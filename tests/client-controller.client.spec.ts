// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import type { SettingsPathOpView } from '@deepseek-ai/dsh-api-remotes/client'
import {
  stubConfigForm,
  type StubConfigForm,
} from '@deepseek-ai/dsh-client-test-runtime/src/config-form.ts'
import {
  MicrosoftWebIqSettingsController,
  type MicrosoftWebIqClientSettings,
  type WebRuntimeClientSettings,
} from '../src/client/controller.ts'

interface Deferred<T> {
  readonly promise: Promise<T>
  readonly resolve: (value: T) => void
}

function deferred<T>(): Deferred<T> {
  let resolve = (_value: T): void => {}
  const promise = new Promise<T>((accept) => { resolve = accept })
  return { promise, resolve }
}

function credentialResponse(ref: string, configured: boolean, writable = true) {
  return {
    ok: true as const,
    value: { [ref]: { configured, writable } },
  }
}

function credentialsApi(configured = false) {
  let current = configured
  const describe = vi.fn((refs: string[]) =>
    Promise.resolve(credentialResponse(refs[0] ?? '', current)))
  const set = vi.fn(() => {
    current = true
    return Promise.resolve({ ok: true as const, value: undefined })
  })
  return { remote: { credentials: { describe, set } } as never, describe, set }
}

function publishProvider(
  host: StubConfigForm<MicrosoftWebIqClientSettings>,
  value: MicrosoftWebIqClientSettings = {},
): void {
  host.publish({
    status: 'ready',
    writable: true,
    value,
    base: {
      apiKeyEnv: 'MICROSOFT_WEBIQ_API_KEY',
      endpoint: 'https://api.microsoft.ai/v3/search/web',
      maxLength: 5000,
      safeSearch: 'strict',
    },
    user: {},
  })
}

function publishWeb(
  host: StubConfigForm<WebRuntimeClientSettings>,
  searchProvider = 'deepseek-official',
): void {
  host.publish({
    status: 'ready',
    writable: true,
    value: { searchProvider },
    base: { searchProvider: 'deepseek-official' },
    user: {},
  })
}

describe('MicrosoftWebIqSettingsController credentials', () => {
  it('reads the effective credential reference and never exposes a key value', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const credentials = credentialsApi(true)
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentials.remote)

    publishProvider(provider, { apiKeyEnv: 'CUSTOM_WEBIQ_KEY' })

    await vi.waitFor(() => {
      expect(controller.store.getSnapshot()).toMatchObject({
        credentialRef: 'CUSTOM_WEBIQ_KEY',
        apiKeyConfigured: true,
        apiKeyWritable: true,
      })
    })
    expect(credentials.describe).toHaveBeenLastCalledWith(['CUSTOM_WEBIQ_KEY'])
    expect(JSON.stringify(controller.store.getSnapshot())).not.toContain('secret')
    controller.dispose()
  })

  it('writes a nonblank key only through credentials and verifies it by re-reading', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const credentials = credentialsApi(false)
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentials.remote)
    publishProvider(provider)

    await expect(controller.saveApiKey('  webiq-secret  ')).resolves.toBe(true)

    expect(credentials.set).toHaveBeenCalledWith('MICROSOFT_WEBIQ_API_KEY', 'webiq-secret')
    expect(provider.set).not.toHaveBeenCalled()
    expect(controller.store.getSnapshot()).toMatchObject({ apiKeyConfigured: true, savingApiKey: false })
    await expect(controller.saveApiKey('   ')).resolves.toBe(false)
    expect(credentials.set).toHaveBeenCalledOnce()
    controller.dispose()
  })

  it('refreshes only for the credential reference currently in force', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const credentials = credentialsApi(false)
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentials.remote)
    publishProvider(provider)
    await vi.waitFor(() => { expect(credentials.describe).toHaveBeenCalled() })
    credentials.describe.mockClear()

    controller.refreshCredential('OTHER_KEY')
    expect(credentials.describe).not.toHaveBeenCalled()
    controller.refreshCredential('MICROSOFT_WEBIQ_API_KEY')
    await vi.waitFor(() => { expect(credentials.describe).toHaveBeenCalledOnce() })
    controller.dispose()
  })

  it('drops a stale credential response after the reference changes', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const first = deferred<ReturnType<typeof credentialResponse>>()
    const second = deferred<ReturnType<typeof credentialResponse>>()
    const describe = vi.fn((refs: string[]) =>
      refs[0] === 'CUSTOM_KEY' ? second.promise : first.promise)
    const controller = new MicrosoftWebIqSettingsController(
      provider.scope,
      web.scope,
      { credentials: { describe, set: vi.fn() } } as never,
    )

    publishProvider(provider)
    publishProvider(provider, { apiKeyEnv: 'CUSTOM_KEY' })
    second.resolve(credentialResponse('CUSTOM_KEY', true))
    await vi.waitFor(() => {
      expect(controller.store.getSnapshot()).toMatchObject({
        credentialRef: 'CUSTOM_KEY',
        apiKeyConfigured: true,
      })
    })
    first.resolve(credentialResponse('MICROSOFT_WEBIQ_API_KEY', false))
    await Promise.resolve()

    expect(controller.store.getSnapshot()).toMatchObject({
      credentialRef: 'CUSTOM_KEY',
      apiKeyConfigured: true,
    })
    controller.dispose()
  })
})

describe('MicrosoftWebIqSettingsController settings', () => {
  it('sets Microsoft Web IQ as the default search provider and verifies the accepted value', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentialsApi().remote)
    publishProvider(provider)
    publishWeb(web)
    web.set.mockImplementation((field: string, value: unknown) => {
      web.publish({
        value: { searchProvider: String(value) },
        user: { [field]: value },
      })
    })

    await expect(controller.setDefault(true)).resolves.toBe(true)

    expect(web.set).toHaveBeenCalledWith('searchProvider', 'microsoft-webiq')
    expect(controller.store.getSnapshot()).toMatchObject({ isDefault: true, settingDefault: false })
    controller.dispose()
  })

  it('clears the user override when the provider is switched off', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentialsApi().remote)
    publishProvider(provider)
    publishWeb(web, 'microsoft-webiq')
    web.unset.mockImplementation((field: string) => {
      web.publish({
        value: { searchProvider: 'deepseek-official' },
        user: { [field]: undefined },
      })
    })

    await expect(controller.setDefault(false)).resolves.toBe(true)

    expect(web.unset).toHaveBeenCalledWith('searchProvider')
    expect(controller.store.getSnapshot()).toMatchObject({ isDefault: false, settingDefault: false })
    controller.dispose()
  })

  it('reports a refused default write instead of claiming success', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentialsApi().remote)
    publishProvider(provider)
    publishWeb(web)

    await expect(controller.setDefault(true)).resolves.toBe(false)

    expect(controller.store.getSnapshot()).toMatchObject({ isDefault: false, failedAction: 'default' })
    controller.dispose()
  })

  it('writes provider settings through their owning namespace and verifies each value', async () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentialsApi().remote)
    publishProvider(provider)
    provider.mutate.mockImplementation((ops: readonly SettingsPathOpView[]) => {
      const before = provider.scope.getSnapshot()
      const value = { ...before.value } as Record<string, unknown>
      const user = { ...before.user as object } as Record<string, unknown>
      for (const op of ops) {
        const field = op.path[0]!
        if (op.op === 'set') {
          value[field] = op.value
          user[field] = op.value
        } else {
          Reflect.deleteProperty(user, field)
          value[field] = (before.base as Record<string, unknown> | undefined)?.[field]
        }
      }
      provider.publish({ value: value as MicrosoftWebIqClientSettings, user })
      return Promise.resolve(true)
    })

    await expect(controller.saveSettings({
      endpoint: 'https://proxy.test/web',
      language: 'zh',
      region: 'CN',
      maxLength: 8000,
      safeSearch: 'off',
    })).resolves.toBe(true)

    expect(provider.mutate).toHaveBeenCalledWith([
      { op: 'set', path: ['endpoint'], value: 'https://proxy.test/web' },
      { op: 'set', path: ['language'], value: 'zh' },
      { op: 'set', path: ['region'], value: 'CN' },
      { op: 'set', path: ['maxLength'], value: 8000 },
      { op: 'set', path: ['safeSearch'], value: 'off' },
    ])
    expect(controller.store.getSnapshot()).toMatchObject({
      settings: { endpoint: 'https://proxy.test/web', maxLength: 8000, safeSearch: 'off' },
      savingSettings: false,
    })
    controller.dispose()
  })

  it('disposes both settings subscriptions', () => {
    const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
    const web = stubConfigForm<WebRuntimeClientSettings>()
    const controller = new MicrosoftWebIqSettingsController(provider.scope, web.scope, credentialsApi().remote)
    expect(provider.listenerCount()).toBe(1)
    expect(web.listenerCount()).toBe(1)

    controller.dispose()

    expect(provider.listenerCount()).toBe(0)
    expect(web.listenerCount()).toBe(0)
  })
})
