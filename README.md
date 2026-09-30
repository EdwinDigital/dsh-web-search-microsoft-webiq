# @edwindigital/dsh-web-search-microsoft-webiq

English | [中文](README.zh.md)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A [Microsoft Web IQ](https://webiq.microsoft.ai/)-backed `WebSearchProvider` for the harness [web capability](https://github.com/deepseek-ai/deepseek-harness) (`ctx.web`). The package calls the Web Search v3 REST endpoint and maps query-relevant passages into the provider-neutral `WebSearchResult` consumed by `@deepseek-ai/dsh-tool-web`.

This is one dual-half plugin package. Its Host half registers provider `microsoft-webiq`; its browser half contributes a package-local item to the Plugins page. It does not register `webiq_search` or any other model-facing tool. Agent calls continue to use the single `web_search` tool.

The install patch selects Web IQ for `web_search` immediately. Turning off **Use Web IQ for web search** writes the Web profile's shipped `deepseek-official` provider into the profile user layer.

## About Microsoft Web IQ

Microsoft describes Web IQ as a suite of AI-native APIs that give applications access to fresh, real-world intelligence from across the web — web pages, news, images, and videos. This package consumes one of them, the Web Search v3 endpoint.

> [!IMPORTANT]
> **Web IQ is in limited access for select Azure customers**, so a key is not self-service. Request one through the [waitlist](https://aka.ms/webiq-access) before installing. Without a resolvable key the selected provider fails with `WEB_PROVIDER_CREDENTIAL_MISSING` and directs the user to **Plugins → Microsoft Web IQ Search → API Key**.

Figures Microsoft publishes for the service, against alternatives it does not name:

| Measure | Web IQ | Best alternative in the set |
|---|---|---|
| p95 latency | 164 ms | 406 ms |
| Grounding satisfaction | 79.05 | 75.70 |

Source: the [Web IQ site](https://webiq.microsoft.ai/), over a 3,000-query production sample at 10 results and 10,000 characters per result. This package does not verify them, and the mapping documented below decides what actually reaches the model.

Where this package sits between the model and that API:

```mermaid
flowchart LR
  M["Conversation model"] -->|web_search| T["dsh-tool-web"]
  T --> W["ctx.web seam"]
  W -->|"selected provider"| P["this package<br/>microsoft-webiq"]
  P -->|"POST /v3/search/web"| A["Microsoft Web IQ"]
  A -->|"passages"| P
  P -->|"WebSearchSource[]"| W
```

## Screenshots

The bundle detail page under the main sidebar's **Plugins** entry. **Use Web IQ for web search** is the switch that selects this provider; turned off, `web_search` uses the Web profile's shipped `deepseek-official` provider. Below it, one group holds the endpoint and API key and another holds language, region, passage length, and SafeSearch. The line under the masked password field reports only that a key is stored, without exposing the credential.

![The Microsoft Web IQ settings card](docs/images/screenshot-1-settings.png)

An agent answering from Web IQ results. Registration adds no tool, so the model issues the same `web_search` it always had — twice here — and nothing in the transcript names the provider. Only the sources behind the answer changed.

![An agent answering from web_search results served by Web IQ](docs/images/screenshot-2-web-search.png)

The session trace for one of those calls. The call takes 595 ms measured from session timestamps, and the turn's two calls total 1.2 s against 43.4 s of model time — retrieval is not where the turn spends its time.

![The session trace for one web_search call](docs/images/screenshot-3-trace.png)

## Installation and selection

The plugin is listed in [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), so any storefront reading that list offers it. In `dsh-market`, open **Settings → Plugin Market**, search `webiq`, and install from the entry — it is filed under **Browser & web**:

![The plugin listed in the dsh-market plugin marketplace](docs/images/screenshot-4-market.png)

The package is not on npm and its listing carries no prebuilt tarball, so the storefront installs from source — the same thing this command does:

```sh
dsh plugin --profile web add github:EdwinDigital/dsh-web-search-microsoft-webiq
```

Either route makes this an installed profile bundle, and the shipped composition mounts no Web IQ row until one of them runs.

The build output is committed, so a git install runs no build step. That is deliberate: preparing a git-hosted package runs `npm install` in a scratch tree, and npm auto-installs peer dependencies — which would pull a second, registry-resolved copy of the harness whose internal version constraints conflict with the installation this plugin is meant to extend. Shipping the artifact keeps the harness packages purely as peers resolved from the running installation.

Either route records the dependency, appends the package to the profile's `dsh.profile.bundles`, and layers this package's own patch after the shipped bundles:

```yaml
- insert:
    - id: web-search-microsoft-webiq
      name: '@edwindigital/dsh-web-search-microsoft-webiq'
- id: web
  config:
    searchProvider: microsoft-webiq
```

The second patch row makes Web IQ the first-install search provider. Because the installed bundle layer remains active, turning the card switch off writes `deepseek-official` into the higher-priority profile user layer. The credential reference resolves from the schema default; a deployment states `apiKeyEnv` in the plugin row only to redirect the lookup.

### Peer dependencies stay unresolved by design

Every harness package this plugin uses is an optional peer, and `pnpm peers check` inside the profile reports all of them missing. That is the expected state, not a broken install: bundles resolve from the running dsh installation through `$DSH_HOME/profiles/node_modules`, a directory the harness maintains and pnpm never sees. Marking them optional keeps the package manager from installing a competing copy — the failure mode that made the first git install unusable.

A peer therefore reports missing right up until the plugin loads it successfully. The signal that actually matters is the dsh boot: an absent package fails there by name.

### Replacing an earlier install

An install that predates this repository points at the package's old name and location. Remove it before adding this one, or the profile keeps a bundle entry whose target no longer exists:

```sh
dsh plugin --profile web remove @deepseek-ai/dsh-web-search-microsoft-webiq
dsh plugin --profile web add github:EdwinDigital/dsh-web-search-microsoft-webiq
```

Skipping the removal fails the next boot with `cannot resolve profile bundle`, naming the entry to remove. A running server keeps its loaded plugins, so restart it after either command.

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

The browser card writes replacement keys only through the credentials RPC. The password field is always blank after load and after an accepted save. Key literals are marked secret in the Host schema and are omitted from Settings descriptions, browser boot data, logs, and normal configuration reads. A missing key fails the selected provider with `WEB_PROVIDER_CREDENTIAL_MISSING`, names the unresolved reference, and directs the user to the Web IQ plugin page's API Key field. A key inherited from the launch environment is the one layer this process cannot rewrite, so the card disables its password field and says which layer owns the key instead of failing an accepted-looking save.

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

The Host exposes the plugin entry `web-search-microsoft-webiq` as a profile-backed live Config form; provider selection lives separately in the `web` entry. The installed bundle layer selects Web IQ until a higher-priority profile user setting says otherwise. Every editable field is volatile, so the next search reads saved values without replacing the plugin instance, while an in-flight search keeps its starting snapshot. The Plugins-page form starts with a switch that reflects this selection and, once off, writes `deepseek-official` into the profile user layer. Below it, one API configuration group holds the endpoint and the API key, a search parameter group holds language, region, passage length, and SafeSearch, and a single command at the bottom commits both owners: the key crosses the credentials RPC and the rest uses revision-fenced profile mutations. The credential reference stays a deployment choice made in `cordis.yml`, so no configuration surface asks a user for an environment variable name. Each owner is read back after a write, so a refused operation is reported rather than presented as accepted.

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

`language` and `region` are omitted unless configured. `maxResults` is forwarded only when the caller sets one — an unbounded request omits the field and takes Web IQ's own default — and an explicit value is capped at Web IQ's maximum of 50. Queries longer than 1,000 characters fail locally before credential or network work begins.

Every `webResults[]` item maps as follows:

| Web IQ | `WebSearchSource` |
|---|---|
| `url` | `url` |
| non-empty `title` | `title` |
| non-empty query-relevant `content` | `snippet` |
| non-empty `crawledAt` | `publishedAt` |

The provider reports `truncated: false`; `ctx.web` performs the final `maxResults` enforcement on normalized sources. The adapter validates the external envelope and every consumed item field. A missing `webResults` array, malformed item, non-JSON success body, redirect, network failure, or non-success status becomes `WEB_PROVIDER_ERROR`. HTTP messages include Web IQ's `userMessage`, `errorCode`, `retryAfter`, and `traceId` when present, never the key. Caller cancellation remains `WEB_ABORTED`, including during credential resolution or body parsing. The provider does not retry internally.

## Model Experience

### `web_search` tool result, when Web IQ is the selected provider

#### What the model sees

Registration adds no tool. Through `@deepseek-ai/dsh-tool-web`, the conversation model sees the existing `web_search` arguments and a normalized result containing URLs, titles, passages, and optional crawl timestamps. Web IQ receives only the search query and configured REST parameters; it does not receive the conversation transcript.

#### Token effect

Registration costs zero model tokens. Result tokens scale with the number and `maxLength` of passages returned, then the existing tool rendering limits apply. Web IQ is a retrieval API, so this package does not create a separate model turn.

#### KV Cache effect

Append-only. The tool result follows the reusable conversation prefix and does not invalidate earlier cache entries.

## Reaching the other Web IQ methods

This package registers one search provider, so every `web_search` posts to the web endpoint. Web IQ also publishes a Streamable HTTP MCP server exposing `web`, `videos`, `browse`, `news`, and `images` as five separate tools — the one route where the model picks the method per call instead of a deployment picking it once for every call.

Compose `@deepseek-ai/dsh-mcp-client` next to this package:

```yaml
- id: web-search-microsoft-webiq
  name: '@edwindigital/dsh-web-search-microsoft-webiq'

- id: mcp-webiq
  name: '@deepseek-ai/dsh-mcp-client'
  config:
    serverName: webiq
    transport: streamable-http
    url: https://api.microsoft.ai/v3/mcp
    headers:
      x-apikey: !!js process.env.MICROSOFT_WEBIQ_API_KEY
```

The model then sees `mcp__webiq__web`, `mcp__webiq__videos`, `mcp__webiq__browse`, `mcp__webiq__news`, and `mcp__webiq__images` beside `web_search`. Web IQ scopes that list to the calling key's allowed services, so a tool the key may not use never appears. These tools bypass `ctx.web`: their results are not normalized into `WebSearchSource`, `maxResults` and the settings card do not reach them, and `web.searchProvider` does not select among them.

### One key for both halves

Both halves name the same reference, `MICROSOFT_WEBIQ_API_KEY`, but they read it through different mechanisms, so which layer holds the value decides whether one key serves both.

The loader evaluates `headers` against `process.env`, and the launch environment materializes each of its layers there. A key in the launching shell, `<cwd>/.env`, or `$DSH_HOME/.env` therefore reaches the MCP entry and, through the credential provider, this package as well — one key, configured once.

A key typed into the settings card does not: that write crosses the credentials RPC into the credential provider's managed document, which the loader never reads. Prefer `$DSH_HOME/.env`, which sits below that document, so the card still reports the reference as configured and still accepts a replacement; the cost is that a replacement saved there outranks `.env` for `web_search` while the MCP tools keep reading the `process.env` value. The launching shell removes that split by shadowing the managed document outright, at the price of a read-only password field on the card.

## Known Limitations and Deferred Work

- **Only `/v3/search/web` is wired for search** — Web IQ also serves news (trusted sources, last 14 days), videos, images, and classic multi-answer, but `WebSearchRequest` carries only a query and a result bound, so no caller can name a method and every search posts `contentFormat: passage` to the web endpoint. Provider-specific modes wait on provider-neutral Service Definition fields; [Reaching the other Web IQ methods](#reaching-the-other-web-iq-methods) is the route that reaches them today, outside this seam.
- **`maxResults` is owned by `dsh-tool-web`, not this provider's settings card** — the Harness consumer currently defaults `searchMaxResults` to 8 and sends that bound through `WebSearchRequest`; this package forwards it to Web IQ and caps explicit values at the API maximum of 50. Changing the count therefore belongs in the `tool-web` entry. The current Web IQ card does not expose that shared setting, and a direct value above 50 is capped without a truncation signal.
- **No fetch provider for `/v3/browse`** — Browse can be implemented behind the existing `registerFetchProvider` role without changing the `web_fetch` tool, and it supports extracted text, HTML, or Markdown plus optional live crawling. It is not an exact replacement for the shipped HTTP fetcher: Browse returns extracted page content rather than the resource body, omits the origin HTTP status, may return API `202` while a live crawl is pending, and provides no authoritative truncation flag. A future integration should therefore be an explicitly selectable fetch provider with documented mappings, not a silent replacement.
- **`safeSearch: off` does not transfer the caller's content duty** — Web IQ still blocks illegal content, but potentially sensitive legal content reaches the model unchanged; this package adds no further filtering.
- **`site:` and `-site:` operators degrade the result set** — relevance drops, and `site:` can return adult content regardless of the configured SafeSearch mode.
- **A custom `endpoint` receives the resolved key** — the deployment, not this package, decides where the credential is sent; only the HTTPS requirement is enforced locally.
- **`available()` cannot confirm a resolvable credential** — resolution is asynchronous, so a selected provider with no stored or ambient value fails at search start with `WEB_PROVIDER_CREDENTIAL_MISSING` rather than at selection.
- **Real-API coverage is opt-in** — `tests/microsoft-webiq.e2e.ts` self-skips unless `MICROSOFT_WEBIQ_API_KEY` is set, so drift in Web IQ's own responses surfaces only when a key is present.

## Development

`npm run build` runs `tsc -b` for the declarations and `tsdown` for both halves. Only what the manifest publishes is tracked: `lib/index.js`, `lib/client.js`, `locale/*.json`, and `lib/types/**/*.d.ts`; source maps stay outside the package payload.

Committing the artifact removes the install-time build and moves an obligation onto every change: **rebuild and commit `lib/` in the same commit as any `src/` edit.** Nothing enforces this, and a stale artifact is silent — installers keep resolving the previous code with no warning at any layer. `git status` after a build is the check, which works because the build is deterministic: repeated builds of unchanged sources produce byte-identical output, so any diff is a real change.

The browser half is bundled to the harness client-loader contract: a CJS closure handed to `window.__ModuleLoader__.load`, platform modules kept external so they resolve from the frozen module table, and CSS Modules compiled through lightningcss into one injected style tag. That contract lives in a harness build helper that is not a published package, so `tsdown.config.ts` reproduces it here. A harness change to the loader format would break this plugin at load time; the wrapper header in `lib/client.js` is what to compare against.

Type checking needs the harness packages resolvable. There is no release to install them from, so point the peers at a harness checkout — linking its workspace packages into `node_modules` — before running `npm run typecheck`.
