/** Register Microsoft Web IQ as a provider in the DSH web capability. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export { MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV, MICROSOFT_WEBIQ_DEFAULT_ENDPOINT, MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH, MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH, MICROSOFT_WEBIQ_PROVIDER_ID, MicrosoftWebIqSearchProvider, mapWebIqResponse, } from './provider.ts';
export type { MicrosoftWebIqSearchProviderOptions } from './provider.ts';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "web-search-microsoft-webiq";
/** The web seam this provider registers into. */
export declare const inject: string[];
/** Plugin configuration and settings fields. */
export interface Config {
    /** Literal API key for direct composition; prefer {@link apiKeyEnv}. */
    readonly apiKey?: string;
    /** Credential reference resolved for each search. */
    readonly apiKeyEnv?: string;
    /** Full Microsoft Web IQ Web Search endpoint. */
    readonly endpoint?: string;
    /** Optional ISO 639-1 interface language. */
    readonly language?: string;
    /** Optional two-letter country or region code. */
    readonly region?: string;
    /** Maximum characters requested for each result passage. */
    readonly maxLength?: number;
    /** Web IQ SafeSearch mode. */
    readonly safeSearch?: 'strict' | 'off';
}
/** Runtime validation and browser-renderable metadata for {@link Config}. */
export declare const Config: z<Config>;
/** Settings namespace carrying this provider's current configuration. */
export declare const WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/**
 * Register the Microsoft Web IQ search provider.
 * @param ctx - Cordis context carrying the web capability.
 * @param config - composition entry layered by optional Settings state.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map