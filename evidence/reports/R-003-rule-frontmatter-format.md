---
report_id: R-003
title: "Rule File Frontmatter Format: activation vs trigger vs none — verified against real Antigravity rule files"
status: Complete
date: 2026-08-14
scope:
  - Rule File Format
  - Frontmatter Keys (activation / trigger)
  - Activation Modes & Glob Syntax
  - Auditor Rule Validation
source_refs:
  - "§4"
  - "§5"
  - "§15"
  - "§17"
  - "§20"
evidence_refs:
  - EV-007
---

# R-003 — Rule File Frontmatter Format: `activation` vs `trigger` vs none

**Date:** 2026-08-14

**Question:** What does a real Antigravity rule file actually look like, and does the repo's `schemas/rule.schema.json` (key `activation`, enum `always_on|manual|model_decision|glob`) match reality?

## TL;DR

1. **Real Antigravity rule files are mostly plain Markdown with no frontmatter at all** — `~/.gemini/antigravity-cli/rules/global.md` and the installed ponytail plugin's `.agents/rules/ponytail.md` both start directly with `#` headings. The official docs and the installed `manage-rules` skill treat activation as a **panel/UI property**, not a file key.
2. **The one real rule file that does carry frontmatter uses `activation: always`** — `~/.gemini/config/plugins/self-customizer/rules/safety-guardrails.md` (`name`, `description`, `activation: always`). The current repo schema **rejects it** (`activation: always` ∉ `[always_on, manual, model_decision, glob]`) — verified against the repo's own validator.
3. **The `trigger:` key is a community/interop convention, not yet observed in a real file on this install** — xcaffold's Antigravity renderer emits `trigger: glob|model_decision|manual_mention` (+ comma-joined `globs`); the note.com guide documents `trigger: always_on|glob|model_decision|manual` (+ `globs` array). Likely Antigravity-2.0-era, and/or IDE-written; unconfirmed live.
4. **Because frontmatter is optional in practice, the auditor must not hard-fail frontmatter-less rule files.** Today `identifyFileSchemaKey` maps `.agents/rules/*.md` → `rule` and the auditor reports `parse_error` for any `.md` without `---` — which is the dominant real-world shape.

## 1. What `reference/` already says

- **§4.6 Rules** documents the four activation modes (Manual via `@` mention, Always On, Model Decision, Glob) and rule paths (global `~/.gemini/GEMINI.md`, workspace `.agents/rules/`, legacy `.agent/rules`), the 12,000-char limit, and `@filename` references — **no frontmatter keys are specified** `[DOCS]`.
- **§5.8 Context Rule Files** lists `GEMINI.md` / `AGENTS.md` paths — no frontmatter format `[DOCS]`.
- **§17 Undocumented Behavioral Contracts** still lists **"What glob syntax do Rules use in `Glob` activation mode?"** as an open gap — the schema's `globs` semantics were never source-grounded.
- **§20.2 matrix row 14** points `rule` at `AGENTS.md`, `GEMINI.md`, `.agents/rules/*.md`.
- **§4.4 / EV-007** note that plugin `rules` components exist on disk (self-customizer ships `rules/safety-guardrails.md`) but `agy plugin list` does **not** surface them — so plugin rule files are not CLI-loaded/verified components `[LIVE]`.

## 2. Primary-source evidence: real files on this install (2026-08-14)

| File | Frontmatter | Notes |
|---|---|---|
| `~/.gemini/antigravity-cli/rules/global.md` | **none** — starts `# Global Rules` | The CLI's actual global rules file; body-only markdown `[LIVE]` |
| `~/.gemini/config/plugins/ponytail/.agents/rules/ponytail.md` | **none** — starts `# Ponytail, lazy senior dev mode` | Workspace-scoped plugin rule; body-only `[LIVE]` |
| `~/.gemini/config/plugins/self-customizer/rules/safety-guardrails.md` | `name`, `description`, **`activation: always`** | The only real file with frontmatter found; rejected by current schema `[LIVE]` |
| `~/.gemini/config/archived-skills/manage-rules/SKILL.md` | — | Google-authored skill: instructs creating rules as plain `.md`; activation chosen in the prompt/panel — never writes a frontmatter key `[LIVE]` |

Verification run against the repo's validator (`validateAntigravityPayload('rule', …)` on `parseYamlFrontmatter` of each file):

```text
safety-guardrails.md   → INVALID: Field 'activation' must be equal to one of the allowed values
                         (allowedValues: [always_on, manual, model_decision, glob])
ponytail.md / global.md → no frontmatter (schema trivially passes; auditor would raise parse_error)
```

## 3. Community / interop sources for `trigger:`

- **xcaffold** (declarative compiler that emits provider-native files, Antigravity v1 + 2.0 renderers): always-applied rules emit **only `description`** (no activation key); path-scoped emit `trigger: glob` + `globs: src/components/**,src/hooks/**` (**comma-joined string**); model-decided emit `trigger: model_decision`; Antigravity 2 manual emits `trigger: manual_mention`. v1 is stated to support always/path-glob/model-decided `[COMMUNITY]`.
- **note.com guide (2026-03)** on the Antigravity IDE rules UI: `trigger: always_on`, `trigger: model_decision`, `trigger: glob` + `globs: ["…","…"]` (**array**), `trigger: manual` `[COMMUNITY]`.

Both agree the key is `trigger`; they disagree on `always` spelling (`always_on` vs omitted) and `globs` type (array vs comma-joined string). Neither matches the real installed file's `activation: always`.

## 4. Analysis

- **Version/convention split is the likely explanation.** The real `activation: always` file lives in a plugin that also ships `~/.gemini/config/agents/`-style legacy components; `trigger:` with underscore values is the newer 2.0-era interop convention. No single key is canonical across both eras, and official docs bless neither.
- **Frontmatter is optional.** The two body-only CLI rule files plus the manage-rules skill show plain Markdown is a first-class, common rule format. A rule schema with required fields, or an auditor that hard-errors on missing frontmatter, is wrong for the dominant real-world shape.
- **The current schema is an invented synthesis** (key `activation` + enum from the docs' mode names) that matches no observed file exactly — it neither validates the real `activation: always` file nor documents `trigger:`.

## 5. Recommended rule.schema.json shape

```yaml
properties:
  name:        string, pattern ^[a-z0-9-_]+$        # optional; defaults to file name
  description: string                                # optional; shown to model for model_decision
  trigger:     enum [always_on, glob, model_decision, manual, manual_mention]   # observed community convention
  activation:  enum [always, always_on, glob, manual, model_decision]           # observed real file (legacy)
  globs:       string | array of string              # comma-joined string (xcaffold) or array (note.com)
  tags:        array of string                       # optional
additionalProperties: true
required: []                                          # frontmatter-less rule files are normal
```

Plus: the auditor should treat a rule `.md` with no `---` block as **valid** (skip schema validation) rather than a `parse_error`, matching the real `global.md` / `ponytail.md` shape.

## 6. Related observation (workflow schema)

The repo's own `.agents/workflows/antigravity_research_workflow.md` (untracked, on disk) carries **description-only frontmatter** — consistent with the Mace Labs format and the new `workflow.schema.json` (no required fields). Good early validation of the workflow schema `[LIVE]`.

*End of Report — R-003*
