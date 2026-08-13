## 16. Information Sourced Outside Official Docs

This section explicitly catalogs every piece of information in this report that comes from sources other than `antigravity.google/docs/*`. Each entry identifies the source category, specific source, what it contributed, and why it was included.

### From Live-System Observation `[LIVE-1.1.12 · 2026-08-13]`

All live corrections in this revision come from direct observation of a user-configured `agy 1.1.12` install on macOS. They are evidence-tagged with `EV-###`. Key examples:

| Information | Evidence | Why Included |
|---|---|---|
| `agy 1.1.12` version and platform | EV-001 | Grounds all subsequent live claims |
| `agy agents` / `agy models` reject `--output-format` despite changelog | EV-002, EV-003 | Changelog/live conflict |
| `agy agents` lists global + plugin agents only | EV-004 | Corrects previous workspace-agent claim |
| `agy plugin` full command surface | EV-005 | Completes CLI reference |
| `agy plugin list` JSON schema and observed components | EV-006 | Completes plugin schema |
| Plugin `rules` component not surfaced despite existing | EV-007 | Documents docs/live discrepancy |
| Two plugin roots | EV-008 | Adds undocumented path |
| `config.json` vs `agy plugin list` distinction | EV-009 | Clarifies plugin registry model |
| `plugin.json` manifest minimal keys | EV-010 | Corrects manifest schema |
| Agent frontmatter live examples | EV-011 | Refines frontmatter semantics |
| Multiple global skill roots | EV-012 | Adds undocumented skill roots |
| `model_invocable` field verified | EV-012 | Confirms previously uncertain field |
| SKILL.md optional `metadata` object | EV-012 | Extends schema |
| `settings.json` live keys | EV-013 | Grounds settings schema |
| `config.json` `userSettings` and enums | EV-014 | Grounds master config schema |
| Three permission scopes | EV-015 | Adds project/shared/global model |
| `/hooks` returns empty despite hook files | EV-016 | New behavioral gap |
| Headless `-p` did not fire workspace `PreToolUse` hooks | EV-017, EV-018 | New unresolved confound |

### From Google-Owned, Non-Antigravity Sources `[GOOGLE]`

| Information | Source | Why Included |
|---|---|---|
| Written in Go, Gemini 3.5 Flash optimized | Codelab: Getting Started `[GOOGLE]` | Not stated on official docs pages |
| Progressive disclosure token costs (~100/skill Phase 1, <5000 Phase 2) | Codelab: Skills 101 `[GOOGLE]` | Official docs describe pattern but omit quantitative details |
| `scripts/`, `references/`, `assets/` subdirectories (Codelab names) | Codelab: Skills 101 `[GOOGLE]` | Superseded by official docs page which uses `scripts/`, `examples/`, `resources/` |
| 7-level configuration precedence | Gemini CLI Configuration docs `[GOOGLE]` | Not stated in Antigravity docs; likely inherited but unconfirmed |
| Environment variable interpolation syntax | Gemini CLI docs `[GOOGLE]` | Not mentioned in Antigravity docs |
| `general.preferredEditor` 18 enum values | Gemini CLI docs `[GOOGLE]` | Not in Antigravity docs |
| `general.openEditorInNewWindow`, `general.vimMode` | Gemini CLI docs `[GOOGLE]` | Not in Antigravity docs |
| `policyPaths`, `adminPolicyPaths` | Gemini CLI docs `[GOOGLE]` | Not in Antigravity docs |
| Migration path mapping (`~/.gemini/skills/` → `~/.gemini/config/skills/`) | Migration docs `[GOOGLE]` | Provides critical path correction for users migrating from Gemini CLI |
| `AfterAgent`/`AfterTool` event names | Claude-Mem integration docs `[COMMUNITY]` | Official hooks docs list `PreInvocation`/`PostInvocation`; naming discrepancy unresolved |
| Nano Banana 2 model for image generation | LinkedIn blog post `[GOOGLE]` | Not mentioned in official docs |
| `/goal` command and subagent loop patterns | LinkedIn blog post `[GOOGLE]` | `/goal` now confirmed on official landing page; loop patterns are user experience |
| `serverUrl` replaces legacy `url`/`httpUrl` | Migration docs `[GOOGLE]` | Critical migration detail |
| `/schedule` one-time timers capped at 900 s | Google Cloud Medium tutorial (Antigravity CLI series) `[GOOGLE]` | Hard behavioral cap absent from official docs |

### From Third-Party Sources `[COMMUNITY]`

| Information | Source | Why Included |
|---|---|---|
| Skills interoperable across Claude Code, Cursor, Codex CLI | OrangeBot `[COMMUNITY]`, GitHub (claude-faces-expert) `[COMMUNITY]` | Official docs don't explicitly state cross-tool portability of Skills |
| Security: hidden Unicode instructions can survive human review | Embrace The Red `[COMMUNITY]` | Official docs don't address this security concern |
| `disable-model-invocation` frontmatter attribute | Embrace The Red `[COMMUNITY]` | Not in official docs; may not exist — included only as security concern reference |
| 30-day usage patterns, `/goal` command usage | LinkedIn `[COMMUNITY]` | First-person user experience with CLI |
| `/export` CLI→Desktop session handoff | aibuilderclub `[COMMUNITY]`, dev.to hands-on `[COMMUNITY]`, neurals.ca `[COMMUNITY]` | Cross-product workflow absent from official CLI reference |
| Open VSX IDE extension marketplace (not official VS Code Marketplace) | `microsoft/vscode-dotnettools#2557` `[COMMUNITY]`, mslinn.com `[COMMUNITY]`, BleepingComputer `[COMMUNITY]` | C# Dev Kit and other non-mirrored extensions unavailable |
| `agy` + `gemini` binary coexistence | aibuilderclub `[COMMUNITY]`, harshrastogi.tech `[COMMUNITY]`, how2shout `[COMMUNITY]` | Resolves binary-conflict ambiguity in §3.4 migration |
| SDK Go harness over WebSockets | Karl Weinmeister developer guide (LinkedIn) `[COMMUNITY]` | Transport detail; author is Google Cloud Developer Advocate |
| `Ctrl+Z`-suspend / `e` / `Ctrl+Y` keybinding claims | Community round-up `[COMMUNITY]` | Rejected after official reference check (see §5.7) |
