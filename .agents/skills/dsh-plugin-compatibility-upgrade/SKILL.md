---
name: dsh-plugin-compatibility-upgrade
description: Use whenever asked to audit, check, synchronize, or upgrade this out-of-tree plugin against current or latest DeepSeek Harness plugin conventions, including requests such as "按照最新 deepseek-harness 插件规范升级", "检查插件兼容性", or "上游 harness 更新后同步". Covers Host and Client seams, settings integration, package and publication contracts, committed build artifacts, and isolated installation verification.
---

# DSH Plugin Compatibility Upgrade

Read [the compatibility audit reference](references/compatibility-audit.md) before auditing or editing. It defines the authority order, durable audit surfaces, validation ladder, and failure rules. Rediscover exact APIs and commands from the upstream commit selected for this run.

## Protect both worktrees

1. Inspect this repository's root, branch, status, and existing diff.
2. Preserve all user-authored and unrelated changes. Never reset, clean, restore, or overwrite work to create a convenient baseline.
3. Resolve the upstream checkout from the user's explicit path or default to `~/Development/deepseek-harness`.
4. Inspect the upstream checkout's branch, tracking ref, status, and remotes without modifying its files.

## Prove the upstream baseline

Run `git fetch` in the upstream checkout, then compare its HEAD with the fetched tracking branch.

- Continue only when the selected commit is proven suitable for a request about the latest upstream conventions.
- If the checkout is missing, untrackable, detached without approval, behind, or diverged, stop and ask which synchronized checkout or exact ref to use.
- If fetch or authentication fails, report that freshness is unverified and stop unless the user explicitly chooses a local-only audit.
- If the checkout is ahead or dirty, report the local commits or modifications and confirm whether they are intended evidence.
- Never pull, merge, rebase, reset, clean, or otherwise update the upstream checkout automatically.

Record the exact upstream commit used.

## Derive the current contract

Collect upstream evidence before reading this repository's derived compatibility notes:

1. Read the root and nearest package-level instructions.
2. Read the relevant plugin, package, settings, and publishing cookbooks.
3. Inspect current manifests, public types, build helpers, tests, and representative in-tree implementations at every affected seam.
4. Separate binding out-of-tree plugin contracts from workspace-only gates.
5. Cite the evidence behind each requirement.
6. Compare the resulting checklist with this repository's `AGENTS.md`, source, tests, README pair, and `docs/plugin-conventions.md`.

Do not preserve an old API merely because this repository documents or tests it. Do not adopt an upstream workspace rule merely because it exists.

## Audit before implementing

Use the reference to inspect all five surfaces:

1. Host seam.
2. Client seam.
3. Package and distribution.
4. Documentation and localization.
5. Committed artifact.

For each gap, identify the upstream evidence, affected files, behavior change, test that can expose it, documentation impact, and built-artifact impact. Present material design choices before implementation when more than one compatible behavior is reasonable.

## Implement the compatibility change

1. Add or update a focused failing test before each behavior change where practical.
2. Make precise changes using current upstream patterns.
3. Update package metadata, composition, locales, repository instructions, and both README languages when their contract changes.
4. Recompute translation-pairing records or hashes required by this repository.
5. Rebuild and commit `lib/` with every `src/` change; remove obsolete generated output.
6. Keep secrets out of source, browser data, logs, errors, fixtures, and published files.

Do not fix unrelated issues or weaken types and validation to accommodate unresolved dependencies.

## Validate in layers

Follow the reference's validation ladder:

1. Focused behavior tests.
2. Typecheck and build.
3. All runnable package and relevant composition/load tests.
4. Publication payload inspection.
5. Documentation pairing, artifact parity, deterministic-build, and diff-hygiene checks.
6. Isolated installation of the current checkout and an installed-built-artifact smoke test.

If optional Harness peers do not resolve, link the matching packages from the verified upstream workspace as this repository documents. Do not install guessed releases or describe a skipped check as passing.

Source imports, unit tests, successful builds, and configuration dumps do not replace the isolated installation check.

## Completion gate

Before claiming compatibility:

- name the upstream commit and evidence sources;
- account for every applicable audit surface;
- confirm source, tests, docs, metadata, locales, and committed artifacts agree;
- report the exact validation commands and outcomes;
- prove the supported installation path used this checkout's built files and exercised core success and failure behavior;
- list blockers and unverified requirements plainly.

Partial evidence is not completion. A non-applicable check needs an evidence-backed reason, not silent omission.
