import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MicrosoftWebIqSearchProvider,
  mapWebIqResponse,
  type MicrosoftWebIqSearchProviderOptions,
} from '../src/provider.ts'

const options: MicrosoftWebIqSearchProviderOptions = {
  apiKey: 'webiq-secret',
  endpoint: 'https://api.microsoft.ai/v3/search/web',
  maxLength: 5000,
  safeSearch: 'strict',
}

const provider = (
  overrides: Partial<MicrosoftWebIqSearchProviderOptions> = {},
): MicrosoftWebIqSearchProvider =>
  new MicrosoftWebIqSearchProvider(() => ({ ...options, ...overrides }))

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

const WEB_RESPONSE = {
  webResults: [{
    title: 'TypeScript 5.9',
    url: 'https://typescript.test/releases/5-9',
    content: 'TypeScript 5.9 introduces deferred module evaluation.',
    crawledAt: '2026-08-16T12:00:00Z',
  }],
  traceId: 'trace-success',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('mapWebIqResponse', () => {
  it('maps Web IQ passages to normalized web sources', () => {
    expect(mapWebIqResponse(WEB_RESPONSE)).toEqual({
      sources: [{
        title: 'TypeScript 5.9',
        url: 'https://typescript.test/releases/5-9',
        snippet: 'TypeScript 5.9 introduces deferred module evaluation.',
        publishedAt: '2026-08-16T12:00:00Z',
      }],
      truncated: false,
    })
  })

  it('omits empty optional normalized fields', () => {
    expect(mapWebIqResponse({
      webResults: [{ title: '', url: 'https://example.test', content: '', crawledAt: '' }],
    })).toEqual({ sources: [{ url: 'https://example.test' }], truncated: false })
  })

  it('rejects a missing webResults array', () => {
    expect(() => mapWebIqResponse({ traceId: 'trace-only' }))
      .toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_ERROR' }))
  })

  it('rejects malformed result fields', () => {
    expect(() => mapWebIqResponse({
      webResults: [{ title: 'Bad', url: 42, content: 'passage' }],
    })).toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_ERROR' }))
  })
})

describe('MicrosoftWebIqSearchProvider request mapping', () => {
  it('posts the documented passage request with API-key authentication', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(WEB_RESPONSE))
    vi.stubGlobal('fetch', fetchMock)

    await provider().search({ query: 'current TypeScript release', maxResults: 10 })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.microsoft.ai/v3/search/web')
    expect(init).toMatchObject({ method: 'POST', redirect: 'error' })
    expect(init.headers).toMatchObject({
      'x-apikey': 'webiq-secret',
      'content-type': 'application/json',
    })
    expect(JSON.parse(init.body as string)).toEqual({
      query: 'current TypeScript release',
      maxResults: 10,
      contentFormat: 'passage',
      maxLength: 5000,
      safeSearch: 'strict',
    })
  })

  it('adds configured language and region while omitting absent values', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(WEB_RESPONSE))
    vi.stubGlobal('fetch', fetchMock)

    await provider({ language: 'en', region: 'US' }).search({ query: 'q' })

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({
      query: 'q',
      maxResults: 10,
      language: 'en',
      region: 'US',
      contentFormat: 'passage',
      maxLength: 5000,
      safeSearch: 'strict',
    })
  })

  it('caps the provider request at 50 results', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(WEB_RESPONSE))
    vi.stubGlobal('fetch', fetchMock)

    await provider().search({ query: 'q', maxResults: 200 })

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({ maxResults: 50 })
  })

  it('accepts a 1,000-character query and rejects 1,001 before dispatch', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(WEB_RESPONSE))
    vi.stubGlobal('fetch', fetchMock)

    await expect(provider().search({ query: 'x'.repeat(1000) })).resolves.toMatchObject({ truncated: false })
    await expect(provider().search({ query: 'x'.repeat(1001) }))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_ERROR' }))
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})

describe('MicrosoftWebIqSearchProvider operation snapshots', () => {
  it('keeps one settings section while credential resolution is pending', async () => {
    const { apiKey: _apiKey, ...keylessOptions } = options
    const before = { ...keylessOptions, endpoint: 'https://before.test/search', maxLength: 100 }
    const after = { ...keylessOptions, endpoint: 'https://after.test/search', maxLength: 900 }
    let current = before
    let releaseCredential = (): void => {}
    const resolveApiKey = () => new Promise<string>((resolve) => {
      releaseCredential = () => {
        current = after
        resolve('key-from-before')
      }
    })
    const fetchMock = vi.fn(async () => jsonResponse(WEB_RESPONSE))
    vi.stubGlobal('fetch', fetchMock)
    const searchProvider = new MicrosoftWebIqSearchProvider(() => ({ ...current, resolveApiKey }))

    const search = searchProvider.search({ query: 'q' })
    await vi.waitFor(() => { expect(typeof releaseCredential).toBe('function') })
    releaseCredential()
    await search

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://before.test/search')
    expect((init.headers as Record<string, string>)['x-apikey']).toBe('key-from-before')
    expect(JSON.parse(init.body as string)).toMatchObject({ maxLength: 100 })
  })
})

describe('MicrosoftWebIqSearchProvider failures', () => {
  it('fails with the credential reference when no key resolves', async () => {
    await expect(provider({ apiKey: '' }).search({ query: 'q' }))
      .rejects.toThrow(expect.objectContaining({
        code: 'WEB_PROVIDER_CREDENTIAL_MISSING',
        message: expect.stringContaining('MICROSOFT_WEBIQ_API_KEY') as string,
      }))
  })

  it('does not resolve credentials or dispatch a pre-aborted search', async () => {
    const resolveApiKey = vi.fn(async () => 'late-key')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    controller.abort(new Error('caller stopped'))

    await expect(provider({ apiKey: '', resolveApiKey }).search({ query: 'q' }, controller.signal))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_ABORTED' }))
    expect(resolveApiKey).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps fetch aborts to WEB_ABORTED', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new DOMException('aborted', 'AbortError'))))
    await expect(provider().search({ query: 'q' }))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_ABORTED' }))
  })

  it('maps network and redirect failures to WEB_PROVIDER_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('redirect blocked'))))
    await expect(provider().search({ query: 'q' }))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_ERROR' }))
  })

  it('includes standardized Web IQ error diagnostics', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      userMessage: 'Rate limit exceeded.',
      retryAfter: '60s',
      traceId: 'trace-456',
    }, { status: 429 })))

    await expect(provider().search({ query: 'q' })).rejects.toThrow(expect.objectContaining({
      code: 'WEB_PROVIDER_ERROR',
      message: expect.stringMatching(/Rate limit exceeded.*RATE_LIMIT_EXCEEDED.*60s.*trace-456/u) as string,
    }))
  })

  it('maps an unparseable success body to WEB_PROVIDER_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not json', { status: 200 })))
    await expect(provider().search({ query: 'q' }))
      .rejects.toThrow(expect.objectContaining({ code: 'WEB_PROVIDER_ERROR' }))
  })
})
