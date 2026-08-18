/** Register Microsoft Web IQ as a provider in the DSH web capability. */

import type { Context } from '@deepseek-ai/cordis'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
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
  readonly apiKey?: string
  /** Credential reference resolved for each search. */
  readonly apiKeyEnv?: string
  /** Full Microsoft Web IQ Web Search endpoint. */
  readonly endpoint?: string
  /** Optional ISO 639-1 interface language. */
  readonly language?: string
  /** Optional two-letter country or region code. */
  readonly region?: string
  /** Maximum characters requested for each result passage. */
  readonly maxLength?: number
  /** Web IQ SafeSearch mode. */
  readonly safeSearch?: 'strict' | 'off'
}

/** Runtime validation and browser-renderable metadata for {@link Config}. */
export const Config: z<Config> = z.object({
  apiKey: z.string().role('secret'),
  apiKeyEnv: z.string()
    .pattern(CREDENTIAL_REF_PATTERN)
    .role('credential-ref')
    .default(MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV),
  endpoint: z.string()
    .pattern(HTTPS_ENDPOINT_PATTERN)
    .default(MICROSOFT_WEBIQ_DEFAULT_ENDPOINT),
  language: z.string().pattern(ISO_CODE_PATTERN),
  region: z.string().pattern(ISO_CODE_PATTERN),
  maxLength: z.number()
    .step(1)
    .min(1)
    .max(500000)
    .default(MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH),
  safeSearch: z.union(['strict', 'off'] as const)
    .default(MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH),
})

/** Settings namespace carrying this provider's current configuration. */
export const WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE =
  settingsNamespace('web-search-microsoft-webiq')

/** Reject runtime constraints that are stricter than the serialized schema. */
function validateConfig(config: Config): void {
  const endpoint = config.endpoint ?? MICROSOFT_WEBIQ_DEFAULT_ENDPOINT
  if (!URL.canParse(endpoint) || new URL(endpoint).protocol !== 'https:') {
    throw new TypeError('web-search-microsoft-webiq endpoint must be an absolute HTTPS URL')
  }
  if (config.language !== undefined && !ISO_CODE_PATTERN.test(config.language)) {
    throw new TypeError('web-search-microsoft-webiq language must be a two-letter ISO 639-1 code')
  }
  if (config.region !== undefined && !ISO_CODE_PATTERN.test(config.region)) {
    throw new TypeError('web-search-microsoft-webiq region must be a two-letter country or region code')
  }
  const maxLength = config.maxLength ?? MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH
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
  config: Config,
): MicrosoftWebIqSearchProviderOptions {
  const apiKeyEnv = credentialRef(config.apiKeyEnv ?? MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV)
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
    endpoint: config.endpoint ?? MICROSOFT_WEBIQ_DEFAULT_ENDPOINT,
    ...config.language === undefined ? {} : { language: config.language },
    ...config.region === undefined ? {} : { region: config.region },
    maxLength: config.maxLength ?? MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH,
    safeSearch: config.safeSearch ?? MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH,
  }
}

/**
 * Register the Microsoft Web IQ search provider.
 * @param ctx - Cordis context carrying the web capability.
 * @param config - composition entry layered by optional Settings state.
 */
export function apply(ctx: Context, config: Config): void {
  validateConfig(config)
  let current: () => Config = () => config
  installSettingsSection(
    ctx,
    WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE,
    Config,
    config,
    {
      setSource: (source) => {
        current = source
      },
      // The options thunk reads committed settings at the next operation entry.
      onChange: () => {},
      validate: validateConfig,
    },
  )
  ctx.web.registerSearchProvider(
    new MicrosoftWebIqSearchProvider(() => resolveOptions(ctx, current())),
  )
}
