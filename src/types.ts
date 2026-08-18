/** Provider-private Microsoft Web IQ REST vocabulary. */

/** Request body accepted by the Web Search v3 endpoint. */
export interface MicrosoftWebIqSearchRequestBody {
  /** Search query, limited by Web IQ to 1,000 characters. */
  readonly query: string
  /** Requested result count, capped at 50. */
  readonly maxResults: number
  /** Optional ISO 639-1 interface language. */
  readonly language?: string
  /** Optional two-letter country or region code. */
  readonly region?: string
  /** Query-relevant extraction mode. */
  readonly contentFormat: 'passage'
  /** Maximum characters returned in each passage. */
  readonly maxLength: number
  /** Sensitive-content filtering mode. */
  readonly safeSearch: 'strict' | 'off'
}

/** Validated fields consumed from one Web IQ web result. */
export interface MicrosoftWebIqWebResult {
  /** Webpage title. */
  readonly title: string
  /** Source URL. */
  readonly url: string
  /** Query-relevant passage. */
  readonly content: string
  /** Optional ISO-8601 crawl timestamp. */
  readonly crawledAt?: string
}

/** Validated successful Web Search response fields. */
export interface MicrosoftWebIqWebResponse {
  /** Ordered web results. */
  readonly webResults: readonly MicrosoftWebIqWebResult[]
}

/** Standardized fields consumed from a Web IQ error response. */
export interface MicrosoftWebIqErrorResponse {
  /** Machine-readable provider error code. */
  readonly errorCode?: string
  /** Human-readable provider message. */
  readonly userMessage?: string
  /** Provider-requested delay, such as `60s`. */
  readonly retryAfter?: string
  /** Support trace identifier. */
  readonly traceId?: string
}
