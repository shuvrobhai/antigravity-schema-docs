# TODO — Open Issues & Next-Session Work

Status ledger for issues surfaced by the schema coverage audit (**R-002**) and the rule frontmatter research (**R-003**), plus related hardening. Applied items are listed for traceability; the open items below are the next session's backlog.

## Applied (2026-08-14)

- [x] **Hooks event shapes** — `PreInvocation`/`PostInvocation`/`Stop` now accept the documented plain handler list (matcher ignored), matcher-group form still accepted. File: `schemas/hooks.schema.json` (R-002 §3.1).
- [x] **Workflow schema** — added `schemas/workflow.schema.json` as the 19th native schema, registered in the §20.2 matrix, wired into the auditor as the `workflow` file type (R-002 §2.1).
- [x] **Rule frontmatter** — `rule.schema.json` accepts both observed keys: `trigger` (community 2.0 convention) and `activation` (real file `activation: always`), `globs` as string or array, **no required fields** (R-003 §5).
- [x] **Auditor rule tolerance** — frontmatter-less `.agents/rules/*.md` (the dominant real-world shape) are now valid instead of a `parse_error` (R-003).
- [x] **MCP transport** — each `mcpServers` entry requires at least one of `command` (stdio) or `serverUrl` (remote), per the official docs (R-002 §3.3).
- [x] **`settings.general.defaultApprovalMode`** — enumerated `default | auto_edit | plan` (R-002 §4; resolved in §18).
- [x] **YAML block scalars** — `parseSimpleYaml` in `src/lib/markdownCore.ts` supports `>` / `|` values, so multi-line skill/rule descriptions parse fully (R-002 §4).

## Open for next session

### 1. Hook payload schemas (R-002 §2.2)
The five hook events have formally documented stdin/stdout contracts (`decision`, `injectSteps`, `terminationBehavior`, `permissionOverrides`, common fields `conversationId`/`workspacePaths`/`transcriptPath`/`artifactDirectoryPath`/`modelName`) with **no schemas**. Add a `hook_payload` family (one schema per event, or one schema with per-event `$defs`) — consistent with `status_line` already being a runtime IPC payload schema. Requires registering new schemas in the §20.2 matrix and bumping the catalog count.
Evidence: `https://antigravity.google/docs/hooks` → Input/Output Contract tables.

### 2. `$id` URLs are 404 placeholders (R-002 §4)
All schemas claim `https://antigravity.google/schemas/v1/*.schema.json`, but the URLs do not resolve (verified 2026-08-14). Decide: keep them as internal namespaces and document that they are not resolvable, or drop `$id`. Do not present them as Google-served URLs.

### 3. §20.2 matrix target-path accuracy (R-002 §4)
- Agent: add folder form `.agents/agents/<name>/agent.md`, global `~/.gemini/config/agents/`, plugin `agents/` components (EV-007/EV-008).
- Plugin: add locations `.agents/plugins/` and `~/.gemini/config/plugins/`; note that `description`/`version`/`author`/`homepage` beyond `name` are extras (EV-010).

### 4. Definitively confirm rule frontmatter with a live probe (R-003)
Community tooling says `trigger: always_on|glob|model_decision|manual_mention`; the only real frontmatter'd file found uses `activation: always`. Create a rule through the actual UI/CLI (Rules panel or direct write in `.agents/rules/`) and inspect what Antigravity itself writes, then lock the schema's primary key.

### 5. Workflow schema verification against real files
The repo's `.agents/workflows/antigravity_research_workflow.md` (description-only frontmatter) validates. Sweep `~/.gemini` for real workflow files (`.agent/workflows/`, `.agents/workflows/`, `global_workflows/`) to confirm frontmatter keys and the `// turbo` / `// turbo-all` annotation semantics (Mace Labs).

### 6. Rule glob syntax semantics (§17 open gap)
"What glob syntax do Rules use in `Glob` activation mode?" — minimatch vs gitignore, negation (`!`), comma-joined vs array. Close with a live probe; then tighten `rule.schema.json`'s `globs` docs.

### 7. Schema strictness pass
Most schemas use `additionalProperties: true`. Where docs define closed enums/required sets (hooks handler `type`, transcript `source`/`type`/`status`, settings enums), consider tightening — but never in a way that rejects real observed files.

### 8. `parseSimpleYaml` block-scalar edge cases
Current block-scalar support is best-effort: folding (`>`) joins lines with spaces, literal (`|`) keeps newlines, trailing whitespace is trimmed. YAML-exact chomping (`+` keeps trailing newlines, `-` strips), multi-paragraph `|` blocks, and indentation preservation are not implemented. Add unit tests pinning the real skill files' `description: >` parsing.

### 9. Version-string drift
Preamble version header and the §20 end-note must stay in sync with the top changelog row after each revision (currently 8.3).

## Where the findings live
- `evidence/reports/R-002-schema-coverage-audit.md`
- `evidence/reports/R-003-rule-frontmatter-format.md`
