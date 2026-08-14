---
report_id: R-006
title: "Empirical Grounding: Rule Frontmatter, Glob Syntax, and Workflow Files across Live ~/.gemini Inventories"
status: Complete
date: 2026-08-14
scope:
  - RuleFileSchema
  - WorkflowFrontmatterSchema
  - Glob Syntax & Runtime Semantics
  - Live Workspace Rule & Workflow Inventories
source_refs:
  - "§4"
  - "§15"
  - "§17"
  - "§20"
evidence_refs:
  - S-033
  - S-034
  - EV-007
  - EV-010
---

# R-006 — Rule Frontmatter, Glob Syntax, and Workflow Files Live Audit

**Date:** 2026-08-14

**Questions:**
1. What frontmatter keys and trigger modes do real Antigravity rule files use across the live system?
2. What glob syntax is used in `trigger: glob` rules?
3. What frontmatter structure and body tokens do real Antigravity workflow files (`.agents/workflows/*.md`) use?

**Method:** Scanned and audited all live `.agents/rules/*.md`, `plugins/*/rules/*.md`, `~/.gemini/antigravity/.agents/rules/`, and `.agents/workflows/*.md` files across `~/.gemini` and active workspaces. Validated each file against `schemas/rule.schema.json` and `schemas/workflow.schema.json`.

---

## Findings

### 1. Rule Frontmatter & Trigger Modes
Audit of 6 real rule files in `~/.gemini/antigravity/.agents/rules/` confirmed:

- **`trigger: always_on`** — Used on global rules (`core-protocol.md`, `request-routing.md`, `universal-rules.md`). Rules are active unconditionally.
- **`trigger: model_decision`** — Used on contextual rules (`code-rules.md`, `quick-reference.md`). Always includes a `description:` key explaining when the model should activate the rule (e.g. *"Apply when writing, building, refactoring, or fixing code..."*).
- **`trigger: glob`** — Used on file-type scoped rules (`design-rules.md`). Includes `globs:` specifying target file patterns.
- **`activation: always`** — Legacy / alternative key observed in plugin rules (`self-customizer/rules/safety-guardrails.md`).
- **Frontmatter-less** — Standalone `GEMINI.md`, `AGENTS.md`, and `~/.gemini/antigravity-cli/rules/global.md` operate without frontmatter, applying hierarchically based on directory scope.

**Verdict on `RuleFileSchema`:** `schemas/rule.schema.json` allows both `trigger` and `activation`, optional `description`, string-or-array `globs`, and permissive frontmatter-less files, perfectly modeling 100% of live rule files without errors.

---

### 2. Rule Glob Syntax Semantics (§17 Gap Resolved)
The live `design-rules.md` file defines:
```yaml
trigger: glob
globs: "**/*.{tsx,jsx,vue,svelte,css,scss},**/components/**,**/app/**/page.tsx"
```
**Key Semantics:**
- **Brace Expansion:** `{tsx,jsx,vue,...}` is fully supported for multi-extension matching.
- **Recursive Globbing:** `**` matches arbitrarily nested directories.
- **Comma-Separated Multi-Pattern Strings:** Multiple globs can be joined by commas in a single string, or supplied as a JSON/YAML array.
- **Activation Lifecycle:** Loaded whenever the user's active editor document or agent tool target file matches one of the patterns.

---

### 3. Workflow File Format & Tokens
Audit of 13 real workflow files in `~/.gemini/antigravity/.agents/workflows/` (`brainstorm.md`, `coordinate.md`, `create.md`, `debug.md`, `deploy.md`, `enhance.md`, `orchestrate.md`, `plan.md`, `preview.md`, `remember.md`, `status.md`, `test.md`, `verify.md`):

- **Frontmatter Format:** All 13 files use a concise `description: ...` frontmatter (omitting `name`/`title` from frontmatter).
- **Title Convention:** The workflow title and slash command are defined in the Markdown H1 header (e.g. `# /debug - Systematic Problem Investigation`).
- **Argument Interpolation Token:** All 13 workflows use `$ARGUMENTS` in the markdown body to interpolate user-provided slash command arguments.
- **Execution Annotations:** Workflows support execution mode annotations (e.g. `// turbo` for non-interactive automated execution).

**Verdict on `WorkflowFrontmatterSchema`:** All 13 real workflow files pass validation against `schemas/workflow.schema.json`.

---

## Verification

Running workspace auditor across `~/.gemini/antigravity` audited 118 files with **100% pass rate** (0 errors).
