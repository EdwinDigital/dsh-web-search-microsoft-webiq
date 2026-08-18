# @edwindigital/dsh-web-search-microsoft-webiq

English

A [Microsoft Web IQ](https://webiq.microsoft.ai/)-backed `WebSearchProvider` for the harness [web capability](https://github.com/deepseek-ai/deepseek-harness) (`ctx.web`). The package calls the Web Search v3 REST endpoint and maps query-relevant passages into the provider-neutral `WebSearchResult` consumed by `@deepseek-ai/dsh-tool-web`.

This is one dual-half plugin package. Its Host half registers provider `microsoft-webiq`; its browser half contributes a package-local card to the Plugins settings page. It does not register `webiq_search` or any other model-facing tool. Agent calls continue to use the single `web_search` tool.

Installing the package does not silently replace an existing search provider. The `web` seam keeps `deepseek-official` selected until the user clicks **Set as default** or stores `web.searchProvider: microsoft-webiq` explicitly.

## Installation and selection

The package is an installable profile bundle, so the shipped composition mounts no Web IQ row until a profile installs it:

```sh
dsh plugin --profile web add @edwindigital/dsh-web-search-microsoft-webiq
```

Or install this repository directly:

```sh
dsh plugin --profile web add github:EdwinDigital/dsh-web-search-microsoft-webiq
```

The build output is committed, so a git install runs no build step. That is deliberate: preparing a git-hosted package runs `npm install` in a scratch tree, and npm auto-installs peer dependencies — which would pull a second, registry-resolved copy of the harness whose internal version constraints conflict with the installation this plugin is meant to extend. Shipping the artifact keeps the harness packages purely as peers resolved from the running installation.

Either form records the dependency, appends the package to the profile's `dsh.profile.bundles`, and layers this package's own patch after the shipped bundles:

```yaml
- insert:
    - id: web-search-microsoft-webiq
      name: '@edwindigital/dsh-web-search-microsoft-webiq'
```

The credential reference resolves from the schema default; a deployment states `apiKeyEnv` in the row only to redirect the lookup.

A composition that mounts rows directly states the same row beside the seam and the tool:

```yaml
- id: web
  name: '@deepseek-ai/dsh-web'
  config:
    searchProvider: deepseek-official

- id: web-search-microsoft-webiq
  name: '@edwindigital/dsh-web-search-microsoft-webiq'
  config:
    apiKeyEnv: MICROSOFT_WEBIQ_API_KEY

- id: tool-web
  name: '@deepseek-ai/dsh-tool-web'
```

The Web IQ row registers the provider and activates this package's browser module. Select it in the card or configure:

```yaml
web:
  searchProvider: microsoft-webiq
```

`@deepseek-ai/dsh-web` reads that setting at operation entry. The next `web_search` uses Web IQ without a restart, while an already-running search keeps the provider and options it started with. Without an explicit selection, the web seam auto-selects only when exactly one usable provider is registered.

## Credentials

The default credential reference is `MICROSOFT_WEBIQ_API_KEY`. Resolution occurs for every search in this order:

1. A non-empty literal `apiKey` from direct Cordis composition.
2. The optional `ctx.credentials` service for `apiKeyEnv`.
3. The launching environment for the same reference.

The browser card writes replacement keys only through the credentials RPC. The password field is always blank after load and after an accepted save. Key literals are marked secret in the Host schema and are omitted from Settings descriptions, browser boot data, logs, and normal configuration reads. A missing key fails the selected provider with `WEB_PROVIDER_CREDENTIAL_MISSING` and names only the unresolved reference. A key inherited from the launch environment is the one layer this process cannot rewrite, so the card disables its password field and says which layer owns the key instead of failing an accepted-looking save.

## Config

| Key | Default | Meaning |
|---|---|---|
| `apiKey` | omitted | Literal API key for direct composition. Prefer `apiKeyEnv`; a non-empty literal wins. |
| `apiKeyEnv` | `MICROSOFT_WEBIQ_API_KEY` | Credential reference resolved for each search. A deployment choice; the browser card neither shows nor edits it. |
| `endpoint` | `https://api.microsoft.ai/v3/search/web` | Full HTTPS Web Search v3 endpoint. A deployment proxy may be used, but it receives the resolved key. |
| `language` | omitted | Optional two-letter ISO 639-1 interface language. Web IQ defaults to `en`. |
| `region` | omitted | Optional two-letter country or region code. Web IQ defaults to `US`. |
| `maxLength` | `5000` | Maximum passage characters per result; positive integer, maximum `500000`. |
| `safeSearch` | `strict` | `strict` or `off`. Web IQ still blocks illegal content when set to `off`. |

The Host owns settings namespace `web-search-microsoft-webiq`; provider selection lives separately in namespace `web`. The card opens with a switch that selects Web IQ for `web_search` and, once off, clears the user override so the composed provider applies again. Below it, one API configuration group holds the endpoint and the API key, a search parameter group holds language, region, passage length, and SafeSearch, and a single command at the bottom commits both owners: the key crosses the credentials RPC and the rest goes to the settings namespace. The credential reference stays a deployment choice made in `cordis.yml`, so no configuration surface asks a user for an environment variable name. Each owner is read back after a write, so a refused operation is reported rather than presented as accepted.

## REST contract and mapping

Each search sends:

```http
POST https://api.microsoft.ai/v3/search/web
x-apikey: <resolved credential>
content-type: application/json
```

```json
{
  "query": "current TypeScript release",
  "maxResults": 10,
  "contentFormat": "passage",
  "maxLength": 5000,
  "safeSearch": "strict"
}
```

`language` and `region` are omitted unless configured. `maxResults` defaults to 10 for a direct provider call and is capped at Web IQ's maximum of 50. Queries longer than 1,000 characters fail locally before credential or network work begins.

Every `webResults[]` item maps as follows:

| Web IQ | `WebSearchSource` |
|---|---|
| `url` | `url` |
| non-empty `title` | `title` |
| non-empty query-relevant `content` | `snippet` |
| non-empty `crawledAt` | `publishedAt` |

The provider reports `truncated: false`; `ctx.web` performs the final `maxResults` enforcement on normalized sources. The adapter validates the external envelope and every consumed item field. A missing `webResults` array, malformed item, non-JSON success body, redirect, network failure, or non-success status becomes `WEB_PROVIDER_ERROR`. HTTP messages include Web IQ's `userMessage`, `errorCode`, `retryAfter`, and `traceId` when present, never the key. Caller cancellation remains `WEB_ABORTED`, including during credential resolution or body parsing. The provider does not retry internally.

## Model Experience

### What the model sees

Registration adds no tool. Through `@deepseek-ai/dsh-tool-web`, the conversation model sees the existing `web_search` arguments and a normalized result containing URLs, titles, passages, and optional crawl timestamps. Web IQ receives only the search query and configured REST parameters; it does not receive the conversation transcript.

### Token effect

Registration costs zero model tokens. Result tokens scale with the number and `maxLength` of passages returned, then the existing tool rendering limits apply. Web IQ is a retrieval API, so this package does not create a separate model turn.

### KV Cache effect

Append-only. The tool result follows the reusable conversation prefix and does not invalidate earlier cache entries.

## Limits

- `safeSearch: off` still requires the caller to handle potentially sensitive legal content appropriately.
- `site:` and `-site:` query operators can reduce relevance; `site:` may return adult content regardless of SafeSearch.
- A custom endpoint determines where the API key is sent and must use HTTPS.
- Credential availability is asynchronous. `available()` can confirm that a resolver exists, but a selected provider with no resolved value fails when the search starts.
- Real API coverage is opt-in: set `MICROSOFT_WEBIQ_API_KEY` before running `tests/microsoft-webiq.e2e.ts`.