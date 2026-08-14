---
report_id: R-005
title: "Schema verification against the archived IDE pages: hooks, rules, workflows (no changes required)"
status: Complete
date: 2026-08-14
scope:
  - HooksConfigSchema
  - RuleFileSchema
  - WorkflowFrontmatterSchema
  - IDE Docs (rules / workflows / hooks)
source_refs:
  - "§4"
  - "§19"
  - "§20"
evidence_refs:
  - S-033
  - S-034
  - S-043
---

# R-005 — Schema verification against the archived IDE pages

**Date:** 2026-08-14

**Question:** Do `schemas/hooks.schema.json`, `schemas/rule.schema.json`, and `schemas/workflow.schema.json` match the formats documented on the official IDE pages archived as evidence sources (`ide/rules` = S-033, `ide/workflows` = S-034, `ide/hooks` = S-043)?

**Method:** extracted the documented JSON/markdown formats from the archived snapshots and validated the exact documented examples against the repo's own validator (`validateAntigravityPayload`).

## Verdict: all three schemas match the official docs — no changes required

### 1. Hooks — `schemas/hooks.schema.json` matches S-043 (`ide/hooks`) ✓

The archived page documents:

- Top-level `hooks.json` maps hook-set names to `{ enabled?, PreToolUse, PostToolUse, PreInvocation, PostInvocation, Stop }`.
- `PreToolUse`/`PostToolUse` use the matcher-group form: array of `{ matcher, hooks: [{ type?, command, timeout? }] }`.
- `PreInvocation`/`PostInvocation`/`Stop` are **plain handler lists**; the Supported Events table explicitly says *"N/A (matcher ignored)"* — confirming the 8.2 fix.
- Hook-set `enabled` (boolean, default true), handler `timeout` (integer), and handlers with **no `type`** (defaults to `command`) are all documented.

The exact example from the page (including `enabled: false`, a no-`type` handler, `timeout: 10`, and a plain-list `PreInvocation`) validates: `true`.

### 2. Rules — `schemas/rule.schema.json` consistent with S-033 (`ide/rules`) ✓

The archived page describes activation as a UI-managed property at the rule level (Manual / Always On / Model Decision / Glob) and never documents frontmatter keys — consistent with the permissive schema from R-003 (no required fields, `trigger`/`activation` both accepted, `globs` string-or-array). Glob examples (`*.js`, `src/**/*.ts`) are covered by the schema's `globs` type.

### 3. Workflows — `schemas/workflow.schema.json` consistent with S-034 (`ide/workflows`) ✓

The archived page states workflow files "contain a title, a description and a series of steps" (steps are markdown body, not frontmatter). A `{title, description}` frontmatter validates: `true`. The schema's optional `name`/`title`/`description` with `additionalProperties: true` covers the documented surface.

## New observations (open items, see docs/TODO.md)

1. **Global rules location:** `ide/rules` says *"Global rules live in `~/.gemini/GEMINI.md`"* (also echoed by the archived `cli/gcli-migration` page). The repo's §3/§20 and the real install record rule files under `~/.gemini/antigravity-cli/rules/` (e.g. `global.md`). Reconcile: GEMINI.md is the global context/constraint file per the docs; the `rules/` directories may be the CLI/panel-managed store — confirm and document both.
2. **Runtime size limits:** both `ide/rules` and `ide/workflows` cap files at 12,000 characters; not captured in the schemas or reference modules. Consider documenting (a runtime constraint, not a schema field).
3. **Workflow `name` key:** the official page documents only `title` + `description`; the community/2.0 format uses `name`. The schema accepts both — do not tighten until a real Antigravity-written workflow confirms the primary key.

## Verification

Validation run against the repo's own validator: hooks doc example, hooks `PostInvocation`/`Stop` plain lists, and workflow `title`+`description` all validate. No schema or fixture changes were required.
