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

The namespace is validated as lowercase kebab-case at construction. Resolution layers in one order: **schema defaults, then the composition `base`, then the user layer**.

`update` merges a sparse patch into the user section only and never into `base`; `replace` sets the section wholesale and is the reset path, since keys absent from the replacement re-inherit `base` and the schema defaults. Resolved values are deep-frozen snapshots and writes to one namespace are serialised in call order.

**`validate` refuses the write that produced the value.** It runs after the schema admits the value, so it sees defaults and base as the owner will. A stored section that already fails rejects the registration itself; one that starts failing later keeps the last good value and warns. Passing the same `validateConfig` to both the load-time check and the settings hook is the intended shape, not duplication.

**Secrets never cross a wire surface.** `describe({ redactSecrets: true })` is "mandatory on every wire surface" and strips `role('secret')` fields from all three layers, enumerating their slots so a page can render write-only inputs. The consequence for any configuration UI is mechanical: a holder of a redacted document must write through `mutate` with path ops, because "a wholesale `replace` rebuilt from a redacted document silently deletes every secret the wire never returned".

`installSettingsSection` — the helper this package builds on — is not covered by the subsystem page; its contract lives in `packages/settings/settings/src/index.ts`. It registers the composition entry as the `base` layer while a settings service exists and falls back to the entry when the service goes away, so the plugin keeps working exactly as composed.

## The invariant companion

A companion installs a real check "only when its package owns an observable event or mutable-data relationship; otherwise it exports an empty installer whose leading comment starts `No runtime invariant:` and explains, package-specifically, why nothing is checkable".

That is two obligations, not one: the literal comment prefix, and a justification specific to this package. A check, if one is ever added, may assert "authoritative event streams or mutable data, never service or method presence" — and must be synchronous when it observes `settings/updated` or `credentials/updated`, because the rethrow reaches the emitter only from synchronous listeners.

Registration reserves the **exact npm package name**; a duplicate, blank, or whitespace-containing name throws.

## The browser half

`dsh.client` declares exactly three keys — `platform: 'web'`, optional `inject`, optional `immediately` — and the declaration "requires a `./client` export (the scan throws without one)". `external` is *not* declarable here; it is host-derived, and it is the one that constrains code arrival "because `require` is synchronous". `inject` is informational only: it drives preflight display and HMR diffing, and never sequences activation, which is decided by Cordis service injection alone.

The row id is the package name, and the bundle is served from `/plugins/<id>/client.js`. An unbuilt bundle answers "a loud 404 rather than letting the carrier's SPA fallback ship HTML as JavaScript" — which is the mechanical reason this repository commits `lib/`.

Without `immediately`, the row is lazy and "fetched on first import" rather than executed during module-face boot.

The CJS-closure loader format that `tsdown.config.ts` reproduces has **no binding statement in the subsystem pages**; its only sources are `packages/client/modules/README.md` and the shared preset `packages/client/tsdown.client.ts`, neither of which is a published package. Treat it as an unversioned coupling and compare against the wrapper header in `lib/client.js` after any harness upgrade.

For anything touching slots, props, or stores, `packages/client/AGENTS.md` is authoritative — notably that a UI plugin composes only through `ctx.slots.register`, that components never see `ctx`, and that the `/client` entrypoint is a public API rather than a convenience barrel.

## Package and README obligations

The README ends with the canonical Model Experience format: one H3 per model-context entry, then the three ordered H4 fields — `What the model sees`, `Token effect`, `KV Cache effect` — with one prose paragraph under each. A package with no direct effect uses the audited `None, as ` or `Indirectly, through ` sentence followed by a `KV Cache effect` H4 and one non-empty paragraph.

This package is a Service Provider behind `dsh-tool-web`, so its entry is the indirect form. It "may name the consumer that surfaces this package's contribution, but it does not restate that consumer's implementation" — do not describe how `web_search` renders sources.

`## Known Limitations and Deferred Work` records "durable consumer gaps and non-obvious maintainer constraints owned by this package"; ordinary cleanup stays in a source TODO instead.

Naming follows the role that exists: a `Provider` supplies one implementation and takes a vendor qualifier when several can exist. In-package relative imports use explicit `.ts` specifiers in source, which the compiler rewrites on emit.

The published payload stays closed — every relative runtime import and emitted asset must be covered by `files` — and `src`, declaration maps, and JS maps are not published.

## What does not bind this package

These are workspace rules enforced by harness scripts over `packages/**`, and adopting them here would be wrong rather than merely unnecessary.

| Rule | Why it does not apply |
|---|---|
| `private: true`, version matching the root manifest | workspace-publication invariants; this is a standalone published package |
| Cordis in both `peerDependencies` and `devDependencies`, every dsh peer mirrored into dev | enforced by `check-workspace-constraints` over the workspace; the deliberate optional-peer model here is incompatible on purpose |
| `packages/<group>/<pkg>` placement and root-config registration (`tsconfig.*.json`, `knip.json`) | harness repository layout |
| `tsconfig.base.client.json` and the shared `tsdown.client.ts` preset | not resolvable out-of-tree; reproducing the behaviour locally is the only option |
| `pnpm run constraints / doc-sync / typecheck / lint / build`, `verify-package-invariants`, `verify-package-readme-limitations`, `verify-client-packages`, `verify-translation-pairing` | workspace scripts that never reach this package — the substance still describes what correct means, but nothing enforces it here |
| "Every workspace package owns a `./invariant` companion" | scoped to workspace packages; the companion here is voluntary and `register()` accepts any npm name |
| The whole fetch-side contract (`WebFetchProvider`, `WebFetchBody`, `WEB_INVALID_URL` … `WEB_UNSUPPORTED_CONTENT_TYPE`) | only a search provider is registered |

## Conformance notes

No deviation is outstanding. Two shapes look wrong when read against a single page and are not — both were checked against the in-tree implementations, and changing either would move this package away from the harness rather than toward it.

- **`available()` reports usable whenever a resolver is installed.** This matches `web-search-deepseek` line for line; see the provider-contract section above for why the async credential seam leaves no better option.
- **`Config.apiKey` accepts a literal secret for direct composition.** `web-search-deepseek` carries the same field with the same purpose. It is `role('secret')`, so wire surfaces strip it; a value set through it is still persisted in the settings document, which is why the README records it rather than the code forbidding it.

Two real gaps were fixed rather than recorded: an omitted `maxResults` is now forwarded as omitted instead of defaulting to 10, and `lib/client.js.map` is no longer published — the harness client packages generate that map but keep it out of `files`, and their published payload is exactly `lib/index.js`, `lib/invariant.js`, `lib/client.js`, and `lib/types/**/*.d.ts`.

## Maintaining this file

Cite the harness page for every rule added, and delete a rule when its subject is gone. A deviation moves out of the last section when the code changes — not when the discomfort passes.
