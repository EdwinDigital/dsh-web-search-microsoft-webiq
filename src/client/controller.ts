/** Browser-side state controller for Microsoft Web IQ configuration. */

import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import {
  createSnapshotStore,
  type SettingsScope,
  type SettingsScopeSnapshot,
  type SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'

/** Provider settings mirrored from `web-search-microsoft-webiq`. */
export interface MicrosoftWebIqClientSettings {
  /** Credential reference used by the Host provider. */
  readonly apiKeyEnv?: string
  /** Full Web Search endpoint. */
  readonly endpoint?: string
  /** Optional ISO 639-1 interface language. */
  readonly language?: string
  /** Optional two-letter country or region code. */
  readonly region?: string
  /** Maximum passage length. */
  readonly maxLength?: number
  /** Web IQ SafeSearch mode. */
  readonly safeSearch?: 'strict' | 'off'
}

/** Provider-selection settings mirrored from `web`. */
export interface WebRuntimeClientSettings {
  /** Selected search provider id. */
  readonly searchProvider?: string
  /** Selected fetch provider id. */
  readonly fetchProvider?: string
}

/** A provider-settings mutation; an explicit `undefined` clears an optional override. */
export interface MicrosoftWebIqSettingsPatch {
  readonly endpoint?: string | undefined
  readonly language?: string | undefined
  readonly region?: string | undefined
  readonly maxLength?: number | undefined
  readonly safeSearch?: 'strict' | 'off' | undefined
}

/** Last command that the Host did not confirm. */
export type MicrosoftWebIqFailedAction = 'apiKey' | 'default' | 'settings'

/** Secret-free state rendered by the Microsoft Web IQ settings card. */
export interface MicrosoftWebIqSettingsState {
  /** Whether the provider namespace is exposed by the Host. */
  readonly available: boolean
  /** Whether ordinary provider settings are writable. */
  readonly writable: boolean
  /** Current resolved non-secret provider settings. */
  readonly settings: MicrosoftWebIqClientSettings
  /** Effective credential reference; never its value. */
  readonly credentialRef: string
  /** Whether any Host credential layer resolves the reference. */
  readonly apiKeyConfigured: boolean
  /** Whether credentials RPC accepts a replacement value. */
  readonly apiKeyWritable: boolean
  /** Whether Web IQ currently owns `web.searchProvider`. */
  readonly isDefault: boolean
  /** Whether the shared `web` namespace can be changed. */
  readonly defaultWritable: boolean
  /** Whether an API-key write is in flight. */
  readonly savingApiKey: boolean
  /** Whether a default-provider write is in flight. */
  readonly settingDefault: boolean
  /** Whether ordinary provider settings are being written. */
  readonly savingSettings: boolean
  /** Most recent command the Host did not confirm. */
  readonly failedAction?: MicrosoftWebIqFailedAction
}

interface CredentialState {
  readonly ref: string
  readonly configured: boolean
  readonly writable: boolean
}

const DEFAULT_API_KEY_REF = 'MICROSOFT_WEBIQ_API_KEY'
const PROVIDER_ID = 'microsoft-webiq'

/** Coordinate the provider namespace, shared selection namespace, and credential domain. */
export class MicrosoftWebIqSettingsController {
  /** Snapshot source consumed by the card. */
  readonly store: SnapshotStore<MicrosoftWebIqSettingsState>

  private credential: CredentialState = {
    ref: DEFAULT_API_KEY_REF,
    configured: false,
    writable: true,
  }

  private savingApiKey = false
  private settingDefault = false
  private savingSettings = false
  private failedAction: MicrosoftWebIqFailedAction | undefined
  private credentialGeneration = 0
  private disposed = false
  private readonly disposers: Array<() => void>

  /**
   * @param providerScope - provider-owned settings namespace.
   * @param webScope - shared provider-selection namespace.
   * @param api - credential wire face; key literals cross only this boundary.
   */
  constructor(
    private readonly providerScope: SettingsScope<MicrosoftWebIqClientSettings>,
    private readonly webScope: SettingsScope<WebRuntimeClientSettings>,
    private readonly api: Pick<IApiClient, 'credentials'>,
  ) {
    this.store = createSnapshotStore(this.projection())
    this.disposers = [
      providerScope.subscribe(() => {
        this.publish()
        void this.readCredential()
      }),
      webScope.subscribe(() => { this.publish() }),
    ]
    void this.readCredential()
  }

  /**
   * Re-read credential metadata after an external write notification.
   * @param ref - credential reference reported by the Host.
   */
  refreshCredential(ref: string): void {
    if (ref !== credentialRefOf(this.providerScope.getSnapshot())) return
    void this.readCredential()
  }

  /**
   * Store a replacement API key through the write-only credential RPC.
   * @param value - user-entered credential literal.
   * @returns whether a subsequent describe confirms a configured key.
   */
  async saveApiKey(value: string): Promise<boolean> {
    const trimmed = value.trim()
    if (trimmed.length === 0 || this.savingApiKey || !this.credential.writable || this.disposed) {
      return false
    }
    this.savingApiKey = true
    this.failedAction = undefined
    this.publish()
    const ref = credentialRefOf(this.providerScope.getSnapshot())
    try {
      await this.api.credentials.set({ ref, value: trimmed })
    } catch (_credentialWriteFailure) {
      // The following authoritative describe decides whether another layer accepted it.
    }
    await this.readCredential()
    const landed = ref === this.credential.ref && this.credential.configured
    this.savingApiKey = false
    this.failedAction = landed ? undefined : 'apiKey'
    this.publish()
    return landed
  }

  /**
   * Select or release Microsoft Web IQ in the shared web settings namespace.
   * Releasing clears the user override so the composed default applies again.
   * @param enabled - whether Web IQ should own `web.searchProvider`.
   * @returns whether the scope confirms the requested state after settlement.
   */
  async setDefault(enabled: boolean): Promise<boolean> {
    const snapshot = this.webScope.getSnapshot()
    if ((snapshot.value?.searchProvider === PROVIDER_ID) === enabled) return true
    if (snapshot.status !== 'ready' || !snapshot.writable || this.settingDefault || this.disposed) {
      return false
    }
    this.settingDefault = true
    this.failedAction = undefined
    this.publish()
    try {
      if (enabled) await this.webScope.set('searchProvider', PROVIDER_ID)
      else await this.webScope.unset('searchProvider')
    } catch (_settingsWriteFailure) {
      // Scope state after settlement remains authoritative.
    }
    const selected = this.webScope.getSnapshot().value?.searchProvider === PROVIDER_ID
    const landed = selected === enabled
    this.settingDefault = false
    this.failedAction = landed ? undefined : 'default'
    this.publish()
    return landed
  }

  /**
   * Store non-secret provider settings through their owning namespace.
   * @param patch - fields to set; `undefined` clears an override.
   * @returns whether every write is reflected by the scope after settlement.
   */
  async saveSettings(patch: MicrosoftWebIqSettingsPatch): Promise<boolean> {
    const snapshot = this.providerScope.getSnapshot()
    if (snapshot.status !== 'ready' || !snapshot.writable || this.savingSettings || this.disposed) {
      return false
    }
    this.savingSettings = true
    this.failedAction = undefined
    this.publish()
    let landed = true
    for (const [field, value] of Object.entries(patch)) {
      try {
        if (value === undefined) await this.providerScope.unset(field)
        else await this.providerScope.set(field, value)
      } catch (_settingsWriteFailure) {
        // The scope snapshot below decides whether this individual write landed.
      }
      landed = settingMatches(this.providerScope.getSnapshot(), field, value) && landed
    }
    this.savingSettings = false
    this.failedAction = landed ? undefined : 'settings'
    this.publish()
    return landed
  }

  /** Stop both scope subscriptions and suppress pending credential publications. */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.credentialGeneration += 1
    for (const dispose of this.disposers) dispose()
  }

  /** Read credential metadata with generation and effective-reference fencing. */
  private async readCredential(): Promise<void> {
    const ref = credentialRefOf(this.providerScope.getSnapshot())
    if (ref !== this.credential.ref) {
      this.credential = { ref, configured: false, writable: true }
      this.publish()
    }
    const generation = ++this.credentialGeneration
    let response: Awaited<ReturnType<IApiClient['credentials']['describe']>>
    try {
      response = await this.api.credentials.describe({ refs: [ref] })
    } catch (_credentialReadFailure) {
      return
    }
    if (this.disposed
      || generation !== this.credentialGeneration
      || ref !== credentialRefOf(this.providerScope.getSnapshot())
      || !response.result.ok) return
    const view = response.result.value.credentials[ref]
    this.credential = {
      ref,
      configured: view?.configured ?? false,
      writable: view?.writable ?? true,
    }
    this.publish()
  }

  /** Build the current secret-free card state. */
  private projection(): MicrosoftWebIqSettingsState {
    const provider = this.providerScope.getSnapshot()
    const web = this.webScope.getSnapshot()
    return {
      available: provider.status === 'ready',
      writable: provider.writable,
      settings: provider.value ?? {},
      credentialRef: credentialRefOf(provider),
      apiKeyConfigured: this.credential.configured,
      apiKeyWritable: this.credential.writable,
      isDefault: web.value?.searchProvider === PROVIDER_ID,
      defaultWritable: web.status === 'ready' && web.writable,
      savingApiKey: this.savingApiKey,
      settingDefault: this.settingDefault,
      savingSettings: this.savingSettings,
      ...this.failedAction === undefined ? {} : { failedAction: this.failedAction },
    }
  }

  /** Publish a fresh projection unless the controller has been released. */
  private publish(): void {
    if (!this.disposed) this.store.set(this.projection())
  }
}

/** Resolve the configured credential reference or the provider default. */
function credentialRefOf(
  snapshot: SettingsScopeSnapshot<MicrosoftWebIqClientSettings>,
): string {
  const ref = snapshot.value?.apiKeyEnv
  return ref !== undefined && ref.length > 0 ? ref : DEFAULT_API_KEY_REF
}

/** Verify one settings mutation from the scope's accepted state. */
function settingMatches(
  snapshot: SettingsScopeSnapshot<MicrosoftWebIqClientSettings>,
  field: string,
  expected: unknown,
): boolean {
  if (expected === undefined) {
    const user = snapshot.user as Record<string, unknown> | undefined
    return user === undefined || !Object.hasOwn(user, field)
  }
  const value = snapshot.value as Record<string, unknown> | undefined
  return value?.[field] === expected
}
