# Google Antigravity Ecosystem: Complete Technical Reference, Schema Specification, and Gap Analysis

## Version 8.1 — Live-Grounded Revision (agy 1.1.12) Edition

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
20. Automated Schema Toolkit & 18 Native Schemas Reference Architecture
    20.1 Toolkit Architecture (SchemaRegistry, AuditReport, DocSyncInspector)
    20.2 Complete 18 Native Schema Matrix
    20.3 Detailed Pydantic Specifications & Usage Examples
