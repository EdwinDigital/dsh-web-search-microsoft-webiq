# Compatibility Audit Reference

Use this reference to build the evidence checklist for one compatibility audit. Rediscover exact APIs, package names, commands, and loader contracts from the selected upstream commit; do not treat examples from an earlier migration as current requirements.

## Authority Order

Apply evidence in this order:

1. The user's requested scope and any explicitly selected upstream checkout.
2. The upstream checkout's root and nearest package-level `AGENTS.md` files.
3. Upstream cookbooks, manifests, public types, build helpers, tests, and representative in-tree implementations.
4. This repository's `AGENTS.md`, source, tests, and current package metadata.
5. `docs/plugin-conventions.md` and README content as derived records to verify and update, not as substitutes for upstream evidence.

For every obligation, cite the upstream file that establishes it. Separate plugin contracts that bind an out-of-tree package from workspace-only gates whose scripts do not reach this repository.

## Upstream Freshness Check

Default to `~/Development/deepseek-harness`; honor an explicit user-supplied path.

Before reading conventions:

1. Confirm the directory exists and is a Git checkout.
2. Record its HEAD, branch, tracking branch, and short worktree status.
3. Preserve local changes. Never clean, reset, restore, stash, merge, rebase, or pull the checkout.
4. Run `git fetch` without changing the checked-out branch.
5. Compare HEAD with the fetched tracking branch and classify it as current, ahead, behind, diverged, detached, or untrackable.

Proceed only when the selected local commit is proven suitable for the user's "latest upstream" request. A clean checkout is not proof of freshness.

- **Missing checkout or no usable remote/tracking branch:** report the missing evidence and ask which checkout or ref to use.
- **Fetch or authentication failure:** report that remote freshness is unverified; do not silently use stale local content as "latest."
- **Behind or diverged:** stop and ask the user to synchronize or select a commit. Do not update the upstream checkout automatically.
- **Ahead:** identify the local-only commits and ask whether they are intentionally the authority for this audit.
- **Detached:** compare only when the user supplied or approved the exact commit/ref; otherwise stop.
- **Dirty:** continue read-only when freshness is otherwise proven, but record that local modifications may affect evidence and never overwrite them.

Record the exact upstream commit used in the final report.

## Upstream Source Inventory

Inspect the smallest authoritative set that covers the requested change:

- root repository instructions and the nearest instructions for packages, Client code, Web search, documentation, and publishing;
- plugin-development, package-addition, settings-integration, and publication cookbooks;
- manifests and exports for the current Host, Client, credential, settings, loader, and Web-search packages;
- public interfaces and schemas at the seams this plugin implements;
- current build helpers and one or more representative in-tree plugins using each affected seam;
- tests or verification scripts that encode behavior not fully stated in prose;
- release, installation, and profile-composition code when distribution behavior is affected.

Search by behavior and exported seam, not by old symbol names alone. If prose and implementation disagree, collect both pieces of evidence and resolve the conflict before editing.

Only after this inventory is captured should you read this repository's derived compatibility notes and compare them with the upstream findings.

## Five Compatibility Surfaces

### Host seam

Check:

- plugin entry shape, exports, injection declarations, lifecycle, disposal, and provider registration;
- configuration schemas, runtime configuration consistency, defaults, validation timing, and deployment-varying tunables;
- optional-service access and behavior when services or credentials are unavailable;
- operation-level error codes, error messages, logging, and secret handling;
- request construction, redirect policy, response parsing, normalization, limits, and cancellation;
- public types, declarations, JSDoc ownership, and test coverage for changed behavior.

### Client seam

Check:

- browser entry shape and the current module-loader wrapper contract;
- platform modules that must remain external versus implementation dependencies that must be bundled;
- current settings-registration service, slot, view, props, lifecycle, and Host-availability behavior;
- state ownership, configuration mutation and revision handling, remote signatures, events, and credential invalidation;
- localization resources, browser-visible copy, accessibility, styling boundaries, and disposal;
- built declarations and a load/render test using the current upstream Client environment.

### Package and distribution

Check:

- package exports, `files`, artifacts, peer and optional-peer declarations, browser/client metadata, and composition patch;
- whether a package-owned state-consistency companion is required by independently observable state rather than by historical convention;
- build entries, platform externals, source maps, declarations, and generated-file exclusions;
- publication workflow assumptions, tag/version guards, npm payload contents, install spec behavior, and marketplace impact;
- absence of source, secrets, stale outputs, undeclared runtime dependencies, and obsolete entry points from the published payload.

### Documentation and localization

Check:

- README configuration keys, defaults, errors, request/response behavior, installation, model experience, and limitations;
- structural parity between English and Chinese documents;
- locale metadata and any browser or package localization resources;
- translation-pairing hashes or records required by this repository;
- repository instructions and compatibility notes that must change with the implementation;
- current-state prose with one authoritative home for each fact.

### Committed artifact

Check:

- every source edit has the corresponding committed build output;
- declarations and browser/Host bundles match the current source and manifest;
- obsolete entries and incidental compiler output are absent;
- repeated unchanged builds are byte-identical;
- loader headers and external module requests match the selected upstream contract;
- installation resolves the built files that were inspected, not source files or stale output.

## Validation Ladder

Run validation from narrowest to broadest, recording the exact command and result:

1. Focused tests that expose each changed behavior.
2. Typecheck and build in the dependency environment documented by this repository.
3. All runnable package tests and relevant upstream composition/load tests.
4. Package payload inspection, including the exact file list and checks for excluded source, maps, secrets, and obsolete artifacts.
5. Documentation structure, localization pairing, recorded hashes, artifact parity, and `git diff --check`.
6. A second unchanged build when deterministic committed output is part of the contract.
7. The isolated installation check below.

Harness packages are deliberate optional peers in this checkout. If they do not resolve, link the matching packages from the verified upstream workspace as the repository instructions require. Do not install guessed releases, weaken types, add broad casts, or report skipped tests as passing.

Do not run upstream workspace gates reflexively when they cannot reach this out-of-tree package. Reproduce their applicable obligation locally and record why the workspace script itself is non-applicable.

## Isolated Installation Check

Use session-temporary storage outside the repository for a disposable profile or installation root.

1. Build the current checkout and verify the committed artifact is current.
2. Install this checkout through the supported local plugin installation path; do not substitute a registry or GitHub version.
3. Inspect the installed package payload and generated bundle/configuration layer.
4. Start or load the smallest real Harness composition that exercises the installed built entry.
5. Exercise the provider's core behavior with deterministic fixtures or approved credentials, including an important failure path.
6. Confirm the runtime resolved installed `lib/` files and that browser metadata or Client code is present when applicable.
7. Stop temporary processes and remove disposable files that are not needed as failure evidence.

A source import, unit test, successful build, or configuration dump alone is not an installation test.

## Failure and Evidence Rules

- Preserve both worktrees and all unrelated user changes.
- Fail loudly on invalid configuration, missing credentials, incompatible seams, stale artifacts, and unresolved installation behavior.
- Never turn an unavailable check into a success-shaped fallback.
- Report each blocker with the failed command or missing evidence, its impact, and the requirements still unverified.
- Do not claim compatibility until every applicable surface and validation layer has fresh evidence.
- If a requirement is intentionally non-applicable, support that conclusion with upstream evidence rather than omission.
- Final reporting must name the upstream commit, changed surfaces, validation commands, installed-artifact result, remaining risks, and any checks that could not run.
