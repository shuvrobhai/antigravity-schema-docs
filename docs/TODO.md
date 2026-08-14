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
Preamble version header and the §20 end-note must stay in sync with the top changelog row after each revision (currently 8.4).

### 10. §09 fail-closed / symlink-escape claims lack a backing source (R-004 §6.1)
The claims at `reference/09-sandbox.md` ("fails closed with a hard error", "symlinks … outside the workspace root are blocked") are tagged `[DOCS:06]`/`[GOOGLE:41]`, but none of the live official sandbox doc, the archived snapshot, the geminicli configuration reference, or the geminicli sandbox page contains that language (2026-08-14). Find the true source or downgrade the claims.

### 11. Official-docs conflict on the global skills path (R-004 §6.2)
`docs/cli/gcli-migration` says global skills migrate to `~/.gemini/antigravity-cli/skills/`; `docs/skills` says the global location is `~/.gemini/config/skills/`. Both directories exist on this install. Resolve before re-sourcing §3.4/§16 migration rows from `[GOOGLE]`/`[COMMUNITY]` to `[DOCS]`.

### 12. §16 bare-tag community sources have no works-cited entries (R-004 §6.3)
OrangeBot, mslinn.com, BleepingComputer, aibuilderclub, how2shout, Google Cloud Medium tutorial, LinkedIn, community round-up are cited by bare tag in §16 but absent from §19. Decide: add entries (grows the list) or accept bare tags as audit-table-only citations (keeps §19 minimal).

### 13. Live settings doc lists keys not yet in `settings.schema.json` (R-004 §6.4)
`allowNonWorkspaceAccess`, `altScreenMode`, `runningLightSpeed`, `verbosity`, `useG1Credits`, `showTips`, `showFeedbackSurvey`, `notifications`, `editorMode` — re-check schema coverage against the 2026-08-14 live page.

### 14. Snapshot the remaining official pages (R-004 §3)
Done 2026-08-14: `cli/install`, `cli/gcli-migration`, `ide/rules`, `ide/workflows`, `sdk/mcp`, `sidecars`, `task-groups`, `tools`, `faq` (§19 #31-39), `cli/modes`, `cli/vim-editor-mode`, `cli/credits`, `ide/hooks`, `ide/settings`, `ide/plugins`, `ide/mcp` (§19 #40-46). Still candidates: `cli/commands/*`, `ide/overview`, `ide/getting-started`, `ide/browser-recordings`, `ide/review-changes-editor`, `ide/tab`, `cli/overview`, `cli/getting-started`, `cli/features`, `cli/prompting`, `cli/using`, `cli/tutorial`, `docs/plans`, `docs/faq` extras — useful to close §16/§17 gaps.

## Where the findings live
- `evidence/reports/R-002-schema-coverage-audit.md`
- `evidence/reports/R-003-rule-frontmatter-format.md`
- `evidence/reports/R-004-works-cited-minimization-audit.md`
