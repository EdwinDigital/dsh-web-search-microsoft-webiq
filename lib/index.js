import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import { WebError } from "@deepseek-ai/dsh-web";
//#region lib/types/provider.js
/** Microsoft Web IQ Web Search v3 provider for the DSH web capability. */
/** Stable id this provider registers under. */
const MICROSOFT_WEBIQ_PROVIDER_ID = "microsoft-webiq";
/** Public Microsoft Web IQ Web Search v3 endpoint. */
const MICROSOFT_WEBIQ_DEFAULT_ENDPOINT = "https://api.microsoft.ai/v3/search/web";
/** Default credential reference; provider-qualified so an unrelated `WEBIQ_API_KEY` cannot shadow it. */
const MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV = "MICROSOFT_WEBIQ_API_KEY";
/** Default maximum passage length sent to Web IQ. */
const MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH = 5e3;
/** Default SafeSearch mode sent to Web IQ. */
const MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH = "strict";
const DEFAULT_MAX_RESULTS = 10;
const MAX_RESULTS = 50;
const MAX_QUERY_LENGTH = 1e3;
const MAX_CONTENT_LENGTH = 5e5;
const USER_AGENT = "deepseek-harness/0.1.0";
/**
* Validate and normalize one unknown Web IQ success payload.
* @param payload - parsed external JSON.
* @returns normalized DSH search sources.
*/
function mapWebIqResponse(payload) {
	return {
		sources: parseWebResponse(payload).webResults.map((item) => ({
			url: item.url,
			...item.title.length > 0 ? { title: item.title } : {},
			...item.content.length > 0 ? { snippet: item.content } : {},
			...item.crawledAt !== void 0 && item.crawledAt.length > 0 ? { publishedAt: item.crawledAt } : {}
		})),
		truncated: false
	};
}
/** Microsoft Web IQ implementation of the provider-neutral web search interface. */
var MicrosoftWebIqSearchProvider = class {
	resolveOptions;
	id = MICROSOFT_WEBIQ_PROVIDER_ID;
	/**
	* @param resolveOptions - options for the next operation; called once at operation entry.
	*/
	constructor(resolveOptions) {
		this.resolveOptions = resolveOptions;
	}
	available() {
		const options = this.resolveOptions();
		return ((options.apiKey?.length ?? 0) > 0 || options.resolveApiKey !== void 0) && isHttpsEndpoint(options.endpoint) && isOptionalIsoCode(options.language) && isOptionalIsoCode(options.region) && Number.isInteger(options.maxLength) && options.maxLength > 0 && options.maxLength <= MAX_CONTENT_LENGTH;
	}
	async search(request, signal) {
		throwIfAborted(signal);
		if (request.query.length > MAX_QUERY_LENGTH) throw new WebError(`Microsoft Web IQ query exceeds the ${MAX_QUERY_LENGTH}-character limit`, "WEB_PROVIDER_ERROR");
		const options = this.resolveOptions();
		const apiKey = await this.resolveCredential(options, signal);
		throwIfAborted(signal);
		const body = {
			query: request.query,
			maxResults: Math.min(request.maxResults ?? DEFAULT_MAX_RESULTS, MAX_RESULTS),
			...options.language !== void 0 && options.language.length > 0 ? { language: options.language } : {},
			...options.region !== void 0 && options.region.length > 0 ? { region: options.region } : {},
			contentFormat: "passage",
			maxLength: options.maxLength,
			safeSearch: options.safeSearch
		};
		let response;
		try {
			response = await fetch(options.endpoint, {
				method: "POST",
				redirect: "error",
				headers: {
					"x-apikey": apiKey,
					"content-type": "application/json",
					"accept": "application/json",
					"user-agent": USER_AGENT
				},
				body: JSON.stringify(body),
				...signal !== void 0 ? { signal } : {}
			});
		} catch (error) {
			if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
			throw new WebError(`Microsoft Web IQ search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
		if (!response.ok) {
			let message = `Microsoft Web IQ API error (HTTP ${response.status})`;
			try {
				message = formatHttpError(response.status, await response.json());
			} catch (error) {
				if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
			}
			throw new WebError(message, "WEB_PROVIDER_ERROR");
		}
		try {
			return mapWebIqResponse(await response.json());
		} catch (error) {
			if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
			if (error instanceof WebError) throw error;
			throw new WebError(`Microsoft Web IQ returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
	}
	/** Resolve one operation's credential without retaining it on the provider. */
	async resolveCredential(options, signal) {
		throwIfAborted(signal);
		if (options.apiKey !== void 0 && options.apiKey.length > 0) return options.apiKey;
		let resolved;
		try {
			resolved = await abortable(options.resolveApiKey?.() ?? Promise.resolve(void 0), signal);
		} catch (error) {
			if (signal?.aborted === true || isAbortError(error)) throw aborted(signal, error);
			throw new WebError(`Microsoft Web IQ credential resolution failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
		if (resolved !== void 0 && resolved.length > 0) return resolved;
		throw new WebError(`Microsoft Web IQ has no API key for "${options.apiKeyEnv ?? "MICROSOFT_WEBIQ_API_KEY"}"; store it through the credentials service, export it in the launching environment, or set a literal "apiKey" in the plugin config`, "WEB_PROVIDER_CREDENTIAL_MISSING");
	}
};
/** Parse only the external success fields consumed by this adapter. */
function parseWebResponse(payload) {
	if (!isRecord(payload) || !Array.isArray(payload.webResults)) throw malformedResponse("expected a webResults array");
	return { webResults: payload.webResults.map((item, index) => parseWebResult(item, index)) };
}
/** Validate one external result item. */
function parseWebResult(payload, index) {
	if (!isRecord(payload) || typeof payload.title !== "string" || typeof payload.url !== "string" || payload.url.length === 0 || typeof payload.content !== "string" || payload.crawledAt !== void 0 && typeof payload.crawledAt !== "string") throw malformedResponse(`webResults[${index}] has invalid title, url, content, or crawledAt fields`);
	return {
		title: payload.title,
		url: payload.url,
		content: payload.content,
		...payload.crawledAt !== void 0 ? { crawledAt: payload.crawledAt } : {}
	};
}
/** Build a secret-free error message from the documented Web IQ error fields. */
function formatHttpError(status, payload) {
	const parsed = parseErrorResponse(payload);
	const message = parsed.userMessage !== void 0 && parsed.userMessage.length > 0 ? parsed.userMessage : `Microsoft Web IQ API error (HTTP ${status})`;
	const diagnostics = [
		parsed.errorCode === void 0 ? void 0 : `errorCode=${parsed.errorCode}`,
		parsed.retryAfter === void 0 ? void 0 : `retryAfter=${parsed.retryAfter}`,
		parsed.traceId === void 0 ? void 0 : `traceId=${parsed.traceId}`
	].filter((value) => value !== void 0);
	return diagnostics.length === 0 ? message : `${message} (${diagnostics.join(", ")})`;
}
/** Read optional string diagnostics from an unknown error body. */
function parseErrorResponse(payload) {
	if (!isRecord(payload)) return {};
	return {
		...typeof payload.errorCode === "string" ? { errorCode: payload.errorCode } : {},
		...typeof payload.userMessage === "string" ? { userMessage: payload.userMessage } : {},
		...typeof payload.retryAfter === "string" ? { retryAfter: payload.retryAfter } : {},
		...typeof payload.traceId === "string" ? { traceId: payload.traceId } : {}
	};
}
/** Construct a stable malformed-response error. */
function malformedResponse(detail) {
	return new WebError(`Microsoft Web IQ returned a malformed response: ${detail}`, "WEB_PROVIDER_ERROR");
}
/** True for non-array JSON objects. */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** True when an endpoint is absolute HTTPS. */
function isHttpsEndpoint(value) {
	if (!URL.canParse(value)) return false;
	return new URL(value).protocol === "https:";
}
/** True when an absent or two-letter ISO code can be sent to Web IQ. */
function isOptionalIsoCode(value) {
	return value === void 0 || /^[A-Za-z]{2}$/u.test(value);
}
/** Race credential resolution against caller cancellation. */
function abortable(operation, signal) {
	if (signal === void 0) return operation;
	if (signal.aborted) return Promise.reject(aborted(signal));
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			reject(aborted(signal));
		};
		signal.addEventListener("abort", onAbort, { once: true });
		operation.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (error) => {
			signal.removeEventListener("abort", onAbort);
			reject(error);
		});
	});
}
/** Throw the provider's stable cancellation error for an already-aborted call. */
function throwIfAborted(signal) {
	if (signal?.aborted === true) throw aborted(signal);
}
/** Build the provider's stable cancellation error. */
function aborted(signal, fallback) {
	return new WebError("Microsoft Web IQ search aborted", "WEB_ABORTED", { cause: signal?.aborted === true ? signal.reason : fallback });
}
/** True for a fetch or response-body abort. */
function isAbortError(error) {
	return error instanceof DOMException && error.name === "AbortError";
}
//#endregion
//#region lib/types/index.js
/** Register Microsoft Web IQ as a provider in the DSH web capability. */
/** Cordis plugin name used by loader diagnostics. */
const name = "web-search-microsoft-webiq";
/** The web seam this provider registers into. */
const inject = ["web"];
const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;
const HTTPS_ENDPOINT_PATTERN = /^https:\/\/[^\s]+$/u;
const ISO_CODE_PATTERN = /^[A-Za-z]{2}$/u;
/** Runtime validation and browser-renderable metadata for {@link Config}. */
const Config = z.object({
	apiKey: z.string().role("secret"),
	apiKeyEnv: z.string().pattern(CREDENTIAL_REF_PATTERN).role("credential-ref").default(MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV),
	endpoint: z.string().pattern(HTTPS_ENDPOINT_PATTERN).default(MICROSOFT_WEBIQ_DEFAULT_ENDPOINT),
	language: z.string().pattern(ISO_CODE_PATTERN),
	region: z.string().pattern(ISO_CODE_PATTERN),
	maxLength: z.number().step(1).min(1).max(5e5).default(MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH),
	safeSearch: z.union(["strict", "off"]).default(MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH)
});
/** Settings namespace carrying this provider's current configuration. */
const WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE = settingsNamespace("web-search-microsoft-webiq");
/** Reject runtime constraints that are stricter than the serialized schema. */
function validateConfig(config) {
	const endpoint = config.endpoint ?? "https://api.microsoft.ai/v3/search/web";
	if (!URL.canParse(endpoint) || new URL(endpoint).protocol !== "https:") throw new TypeError("web-search-microsoft-webiq endpoint must be an absolute HTTPS URL");
	if (config.language !== void 0 && !ISO_CODE_PATTERN.test(config.language)) throw new TypeError("web-search-microsoft-webiq language must be a two-letter ISO 639-1 code");
	if (config.region !== void 0 && !ISO_CODE_PATTERN.test(config.region)) throw new TypeError("web-search-microsoft-webiq region must be a two-letter country or region code");
	const maxLength = config.maxLength ?? 5e3;
	if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 5e5) throw new TypeError("web-search-microsoft-webiq maxLength must be an integer between 1 and 500000");
}
/**
* Resolve the current section into one operation's immutable options.
* @param ctx - plugin context supplying credentials and launch environment.
* @param config - authoritative section for the next operation.
* @returns fully defaulted provider options.
*/
function resolveOptions(ctx, config) {
	const apiKeyEnv = credentialRef(config.apiKeyEnv ?? "MICROSOFT_WEBIQ_API_KEY");
	const literalApiKey = config.apiKey !== void 0 && config.apiKey.length > 0 ? config.apiKey : void 0;
	return {
		...literalApiKey === void 0 ? {} : { apiKey: literalApiKey },
		resolveApiKey: async () => {
			const stored = await ctx.get("credentials")?.resolve(apiKeyEnv);
			if (stored !== void 0 && stored.value.length > 0) return stored.value;
			const ambient = launchEnvironmentOf(ctx).get(apiKeyEnv);
			return ambient !== void 0 && ambient.value.length > 0 ? ambient.value : void 0;
		},
		apiKeyEnv,
		endpoint: config.endpoint ?? "https://api.microsoft.ai/v3/search/web",
		...config.language === void 0 ? {} : { language: config.language },
		...config.region === void 0 ? {} : { region: config.region },
		maxLength: config.maxLength ?? 5e3,
		safeSearch: config.safeSearch ?? "strict"
	};
}
/**
* Register the Microsoft Web IQ search provider.
* @param ctx - Cordis context carrying the web capability.
* @param config - composition entry layered by optional Settings state.
*/
function apply(ctx, config) {
	validateConfig(config);
	let current = () => config;
	installSettingsSection(ctx, WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, Config, config, {
		setSource: (source) => {
			current = source;
		},
		onChange: () => {},
		validate: validateConfig
	});
	ctx.web.registerSearchProvider(new MicrosoftWebIqSearchProvider(() => resolveOptions(ctx, current())));
}
//#endregion
export { Config, MICROSOFT_WEBIQ_DEFAULT_API_KEY_ENV, MICROSOFT_WEBIQ_DEFAULT_ENDPOINT, MICROSOFT_WEBIQ_DEFAULT_MAX_LENGTH, MICROSOFT_WEBIQ_DEFAULT_SAFE_SEARCH, MICROSOFT_WEBIQ_PROVIDER_ID, MicrosoftWebIqSearchProvider, WEB_SEARCH_MICROSOFT_WEBIQ_SETTINGS_NAMESPACE, apply, inject, mapWebIqResponse, name };
