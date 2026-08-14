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

## Open for next session

### 1. Schema strictness pass
Most schemas use `additionalProperties: true`. Where docs define closed enums/required sets (hooks handler `type`, transcript `source`/`type`/`status`, settings enums), consider tightening — but never in a way that rejects real observed files.

### 2. Version-string drift
Preamble version header and the §20 end-note must stay in sync with the top changelog row after each revision (currently 8.10).

### 3. §09 fail-closed / symlink-escape claims lack a backing source (R-004 §6.1)
The claims at `reference/09-sandbox.md` ("fails closed with a hard error", "symlinks … outside the workspace root are blocked") are tagged `[DOCS:06]`/`[GOOGLE:41]`, but none of the live official sandbox doc, the archived snapshot, the geminicli configuration reference, or the geminicli sandbox page contains that language (2026-08-14). Find the true source or downgrade the claims.

### 4. Official-docs conflict on the global skills path (R-004 §6.2)
`docs/cli/gcli-migration` says global skills migrate to `~/.gemini/antigravity-cli/skills/`; `docs/skills` says the global location is `~/.gemini/config/skills/`. Both directories exist on this install. Resolve before re-sourcing §3.4/§16 migration rows from `[GOOGLE]`/`[COMMUNITY]` to `[DOCS]`.

### 5. §16 bare-tag community sources have no works-cited entries (R-004 §6.3)
OrangeBot, mslinn.com, BleepingComputer, aibuilderclub, how2shout, Google Cloud Medium tutorial, LinkedIn, community round-up are cited by bare tag in §16 but absent from §19. Decide: add entries (grows the list) or accept bare tags as audit-table-only citations (keeps §19 minimal).

### 6. Snapshot the remaining official pages (R-004 §3)
Done 2026-08-14: `cli/install`, `cli/gcli-migration`, `ide/rules`, `ide/workflows`, `sdk/mcp`, `sidecars`, `task-groups`, `tools`, `faq` (§19 #31-39), `cli/modes`, `cli/vim-editor-mode`, `cli/credits`, `ide/hooks`, `ide/settings`, `ide/plugins`, `ide/mcp` (§19 #40-46), `cli/commands/*` (9 pages), `ide/overview`, `ide/getting-started`, `cli/overview`, `cli/features`, `cli/prompting` (§19 #60-73, append-only). Remaining (optional, add via append-only numbering): `cli/using`, `cli/tutorial`, `cli/getting-started`, `cli/install` extras, `ide/browser-recordings`, `ide/review-changes-editor`, `ide/tab`, `docs/plans`, `docs/faq` extras — useful to close §16/§17 gaps.

### 7. Workflow `name` key is not officially documented (R-005)
`ide/workflows` documents only `title` + `description` (steps in the markdown body); the community/2.0 format uses `name`. The schema accepts both — confirm the primary key with a real Antigravity-written workflow before tightening.

## Where the findings live
- `evidence/reports/R-002-schema-coverage-audit.md`
- `evidence/reports/R-003-rule-frontmatter-format.md`
- `evidence/reports/R-004-works-cited-minimization-audit.md`
- `evidence/reports/R-005-schema-verification-against-archived-ide-pages.md`
- `evidence/reports/R-006-rule-and-workflow-live-inventory-audit.md`
