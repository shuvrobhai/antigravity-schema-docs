# Google Antigravity Ecosystem: Complete Technical Reference, Schema Specification, and Gap Analysis

## Version 8.10 — Empirical Grounding of Rules, Glob Syntax, and Workflow Files (agy 1.1.12)

**Live verification date:** 2026-08-13  
**Live binary:** `agy 1.1.12`  
**Platform:** macOS Darwin 25.4.0 / arm64  
**Host status:** user-configured, not clean install

---

## What This Is

A comprehensive, source-classified reference for every schema, path, configuration key, command, tool, and behavioral specification across the entire **Google Antigravity Ecosystem**:

1. **Antigravity 2.0** — Standalone desktop application (`~/.gemini/antigravity/`).
2. **Antigravity IDE** — VS Code-fork agentic IDE (`~/.gemini/antigravity-ide/`).
3. **Antigravity CLI** — Lightweight terminal interface (`~/.gemini/antigravity-cli/`).
4. **Antigravity SDK** — Python SDK for agent development & orchestration (`google-antigravity-sdk`).
5. **Shared Ecosystem Core** — Global customizations, skills, plugins, rules, and hooks (`~/.gemini/config/`).

This report answers three questions:

1. **What exists?** — Every configuration key, file path, command, tool argument, and schema in Antigravity CLI.
2. **What do the official docs tell you?** — Everything confirmed at `antigravity.google/docs/*`, with source attribution.
3. **What don't the official docs tell you?** — Behavioral gaps, undocumented contracts, community-sourced findings, and information that requires independent verification.

This version adds a live-system grounding pass against `agy 1.1.12` using evidence IDs (`EV-###`) and the source tag `[LIVE-1.1.12 · 2026-08-13]`.

## Changelog

| Version | Date | Summary |
|---|---|---|
| 1.0 | Initial | Original gap analysis with mixed-sourcing |
| 2.0 | Revision | Tier A/B/C classification applied; sourced vs unsourced separated |
| 3.0 | Major update | All official docs pages incorporated; 50+ sources; schemas expanded |
| 4.0 | Current | Source classification system (`[DOCS]`/`[GOOGLE]`/`[PROTOCOL]`/`[COMMUNITY]`); Sections 16-17 added; 35 commands; 25 behavioral gaps cataloged |
| 5.0 | 2026-08-11 | Live-doc verification run: headless `status` enum + exit codes resolved; `defaultApprovalMode` enum resolved; plugin `agents/` inconsistency confirmed; CLI brain path + transcript schema verified hands-on (new §18.1); Section 10 rebuilt with full flag/stream reference |
| 5.1 | 2026-08-11 | Full-brain transcript audit (`scripts/audit_transcripts.py`, 49,586 lines / 33 sessions): `type` enum expanded to 19 values (9 promoted with citations); `status` enum confirmed as `DONE`/`RUNNING`/`ERROR` (the `ACTIVE` guess superseded); evidence saved under `audits/` |
| 5.2 | 2026-08-13 | Automated schema extraction & validation toolkit created (`antigravity-schemas` / `agy-schema` CLI); 9 Pydantic v2 models + JSON Schemas + live system auditor + sync-doc verification implemented |
| 6.0 | 2026-08-13 | Full Ecosystem Expansion: Expanded scope across Antigravity 2.0 (Desktop app), Antigravity IDE (VS Code fork), Antigravity CLI, Antigravity SDK, and Shared Core (`config/`); updated path inventories and system models |
| 7.0 | 2026-08-13 | Complete 17 Native Schemas & Toolkit Architecture Edition: Built single-source `SchemaRegistry`, domain-locality `AuditReport`, contextual `DocSyncInspector`, added 4 new native models (`RuleFileSchema`, `CLIStateSchema`, `CLIHistoryEntrySchema`, `TrustedHooksSchema`), updated file references to `antigravity-reference.md`, and achieved 100% spec sync. |
| 7.1 | 2026-08-13 | **Live-system grounding pass:** replaced guessed schemas with empirically observed formats from `~/.gemini/`. `CLIHistoryEntrySchema` corrected to `{display, timestamp (int), workspace, conversationId, type}`. `TranscriptStepSchema` gained `created_at` and expanded `type` enum to include observed values (`CONVERSATION_HISTORY`, `LIST_DIRECTORY`, `RUN_COMMAND`, `VIEW_FILE`, `CHECKPOINT`). `parse_pbtxt_state` implemented migrations parsing and fixed section-name extraction. `SystemAuditor` expanded from 5 to all 17 schemas (added `audit_json_file`, `audit_history`, `audit_plugin_hooks`, `audit_ide_state`; fixed agent glob to `*/agent.md`). `doc_inspector` regex updated to support hyphenated field names. CLI `validate` gained `.jsonl` and `.pbtxt` handling. |
| 8.0 | 2026-08-13 | **Live-Grounded Revision against `agy 1.1.12`:** Added `[LIVE-1.1.12 · 2026-08-13]` source tag and evidence IDs (`EV-001`–`EV-018`). Replaced all prior `1.1.11` grounding with `1.1.12`. Corrected `agy agents` / `agy models` output-format conflict, `agy agents` workspace-agent scope, plugin component detection rules, plugin roots, plugin manifest schema, agent frontmatter notes, global skill roots, structured `/skills` and `/permissions` output, CLI state/history/trusted-hooks schemas, keybindings default absence, and CLI path inventory. Added official hook argument corrections and Projects documentation. Recorded five high-priority conflicts and one unresolved hook-firing confound. |
| 8.1 | 2026-08-13 | **Web-Validated Additions Edition:** Added official SDK architecture documentation (three-layer model, bundled Go harness over WebSockets, Inspect/Decide/Transform hook categories, multimodal input) `[DOCS]`/`[GOOGLE]`; documented `/export` CLI→Desktop handoff `[COMMUNITY]`, `/schedule` one-time-timer 900 s cap `[GOOGLE]`, Open VSX IDE extension marketplace `[COMMUNITY]`, and `agy`/`gemini` binary coexistence `[COMMUNITY]`; expanded §5.7 keybinding inventory from the live official CLI reference `[DOCS]` (Ctrl+D exit, Ctrl+O/Ctrl+R/Ctrl+A/Ctrl+E/Ctrl+Z undo/Ctrl+Shift+Z redo, Alt+J, Ctrl+K, page nav, `A` approve-all) and rejected a community claim that mislabeled `Ctrl+Z` as suspend; documented that CLI API-key auth is NOT supported (open feature request `google-antigravity/antigravity-cli#78`; Google staff 2026-06-29: use the SDK) while the SDK supports `GEMINI_API_KEY`/`api_key`; fixed `[DOOGLE]` tag typo and `Antigrativity` misspelling; saved master evidence file at `evidence/agy-1.1.12/evidence.md` (defines EV-019). |
| 8.2 | 2026-08-14 | **Schema Coverage Audit & Catalog Expansion:** added `WorkflowFrontmatterSchema` (`schemas/workflow.schema.json`, the 19th native schema) and fixed `hooks.schema.json` so `PreInvocation`/`PostInvocation`/`Stop` accept the documented plain handler list (matcher ignored) in addition to the matcher-group form; added hooks/workflow schema fixtures and the `workflow` auditor file type; recorded R-002 (schema coverage audit). |
| 8.3 | 2026-08-14 | **Rule & Config Validation Hardening:** rewrote `rule.schema.json` to accept both observed frontmatter keys (`trigger` community convention + legacy `activation`, e.g. the real `activation: always` in the self-customizer plugin rule), string-or-array `globs`, and no required fields (R-003 — real rule files are often frontmatter-less); auditor now treats frontmatter-less `.agents/rules/*.md` as valid; `mcp_config.schema.json` enforces a required transport (`command` or `serverUrl`) per official docs; `settings.schema.json` enumerates `general.defaultApprovalMode` (`default`/`auto_edit`/`plan`); `parseSimpleYaml` now parses YAML block scalars (`>`/`|`) so multi-line skill/rule descriptions round-trip; added rule/mcp/settings schema fixtures. |
| 8.4 | 2026-08-14 | **Official-Docs Verification & Works Cited Minimization:** re-verified every Google/community entry in §19 against the official docs inventory (`antigravity.google/llms.txt`) and live pages (`cli/install`, `cli/settings`, `cli/gcli-migration`, `skills`, `sdk/overview`, `ide/getting-started`, `cli/sandbox`); confirmed every kept non-official source backs claims the official docs do not cover (skill token costs, legacy config keys, CLI API-key auth status, SDK internals, Open VSX gaps, binary coexistence); dropped the three never-cited codelab sources (`getting-started-google-antigravity`, `sdd-agy-cli`, `antigravity-cli-hands-on`), shrinking §19 from 46 → 43 entries with sources 35-46 renumbered 32-43; renamed the source-archive snapshots and their `source:` frontmatter accordingly, regenerated the manifest, and updated §2 source ranges, badge indices (`[GOOGLE:35]`→`[GOOGLE:32]`, `[GOOGLE:38]`→`[GOOGLE:35]`), registry self-test (46→43), and UI counts (19 schemas / 43 sources). |
| 8.5 | 2026-08-14 | **Evidence Archive Expansion:** added 9 official-docs sources surfaced by `antigravity.google/llms.txt` to §19 — `cli/install`, `cli/gcli-migration`, `ide/rules`, `ide/workflows`, `sdk/mcp`, `sidecars`, `task-groups`, `tools`, `faq` (now 52 entries: docs #1-39, Google #40-44, protocol #45, community #46-52); renamed the 13 affected archive snapshots with their `source:` frontmatter, fetched the 9 new pages into `evidence/sources/docs/`, regenerated the manifest and §2 source ranges; updated badge indices (`[GOOGLE:32]`→`[GOOGLE:41]`, `[GOOGLE:35]`→`[GOOGLE:44]`), registry self-test (43→52), and UI counts (52 sources). |
| 8.6 | 2026-08-14 | **Evidence Archive Expansion II:** added 7 more official-docs sources to §19 — `cli/modes`, `cli/vim-editor-mode`, `cli/credits`, `ide/hooks`, `ide/settings`, `ide/plugins`, `ide/mcp` (now 59 entries: docs #1-46, Google #47-51, protocol #52, community #53-59); renamed the 13 affected archive snapshots with their `source:` frontmatter, fetched the 7 new pages into `evidence/sources/docs/`, regenerated the manifest and §2 source ranges; updated badge indices (`[GOOGLE:41]`→`[GOOGLE:47]`, `[GOOGLE:44]`→`[GOOGLE:50]`), registry self-test (52→59), and UI counts (59 sources). |
| 8.7 | 2026-08-14 | **Append-Only Numbering & Archive Completion:** adopted append-only §19 numbering — new sources get the next free numbers at the end of the list (documented in the §19 header) so existing entries and their snapshots are never renumbered again; archived the final `llms.txt` batch (9 CLI command pages `cli/commands/*`, `ide/overview`, `ide/getting-started`, `cli/overview`, `cli/features`, `cli/prompting`) as §19 entries #60-73 (now 73 entries); fetched the 14 pages into `evidence/sources/docs/`; registry self-test (59→73) and UI counts (73 sources). |
| 8.8 | 2026-08-14 | **Schema Verification Against Archived IDE Pages:** verified `hooks`/`rule`/`workflow` schemas against the newly-archived official `ide/hooks`, `ide/rules`, `ide/workflows` pages (S-043/S-033/S-034) with the repo's own validator — the exact documented hooks.json example (plain-list `PreInvocation`/`PostInvocation`/`Stop`, `enabled`, optional handler `type`, `timeout`) and workflow `title`+`description` frontmatter all validate; recorded R-005 (no schema changes required) and three new open items (global rules path `~/.gemini/GEMINI.md` vs `rules/` dirs, 12,000-char file limits, workflow `name` key). |
| 8.9 | 2026-08-14 | **Hook Payload Runtime Schema & 20-Schema Catalog Expansion:** added `HookPayloadSchema` (`schemas/hook_payload.schema.json`, the 20th native schema) covering stdin/stdout contracts across all five hook events (`PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`) and reusable context/step definitions; updated §20.2 matrix table with item #20 and expanded target paths for agents/plugins; added §20 documentation note clarifying `$id` URI namespaces; updated test suite and integrity gates to 20 native schemas. |
| 8.10 | 2026-08-14 | **Rule Frontmatter, Glob Syntax, & Workflow Live Audit:** audited 6 real rule files and 13 real workflow files in `~/.gemini/antigravity/.agents/`; confirmed `trigger: always_on|model_decision|glob`, `activation: always`, glob syntax (curly brace expansion, recursive globbing, comma-delimited strings), and `$ARGUMENTS` workflow tokens; recorded research report R-006; resolved the §17 glob syntax gap. |

## How This Report Was Built

1. **Initial audit** — 22 search results retrieved and cross-referenced
2. **Progressive gap identification** — claims classified into Tier A/B/C
3. **Targeted retrieval** — official docs pages retrieved one by one to fill gaps
4. **Source classification** — every claim tagged with `[DOCS]`/`[GOOGLE]`/`[PROTOCOL]`/`[COMMUNITY]`
5. **Behavioral gap cataloging** — every undocumented behavioral question identified
6. **Iterative correction** — claims upgraded, downgraded, or corrected as new sources arrived (5 major revisions)
7. **Live-system grounding** — direct inspection of a user-configured `agy 1.1.12` installation on macOS, with evidence files and IDs

---

## Table of Contents

1. Executive Summary
2. Methodology and Source Classification
3. Product Ecosystem and Identity
4. Extensibility Architecture
5. Configuration System
6. Permissions Engine
7. Complete CLI Command Reference
8. Built-in Agent Tool API
9. Sandbox
10. Headless Mode
11. Browser Integration
12. Artifacts and Implementation Plans
13. Enterprise Features
14. Workspace Governance Recommendations
15. Complete Path Inventory
16. Information Sourced Outside Official Docs
17. Undocumented Behavioral Contracts
    17.1 High-Priority Live Conflicts (agy 1.1.12)
18. Remaining Hard Gaps
    18.1 Transcript Schema (verified hands-on, 2026-08-11)
19. Works Cited
20. Automated Schema Toolkit & 20 Native Schemas Reference Architecture
    20.1 Toolkit Architecture (SchemaRegistry, AuditReport, DocSyncInspector)
    20.2 Complete 20 Native Schema Matrix
    20.3 Detailed Pydantic Specifications & Usage Examples
