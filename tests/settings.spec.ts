import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context, type Fiber } from '@deepseek-ai/cordis'
import { createVolatile, updateVolatile } from '@deepseek-ai/cosmokit'
import WebRuntime from '@deepseek-ai/dsh-web'
import * as webIqPlugin from '../src/index.ts'
import { MICROSOFT_WEBIQ_PROVIDER_ID } from '../src/index.ts'

const WEB_RESPONSE = {
  webResults: [{ title: 'A', url: 'https://a.test', content: 'Passage A' }],
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

async function boot(config: Record<string, unknown> = {}): Promise<{
  ctx: Context
  pluginFiber: Fiber
}> {
  const ctx = new Context()
  await ctx.plugin(WebRuntime, { searchProvider: MICROSOFT_WEBIQ_PROVIDER_ID }).await()
  const pluginFiber = ctx.plugin(webIqPlugin, {
    apiKey: 'entry-key',
    endpoint: 'https://entry.test/search',
    ...config,
  })
  await pluginFiber.await()
  return { ctx, pluginFiber }
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

describe('web-search-microsoft-webiq live configuration', () => {
  it('uses a volatile endpoint change on the next search without re-registering', async () => {
    const bench = await boot()
    expect((await searchOnce(bench.ctx)).url).toBe('https://entry.test/search')

    updateVolatile(
      (bench.pluginFiber.config as webIqPlugin.Config).endpoint,
      createVolatile('https://stored.test/search'),
    )

    expect((await searchOnce(bench.ctx)).url).toBe('https://stored.test/search')
    await bench.ctx.fiber.dispose()
  })

  it('uses MICROSOFT_WEBIQ_API_KEY from the launch environment when no literal key exists', async () => {
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

  it('releases the provider when unloaded', async () => {
    const bench = await boot()
    await bench.pluginFiber.dispose()

    await expect(bench.ctx.web.search({ query: 'q' }))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_CONFIGURED_MISSING' }))
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
