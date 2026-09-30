# DeepSeek Harness Plugin Compatibility Skill Design

## Purpose

Add a project-level Copilot skill that guides future compatibility audits and upgrades of this out-of-tree plugin against the latest available DeepSeek Harness source checkout. The skill must make upstream evidence, repository safety, committed build artifacts, and real installation verification mandatory rather than relying on the details of the most recent migration.

## Scope

The skill covers compatibility work spanning:

- the Host plugin seam and provider behavior;
- the browser Client and settings integration;
- package exports, metadata, bundle composition, and publication payload;
- English and Chinese documentation, localization metadata, and pairing records;
- committed `lib/` artifacts;
- isolated installation and installed-artifact smoke testing.

It does not encode a permanent snapshot of current Harness APIs, automatically update the upstream checkout, or provide a general-purpose release workflow.

## Repository Structure

Create the skill under the upstream-compatible and Copilot-supported project path:

```text
.agents/skills/dsh-plugin-compatibility-upgrade/
├── SKILL.md
└── references/
    └── compatibility-audit.md
```

`SKILL.md` remains concise and defines triggers, workflow stages, stop conditions, and completion gates. `references/compatibility-audit.md` is loaded on demand and contains the upstream source inventory, compatibility surfaces, evidence requirements, and verification matrix.

No executable scripts or pre-approved shell tools are included. The checks depend on the current upstream implementation, so hard-coded automation would prematurely freeze conventions that the skill is intended to rediscover.

## Triggering

The skill should activate for requests to:

- upgrade this plugin to the latest DeepSeek Harness plugin conventions;
- audit compatibility with current Host, Client settings, package, or distribution seams;
- synchronize the provider, settings card, manifest, documentation, or committed artifact after an upstream Harness change;
- run a complete compatibility and installation validation.

It should not activate for ordinary bug fixes, isolated documentation edits, feature development unrelated to Harness compatibility, or generic dependency updates.

## Source of Truth and Upstream Refresh Policy

The default upstream checkout is `~/Development/deepseek-harness`; an explicitly supplied path overrides it.

Before deriving requirements, the workflow records the upstream checkout's HEAD, branch, tracking relationship, and worktree state, then runs `git fetch` and compares local HEAD with its tracked remote branch. It never automatically pulls, merges, rebases, resets, or modifies the upstream checkout.

If fetch fails, the workflow reports the network or authentication failure and the resulting freshness uncertainty. If the local checkout is behind, diverged, detached without a clear comparison target, or otherwise cannot represent the latest fetched upstream, the compatibility upgrade stops and asks the user to decide how the checkout should be synchronized.

Upstream root and package-level `AGENTS.md` files, relevant cookbooks, manifests, type declarations, build helpers, and representative in-tree implementations are authoritative. This repository's `AGENTS.md` and `docs/plugin-conventions.md` are derived aids: they are compared with upstream evidence but never used to overrule or substitute for it.

## Workflow

### 1. Protect the Current Worktree

Inspect the plugin repository's status and existing diffs before editing. Preserve unrelated and user-authored changes, integrate with changes in files that must be touched, and never revert or overwrite work merely to obtain a clean baseline.

### 2. Establish the Upstream Baseline

Locate the Harness checkout, execute the fetch-and-compare policy, and record the exact upstream commit used for the audit. Stop on an unresolved freshness problem rather than describing stale local content as the latest convention.

### 3. Extract Current Requirements

Read the authoritative upstream instructions and implementation evidence before reading repository-derived compatibility notes. Build a task-specific evidence checklist that cites the files supporting each obligation. The checklist must distinguish binding plugin contracts from workspace-only rules that do not apply to an out-of-tree package.

### 4. Audit and Implement by Compatibility Surface

Compare the plugin against five surfaces:

1. **Host seam:** exports, configuration model, service injection, lifecycle, operation consistency, errors, credentials, and request security.
2. **Client seam:** module-loader contract, current Client services, settings registration, UI contracts, remote APIs, state ownership, events, and localization.
3. **Package and distribution:** exports, artifacts, optional peers, browser declaration, bundle patch, publication payload, workflow assumptions, and marketplace implications.
4. **Documentation and localization:** behavior documentation, limitations, bilingual structure, locale resources, pairing hashes, and repository instructions.
5. **Committed artifact:** source-to-`lib/` parity, deterministic rebuild expectations, declarations, wrapper format, and absence of obsolete outputs.

For behavior changes, add or update tests that expose the previous incompatibility before changing implementation where practical. Reuse current repository patterns and avoid unrelated refactoring.

### 5. Validate in Layers

Run the smallest relevant tests first, then the repository's typecheck and build, the full runnable test selection, package payload inspection, documentation pairing checks, artifact checks, and diff hygiene.

When Harness peers are intentionally unresolved, follow this repository's documented development setup by linking the corresponding packages from the verified upstream checkout. Do not install guessed or nonexistent published packages to make validation appear successful.

### 6. Verify a Real Installation

Create an isolated profile under session-temporary storage, install the current checkout through the supported plugin installation path, inspect the resulting bundle/configuration layer, and load or exercise the installed built artifact. Source-level tests and a successful build do not replace this step.

Clean up temporary processes and disposable files. Preserve useful failure evidence when cleanup would make a reported blocker impossible to diagnose.

## Error Handling and Completion Rules

Every blocker must identify the failed command or missing evidence, its impact, and the remaining unverified requirements. The workflow must not silently skip unavailable checks, convert errors into success-shaped fallback results, or claim compatibility from partial evidence.

Completion requires fresh evidence for every applicable layer:

- the upstream checkout was fetched and proven current relative to its tracked branch;
- each compatibility surface was audited against cited upstream sources;
- source, tests, documentation, metadata, and committed artifacts are synchronized;
- typecheck, build, tests, payload, pairing, artifact, and diff checks passed or an explicit non-applicable rationale is supported by upstream evidence;
- an isolated installation loaded and exercised the installed built artifact.

## Skill Verification

Evaluate the skill with these representative prompts:

1. "按照最新 deepseek-harness 插件规范升级当前项目并运行安装测试。"
2. "检查这个插件是否仍符合最新 Host、Client settings 和 package conventions。"
3. "上游 harness 更新后，同步 provider、settings card、manifest、文档和 committed artifact。"

Before adding the skill, capture a baseline response to at least the primary upgrade scenario and identify omissions such as trusting stale derived documentation, skipping remote comparison, failing to rebuild `lib/`, overlooking bilingual documentation and hashes, omitting payload checks, or substituting source tests for an isolated installation.

After adding the skill, repeat the scenarios and require explicit coverage of dynamic upstream evidence, worktree protection, all five compatibility surfaces, layered validation, and installed-artifact testing. Also test an unrelated bug-fix or documentation prompt to confirm the trigger description does not cause false activation.

Static validation must confirm:

- valid `name` and trigger-focused `description` frontmatter;
- all referenced repository paths exist;
- the main skill remains concise and delegates detail to the reference;
- the reference describes durable audit categories rather than freezing current API names as permanent rules;
- no shell or bash tool is pre-approved;
- `git diff --check` passes for the new skill files.
