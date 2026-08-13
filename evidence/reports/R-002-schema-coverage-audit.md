---
report_id: R-002
title: "Schema Coverage Audit: Antigravity Native Config Surface vs the 19-Schema Catalog"
status: Complete
date: 2026-08-14
scope:
  - Schema Catalog Coverage
  - Hooks Event Shapes
  - Rules & Workflows Frontmatter
  - MCP Transport Contracts
source_refs:
  - "§1"
  - "§4"
  - "§5"
  - "§18"
  - "§20"
evidence_refs:
  - EV-010
  - EV-013
  - EV-014
  - EV-019
  - EV-020
---

# R-002 — Schema Coverage Audit: Antigravity Native Config Surface vs the 19-Schema Catalog

**Date:** 2026-08-14

**Method:** Inventoried the repo's schema catalog (`schemas/*.schema.json` + the §20.2 matrix, `src/schema/validator.ts` registry) — 18 schemas at audit time, 19 since v8.2 — and compared it against primary sources: live `antigravity.google` docs (re-fetched 2026-08-14; repo snapshots from 2026-08-13 under `evidence/sources/docs/`), the official Hooks / Plugins / Workflows pages, the repo's own EV probes and §4/§5/§18 reference modules, and ecosystem tooling that renders Antigravity-native files from declared formats (xcaffold's Antigravity 2 renderer, Mace Labs, note.com). Claims are tagged with the repo's source-tag precedence.

## TL;DR

Three real gaps — one of them a validation bug that rejects **documented-valid** configs:

1. **No Workflow schema.** Workflows are a first-class YAML-frontmatter artifact — the repo's own §1 lists "Skills, Agents, Rules, and Workflows" as the frontmatter family and §4.7 documents them — yet `workflow` is absent from the registry. `validateAntigravityPayload('workflow', …)` → `Schema 'workflow' not found in registry`.
2. **`hooks.schema.json` rejects the documented event shapes.** For `PreInvocation`, `PostInvocation`, and `Stop`, the official docs (and repo §4.8) specify a **plain list of handlers** with no matcher; the schema forces the `{matcher, hooks[]}` wrapper on all five events. Proven failure against the repo's own validator: `Field 'reminder/PreInvocation/0' must have required property 'hooks'`.
3. **`rule.schema.json` documents the wrong frontmatter key.** Real-world Antigravity rule files use `trigger: always_on|glob|model_decision|manual_mention` plus `globs` and `description`; the schema documents `activation:`. Validation passes only by luck (`additionalProperties: true`), but the documented key is inaccurate.

Two scope gaps follow: **hook stdin/stdout payload contracts** (formally documented, zero schemas) and a handful of accuracy notes (§3/$id, plugin manifest fields, target paths, block-scalar parsing).

All three gaps and most accuracy notes have since been fixed — see **Resolution Status** below.

## Resolution Status (2026-08-14, v8.3)

The sections below are preserved as the findings-at-the-time record. Inline **Status:** lines on each action item reflect where each landed; `docs/TODO.md` is the live backlog.

| Finding | Status |
|---|---|
| §2.1 No Workflow schema | ✅ **Resolved in v8.2** — `schemas/workflow.schema.json` added as the 19th native schema, registered in the §20.2 matrix, wired into the auditor (`workflow` file type) |
| §3.1 Hooks event shapes reject documented-valid configs | ✅ **Resolved in v8.2** — `PreInvocation`/`PostInvocation`/`Stop` accept the plain handler list (matcher ignored) via `anyOf` |
| §3.2 Rule frontmatter `activation` vs `trigger` | ✅ **Resolved in v8.3** — both observed keys accepted, incl. the real `activation: always`; no required fields (see R-003) |
| §3.3 MCP transport not enforced | ✅ **Resolved in v8.3** — each server entry requires `command` or `serverUrl` |
| §4 `defaultApprovalMode` / YAML block scalars | ✅ **Resolved in v8.3** — enum enumerated in `settings.schema.json`; `parseSimpleYaml` supports `>`/`\|` values |
| §2.2 Hook payload stdin/stdout contracts | ⏳ **Open** — tracked in `docs/TODO.md` item 1 |
| §4 `$id` URL handling / §20.2 matrix target paths | ⏳ **Open** — tracked in `docs/TODO.md` items 2–3 |

## 1. Covered and confirmed — no gap

- **`settings.json`** — every key in the live Settings doc is present in `settings.schema.json`: `toolPermission`, `artifactReviewPolicy`, `enableTerminalSandbox`, `allowNonWorkspaceAccess`, `altScreenMode`, `colorScheme`, `runningLightSpeed`, `verbosity`, `editor`, `editorMode`, `notifications`, `useG1Credits`, `enableTelemetry`, `showTips`, `showFeedbackSurvey`, `statusLine`, `title`, plus the keybindings profile `[DOCS]`. Live-verified via EV-013 `[LIVE]`.
- **`keybindings.json`** — `{action: [chord, …]}` format confirmed by docs; EV-019 probed the default state `[DOCS] [LIVE]`.
- **`skill.md`** — `name` + `description` confirmed by the Skills doc; `metadata` + `disable-slash-command` are live-verified v1.1.12 additions `[DOCS] [LIVE]`.
- **`agent.md`** — all documented frontmatter fields covered (`name`, `description`, `tools`, `mainAgent`, `subagent`, `model`, `commandExecutionPolicy`, `mcpServers`, `skills`, `plugins`); EV-011 grounded model inheritance `[DOCS] [LIVE]`.
- **`mcp_config.json`** — server fields match the MCP doc: `command`|`serverUrl`, `args`, `env`, `cwd`, `headers`, `authProviderType` (`google_credentials`), `oauth`, `disabled`, `disabledTools` `[DOCS]`.
- **Runtime state** — `transcript_step`, `history_entry`, `cli_state`, `projects`, `master_config`, `desktop_state`, `ide_state`, `trusted_hooks`, `import_manifest` were grounded in the 2026-08-13 live `~/.gemini/` observation pass; no additional artifact surfaced in this audit `[LIVE]`.

## 2. Missing schemas

### 2.1 Workflow — first-class artifact with no schema

Official docs: workflows are Markdown files "contain a title, a description and a series of steps", invoked as `/workflow-name`, composable (a workflow can call other workflows), 12,000-char limit, managed in the Customizations panel `[DOCS]`.

Observed on-disk format (Mace Labs, verified Nov 2025) — YAML frontmatter plus an ordered Markdown step list, with `// turbo` (auto-run next command) and `// turbo-all` (auto-run everything) annotations `[COMMUNITY]`:

```yaml
---
description: A short description of what this workflow does
---
1. Step Title
command to run
// turbo
2. Another Step
```

Locations: workspace `.agent/workflows/` (legacy, verified) / `.agents/workflows/` (2.0 convention, inferred), global `~/.gemini/antigravity/global_workflows/global-workflow.md` `[COMMUNITY]`.

**Action:** add `workflow.schema.json` (`{title?, description?, name?}` frontmatter, `additionalProperties: true`) and a `workflow` registry key; wire `.agents/workflows/*.md` / `.agent/workflows/*.md` into `identifyFileSchemaKey` (today they fall through to "general file"). Confirm exact frontmatter keys against a real workflow file before locking `required`.

**Status:** ✅ Resolved in v8.2 — `schemas/workflow.schema.json` added (19th native schema), `workflow` registry key and `identifyFileSchemaKey` mapping live; description-only frontmatter verified against the repo's own `.agents/workflows/antigravity_research_workflow.md`. Sweeping `~/.gemini` for real workflow files remains open (`docs/TODO.md` item 5).

### 2.2 Hook payload contracts — documented, zero schemas

The Hooks doc formally specifies stdin/stdout JSON for all five events `[DOCS]`:

| Event | stdin key fields | stdout key fields |
|---|---|---|
| `PreToolUse` | `toolCall{name,args}`, `stepIdx` | `decision` (`allow`/`deny`/`ask`/`force_ask`/`deny_unless_prior_grant`), `reason`, `permissionOverrides[]` |
| `PostToolUse` | `toolCall`, `stepIdx`, `error` | `{}` |
| `PreInvocation` | `invocationNum`, `initialNumSteps` | `injectSteps[]` (`toolCall`/`userMessage`/`ephemeralMessage`) |
| `PostInvocation` | same as PreInvocation | `injectSteps[]`, `terminationBehavior` (`force_continue`/`terminate`/`""`) |
| `Stop` | `executionNum`, `terminationReason`, `error`, `fullyIdle` | `decision` (`continue` or other), `reason` |

Plus shared common fields (`conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`).

**Action:** add a `hook_payload` schema family (one per event, or one schema with per-event `$defs`). This fits the catalog's scope — `status_line` is already a runtime IPC payload schema.

**Status:** ⏳ Open — tracked in `docs/TODO.md` item 1.

## 3. Schema correctness bugs

### 3.1 `hooks.schema.json` event shapes (validates wrongly)

The schema models every event as `array of {matcher, hooks: [{type, command, timeout}]}`. The official doc's own example and repo §4.8 say `PreInvocation`/`PostInvocation`/`Stop` are a **plain handler list** (matcher ignored) `[DOCS]`. Reproduced with the repo's validator:

```text
validateAntigravityPayload('hooks', { reminder: { PreInvocation: [{ type: 'command', command: './scripts/reminder.sh' }] } })
→ invalid: Field 'reminder/PreInvocation/0' must have required property 'hooks'
```

**Action:** in `hooks.schema.json`, type `PreInvocation`/`PostInvocation`/`Stop` as arrays of handler objects directly (keep `{matcher, hooks[]}` for `PreToolUse`/`PostToolUse`), or use a `oneOf` accepting both shapes for forward compatibility.

**Status:** ✅ Resolved in v8.2 — `anyOf` accepts both the plain handler list (canonical) and the matcher-group form (compatibility); covered by `test/fixtures/hooks/valid-preinvocation-list.json`.

### 3.2 `rule.schema.json` — `activation` vs `trigger`

Official Rules doc documents the four activation modes (Always On / Model Decision / Glob / Manual) but not the frontmatter keys `[DOCS]`. Ecosystem tooling that writes native Antigravity rule files (xcaffold Antigravity 2 renderer; note.com guide) consistently emits `description` + `trigger:` with values `always_on`, `glob`, `model_decision`, `manual_mention`, plus `globs:` (comma-joined patterns) `[COMMUNITY]`. The schema instead documents `activation: always_on|manual|model_decision|glob` — the key is likely wrong, and the `manual`/`manual_mention` spelling is unconfirmed.

**Action:** rename to `trigger` (accepting both `manual` and `manual_mention` in the enum) and model `globs` as `string` or `array`; validate against a real rule file before locking.

**Status:** ✅ Resolved in v8.3 (with R-003) — `rule.schema.json` accepts both `trigger` and the legacy `activation` key (incl. `activation: always`), `globs` as string or array, and no required fields; frontmatter-less rule files no longer error in the auditor. Locking the primary key against a UI/CLI-written rule file remains open (`docs/TODO.md` item 4).

### 3.3 `mcp_config.schema.json` — transport not enforced

Docs: "Transport (one required): `command` (stdio) or `serverUrl` (Streamable HTTP/SSE)" `[DOCS]`; the schema allows servers with neither. **Action:** add `oneOf` requiring one of the two, or at least document the constraint.

**Status:** ✅ Resolved in v8.3 — `mcp_config.schema.json` `anyOf` requires `command` (stdio) or `serverUrl` (remote); covered by `test/fixtures/mcp_config/invalid-no-transport.json`.

## 4. Accuracy & enrichment notes

- **`$id` URLs are placeholders.** All schemas claim `https://antigravity.google/schemas/v1/*.schema.json`; fetching one returns **404** (verified 2026-08-14). They are self-referential IDs, not Google-served schemas — keep as-is, but don't advertise them as resolvable.
- **`plugin.json` manifest.** Official Plugins doc confirms only `name` (optional, defaults to directory name); `description`/`version`/`author`/`homepage` are extras tolerated by `additionalProperties` and were observed as variations in EV-010 `[DOCS] [LIVE]`. Plugins also bundle `skills/`, `rules/`, `mcp_config.json`, `hooks.json`; locations include `.agents/plugins/` and `~/.gemini/config/plugins/` (the §20.2 matrix lists only `plugins/<name>/plugin.json`).
- **Agent target paths.** Docs add the folder form `.agents/agents/<name>/agent.md`, global `~/.gemini/config/agents/`, and plugin `agents/` components (EV-007/EV-008) `[DOCS] [LIVE]` — the §20.2 matrix lists only `.agents/agents/<name>.md`.
- **`settings.general.defaultApprovalMode`** (`default`/`auto_edit`/`plan`) was resolved in §18 but is not enumerated in `settings.schema.json` (it lives under the `general` object's `additionalProperties`).
- **YAML block scalars unsupported by the frontmatter parser.** `description: >` (multi-line) — used by this repo's own `.agents/skills/*/SKILL.md` — parses `description` as the literal string `">"` under `parseSimpleYaml`. Skill/agent descriptions in the wild commonly use block scalars; the auditor silently loses the content. Parser gap, not a schema gap, but it degrades schema-driven validation.

## 5. Recommended next steps

Status of the original action list as of v8.3 (see `docs/TODO.md` for the live backlog):

1. ~~Fix `hooks.schema.json` event shapes~~ — ✅ done (v8.2).
2. ~~Add `workflow.schema.json` + registry key + file-type mapping~~ — ✅ done (v8.2).
3. Add hook payload schemas (§2.2) — ⏳ open.
4. ~~Correct `rule.schema.json` to `trigger`~~ — ✅ done (v8.3); confirm the primary key with a live probe before locking (TODO item 4).
5. ~~Enforce MCP transport `oneOf`~~ — ✅ done (v8.3). ~~Enumerate `defaultApprovalMode`~~ — ✅ done (v8.3). §20.2 matrix target paths and `$id` handling — ⏳ open (TODO items 2–3).
6. ~~Extend `parseSimpleYaml` with block-scalar support~~ — ✅ done (v8.3); YAML-exact chomping edge cases remain (TODO item 8).

*End of Report — R-002 (updated 2026-08-14, v8.3)*
