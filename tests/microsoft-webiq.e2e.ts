import { describe, expect, it } from 'vitest'
import {
  MICROSOFT_WEBIQ_DEFAULT_ENDPOINT,
  MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH,
  MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH,
  MicrosoftWebIqSearchProvider,
} from '../src/provider.ts'

const apiKey = process.env.MICROSOFT_WEBIQ_API_KEY
const maybe = apiKey !== undefined && apiKey.length > 0 ? describe : describe.skip

maybe('MicrosoftWebIqSearchProvider real API', () => {
  it('returns at least one citeable HTTP(S) source', async () => {
    const provider = new MicrosoftWebIqSearchProvider(() => ({
      apiKey: apiKey!,
      endpoint: process.env.WEBIQ_ENDPOINT ?? MICROSOFT_WEBIQ_DEFAULT_ENDPOINT,
      maxLength: MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH,
      safeSearch: MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH,
    }))

    const result = await provider.search({ query: 'Microsoft Web IQ documentation', maxResults: 1 })

    expect(result.sources.length).toBeGreaterThan(0)
    expect(result.sources[0]?.url).toMatch(/^https?:\/\//u)
  }, 60_000)
})
