/** Browser-side state controller for Microsoft Web IQ configuration. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
/** Provider settings mirrored from `web-search-microsoft-webiq`. */
export interface MicrosoftWebIqClientSettings {
    /** Credential reference used by the Host provider. */
    readonly apiKeyEnv?: string;
    /** Full Web Search endpoint. */
    readonly endpoint?: string;
    /** Optional ISO 639-1 interface language. */
    readonly language?: string;
    /** Optional two-letter country or region code. */
    readonly region?: string;
    /** Maximum passage length. */
    readonly maxLength?: number;
    /** Web IQ SafeSearch mode. */
    readonly safeSearch?: 'strict' | 'off';
}
/** Provider-selection settings mirrored from `web`. */
export interface WebRuntimeClientSettings {
    /** Selected search provider id. */
    readonly searchProvider?: string;
    /** Selected fetch provider id. */
    readonly fetchProvider?: string;
}
/** A provider-settings mutation; an explicit `undefined` clears an optional override. */
export interface MicrosoftWebIqSettingsPatch {
    readonly endpoint?: string | undefined;
    readonly language?: string | undefined;
    readonly region?: string | undefined;
    readonly maxLength?: number | undefined;
    readonly safeSearch?: 'strict' | 'off' | undefined;
}
/** Last command that the Host did not confirm. */
export type MicrosoftWebIqFailedAction = 'apiKey' | 'default' | 'settings';
/** Secret-free state rendered by the Microsoft Web IQ settings card. */
export interface MicrosoftWebIqSettingsState {
    /** Whether the provider namespace is exposed by the Host. */
    readonly available: boolean;
    /** Whether ordinary provider settings are writable. */
    readonly writable: boolean;
    /** Current resolved non-secret provider settings. */
    readonly settings: MicrosoftWebIqClientSettings;
    /** Effective credential reference; never its value. */
    readonly credentialRef: string;
    /** Whether any Host credential layer resolves the reference. */
    readonly apiKeyConfigured: boolean;
    /** Whether credentials RPC accepts a replacement value. */
    readonly apiKeyWritable: boolean;
    /** Whether Web IQ currently owns `web.searchProvider`. */
    readonly isDefault: boolean;
    /** Whether the shared `web` namespace can be changed. */
    readonly defaultWritable: boolean;
    /** Whether an API-key write is in flight. */
    readonly savingApiKey: boolean;
    /** Whether a default-provider write is in flight. */
    readonly settingDefault: boolean;
    /** Whether ordinary provider settings are being written. */
    readonly savingSettings: boolean;
    /** Most recent command the Host did not confirm. */
    readonly failedAction?: MicrosoftWebIqFailedAction;
}
/** Coordinate the provider namespace, shared selection namespace, and credential domain. */
export declare class MicrosoftWebIqSettingsController {
    private readonly providerScope;
    private readonly webScope;
    private readonly remote;
    /** Snapshot source consumed by the card. */
    readonly store: SnapshotStore<MicrosoftWebIqSettingsState>;
    private credential;
    private savingApiKey;
    private settingDefault;
    private savingSettings;
    private failedAction;
    private credentialGeneration;
    private disposed;
    private readonly disposers;
    /**
     * @param providerScope - provider-owned settings namespace.
     * @param webScope - shared provider-selection namespace.
     * @param api - credential wire face; key literals cross only this boundary.
     */
    constructor(providerScope: ConfigForm<MicrosoftWebIqClientSettings>, webScope: ConfigForm<WebRuntimeClientSettings>, remote: Pick<ClientContext['remote'], 'credentials'>);
    /**
     * Re-read credential metadata after an external write notification.
     * @param ref - credential reference reported by the Host.
     */
    refreshCredential(ref: string): void;
    /**
     * Store a replacement API key through the write-only credential RPC.
     * @param value - user-entered credential literal.
     * @returns whether a subsequent describe confirms a configured key.
     */
    saveApiKey(value: string): Promise<boolean>;
    /**
     * Select Microsoft Web IQ or restore the Web profile's shipped search provider.
     * @param enabled - whether Web IQ should own `web.searchProvider`.
     * @returns whether the scope confirms the requested state after settlement.
     */
    setDefault(enabled: boolean): Promise<boolean>;
    /**
     * Store non-secret provider settings through their owning namespace.
     * @param patch - fields to set; `undefined` clears an override.
     * @returns whether every write is reflected by the scope after settlement.
     */
    saveSettings(patch: MicrosoftWebIqSettingsPatch): Promise<boolean>;
    /** Stop both scope subscriptions and suppress pending credential publications. */
    dispose(): void;
    /** Read credential metadata with generation and effective-reference fencing. */
    private readCredential;
    /** Build the current secret-free card state. */
    private projection;
    /** Publish a fresh projection unless the controller has been released. */
    private publish;
}
//# sourceMappingURL=controller.d.ts.map