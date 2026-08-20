# AGENTS.md

An out-of-tree DeepSeek Harness plugin: the Microsoft Web IQ provider for the `ctx.web` search seam, plus the browser settings card that configures it.

## Relationship to the harness conventions

This package is developed against the DeepSeek Harness but lives outside its workspace, so the harness `AGENTS.md` and `packages/AGENTS.md` are the upstream authority and this file records only what differs or what an out-of-tree checkout cannot infer. Where the two disagree the harness wins, because a package that drifts from the seam it plugs into breaks at load, not at review. Nothing here re-states a rule that already holds verbatim upstream.

The harness gates (`verify-export-jsdoc`, `verify-package-invariants`, `verify-package-readme-limitations`, `verify-translation-pairing`, `doc-sync`) are workspace scripts and **do not reach this package**. Every obligation they would enforce is maintained by hand here; the sections below name the ones that have already been violated once.

## Repository layout

```
src/            plugin source; the Host half (index/provider/invariant) and the browser half (client/)
  types.ts      types only — no runtime code
  invariant.ts  the package-owned ./invariant companion
  client/       browser settings card, its controller, locales, and CSS Modules
lib/            committed build artifact — see "The committed artifact"
tests/          vitest specs at package level, never src/__tests__/
docs/images/    README screenshots, referenced by relative path
cordis.patch.yml  the composition layer `dsh plugin add` appends
```

## Commands

| Command | What it does |
|---|---|
| `npm run build` | `tsc -b` emits declarations and JS under `lib/types`, then `tsdown` bundles both halves. The order is load-bearing: tsdown's entries are `lib/types/*.js`, so a bundle without a preceding `tsc -b` is stale or missing. |
| `npm run typecheck` | `tsc -b` alone. |

There is **no test script and no installed runner**. The specs under `tests/` are vitest and import `../src/*.ts` directly, so they execute only where vitest and the harness packages both resolve — a harness checkout with this package linked in. Do not report the suite as passing from this checkout alone.

Type checking has the same prerequisite. Every harness dependency is an **optional peer** that this repository deliberately leaves unresolved, and there is no published release to install them from, so point the peers at a harness checkout by linking its workspace packages into `node_modules` before running either command.

## The committed artifact

`lib/` is tracked so a git install needs no build step, which keeps the harness peer dependencies out of the installer's own resolution. `.gitignore` keeps only what the manifest publishes and drops tsc's incidental emit under `lib/types`.

That trade moves an obligation onto every change: **rebuild and commit `lib/` in the same commit as any `src/` edit.** Nothing enforces it and a stale artifact is silent — installers keep resolving the previous code with no warning at any layer. `git status` after a build is the check, and it works because the build is deterministic: repeated builds of unchanged sources produce byte-identical output, so any diff is a real change.

The browser half is bundled to the harness client-loader contract — a CJS closure handed to `window.__ModuleLoader__.load`, platform modules external so they resolve from the frozen module table, CSS Modules compiled through lightningcss into one injected style tag. That contract lives in a harness build helper that is not a published package, so `tsdown.config.ts` reproduces it here. A harness change to the loader format breaks this plugin at load time; the wrapper header in `lib/client.js` is what to compare against.

## Conventions

- **Function-plugin form, no default export.** `src/index.ts` named-exports `name` / `inject` / `Config` / `apply`. Adding a default export makes the Loader discard the namespace.
- **Optional services go through `ctx.get(name)`.** Only `web` is a declared injection; `credentials` and the launch environment are read per operation and may legitimately be absent.
- **Heritage-declared members carry no JSDoc here.** `available()` and `search()` document at the declaring `WebSearchProvider` interface, and duplicating those docs is the error, not the omission.
- **No hardcoded tunables.** Deployment-varying choices are validated `Config` fields changeable from `cordis.yml`; a `DEFAULT_*` constant is not configurability. Protocol constants and the Web IQ request contract stay fixed.
- **Misconfiguration fails loud.** `validateConfig` throws at load for what is self-contained; a credential that cannot be resolved fails the operation with `WEB_PROVIDER_CREDENTIAL_MISSING` naming only the reference.
- **The credential-bearing request refuses redirects.** `redirect: 'error'` is a security invariant of sending the key to the configured endpoint, not a preference.
- **Secrets never widen.** The key literal is `role('secret')`, and it stays out of Settings descriptions, browser boot data, logs, and error messages.
- **This package owns `./invariant`.** It registers the manifest name with an explained-empty installer; the `No runtime invariant:` sentence is the required justification, not a placeholder to fill in later.
- **Files end with exactly one trailing newline.**

## Documentation

`README.md` and `README.zh.md` are a bilingual pair of equal authority: edit one and bring the other along in the same commit, keeping headings, code fences, and tables structurally identical.

`README.i18n.yaml` records the git blob hash of each side as of the last confirmed-consistent state. **Recompute it with `git hash-object README.md README.zh.md` before every commit that touches either file.** This has gone stale twice; a hash that no longer matches is worse than no record, because it asserts a consistency nobody checked.

Behaviour changes carry their docs in the same commit — config keys, defaults, error codes, and request or response fields all surface in the README. The README keeps the canonical Model Experience format (an H3 entry with `#### What the model sees`, `#### Token effect`, and `#### KV Cache effect`) and puts durable consumer gaps under `## Known Limitations and Deferred Work`. Write those from the model's perspective: task-relevant concepts only, no transport or implementation vocabulary.

Prose is current-state, one physical line per paragraph, one home per fact. State contracts and consequences rather than narrating changes or preserving review history.

## Distribution

`package.json` declares `dsh.bundle.patch`, which is what makes `dsh plugin --profile <name> add <spec>` append `cordis.patch.yml` after the shipped profile bundles. The patch inserts this package's own entry and nothing else: it composes no other package, because a patch row naming a package the profile cannot resolve fails the whole load, and a `serverName`-style global claim would fail somebody else's composition instead of ours.

The marketplace entry lives in the `awesome-dsh-plugin` repository under `data/plugins/`, with screenshots keyed by repository URL in `data/screenshots.json`. Both READMEs there are generated — never hand-edit them, and change only this package's own entry.

## Editing these instructions

Keep each rule self-contained and verifiable against the code. Delete a rule when the behaviour it describes is gone; a convention document that outlives its subject teaches the wrong thing.
