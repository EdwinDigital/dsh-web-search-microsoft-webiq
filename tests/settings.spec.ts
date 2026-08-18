import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context, type Fiber } from '@deepseek-ai/cordis'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import WebRuntime from '@deepseek-ai/dsh-web'
import * as webIqPlugin from '../src/index.ts'
import {
  MICROSOFT_WEBIQ_PROVIDER_ID,
  WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE,
} from '../src/index.ts'

/** Writable in-memory settings provider for plugin lifecycle tests. */
class MemorySettings extends SettingsProvider {
  private contents: Record<string, unknown> = {}

  get writable(): boolean {
    return true
  }

  protected load(): Promise<Record<string, unknown>> {
    return Promise.resolve(structuredClone(this.contents))
  }

  protected persist(ns: SettingsNamespace, section: Record<string, unknown>): Promise<void> {
    this.contents = { ...this.contents, [ns]: structuredClone(section) }
    return Promise.resolve()
  }
}

const WEB_RESPONSE = {
  webResults: [{ title: 'A', url: 'https://a.test', content: 'Passage A' }],
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

async function boot(): Promise<{ ctx: Context; settingsFiber: Fiber; pluginFiber: Fiber }> {
  const ctx = new Context()
  await ctx.plugin(WebRuntime, { searchProvider: MICROSOFT_WEBIQ_PROVIDER_ID }).await()
  const settingsFiber = ctx.plugin(MemorySettings)
  await settingsFiber.await()
  const pluginFiber = ctx.plugin(webIqPlugin, {
    apiKey: 'entry-key',
    endpoint: 'https://entry.test/search',
  })
  await pluginFiber.await()
  return { ctx, settingsFiber, pluginFiber }
}

async function searchOnce(ctx: Context): Promise<{ url: string; init: RequestInit }> {
  const fetchMock = vi.fn(async () => jsonResponse(WEB_RESPONSE))
  vi.stubGlobal('fetch', fetchMock)
  await ctx.web.search({ query: 'anything' })
  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
  return { url, init }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('web-search-microsoft-webiq settings', () => {
  it('uses a committed endpoint on the next search without re-registering', async () => {
    const bench = await boot()
    expect((await searchOnce(bench.ctx)).url).toBe('https://entry.test/search')

    await bench.ctx.settings.update(WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, {
      endpoint: 'https://stored.test/search',
    })

    expect((await searchOnce(bench.ctx)).url).toBe('https://stored.test/search')
    await bench.ctx.fiber.dispose()
  })

  it('keeps a literal API key out of redacted descriptors', async () => {
    const bench = await boot()
    await bench.ctx.settings.update(WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, {
      apiKey: 'stored-webiq-secret',
    })

    const descriptor = bench.ctx.settings.describe({ redactSecrets: true })
      .find(row => String(row.ns) === 'web-search-microsoft-webiq')
    expect(JSON.stringify(descriptor)).not.toContain('stored-webiq-secret')
    expect(descriptor?.secrets).toEqual([{ path: ['apiKey'], set: true }])
    await bench.ctx.fiber.dispose()
  })

  it('restores the composition endpoint when Settings detaches', async () => {
    const bench = await boot()
    await bench.ctx.settings.update(WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, {
      endpoint: 'https://stored.test/search',
    })
    expect((await searchOnce(bench.ctx)).url).toBe('https://stored.test/search')

    await bench.settingsFiber.dispose()

    expect((await searchOnce(bench.ctx)).url).toBe('https://entry.test/search')
    await bench.ctx.fiber.dispose()
  })

  it('releases the provider and settings namespace when unloaded', async () => {
    const bench = await boot()
    expect(bench.ctx.settings.describe().map(row => String(row.ns)))
      .toContain('web-search-microsoft-webiq')

    await bench.pluginFiber.dispose()

    expect(bench.ctx.settings.describe().map(row => String(row.ns)))
      .not.toContain('web-search-microsoft-webiq')
    await expect(bench.ctx.web.search({ query: 'q' }))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_CONFIGURED_MISSING' }))
    await bench.ctx.fiber.dispose()
  })

  it('uses MICROSOFT_WEBIQ_API_KEY from the launch environment when no stored key exists', async () => {
    const previous = process.env.MICROSOFT_WEBIQ_API_KEY
    process.env.MICROSOFT_WEBIQ_API_KEY = 'environment-key'
    const ctx = new Context()
    try {
      await ctx.plugin(WebRuntime, { searchProvider: MICROSOFT_WEBIQ_PROVIDER_ID }).await()
      await ctx.plugin(webIqPlugin, {}).await()
      const { url, init } = await searchOnce(ctx)
      expect(url).toBe('https://api.microsoft.ai/v3/search/web')
      expect((init.headers as Record<string, string>)['x-apikey']).toBe('environment-key')
    } finally {
      await ctx.fiber.dispose()
      if (previous === undefined) delete process.env.MICROSOFT_WEBIQ_API_KEY
      else process.env.MICROSOFT_WEBIQ_API_KEY = previous
    }
  })

  it('rejects non-HTTPS endpoints and invalid ISO codes at plugin load', async () => {
    const ctx = new Context()
    await ctx.plugin(WebRuntime, { searchProvider: MICROSOFT_WEBIQ_PROVIDER_ID }).await()
    await expect(ctx.plugin(webIqPlugin, { apiKey: 'key', endpoint: 'http://insecure.test/search' }))
      .rejects.toThrow(/endpoint/u)
    await expect(ctx.plugin(webIqPlugin, { apiKey: 'key', endpoint: 'https://[' }))
      .rejects.toThrow(/endpoint/u)
    await expect(ctx.plugin(webIqPlugin, { apiKey: 'key', language: 'english' }))
      .rejects.toThrow(/language/u)
    await expect(ctx.plugin(webIqPlugin, { apiKey: 'key', region: 'USA' }))
      .rejects.toThrow(/region/u)
    await ctx.fiber.dispose()
  })

  it('rejects out-of-range maxLength in settings updates', async () => {
    const bench = await boot()
    await expect(bench.ctx.settings.update(WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, {
      maxLength: 500001,
    })).rejects.toThrow(/maxLength/u)
    await expect(bench.ctx.settings.update(WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, {
      endpoint: 'https://[',
    })).rejects.toThrow(/endpoint/u)
    await bench.ctx.fiber.dispose()
  })
})

describe('web-search-microsoft-webiq plugin exports', () => {
  it('is a namespace plugin with the web injection', () => {
    expect('default' in webIqPlugin).toBe(false)
    expect(webIqPlugin.name).toBe('web-search-microsoft-webiq')
    expect(webIqPlugin.inject).toEqual(['web'])
  })
})
