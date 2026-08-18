/** Microsoft Web IQ Web Search v3 provider for the DSH web capability. */

import type { CredentialRef } from '@deepseek-ai/dsh-credentials'
import { WebError } from '@deepseek-ai/dsh-web'
import type {
  WebSearchProvider,
  WebSearchRequest,
  WebSearchResult,
  WebSearchSource,
} from '@deepseek-ai/dsh-web'
import type {
  MicrosoftWebIqErrorResponse,
  MicrosoftWebIqSearchRequestBody,
  MicrosoftWebIqWebResponse,
  MicrosoftWebIqWebResult,
} from './types.ts'

/** Stable id this provider registers under. */
export const MICROSOFT_WEBIQ_PROVIDER_ID = 'microsoft-webiq'

/** Public Microsoft Web IQ Web Search v3 endpoint. */
export const MICROSOFT_WEBIQ_DEFAULT_ENDPOINT = 'https://api.microsoft.ai/v3/search/web'

/** Default credential reference; provider-qualified so an unrelated `WEBIQ_API_KEY` cannot shadow it. */
export const MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV = 'MICROSOFT_WEBIQ_API_KEY'

/** Default maximum passage length sent to Web IQ. */
export const MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH = 5000

/** Default SafeSearch mode sent to Web IQ. */
export const MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH = 'strict' as const

const DEFAULT_MAX_RESULTS = 10
const MAX_RESULTS = 50
const MAX_QUERY_LENGTH = 1000
const MAX_CONTENT_LENGTH = 500000
const USER_AGENT = 'deepseek-harness/0.1.0'

/** Resolved options for the next Web IQ search operation. */
export interface MicrosoftWebIqSearchProviderOptions {
  /** Literal API key; when present it wins over {@link resolveApiKey}. */
  readonly apiKey?: string
  /** Resolve the current API key for one operation. */
  readonly resolveApiKey?: () => Promise<string | undefined>
  /** Credential reference named by missing-key diagnostics. */
  readonly apiKeyEnv?: CredentialRef
  /** Full Web Search endpoint. */
  readonly endpoint: string
  /** Optional ISO 639-1 interface language. */
  readonly language?: string
  /** Optional two-letter country or region code. */
  readonly region?: string
  /** Maximum characters requested for each passage. */
  readonly maxLength: number
  /** Web IQ SafeSearch mode. */
  readonly safeSearch: 'strict' | 'off'
}

/**
 * Validate and normalize one unknown Web IQ success payload.
 * @param payload - parsed external JSON.
 * @returns normalized DSH search sources.
 */
export function mapWebIqResponse(payload: unknown): WebSearchResult {
  const response = parseWebResponse(payload)
  const sources: WebSearchSource[] = response.webResults.map(item => ({
    url: item.url,
    ...item.title.length > 0 ? { title: item.title } : {},
    ...item.content.length > 0 ? { snippet: item.content } : {},
    ...item.crawledAt !== undefined && item.crawledAt.length > 0
      ? { publishedAt: item.crawledAt }
      : {},
  }))
  return { sources, truncated: false }
}

/** Microsoft Web IQ implementation of the provider-neutral web search interface. */
export class MicrosoftWebIqSearchProvider implements WebSearchProvider {
  readonly id = MICROSOFT_WEBIQ_PROVIDER_ID

  /**
   * @param resolveOptions - options for the next operation; called once at operation entry.
   */
  constructor(
    private readonly resolveOptions: () => MicrosoftWebIqSearchProviderOptions,
  ) {}

  available(): boolean {
    const options = this.resolveOptions()
    return ((options.apiKey?.length ?? 0) > 0 || options.resolveApiKey !== undefined)
      && isHttpsEndpoint(options.endpoint)
      && isOptionalIsoCode(options.language)
      && isOptionalIsoCode(options.region)
      && Number.isInteger(options.maxLength)
      && options.maxLength > 0
      && options.maxLength <= MAX_CONTENT_LENGTH
  }

  async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
    throwIfAborted(signal)
    if (request.query.length > MAX_QUERY_LENGTH) {
      throw new WebError(
        `Microsoft Web IQ query exceeds the ${MAX_QUERY_LENGTH}-character limit`,
        'WEB_PROVIDER_ERROR',
      )
    }

    const options = this.resolveOptions()
    const apiKey = await this.resolveCredential(options, signal)
    throwIfAborted(signal)
    const body: MicrosoftWebIqSearchRequestBody = {
      query: request.query,
      maxResults: Math.min(request.maxResults ?? DEFAULT_MAX_RESULTS, MAX_RESULTS),
      ...options.language !== undefined && options.language.length > 0
        ? { language: options.language }
        : {},
      ...options.region !== undefined && options.region.length > 0
        ? { region: options.region }
        : {},
      contentFormat: 'passage',
      maxLength: options.maxLength,
      safeSearch: options.safeSearch,
    }

    let response: Response
    try {
      response = await fetch(options.endpoint, {
        method: 'POST',
        redirect: 'error',
        headers: {
          'x-apikey': apiKey,
          'content-type': 'application/json',
          'accept': 'application/json',
          'user-agent': USER_AGENT,
        },
        body: JSON.stringify(body),
        ...signal !== undefined ? { signal } : {},
      })
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error)
      throw new WebError(
        `Microsoft Web IQ search request failed: ${String(error)}`,
        'WEB_PROVIDER_ERROR',
        { cause: error },
      )
    }

    if (!response.ok) {
      let message = `Microsoft Web IQ API error (HTTP ${response.status})`
      try {
        message = formatHttpError(response.status, await response.json())
      } catch (error: unknown) {
        if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error)
        // The status message remains authoritative when the error body is not JSON.
      }
      throw new WebError(message, 'WEB_PROVIDER_ERROR')
    }

    try {
      return mapWebIqResponse(await response.json())
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error)
      if (error instanceof WebError) throw error
      throw new WebError(
        `Microsoft Web IQ returned an unprocessable response body: ${String(error)}`,
        'WEB_PROVIDER_ERROR',
        { cause: error },
      )
    }
  }

  /** Resolve one operation's credential without retaining it on the provider. */
  private async resolveCredential(
    options: MicrosoftWebIqSearchProviderOptions,
    signal?: AbortSignal,
  ): Promise<string> {
    throwIfAborted(signal)
    if (options.apiKey !== undefined && options.apiKey.length > 0) return options.apiKey
    let resolved: string | undefined
    try {
      resolved = await abortable(options.resolveApiKey?.() ?? Promise.resolve(undefined), signal)
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error)
      throw new WebError(
        `Microsoft Web IQ credential resolution failed: ${String(error)}`,
        'WEB_PROVIDER_ERROR',
        { cause: error },
      )
    }
    if (resolved !== undefined && resolved.length > 0) return resolved
    const ref = options.apiKeyEnv ?? MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV
    throw new WebError(
      `Microsoft Web IQ has no API key for "${ref}"; store it through the credentials service,`
      + ' export it in the launching environment, or set a literal "apiKey" in the plugin config',
      'WEB_PROVIDER_CREDENTIAL_MISSING',
    )
  }
}

/** Parse only the external success fields consumed by this adapter. */
function parseWebResponse(payload: unknown): MicrosoftWebIqWebResponse {
  if (!isRecord(payload) || !Array.isArray(payload.webResults)) {
    throw malformedResponse('expected a webResults array')
  }
  return {
    webResults: payload.webResults.map((item, index) => parseWebResult(item, index)),
  }
}

/** Validate one external result item. */
function parseWebResult(payload: unknown, index: number): MicrosoftWebIqWebResult {
  if (!isRecord(payload)
    || typeof payload.title !== 'string'
    || typeof payload.url !== 'string'
    || payload.url.length === 0
    || typeof payload.content !== 'string'
    || (payload.crawledAt !== undefined && typeof payload.crawledAt !== 'string')) {
    throw malformedResponse(`webResults[${index}] has invalid title, url, content, or crawledAt fields`)
  }
  return {
    title: payload.title,
    url: payload.url,
    content: payload.content,
    ...payload.crawledAt !== undefined ? { crawledAt: payload.crawledAt } : {},
  }
}

/** Build a secret-free error message from the documented Web IQ error fields. */
function formatHttpError(status: number, payload: unknown): string {
  const parsed = parseErrorResponse(payload)
  const message = parsed.userMessage !== undefined && parsed.userMessage.length > 0
    ? parsed.userMessage
    : `Microsoft Web IQ API error (HTTP ${status})`
  const diagnostics = [
    parsed.errorCode === undefined ? undefined : `errorCode=${parsed.errorCode}`,
    parsed.retryAfter === undefined ? undefined : `retryAfter=${parsed.retryAfter}`,
    parsed.traceId === undefined ? undefined : `traceId=${parsed.traceId}`,
  ].filter((value): value is string => value !== undefined)
  return diagnostics.length === 0 ? message : `${message} (${diagnostics.join(', ')})`
}

/** Read optional string diagnostics from an unknown error body. */
function parseErrorResponse(payload: unknown): MicrosoftWebIqErrorResponse {
  if (!isRecord(payload)) return {}
  return {
    ...typeof payload.errorCode === 'string' ? { errorCode: payload.errorCode } : {},
    ...typeof payload.userMessage === 'string' ? { userMessage: payload.userMessage } : {},
    ...typeof payload.retryAfter === 'string' ? { retryAfter: payload.retryAfter } : {},
    ...typeof payload.traceId === 'string' ? { traceId: payload.traceId } : {},
  }
}

/** Construct a stable malformed-response error. */
function malformedResponse(detail: string): WebError {
  return new WebError(`Microsoft Web IQ returned a malformed response: ${detail}`, 'WEB_PROVIDER_ERROR')
}

/** True for non-array JSON objects. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** True when an endpoint is absolute HTTPS. */
function isHttpsEndpoint(value: string): boolean {
  if (!URL.canParse(value)) return false
  return new URL(value).protocol === 'https:'
}

/** True when an absent or two-letter ISO code can be sent to Web IQ. */
function isOptionalIsoCode(value: string | undefined): boolean {
  return value === undefined || /^[A-Za-z]{2}$/u.test(value)
}

/** Race credential resolution against caller cancellation. */
function abortable<T>(operation: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (signal === undefined) return operation
  if (signal.aborted) return Promise.reject(aborted(signal))
  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => { reject(aborted(signal)) }
    signal.addEventListener('abort', onAbort, { once: true })
    void operation.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort)
        // The awaited operation owns its rejection reason; wrapping it here would
        // hide the provider's own WebError from the caller.
        // oxlint-disable-next-line typescript/prefer-promise-reject-errors
        reject(error)
      },
    )
  })
}

/** Throw the provider's stable cancellation error for an already-aborted call. */
function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) throw aborted(signal)
}

/** Build the provider's stable cancellation error. */
function aborted(signal?: AbortSignal, fallback?: unknown): WebError {
  return new WebError('Microsoft Web IQ search aborted', 'WEB_ABORTED', {
    cause: signal?.aborted === true ? signal.reason : fallback,
  })
}

/** True for a fetch or response-body abort. */
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
