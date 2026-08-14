# TODO — Open Issues & Next-Session Work

Status ledger for issues surfaced by the schema coverage audit (**R-002**), the rule frontmatter research (**R-003**), and the works-cited verification (**R-004**), plus related hardening. Applied items are listed for traceability; the open items below are the next session's backlog.

## Applied (2026-08-14)

- [x] **Hooks event shapes** — `PreInvocation`/`PostInvocation`/`Stop` now accept the documented plain handler list (matcher ignored), matcher-group form still accepted. File: `schemas/hooks.schema.json` (R-002 §3.1).
- [x] **Workflow schema** — added `schemas/workflow.schema.json` as the 19th native schema, registered in the §20.2 matrix, wired into the auditor as the `workflow` file type (R-002 §2.1).
- [x] **Rule frontmatter** — `rule.schema.json` accepts both observed keys: `trigger` (community 2.0 convention) and `activation` (real file `activation: always`), `globs` as string or array, **no required fields** (R-003 §5).
- [x] **Auditor rule tolerance** — frontmatter-less `.agents/rules/*.md` (the dominant real-world shape) are now valid instead of a `parse_error` (R-003).
- [x] **MCP transport** — each `mcpServers` entry requires at least one of `command` (stdio) or `serverUrl` (remote), per the official docs (R-002 §3.3).
- [x] **`settings.general.defaultApprovalMode`** — enumerated `default | auto_edit | plan` (R-002 §4; resolved in §18).
- [x] **YAML block scalars** — `parseSimpleYaml` in `src/lib/markdownCore.ts` supports `>` / `|` values, so multi-line skill/rule descriptions parse fully (R-002 §4).
- [x] **Works Cited minimization** — re-verified every Google/community §19 entry against the official docs (`llms.txt` + live pages), dropped the 3 never-cited codelabs, renumbered 46 → 43 entries, renamed/renumbered snapshots + `source:` frontmatter, regenerated the manifest, updated badges/§2 ranges/registry self-test/UI counts (R-004).
- [x] **Evidence archive expansion** — added 9 official-docs sources surfaced by `llms.txt` (`cli/install`, `cli/gcli-migration`, `ide/rules`, `ide/workflows`, `sdk/mcp`, `sidecars`, `task-groups`, `tools`, `faq`) as §19 entries #31-39; renumbered §19 to 52 entries (docs 1-39, google 40-44, protocol 45, community 46-52); renamed the 13 affected snapshots + `source:` frontmatter and fetched the 9 new pages into `evidence/sources/docs/`.
- [x] **Evidence archive expansion II** — added 7 more official-docs sources (`cli/modes`, `cli/vim-editor-mode`, `cli/credits`, `ide/hooks`, `ide/settings`, `ide/plugins`, `ide/mcp`) as §19 entries #40-46; renumbered §19 to 59 entries (docs 1-46, google 47-51, protocol 52, community 53-59); renamed the 13 affected snapshots + `source:` frontmatter and fetched the 7 new pages into `evidence/sources/docs/`.
- [x] **Append-only numbering + final archive batch** — adopted append-only §19 numbering (new sources get the next free numbers at the end of the list, no renumbering of existing entries/snapshots); archived the final `llms.txt` batch (9 CLI command pages, `ide/overview`, `ide/getting-started`, `cli/overview`, `cli/features`, `cli/prompting`) as §19 entries #60-73 (now 73 entries); fetched the 14 pages into `evidence/sources/docs/`.
- [x] **Schema verification against archived IDE pages** — confirmed `hooks`/`rule`/`workflow` schemas match the official `ide/hooks`, `ide/rules`, `ide/workflows` pages (R-005); validated the exact documented hooks.json example and workflow `title`+`description` frontmatter with the repo's own validator. No schema changes required.
- [x] **Hook payload schemas & 20-schema catalog expansion** — added `schemas/hook_payload.schema.json` as the 20th native schema covering stdin/stdout contracts across all five hook events (`PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`) with reusable `$defs` (`CommonHookContext`, `InjectStep`); registered in the §20.2 matrix (R-002 §2.2).
- [x] **Schema `$id` namespace documentation** — documented in §20 that `$id` URLs (`https://antigravity.google/schemas/v1/*.schema.json`) represent canonical JSON Schema Draft 2020-12 namespace URIs rather than resolvable HTTP endpoints (R-002 §4).
- [x] **§20.2 matrix target-path accuracy** — updated target paths for Agent (`.agents/agents/<name>/agent.md`, `~/.gemini/config/agents/`, `plugins/<name>/agents/*.md`) and Plugin (`plugins/<name>/plugin.json`, `.agents/plugins/<name>/plugin.json`, `~/.gemini/config/plugins/<name>/plugin.json`) (R-002 §4).
- [x] **Empirical rule frontmatter & glob syntax audit** — audited 6 real rule files in `~/.gemini/antigravity/.agents/rules/` and confirmed `trigger: always_on|model_decision|glob` + `activation: always`, and glob syntax with curly braces, recursion, comma-separated patterns (R-006).
- [x] **`parseSimpleYaml` test suite & block-scalar hardening** — added comprehensive unit tests to `scripts/test_integrity_gate.ts` covering folded scalars (`>`), stripped chomp (`>-`), literal scalars (`|`), nested objects, JSON arrays, and YAML lists.
- [x] **Reconcile global rules locations & 12,000-char limits** — documented the 12k character limit on rules and workflows in §4.6 and §4.7; documented global rules paths (`~/.gemini/GEMINI.md`, `~/.gemini/antigravity-cli/rules/`, `~/.gemini/config/rules/`, and directory walk-up deduplication) (R-005/R-006).
- [x] **Correct §09 sandbox claim source tagging** — downgraded unquoted fail-closed and symlink escape claims to `[INFERRED]` (Tier B architectural deduction) in `reference/09-sandbox.md` (R-004 §6.1).
- [x] **Reconcile official-docs global skills path conflict** — resolved conflict between `docs/skills` (`~/.gemini/config/skills/`) and `cli/gcli-migration` (`~/.gemini/antigravity-cli/skills/`) by documenting dual-root runtime loading confirmed by `EV-012` across §3.4 and §16 (R-004 §6.2).
- [x] **Schema strictness & enum pass** — audited all 20 JSON schemas in `schemas/`, verified closed enums across settings, hooks, transcripts, master_config, and status_line (tightened `execution_mode: ["planning", "fast", "default", "accept-edits"]`), and added Ajv invalid fixture test `status_line/invalid-mode.json` (35/35 fixture tests passing).
- [x] **Formalize §16 community sourcing policy** — adopted minimal §19 indexing policy where §19 registers primary snapshotted anchors (#53–#59) while §16 tables cite secondary/corroborating community names without snapshot inflation (R-004 §6.3).
- [x] **Reconcile version strings & end-notes** — synchronized preamble version header, §20 end-note, and README schema counts to v8.10 (20 native schemas).
- [x] **Document workflow frontmatter & token semantics** — verified that official `ide/workflows` uses `title`+`description` while real workflows often omit `name`/`title` and derive the slash command from filename or H1 header; documented `$ARGUMENTS` interpolation and permissive schema behavior across §4.7 and `schemas/workflow.schema.json` (R-005, R-006).
- [x] **Architecture Deepening 01: EvidenceRegistry Domain Catalog** — extracted pure browser-safe `src/lib/evidenceRegistry.ts` cataloging citations, evidence probes, canonical URLs, duplicate grouping, and cross-reference indexing over the `DocumentStore` seam.
- [x] **Architecture Deepening 02: Headless WorkspaceSession Engine** — extracted pure in-memory `src/schema/workspaceSession.ts` managing presets, templates, line-by-line unified diffing, dirty state analysis, and audit execution behind a decoupled class interface.
- [x] **Architecture Deepening 03: Pure ManifestGenerator Engine** — extracted `src/schema/manifestGenerator.ts` providing strongly-typed option contracts, default configurations, and deterministic serializers for `SKILL.md`, `plugin.json`, `mcp_config.json`, `hooks.json`, `agent.md`, and `rule.md`.
- [x] **Architecture Deepening 04: In-Memory Inverted SearchIndex** — extracted `src/lib/searchIndex.ts` pre-indexing corpus items (modules, schemas, evidence, sources, ADRs) for $O(1)$ token and prefix lookup, shrinking `src/data/search.ts` to 15 lines.
- [x] **Ponytail Cleanups & Protocol Rule** — removed redundant `bun.lock` (75 KB), pruned shallow facades (`sourceProcessing.ts`, `validationEngine.ts`), installed active workspace rule `.agents/rules/ponytail.md`, and wired all new module unit tests into `make test`.

## Open for next session

### 1. Snapshot the remaining official pages (R-004 §3)
Done 2026-08-14: `cli/install`, `cli/gcli-migration`, `ide/rules`, `ide/workflows`, `sdk/mcp`, `sidecars`, `task-groups`, `tools`, `faq` (§19 #31-39), `cli/modes`, `cli/vim-editor-mode`, `cli/credits`, `ide/hooks`, `ide/settings`, `ide/plugins`, `ide/mcp` (§19 #40-46), `cli/commands/*` (9 pages), `ide/overview`, `ide/getting-started`, `cli/overview`, `cli/features`, `cli/prompting` (§19 #60-73, append-only). Remaining (optional, add via append-only numbering): `cli/using`, `cli/tutorial`, `cli/getting-started`, `cli/install` extras, `ide/browser-recordings`, `ide/review-changes-editor`, `ide/tab`, `docs/plans`, `docs/faq` extras — useful to close §16/§17 gaps.






## Where the findings live
- `evidence/reports/R-002-schema-coverage-audit.md`
- `evidence/reports/R-003-rule-frontmatter-format.md`
- `evidence/reports/R-004-works-cited-minimization-audit.md`
- `evidence/reports/R-005-schema-verification-against-archived-ide-pages.md`
- `evidence/reports/R-006-rule-and-workflow-live-inventory-audit.md`
