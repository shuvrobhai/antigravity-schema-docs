## 5. Configuration System

### 5.1 Settings File

`~/.gemini/antigravity-cli/settings.json` `[DOCS]`

### 5.2 Sparse Persistence

The CLI writes only values that differ from system defaults. This keeps config files clean and forward-compatible. Updated defaults from Google are automatically inherited `[DOCS]`.

### 5.3 Configuration Precedence

Seven-level hierarchy confirmed for Gemini CLI `[GOOGLE]`. Antigravity CLI likely inherits:

| Level | Source | Scope |
|---|---|---|
| 1 | Default values | Hardcoded |
| 2 | System defaults file | `/etc/gemini-cli/system-defaults.json` (Linux), `C:\ProgramData\gemini-cli\system-defaults.json` (Windows), `/Library/Application Support/GeminiCli/system-defaults.json` (macOS). Overridable via `GEMINI_CLI_SYSTEM_DEFAULTS_PATH` |
| 3 | User settings | `~/.gemini/settings.json` |
| 4 | Project settings | `.gemini/settings.json` |
| 5 | System settings | `/etc/gemini-cli/settings.json` (Linux), `C:\ProgramData\gemini-cli\settings.json` (Windows), `/Library/Application Support/GeminiCli/settings.json` (macOS). Overridable via `GEMINI_CLI_SYSTEM_SETTINGS_PATH` |
| 6 | Environment variables | Shell variables, `.env` files |
| 7 | Command-line arguments | `agy --sandbox --model="Gemini 3.5 Flash"` |

### 5.4 Environment Variable Interpolation

String values support `$VAR_NAME`, `${VAR_NAME}`, `${VAR_NAME:-DEFAULT_VALUE}` `[GOOGLE]`. Each plugin can have its own `.env` file.

### 5.5 Complete settings.json Schema

#### Safety and Permissions `[DOCS]`

| Key | Type | Default | Options |
|---|---|---|---|
| `toolPermission` | string | `"request-review"` | `request-review`, `proceed-in-sandbox`, `always-proceed`, `strict` |
| `commandExecutionPolicy` | string | `"sandbox"` | `sandbox`, `auto`, `eager`, `off` |
| `artifactReviewPolicy` | string | `"asks-for-review"` | `asks-for-review`, `agent-decides`, `always-proceed` |
| `enableTerminalSandbox` | boolean | `false` | `true`, `false` |
| `allowNonWorkspaceAccess` | boolean | `false` | `true`, `false` |
| `trustedWorkspaces` | string[] | `[]` | Whitelist of authorized repository paths |

**Key Behavioral Semantics:** `[DOCS]` / `[GOOGLE]`
- **`commandExecutionPolicy` Containment Rings:**
  - `sandbox` *(Default)*: Enforces OS container isolation (`nsjail` on Linux, `sandbox-exec` on macOS, `AppContainer` on Windows). Uncontained commands require interactive approval.
  - `auto`: Autonomous execution for non-destructive commands (linters, test suites, builds). Destructive actions (`rm -rf`, `git push --force`) remain gated.
  - `eager`: Proactive, high-autonomy execution without confirmation prompts. Intended for automated CI pipelines.
  - `off`: Disables shell command tools (`run_command` rejected).
- **`artifactReviewPolicy` Blast Radius Evaluation:**
  - `asks-for-review` *(Default)*: Strict manual approval gate presenting all proposed file diffs.
  - `agent-decides`: Evaluates change complexity and blast radius. Small doc edits and scratch files proceed automatically; broad multi-file changes or deletions of core manifests require user confirmation.
  - `always-proceed`: Direct file modification without review prompts (for headless operations).
- **`toolPermission: "strict"` Classification:**
  - *Exempt Read Tools (No prompt):* `view_file`, `list_dir`, `find_by_name`, `grep_search`, `/status`, `/mcp`, `/skills`.
  - *Gated Non-Read Operations (Prompt required):* `run_command`, `write_to_file`, `replace_file_content`, `search_web`, `read_url_content`, and mutating external MCP tools.
- **`enableTerminalSandbox` Fail-Closed Guarantee:**
  - If the OS sandbox daemon or namespace capabilities are unavailable (e.g. unprivileged container), execution **fails closed** with a hard error rather than running unprotected. Interactive sessions display a critical prompt offering an explicit unsandboxed override.

#### Display and Rendering `[DOCS]`

| Key | Type | Default | Options |
|---|---|---|---|
| `colorScheme` | string | `"terminal"` | `light`, `solarized light`, `colorblind-friendly light`, `dark`, `solarized dark`, `colorblind-friendly dark`, `tokyo night`, `terminal` |
| `altScreenMode` | string | `"default"` | `default`, `always`, `never` |
| `notifications` | boolean | `false` | `true`, `false` |
| `showTips` | boolean | `true` | `true`, `false` |
| `showFeedbackSurvey` | boolean | `true` | `true`, `false` |
| `ui.language` | string | `"us"` | Interface language |
| `ui.footer.items` | string[] | standard items | Footer display widgets (`model-name`, `agent-profile`, `agent-state`, `context-used`, `token-count`, `artifacts`, `quota`, `quota-weekly`, `project-path`) |

#### Editor `[DOCS]`

| Key | Type | Default | Options |
|---|---|---|---|
| `editor` | string | `"auto"` | `auto`, `vim`, `emacs`, `nano`, or any binary |
| `editorMode` | string | `"default"` | `default`, `vim` |
| `vimInsertFirst` | boolean | `false` | `true`, `false` (requires `editorMode: "vim"`) |

#### Behavior `[DOCS]`

| Key | Type | Default | Options |
|---|---|---|---|
| `verbosity` | string | `"high"` | `high`, `low` |
| `runningLightSpeed` | string | `"medium"` | `fast`, `medium`, `slow`, `off` |
| `useG1Credits` | boolean | `false` | `true`, `false` (external builds only) |
| `enableTelemetry` | boolean | `true` | `true`, `false` |
| `model` | string | (unset) | Model display name + effort tier, e.g. `"Gemini 3.5 Flash (Low)"` |

- **`runningLightSpeed` Modes:** `fast` (high-cadence spinner), `medium` (default balanced cadence), `slow` (low-frequency for remote SSH/bandwidth saving), `off` (disables terminal animations for screen-readers and headless logs).

> **`model` (verified 2026-08-11 via live config diff + live probe `[GOOGLE]`/A):** Not listed on the antigravity.google settings page — discovered by inspecting and diffing live `~/.gemini/antigravity-cli/settings.json`. Confirmed hands-on: a headless `agy -p` run with **no** `--model` flag resolved the session's `Model Selection` to the configured value (`Gemini 3.5 Flash (Low)`), proving the key is the persisted default-model setting. Value format matches the documented `--model="Gemini 3.5 Flash"` flag format; effort tier (`Low`/`High`) is part of the value.

#### Custom Scripts `[DOCS]`

| Key | Type | Description |
|---|---|---|
| `title` | object | `{"type": "command", "command": "<path>"}` |
| `statusLine` | object | `{"type": "command", "command": "<path>", "padding": 0, "enabled": true, "stack_with_default": false}` |

#### Permissions `[DOCS]`

| Key | Type | Description |
|---|---|---|
| `permissions.allow` | string[] | Allowlist rules |
| `permissions.deny` | string[] | Denylist rules |
| `permissions.ask` | string[] | Asklist rules |

#### General (Gemini CLI confirmed) `[GOOGLE]`

| Key | Type | Default | Description |
|---|---|---|---|
| `general.preferredEditor` | enum | `undefined` | `vscode`, `vscodium`, `windsurf`, `cursor`, `zed`, `antigravity`, `sublimetext`, `lapce`, `nova`, `bbedit`, `vim`, `neovim`, `emacs`, `hx`, `emacsclient`, `micro` |
| `general.openEditorInNewWindow` | boolean | `false` | New window for VS Code-family |
| `general.vimMode` | boolean | `false` | Vim keybindings |
| `policyPaths` | array | `[]` | Additional policy files (requires restart) |
| `adminPolicyPaths` | array | `[]` | Additional admin policy files (requires restart) |

#### Live-Verified `settings.json` Example `[LIVE-1.1.12 · 2026-08-13]` `EV-013`

File path:

```text
<HOME>/.gemini/antigravity-cli/settings.json
```

Observed relevant keys:

```json
{
  "allowNonWorkspaceAccess": true,
  "altScreenMode": "always",
  "editor": "code",
  "model": "Gemini 3.6 Flash (Medium)",
  "notifications": true,
  "permissions": {
    "allow": [],
    "deny": []
  },
  "statusLine": {
    "type": "command",
    "command": "node <HOME>/.gemini/antigravity-cli/hooks/statusline-quota.mjs",
    "enabled": true
  },
  "title": {
    "type": "command",
    "command": "<HOME>/.gemini/antigravity-cli/scratch/title.sh"
  },
  "toolPermission": "always-proceed",
  "trustedWorkspaces": []
}
```

Notes:

- `model` value supports effort tier in parentheses.
- `statusLine` in this install is simpler than the full documented schema; `padding` and `stack_with_default` were absent.
- `permissions.allow` and `permissions.deny` confirmed live.

### 5.6 Status Line JSON Payload

Custom scripts receive this JSON via stdin `[DOCS]`:

| Field | Type | Description |
|---|---|---|
| `cwd` | string | Current working directory |
| `session_id` / `conversation_id` | string | Session identifier |
| `transcript_path` | string | Path to transcript log |
| `model` | object | `{id, display_name}` |
| `workspace` | object | `{current_dir, project_dir}` |
| `version` | string | CLI version |
| `context_window` | object | Token usage: `total_input_tokens`, `total_output_tokens`, `context_window_size`, `used_percentage`, `remaining_percentage`, plus `current_usage` sub-object (`input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`) |
| `exceeds_200k_tokens` | bool/null | Context > 200k flag |
| `product` | string | Application name |
| `quota` | object | Maps model/bucket IDs (e.g. `gemini-weekly`) to `{remaining_fraction, reset_time, reset_in_seconds}` |
| `agent_state` | string | `idle`, `thinking`, `working`, `tool_use`, `initializing` |
| `vcs` | object | `{type, branch, client, dirty}` — type: `git`, `jj`, or `hg` |
| `sandbox` | object | `{enabled, allow_network}` |
| `artifact_count` | int | Artifacts produced |
| `plan_tier` | string | Subscription tier |
| `email` | string | Authenticated user |
| `pending_input_count` | int | Queued messages |
| `tool_confirmation_pending` | bool | Confirmation dialog showing |
| `task_count` | int | Background tasks |
| `terminal_width` | int | Terminal width |
| `execution_mode` | string | `planning`, `fast` |
| `vim` | object | `{mode}` — `NORMAL`, `INSERT`, `VISUAL`, `VISUAL LINE` |

Title scripts receive the same payload `[DOCS]`.

### 5.7 Keybindings

**File:** `~/.gemini/antigravity-cli/keybindings.json` `[DOCS]`

**Live-verified default absence** `[LIVE-1.1.12 · 2026-08-13]`:

```text
<HOME>/.gemini/antigravity-cli/keybindings.json
```

Live check:

```text
No such file or directory
```

It appears only after custom keybinding changes.

**Format:** JSON mapping action strings to hotkey arrays. Empty array `[]` disables. Malformed entries fall back to defaults. Delete file to restore all defaults `[DOCS]`.

**Complete TUI Command Inventory:** `[DOCS]`

| Category | TUI Command | Default Hotkey(s) |
|---|---|---|
| Global | `cli.escape` | `Escape` |
| Global | `cli.exit` | `Ctrl+C` (empty prompt) |
| Global | `cli.clear_screen` | `Ctrl+L` |
| Prompt | `prompt.submit` | `Enter` |
| Prompt | `prompt.newline` | `Shift+Enter`, `Ctrl+J` |
| Prompt | `edit.open_editor` | `Ctrl+G` |
| Prompt | `clipboard.paste_image` | `Ctrl+V` |
| Prompt | `prompt.insert_file` | `@` |
| Navigation | `nav.scroll_line` | `↑`, `↓` |
| Navigation | `nav.scroll_half_page` | `Shift+Page Up/Down`, `Ctrl+U/D` |
| Navigation | `nav.scroll_top` | `Home` |
| Navigation | `nav.scroll_bottom` | `End` |
| Navigation | `nav.focus_top` | `>` |
| Navigation | `nav.focus_bottom` | `<` |
| Navigation | `nav.tab_forward` | `Tab` |
| Navigation | `nav.tab_backward` | `Shift+Tab` |
| Navigation | `nav.artifact_outline` | `t` |
| Confirmations | `confirm.approve` | `y` |
| Confirmations | `confirm.reject` | `n` |
| Confirmations | `confirm.approve_all` | `Shift+A` |
| Confirmations | `confirm.reject_all` | `Shift+R` |
| Confirmations | `confirm.preview` | `p` |
| Confirmations | `nav.confirm` | `Enter` |
| Confirmations | `nav.escape` | `Escape` |
| Confirmations | `nav.switch_button` | `Tab` |
| Editor & Text | `prompt.undo_text` | `Ctrl+Z` |
| Editor & Text | `prompt.redo_text` | `Ctrl+Shift+Z` |
| Editor & Text | `prompt.cursor_start` | `Ctrl+A` |
| Editor & Text | `prompt.cursor_end` | `Ctrl+E` |
| Editor & Text | `prompt.toggle_trajectory` | `Ctrl+O` |
| Editor & Text | `prompt.open_review` | `Ctrl+R` |
| Editor & Text | `prompt.teleport_agent` | `Alt+J` |
| Editor & Text | `prompt.fast_approve` | `Ctrl+K` |
| Global | `cli.exit` (empty prompt only) | `Ctrl+D` |
| Global | forward delete (non-empty prompt) | `Ctrl+D` |
| Navigation | `navigation.page_up` / `navigation.page_down` | `PgUp`/`Shift+↑`, `PgDn`/`Shift+↓` |
| Navigation | `navigation.left` / `navigation.right` | `←`/`→` (multipage panels) |
| Confirmations | approve-all (built-in) | `A` (Review Panel) |

**Keybinding verification note `[DOCS]` (2026-08-13, live official CLI reference):** this inventory was reconciled against the live keybinding tables at `antigravity.google/docs/cli/reference`. Community claims that `Ctrl+Z` suspends the CLI and that `e` (edit command), `Ctrl+Y` (yank), and `Ctrl+_`/`Ctrl+Shift+-` (undo) exist were **not** confirmed by the official reference: the official bindings map `Ctrl+Z` → `prompt.undo_text` and `Ctrl+Shift+Z` → `prompt.redo_text`, and `Ctrl+D` is `cli.exit` only when the prompt box is empty (forward delete otherwise).

**Artifact Heading Outline (v1.1.12):** Press `t` in the artifact viewer to open a heading outline. This allows quick scanning of long markdown documents and direct navigation to specific sections. `[DOCS]`

### 5.8 Context Rule Files `[DOCS]`

| File | Scope |
|---|---|
| `GEMINI.md` (project root) | Workspace context rules |
| `AGENTS.md` (project root) | Agent-specific rules |
| `~/.gemini/GEMINI.md` | Global context rules |

### 5.9 Interactive Settings `[DOCS]`

Type `/config` or `/settings`. Navigate with arrows. Enter to toggle. Escape to save. CLI flags override for session duration with warning indicator.
