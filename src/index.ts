/** Register Microsoft Web IQ as a provider in the DSH web capability. */

import type { Context, Volatile } from '@deepseek-ai/cordis'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import type {} from '@deepseek-ai/dsh-web'
import z from '@deepseek-ai/schemastery'
import {
  MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV,
  MICROSOFT_WEBIQ_DEFAULT_ENDPOINT,
  MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH,
  MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH,
  MicrosoftWebIqSearchProvider,
} from './provider.ts'
import type { MicrosoftWebIqSearchProviderOptions } from './provider.ts'

export {
  MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV,
  MICROSOFT_WEBIQ_DEFAULT_ENDPOINT,
  MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH,
  MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH,
  MICROSOFT_WEBIQ_PROVIDER_ID,
  MicrosoftWebIqSearchProvider,
  mapWebIqResponse,
} from './provider.ts'
export type { MicrosoftWebIqSearchProviderOptions } from './provider.ts'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-microsoft-webiq'

/** The web seam this provider registers into. */
export const inject = ['web']

const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u
const HTTPS_ENDPOINT_PATTERN = /^https:\/\/[^\s]+$/u
const ISO_CODE_PATTERN = /^[A-Za-z]{2}$/u

/** Plugin configuration and settings fields. */
export interface Config {
  /** Literal API key for direct composition; prefer {@link apiKeyEnv}. */
  readonly apiKey: Volatile<string | undefined>
  /** Credential reference resolved for each search. */
  readonly apiKeyEnv: Volatile<string>
  /** Full Microsoft Web IQ Web Search endpoint. */
  readonly endpoint: Volatile<string>
  /** Optional ISO 639-1 interface language. */
  readonly language: Volatile<string | undefined>
  /** Optional two-letter country or region code. */
  readonly region: Volatile<string | undefined>
  /** Maximum characters requested for each result passage. */
  readonly maxLength: Volatile<number>
  /** Web IQ SafeSearch mode. */
  readonly safeSearch: Volatile<'strict' | 'off'>
}

/** Runtime validation and browser-renderable metadata for {@link Config}. */
export const Config = z.object({
  apiKey: z.string().role('secret').volatile(),
  apiKeyEnv: z.string()
    .pattern(CREDENTIAL_REF_PATTERN)
    .role('credential-ref')
    .default(MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV)
    .volatile(),
  endpoint: z.string()
    .pattern(HTTPS_ENDPOINT_PATTERN)
    .default(MICROSOFT_WEBIQ_DEFAULT_ENDPOINT)
    .volatile(),
  language: z.string().pattern(ISO_CODE_PATTERN).volatile(),
  region: z.string().pattern(ISO_CODE_PATTERN).volatile(),
  maxLength: z.number()
    .step(1)
    .min(1)
    .max(500000)
    .default(MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH)
    .volatile(),
  safeSearch: z.union(['strict', 'off'] as const)
    .default(MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH)
    .volatile(),
})

interface ResolvedConfig {
  readonly apiKey?: string
  readonly apiKeyEnv: string
  readonly endpoint: string
  readonly language?: string
  readonly region?: string
  readonly maxLength: number
  readonly safeSearch: 'strict' | 'off'
}

/** Reject runtime constraints that are stricter than the serialized schema. */
function validateConfig(config: ResolvedConfig): void {
  const endpoint = config.endpoint
  if (!URL.canParse(endpoint) || new URL(endpoint).protocol !== 'https:') {
    throw new TypeError('web-search-microsoft-webiq endpoint must be an absolute HTTPS URL')
  }
  if (config.language !== undefined && !ISO_CODE_PATTERN.test(config.language)) {
    throw new TypeError('web-search-microsoft-webiq language must be a two-letter ISO 639-1 code')
  }
  if (config.region !== undefined && !ISO_CODE_PATTERN.test(config.region)) {
    throw new TypeError('web-search-microsoft-webiq region must be a two-letter country or region code')
  }
  const maxLength = config.maxLength
  if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 500000) {
    throw new TypeError('web-search-microsoft-webiq maxLength must be an integer between 1 and 500000')
  }
}

/**
 * Resolve the current section into one operation's immutable options.
 * @param ctx - plugin context supplying credentials and launch environment.
 * @param config - authoritative section for the next operation.
 * @returns fully defaulted provider options.
 */
function resolveOptions(
  ctx: Context,
  config: ResolvedConfig,
): MicrosoftWebIqSearchProviderOptions {
  validateConfig(config)
  const apiKeyEnv = credentialRef(config.apiKeyEnv)
  const literalApiKey = config.apiKey !== undefined && config.apiKey.length > 0
    ? config.apiKey
    : undefined
  return {
    ...literalApiKey === undefined ? {} : { apiKey: literalApiKey },
    resolveApiKey: async () => {
      const stored = await ctx.get('credentials')?.resolve(apiKeyEnv)
      if (stored !== undefined && stored.value.length > 0) return stored.value
      const ambient = launchEnvironmentOf(ctx).get(apiKeyEnv)
      return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined
    },
    apiKeyEnv,
    endpoint: config.endpoint,
    ...config.language === undefined ? {} : { language: config.language },
    ...config.region === undefined ? {} : { region: config.region },
    maxLength: config.maxLength,
    safeSearch: config.safeSearch,
  }
}

/** Read one stable configuration snapshot for the next search. */
function currentConfig(config: Config): ResolvedConfig {
  const apiKey = config.apiKey.get()
  const language = config.language.get()
  const region = config.region.get()
  return {
    ...apiKey === undefined ? {} : { apiKey },
    apiKeyEnv: config.apiKeyEnv.get(),
    endpoint: config.endpoint.get(),
    ...language === undefined ? {} : { language },
    ...region === undefined ? {} : { region },
    maxLength: config.maxLength.get(),
    safeSearch: config.safeSearch.get(),
  }
}

/**
 * Register the Microsoft Web IQ search provider.
 * @param ctx - Cordis context carrying the web capability.
 * @param config - composition entry layered by optional Settings state.
 */
export function apply(ctx: Context, config: Config): void {
  validateConfig(currentConfig(config))
  ctx.web.registerSearchProvider(
    new MicrosoftWebIqSearchProvider(() => resolveOptions(ctx, currentConfig(config))),
  )
}
