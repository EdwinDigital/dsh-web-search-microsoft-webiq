# Plugin conventions

The harness contracts that bind this package, extracted from the DeepSeek Harness documentation so an out-of-tree checkout can be developed without one open beside it.

The harness pages remain authoritative and this file is a derived index: when the two disagree, the harness wins and this file is stale. Each rule below names its source page so a claim can be re-checked rather than trusted. The routing page for the whole subject is the harness `docs/cookbook/developing-a-plugin.md`, which classifies this package as an out-of-tree plugin that reaches users through `dsh plugin --profile <name> add` and therefore owes the composition-layer conventions rather than the workspace gates.

## The search-provider contract

`WebSearchProvider` has exactly three members — `id`, `available()`, `search()` — and its authoritative declaration is `packages/web/web/src/types.ts`, not the subsystem page. Both methods document at that interface, so the implementations here carry no JSDoc of their own.

**`available()` is synchronous and must not touch the network.** The harness `docs/subsystems/web.md` defines it as "a cheap LOCAL check (credential presence, parseable config)" and states the prohibition outright.

That parenthetical collides with the credential seam, whose `resolve()` is async and forbids caching across operations, so a credentials-backed provider cannot consult the store from `available()`. The in-tree reference implementation settles it: `packages/web/web-search-deepseek` treats an installed resolver as satisfying the credential half — `(options.apiKey?.length ?? 0) > 0 || options.resolveApiKey !== undefined` — with the resolver supplied unconditionally, exactly as here. Read against `web.md` alone this looks like a gap; it is the sanctioned shape, and the providers that check a resolved key directly (`web-search-exa`, `web-search-perplexity`) can only do so because they never use the credentials seam at all. Do not "fix" it toward those.

**The seam owns the result bound, the provider owns the data.** `maxResults` is "passed through the seam and enforced on the way back — if a provider over-returns, the seam truncates `sources[]` and sets `truncated`". Two consequences bind every mapping here: an omitted `maxResults` means *no bound*, and `truncated` reports seam-side dropping only, so returning `false` unconditionally is correct rather than lazy. Applying the bound at the request layer is permitted purely as a cost optimisation, never as the enforcement.

**Never invent an optional field.** `title`, `snippet`, and `publishedAt` are optional "because not every provider returns them — forcing adapters to invent them would make the seam lie". Omitting a field the upstream response left empty is the contract; emitting `''` breaks it.

**Provider error codes are open.** `WebError` carries "a `code: string` (open …), not a closed union: a provider may raise its own codes without editing `dsh-web`". `WEB_PROVIDER_CREDENTIAL_MISSING` is therefore legitimate and must not be "corrected" to a seam code. The seam owns `WEB_PROVIDER_UNAVAILABLE`, `WEB_PROVIDER_CONFIGURED_MISSING`, `WEB_PROVIDER_CONFIGURED_UNAVAILABLE`, `WEB_PROVIDER_AMBIGUOUS`, `WEB_DUPLICATE_PROVIDER`, `WEB_ABORTED`, and `WEB_PROVIDER_ERROR`; the fetch transport codes belong to `dsh-web-fetch-http` and are not ours to raise.

**Selection is order-independent.** A capability takes an explicit provider id or auto-selects when exactly one provider is usable; two usable providers with no configured id is `WEB_PROVIDER_AMBIGUOUS`, "not first-wins". An `available()` that over-reports therefore does not merely mislead — it can break a composition that would otherwise resolve cleanly.

**Registration returns a disposer that the seam already owns.** `registerSearchProvider` is "disposed with the calling fiber", so discarding the return value is safe and holding it is not required.

## Credentials

Configuration carries references, never values: a settings section or `cordis.yml` entry names an environment-variable-shaped reference and the provider owns the secret behind it.

**Resolve once per operation and never cache across operations.** The harness `docs/subsystems/credentials.md` states that consumers "must not cache across operations — that per-operation read is what makes a changed credential reach the next operation without a restart". The options thunk in `src/index.ts` exists for this reason; caching a resolved key anywhere would defeat rotation.

**An empty stored value is absent everywhere** — `resolve` skips it and `describe` reports it unconfigured, so a blank can never masquerade as configured. The explicit length guard here is redundant defence, not a requirement.

**`resolve()` is async**, which is precisely why it cannot be consulted from the synchronous `available()`.

A reference supplied by the live process environment is reported `writable: false`, and the seam rejects a write against it; the card renders the reference read-only instead of failing an accepted-looking save.

## Settings

Live plugin fields use Cordis `Volatile<T>` references. Each field schema calls `.volatile()`, and an operation reads `.get()` once when it starts so a saved edit affects the next operation without replacing the plugin instance or changing an in-flight operation's captured values. This is the current `docs/cookbook/adding-a-settings-card.md` contract and the shape used by `packages/web/web-search-deepseek`.

The Host projects volatile Config into profile-backed forms. The browser reaches those forms through `ctx.configForms.get(namespace)`, and `whileServed([namespace], register)` keeps the UI present exactly while the Host serves that plugin entry.

Resolution layers remain **schema defaults, then the composition base, then the profile user layer**. Browser writes use revision-fenced `mutate` path operations against the form; clearing a path re-inherits the composition or schema value.

An installed bundle patch may override a shared setting after the shipped bundle layers. This package selects `web.searchProvider: microsoft-webiq` there so a first installation is active immediately. Because that layer remains while the bundle is installed, disabling Web IQ through the card writes `deepseek-official` into the higher-priority profile user layer; merely unsetting the field would expose the bundle layer and select Web IQ again.

**Secrets never cross a read surface.** `role('secret')` keeps the literal out of form responses. The card starts its password draft blank, writes through `ctx.remote.credentials.set(ref, value)`, and re-reads only `configured` and `writable`; a wholesale settings replacement would be both unnecessary and unsafe.

Cross-field or stricter constraints that the serialized schema cannot express are checked from the resolved snapshot at plugin load and again when a search captures its options. A rejected live edit therefore cannot turn into a credentialed request with invalid endpoint or parameter values.

## Runtime invariants

Current package rules say: **publish `./invariant` only for a relationship whose independent observations can diverge**. Empty installers, service-presence checks, plugin metadata checks, effects, and fixed examples are invalid.

This package owns no such independently observable relationship. It therefore publishes no companion; adding an empty one to satisfy an old package checklist would now be a conformance failure.

## The browser half

`dsh.client` requires `platform: 'web'` and a `./client` export. `inject` lists package-level informational dependencies used for preflight display and HMR diffing; Cordis service `inject` still controls activation. `external` exists for exceptional non-baseline module-table requests, but feature plugins must not use it as a dependency mechanism.

The row id is the package name, and the bundle is served from `/plugins/<id>/client.js`. An unbuilt bundle answers "a loud 404 rather than letting the carrier's SPA fallback ship HTML as JavaScript" — which is the mechanical reason this repository commits `lib/`.

Without `immediately`, the row is lazy and "fetched on first import" rather than executed during module-face boot.

The CJS-closure loader format that `tsdown.config.ts` reproduces has **no binding statement in the subsystem pages**; its only sources are `packages/client/modules/README.md` and the shared preset `packages/client/tsdown.client.ts`, neither of which is a published package. Treat it as an unversioned coupling and compare against the wrapper header in `lib/client.js` after any harness upgrade.

For anything touching slots, props, or stores, `packages/client/AGENTS.md` is authoritative — notably that a UI plugin composes only through `ctx.slots.register`, that components never see `ctx`, stores come from `@deepseek-ai/dsh-client-store`, and the `/client` entrypoint exports only loader needs plus public types.

The Plugins page renders a community bundle's own form through `plugins.bundle.config`, keyed by its full npm package name. `plugins.item` is reserved for official companion settings packages shipped with the Harness, while `plugins.row.config` gives one bundle row its own Configure action. Configuration entries render `props.view === 'page'` as their controls; `summary` is used only for official cards or a row whose package description is absent. The old `settings.plugin.item` slot and `settingsScope` service are no longer current.

The shared module baseline is now `PLATFORM_MODULES`: React, Cordis, `dsh-client-store`, `ui-slots`, `ui-primitives`, and `ui-dockkit`. The standalone build must externalize exactly the baseline identities it imports and inline other browser implementation code.

## Package and README obligations

The README ends with the canonical Model Experience format: one H3 per model-context entry, then the three ordered H4 fields — `What the model sees`, `Token effect`, `KV Cache effect` — with one prose paragraph under each. A package with no direct effect uses the audited `None, as ` or `Indirectly, through ` sentence followed by a `KV Cache effect` H4 and one non-empty paragraph.

This package is a Service Provider behind `dsh-tool-web`, so its entry is the indirect form. It "may name the consumer that surfaces this package's contribution, but it does not restate that consumer's implementation" — do not describe how `web_search` renders sources.

`## Known Limitations and Deferred Work` records "durable consumer gaps and non-obvious maintainer constraints owned by this package"; ordinary cleanup stays in a source TODO instead.

Naming follows the role that exists: a `Provider` supplies one implementation and takes a vendor qualifier when several can exist. In-package relative imports use explicit `.ts` specifiers in source, which the compiler rewrites on emit.

The published payload stays closed — every relative runtime import and emitted asset must be covered by `files` — and `src`, declaration maps, and JS maps are not published.

Official Harness packages remain peer dependencies with an explicit prerelease branch. The supported line is `>=0.2.0-rc.2 <0.3.0-0`; a wildcard or a broad range without a comparator on the `0.2.0` prerelease tuple silently excludes the very Harness prereleases this package is developed against. A future prerelease on another `major.minor.patch` tuple requires a reviewed range update.

An installable plugin may ship `locale/en.json` plus matching language files and export `./locale/*.json`. The Plugin Manager and Settings can then show localized `meta.title` and `meta.description` without activating the plugin; `package.json` remains the fallback.

Plugin artwork is package metadata, not browser code. A top-level manifest `"icon": "./icon.svg"` points to a self-contained SVG, PNG, JPEG, or WebP file inside the manifest directory, at most 256 KiB; the file belongs in `files` but needs no export. The Host reads it into a data URL without activating the plugin, and Plugin Manager bundle cards, details, component rows, configuration details, and Settings inventory all consume it. URLs, absolute paths, files outside the package, and symlinks escaping the package are rejected.

## What does not bind this package

These are workspace rules enforced by harness scripts over `packages/**`, and adopting them here would be wrong rather than merely unnecessary.

| Rule | Why it does not apply |
|---|---|
| `private: true`, version matching the root manifest | workspace-publication invariants; this is a standalone published package |
| Cordis in both `peerDependencies` and `devDependencies`, every dsh peer mirrored into dev | enforced by `check-workspace-constraints` over the workspace; the deliberate optional-peer model here is incompatible on purpose |
| `packages/<group>/<pkg>` placement and root-config registration (`tsconfig.*.json`, `knip.json`) | harness repository layout |
| `tsconfig.base.client.json` and the shared `tsdown.client.ts` preset | not resolvable out-of-tree; reproducing the behaviour locally is the only option |
| `pnpm run constraints / doc-sync / typecheck / lint / build`, `verify-package-invariants`, `verify-package-meta`, `verify-package-readme-limitations`, `verify-client-packages`, `verify-translation-pairing` | workspace scripts that never reach this package — the substance still describes what correct means, but nothing enforces it here |
| The whole fetch-side contract (`WebFetchProvider`, `WebFetchBody`, `WEB_INVALID_URL` … `WEB_UNSUPPORTED_CONTENT_TYPE`) | only a search provider is registered |

## Conformance notes

No deviation is outstanding. Two shapes look wrong when read against a single page and are not — both were checked against the in-tree implementations, and changing either would move this package away from the harness rather than toward it.

- **`available()` reports usable whenever a resolver is installed.** This matches `web-search-deepseek` line for line; see the provider-contract section above for why the async credential seam leaves no better option.
- **`Config.apiKey` accepts a literal secret for direct composition.** `web-search-deepseek` carries the same field with the same purpose. It is `role('secret')`, so wire surfaces strip it; a value set through it is still persisted in the settings document, which is why the README records it rather than the code forbidding it.

Historical gaps were fixed rather than recorded: an omitted `maxResults` is forwarded as omitted instead of defaulting to 10; `lib/client.js.map` is not published; the obsolete settings-section bridge and browser runtime package were replaced by Volatile Config, `configForms`, `plugins.bundle.config`, and `dsh-client-store`; and the empty invariant companion was removed.

## Maintaining this file

Cite the harness page for every rule added, and delete a rule when its subject is gone. A deviation moves out of the last section when the code changes — not when the discomfort passes.
