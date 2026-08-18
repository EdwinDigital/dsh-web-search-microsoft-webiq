/** Microsoft Web IQ Web Search v3 provider for the DSH web capability. */
import type { CredentialRef } from '@deepseek-ai/dsh-credentials';
import type { WebSearchProvider, WebSearchRequest, WebSearchResult } from '@deepseek-ai/dsh-web';
/** Stable id this provider registers under. */
export declare const MICROSOFT_WEBIQ_PROVIDER_ID = "microsoft-webiq";
/** Public Microsoft Web IQ Web Search v3 endpoint. */
export declare const MICROSOFT_WEBIQ_DEFAULT_ENDPOINT = "https://api.microsoft.ai/v3/search/web";
/** Default credential reference; provider-qualified so an unrelated `WEBIQ_API_KEY` cannot shadow it. */
export declare const MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV = "MICROSOFT_WEBIQ_API_KEY";
/** Default maximum passage length sent to Web IQ. */
export declare const MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH = 5000;
/** Default SafeSearch mode sent to Web IQ. */
export declare const MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH: "strict";
/** Resolved options for the next Web IQ search operation. */
export interface MicrosoftWebIqSearchProviderOptions {
    /** Literal API key; when present it wins over {@link resolveApiKey}. */
    readonly apiKey?: string;
    /** Resolve the current API key for one operation. */
    readonly resolveApiKey?: () => Promise<string | undefined>;
    /** Credential reference named by missing-key diagnostics. */
    readonly apiKeyEnv?: CredentialRef;
    /** Full Web Search endpoint. */
    readonly endpoint: string;
    /** Optional ISO 639-1 interface language. */
    readonly language?: string;
    /** Optional two-letter country or region code. */
    readonly region?: string;
    /** Maximum characters requested for each passage. */
    readonly maxLength: number;
    /** Web IQ SafeSearch mode. */
    readonly safeSearch: 'strict' | 'off';
}
/**
 * Validate and normalize one unknown Web IQ success payload.
 * @param payload - parsed external JSON.
 * @returns normalized DSH search sources.
 */
export declare function mapWebIqResponse(payload: unknown): WebSearchResult;
/** Microsoft Web IQ implementation of the provider-neutral web search interface. */
export declare class MicrosoftWebIqSearchProvider implements WebSearchProvider {
    private readonly resolveOptions;
    readonly id = "microsoft-webiq";
    /**
     * @param resolveOptions - options for the next operation; called once at operation entry.
     */
    constructor(resolveOptions: () => MicrosoftWebIqSearchProviderOptions);
    available(): boolean;
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult>;
    /** Resolve one operation's credential without retaining it on the provider. */
    private resolveCredential;
}
//# sourceMappingURL=provider.d.ts.map