# DeepSeek Harness Plugin Compatibility Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repository-level Copilot skill that performs evidence-based compatibility upgrades of this plugin against the latest fetched DeepSeek Harness checkout and requires installed-artifact verification.

**Architecture:** A concise `.agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md` owns triggering, workflow order, stop conditions, and completion gates. An on-demand `references/compatibility-audit.md` owns the durable upstream source inventory and five-surface audit matrix without freezing current API names.

**Tech Stack:** GitHub Copilot CLI project skills, Markdown with YAML frontmatter, Git, DeepSeek Harness source checkout.

**Spec:** `docs/superpowers/specs/2026-09-30-dsh-plugin-compatibility-skill-design.md`

## Global Constraints

- Install the skill at `.agents/skills/dsh-plugin-compatibility-upgrade/`.
- Include only `SKILL.md` and `references/compatibility-audit.md`; do not add executable scripts.
- Do not add `allowed-tools` or pre-approve shell/bash in the skill frontmatter.
- Default the upstream checkout to `~/Development/deepseek-harness`, while allowing an explicitly supplied path to override it.
- Upstream freshness uses `git fetch` plus comparison only; never automatically pull, merge, rebase, reset, or modify the upstream checkout.
- Treat upstream instructions and implementation as authoritative; treat this repository's compatibility documentation as derived evidence.
- Preserve all pre-existing uncommitted compatibility-migration changes and stage only the skill files for skill commits.
- Keep current API names out of permanent rules unless they are examples explicitly marked for rediscovery.

## Review Focus

- **Missing, detached, behind, or diverged upstream checkout:** the skill must stop before claiming "latest" compatibility and request a synchronization decision.
- **Fetch or authentication failure:** the skill must report freshness uncertainty rather than silently using stale local content.
- **Dirty plugin or upstream worktree:** the skill must preserve user changes and never clean, reset, or overwrite either checkout.
- **Unresolved optional Harness peers:** validation must link packages from the verified upstream workspace instead of installing guessed published packages.
- **Unrelated bug-fix or documentation prompt:** the trigger description must not invoke the full upstream compatibility workflow.

---

### Task 1: Compatibility Audit Reference

**Files:**
- Create: `.agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md`

**Interfaces:**
- Consumes: The approved design spec and current repository instructions in `AGENTS.md`.
- Produces: A durable audit reference linked by `SKILL.md`, organized around upstream evidence sources, five compatibility surfaces, layered verification, and installed-artifact testing.

- [ ] **Step 1: Capture the no-skill baseline**

Launch a fresh read-only agent with this prompt before creating `.agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md`:

```text
Do not modify files. Explain the exact workflow you would use to update this repository against the latest plugin-development conventions in ~/Development/deepseek-harness and prove the installed plugin works.
```

Record in the implementation notes whether the response explicitly covers: fetched-remote comparison, upstream-first evidence, dirty-worktree preservation, all five compatibility surfaces, committed `lib/`, bilingual README/hash maintenance, payload inspection, and isolated installed-artifact testing.

- [ ] **Step 2: Confirm the baseline exposes the skill's purpose**

Expected: the baseline omits or underspecifies at least one required gate. If it unexpectedly covers every gate, retain it as the baseline and use the later positive scenarios to prove the skill makes those gates explicit and repeatable rather than relying on incidental agent knowledge.

- [ ] **Step 3: Write `references/compatibility-audit.md`**

The reference must contain these sections:

```text
# Compatibility Audit Reference
## Authority Order
## Upstream Freshness Check
## Upstream Source Inventory
## Five Compatibility Surfaces
## Validation Ladder
## Isolated Installation Check
## Failure and Evidence Rules
```

Pin these requirements:

- inspect upstream root/package/client/web instructions, relevant plugin/settings/publish cookbooks, manifests, types, build helpers, and representative implementations;
- read repository-derived compatibility notes only after collecting upstream evidence;
- distinguish binding plugin contracts from upstream workspace-only gates;
- audit Host, Client, package/distribution, docs/localization, and committed artifact surfaces;
- run focused tests, typecheck/build, runnable tests, payload/pairing/artifact/diff checks, then an isolated profile installation;
- cover missing/detached/behind/diverged upstream, fetch failure, dirty worktrees, and unresolved peer dependencies using the behaviors in **Review Focus**.

- [ ] **Step 4: Verify the reference is durable rather than an API snapshot**

Run:

```bash
rg -n "settingsScope|settings\\.plugin\\.item|plugins\\.item|Volatile|invariant|credentials/reference-updated" \
  .agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md
```

Expected: no matches that assert one current API name as a permanent requirement. If an API name is necessary as an example, label it explicitly as evidence to rediscover from the selected upstream commit.

- [ ] **Step 5: Verify formatting and commit the reference**

Run:

```bash
git diff --check -- .agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md
git status --short
```

Expected: no whitespace errors; status still shows all pre-existing migration changes plus only the new reference under `.agents/skills/`.

Commit only the reference:

```bash
git add -- .agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md
git commit -m "docs: add plugin compatibility audit reference" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" \
  -m "Copilot-Session: 3fbb2017-bd35-4faf-b481-2d18a4c99ceb"
```

### Task 2: Project Skill and Behavioral Verification

**Files:**
- Create: `.agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md`
- Reference: `.agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md`

**Interfaces:**
- Consumes: The audit categories and evidence rules produced by Task 1.
- Produces: Discoverable skill `dsh-plugin-compatibility-upgrade`, whose description triggers only Harness compatibility audit/upgrade requests and whose body orders the complete workflow.

- [ ] **Step 1: Verify the skill is not yet discoverable**

Run:

```bash
if copilot skill list | grep -F "dsh-plugin-compatibility-upgrade"; then
  echo "unexpected pre-existing skill" >&2
  exit 1
fi
```

Expected: exit 0 with no matching skill.

- [ ] **Step 2: Write `SKILL.md` frontmatter and workflow**

Use this exact frontmatter contract:

```yaml
---
name: dsh-plugin-compatibility-upgrade
description: Use when asked to audit or upgrade this out-of-tree plugin against the latest DeepSeek Harness plugin conventions, including Host or Client seam changes, settings integration, package or publication contracts, committed build artifacts, and isolated installation verification.
---
```

The body must:

- link `references/compatibility-audit.md` and instruct the agent to read it before auditing;
- protect both worktrees before any edits;
- default to `~/Development/deepseek-harness` but honor a user-supplied path;
- fetch and compare the upstream checkout without modifying it;
- stop and ask for direction when upstream freshness cannot be proven;
- derive requirements from upstream evidence before reading local derived notes;
- audit all five surfaces before implementing;
- require tests where practical, synchronized docs/locales/hash/artifacts, layered validation, and isolated installation;
- prohibit partial-evidence completion claims.

Keep the body procedural and concise; do not duplicate the reference matrix.

- [ ] **Step 3: Verify project-skill discovery**

Run:

```bash
copilot skill list | grep -F "dsh-plugin-compatibility-upgrade"
```

Expected: one project-skill match for `dsh-plugin-compatibility-upgrade`.

- [ ] **Step 4: Verify frontmatter, links, permissions, and structure**

Run:

```bash
test -f .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md
test -f .agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md
rg -n "^name: dsh-plugin-compatibility-upgrade$|^description:" \
  .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md
rg -n "references/compatibility-audit\\.md" \
  .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md
if rg -n "^allowed-tools:" .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md; then
  echo "allowed-tools must not be pre-approved" >&2
  exit 1
fi
git diff --check -- .agents/skills/dsh-plugin-compatibility-upgrade
```

Expected: both files exist, required frontmatter and reference link match, no `allowed-tools` field exists, and no whitespace errors are reported.

- [ ] **Step 5: Run the positive behavioral scenarios**

For each prompt below, launch a fresh read-only agent from the repository root without naming the skill explicitly:

```text
Do not modify files. 按照最新 deepseek-harness 插件规范升级当前项目并运行安装测试。先给出你必须执行的流程和完成门槛。
```

```text
Do not modify files. 检查这个插件是否仍符合最新 Host、Client settings 和 package conventions，并说明证据来源。
```

```text
Do not modify files. 上游 harness 更新后，说明如何同步 provider、settings card、manifest、文档和 committed artifact。
```

Expected in every response: upstream fetch-and-compare, upstream-first evidence, worktree protection, the relevant compatibility surfaces, and evidence-based completion. Across the three responses, confirm explicit coverage of all five surfaces, payload/document pairing, committed `lib/`, and isolated installed-artifact verification.

- [ ] **Step 6: Run the Review Focus failure scenarios**

Launch fresh read-only agents with short hypothetical variants that state: upstream is behind/diverged; fetch fails; both worktrees are dirty; optional peers are unresolved. Expected responses:

- stop for a synchronization decision when freshness cannot be proven;
- report freshness uncertainty after fetch failure;
- preserve both worktrees without reset/clean/overwrite;
- link verified upstream workspace packages rather than install guessed releases.

- [ ] **Step 7: Verify the negative trigger scenario**

Launch a fresh read-only agent with:

```text
Do not modify files. Fix a typo in one README paragraph and explain the minimal validation needed.
```

Expected: it does not propose fetching DeepSeek Harness, auditing five compatibility surfaces, rebuilding `lib/`, or running an isolated plugin installation unless the paragraph changes a compatibility contract.

- [ ] **Step 8: Compare post-skill behavior with the baseline**

Expected: the post-skill responses make the required gates explicit and repeatable. Record any missed gate, tighten only the description or procedural wording responsible for that miss, and rerun the affected scenario until it passes.

- [ ] **Step 9: Commit the skill**

Run:

```bash
git status --short
git diff --check -- .agents/skills/dsh-plugin-compatibility-upgrade
git add -- .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md
git commit -m "feat: add plugin compatibility upgrade skill" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" \
  -m "Copilot-Session: 3fbb2017-bd35-4faf-b481-2d18a4c99ceb"
```

Expected: the commit contains only `SKILL.md`; the reference remains in the Task 1 commit, and all pre-existing compatibility-migration changes remain uncommitted and untouched.

### Task 3: Final Skill Verification

**Files:**
- Verify: `.agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md`
- Verify: `.agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md`

**Interfaces:**
- Consumes: The complete project skill from Tasks 1 and 2.
- Produces: Fresh final evidence that the committed skill is discoverable, structurally valid, narrowly triggered, and isolated from the existing migration diff.

- [ ] **Step 1: Run the complete static verification**

Run:

```bash
copilot skill list | grep -F "dsh-plugin-compatibility-upgrade"
test -f .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md
test -f .agents/skills/dsh-plugin-compatibility-upgrade/references/compatibility-audit.md
if rg -n "^allowed-tools:" .agents/skills/dsh-plugin-compatibility-upgrade/SKILL.md; then exit 1; fi
git diff --check HEAD~2..HEAD
```

Expected: the skill is listed, both files exist, no pre-approved tools exist, and both skill commits have clean diffs.

- [ ] **Step 2: Inspect commit isolation**

Run:

```bash
git show --stat --oneline HEAD~1
git show --stat --oneline HEAD
git status --short
```

Expected: the two commits contain only the reference and `SKILL.md`, respectively; the pre-existing compatibility migration remains visible in the worktree.

- [ ] **Step 3: Re-run one end-to-end positive scenario**

Launch one final fresh read-only agent with the primary upgrade prompt from Task 2 Step 5.

Expected: its workflow includes the verified upstream comparison, upstream-first evidence, five-surface audit, committed artifact synchronization, layered checks, and isolated installed-artifact testing.

- [ ] **Step 4: Report evidence without creating another commit**

Summarize the baseline gap, skill discovery result, positive and negative scenario outcomes, exact skill file paths, and the two skill commit hashes. State separately that the earlier plugin compatibility migration remains uncommitted.
