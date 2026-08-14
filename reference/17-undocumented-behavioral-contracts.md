## 17. Undocumented Behavioral Contracts

The official docs (`antigravity.google/docs/*`) leave the following behavioral questions unanswered. These represent gaps in the behavioral specification — not necessarily missing features, but missing documentation about how features behave.

### Configuration Behavioral Gaps

| Question | Context | Impact |
|---|---|---|
| What does `commandExecutionPolicy: "eager"` do vs `auto` vs `sandbox` vs `off`? | Official docs explain `auto` (permits autonomous test/compilation while gating high-risk actions), but `eager`, `sandbox`, and `off` are not defined | Developers cannot choose between policies without testing |
| What does `artifactReviewPolicy: "agent-decides"` trigger on? | Official docs state it dynamically prompts based on change complexity, but the algorithmic heuristics and thresholds are not defined | Unpredictable review behavior in production |
| What does `runningLightSpeed: "fast"` change vs `medium`/`slow`/`off`? | Official docs clarify this as "Animation Speed" for the TUI progress indicator/spinner, but frame-rate and timing specs are omitted | Users cannot meaningfully predict animation intervals |
| What counts as a "read" tool for `toolPermission: "strict"`? | `strict` prompts for "all non-read tools"; temp directory and `.git` are granted read, but exhaustive built-in tool classification is omitted | Is `grep_search` a read? Is `list_dir` a read? Is `search_web` a read? |
| What happens when `enableTerminalSandbox: true` and the OS sandbox technology is unavailable? | Three technologies listed (nsjail, sandbox-exec, AppContainer) but fallback behavior undocumented | Potential silent security gap |

### Extensibility Behavioral Gaps

| Question | Context | Impact |
|---|---|---|
| What glob syntax do Rules use in `Glob` activation mode? | **RESOLVED 2026-08-14 (R-006):** Standard glob syntax supporting recursive globbing (`**`), brace expansion (e.g. `**/*.{tsx,jsx,vue,svelte,css,scss}`), and comma-delimited strings (e.g. `"**/*.tsx,**/components/**"`) or array format. Verified on live `design-rules.md`. | Resolved via R-006. |
| How does `model: inherit` resolve — parent's selected model or parent's default? | Agent frontmatter `model` field | Subagent may use wrong model tier |
| What happens when two workspace skills share the same name? | Workspace > Global precedence stated; same-level conflicts not | Unpredictable skill activation |
| What is the plugin loading order when multiple plugins define hooks for the same event? | Multiple plugins can include hooks.json | Non-deterministic hook execution order |
| Does a disabled MCP server still appear in `/mcp`? Still count against startup? | `disabled` config field exists | UX confusion |
| What happens when a hook exceeds its `timeout` value? | `timeout` field documented; behavior on timeout is not | Silent failures could bypass safety hooks |
| What happens when a `tools` list in agent frontmatter contains a misspelled tool name? | Documented as known issue causing hang; no validation fallback described | Subagent hangs indefinitely |
| What is the MCP server connection failure behavior? Does the session fail or degrade gracefully? | Not addressed | Potential session failures in production |
| Can a Running subagent transition directly to Killed, or must it pass through Idle? | Three states documented; transition rules are not | State machine behavior unclear |
| What happens when `mainAgent: false` and `subagent: false`? | Both fields documented | Is the agent unusable? Hidden? |

### Headless Mode Gaps

*Both gaps below resolved 2026-08-11 (see Section 10).*

| Question | Resolution |
|---|---|
| What are all valid `status` enum values in JSON output? | `SUCCESS`, `ERROR`, `CANCELED`, `INTERRUPTED`, `INVALID`, `WAITING`, `RUNNING` |
| What is the exit code mapping? | `0` = success; non-zero = no response produced (reason on stderr) |

### CLI Subcommand Behavior Gaps

| Question | Context | Impact |
|---|---|---|
| Why do `agy agents` / `agy models` appear to hang? | Both subcommands perform a remote fetch with **no visible client-side timeout** (observed 2026-08-11: ~8 s on a healthy network; still pending after 45 s inside a restricted/sandboxed network such as the Freebuff tool environment). Neither has an offline/JSON mode (`agy agents --output-format json` errors). | Automation that shells out to these commands must impose its own timeout; don't treat a slow run as a bug |
| Why don't workspace-scoped agents show up in headless mode but do in the TUI? | `.agents/agents/` and `.agents/plugins/<name>/agents/` agents are **not** listed by `agy agents` and are **not** loaded by headless `-p --agent` (any unresolvable name silently falls back to the default agent) — but the interactive TUI `/agents` selector **does** list them (user-verified 2026-08-11 and live-verified 1.1.12). | Discovery behavior differs by surface: headless/CLI = global + plugin agents only; interactive TUI = also workspace agents. Pinning a workspace agent in headless automation will silently use the default agent instead |
| Why does `agy agents` / `agy models` reject `--output-format` despite the 1.1.12 changelog claiming it exists? | `EV-002`, `EV-003`: `Error: flags provided but not defined: -output-format` | Changelog/live conflict; automation cannot rely on changelog for these flags |

### Sandbox Gaps

| Question | Context | Impact |
|---|---|---|
| What specific network restrictions does each sandbox technology impose? | Technology names given (nsjail, sandbox-exec, AppContainer) but restriction details are not | Security teams cannot assess the security boundary |
| What filesystem restrictions does each sandbox impose? | Same as above | Same as above |
| Is sandbox behavior identical across all three platforms? | Three different technologies | Cross-platform parity unknown |

### Permissions Gaps

| Question | Context | Impact |
|---|---|---|
| What happens when a permission rule matches multiple lists with conflicting actions? | Deny > Ask > Allow stated, but edge cases with glob patterns undocumented | Potential unexpected permission behavior |
| How do cross-platform path normalizations handle symlinks? | Path normalization confirmed; symlink handling not | Security boundary could be circumvented |

### Hooks Behavioral Gaps

| Question | Context | Impact |
|---|---|---|
| Why does `/hooks` return `hooks: []` despite valid hook files existing? | `EV-016`: valid files at global plugin paths and workspace `.agents/hooks.json` | Hook enumeration in print mode appears non-functional or incomplete |
| Does `--dangerously-skip-permissions` suppress hook execution in headless `-p`? | **Resolved 2026-08-14 via EV-020:** Probe EV-020 tested headless `-p` without `--dangerously-skip-permissions` (pre-granting permissions in settings/permissions config). Hooks still failed to fire (`MARKER MISSING`). Headless print mode itself omits workspace hook execution; `--dangerously-skip-permissions` is not the cause. | Headless mode cannot be used for workflows requiring workspace hook execution |

### 17.1 High-Priority Live Conflicts (agy 1.1.12)

| # | Conflict | Evidence | Status |
|---|---|---|---|
| 1 | 1.1.12 changelog claims `agents/models --output-format json` exists (v1.1.12 changelog: "Added machine-readable output to the `models` and `agents` subcommands through an `--output-format` flag accepting `json` and `stream-json`") | EV-002, EV-003 | **Confirmed bug:** changelog definitively claims the feature; live CLI definitively rejects the flag. Either the changelog was published before the code shipped, or the flag was reverted without a changelog update. |
| 2 | Official docs list plugin `rules` as component | EV-006, EV-007 | `agy plugin list` did not surface `rules` |
| 3 | `/hooks` should enumerate hooks | EV-016 | Live print mode returns `hooks: []` |
| 4 | Workspace `PreToolUse` hook should fire | EV-017, EV-018, EV-020 | Did not fire in trusted/untrusted `-p` probes or without permission skip flag; EV-020 confirmed headless mode hook omission is an architectural property |
| 5 | §10 claimed `agy agents` lists workspace agents | EV-004 | Live `agy agents` lists global + plugin agents only |

