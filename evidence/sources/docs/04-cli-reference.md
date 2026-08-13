---
source: 4
category: docs
title: CLI Reference
url: "https://antigravity.google/docs/cli/reference"
final_url: "https://antigravity.google/docs/cli/reference"
fetched: 2026-08-13
status: 200
---
# CLI reference

Scan scannable tables listing all TUI slash commands, default keyboard shortcuts, and JSON configuration parameters.

## Core slash commands

Type `/` inside the prompt box to open the typeahead command selection menu.

| Command | Category | Alias | Execution Purpose |
|----|----|----|----|
| **`/add-dir <path>`** | Utilities | — | Add a directory path to the active workspace. |
| **[`/agents`](/docs/cli/commands/agents)** | Tools & Tasks | — | Open the [Agent Manager Panel](/docs/cli/commands/agents) to switch custom agents and monitor background subagents. |
| **`/artifact`** | Tools & Tasks | — | Open the Artifact Review Panel. |
| **`/btw <query>`** | Utilities | — | Ask a side question in the background without interrupting the main conversation. |
| **`/clear`** | Utilities | `/new` | Clear the terminal and reset active conversation contexts. |
| **`/config`** | Configurations | `/settings` | Open the interactive Settings Editor Overlay. |
| **`/context`** | Utilities | — | Open the context usage visualization panel. |
| **`/copy`** | Utilities | — | Copy the last agent response to the system clipboard. |
| **[`/credits`](/docs/cli/commands/credits)** | Account | — | View remaining G1 credits and purchase links. |
| **[`/diff`](/docs/cli/commands/diff)** | Utilities | — | Open the [Interactive Diff Viewer](/docs/cli/commands/diff) to view changes, turns, and commits. |
| **`/exit`** | Core | `/quit` | Close the TUI session and restore your host shell. |
| **`/fast`** | Configurations | — | Enable fast mode (bypass reasoning plans) for quick actions. |
| **`/feedback`** | Utilities | — | Open the feedback submission panel. |
| **`/fork`** | Conversations | `/branch` | Clone the current conversation thread into a new parallel session. |
| **`/help`** | Utilities | — | Open the help panel showing commands and shortcuts. |
| **`/hooks`** | Tools & Tasks | — | Browse active pre-flight/post-format script hooks. |
| **`/keybindings`** | Configurations | — | Open the interactive Keyboard Shortcut Editor. |
| **`/logout`** | Account | — | Disconnect your profile and purge authentication tokens from the secure keyring. |
| **`/mcp`** | Tools & Tasks | — | Open the Model Context Protocol (MCP) server manager. |
| **`/model`** | Configurations | — | Choose your preferred reasoning model (persists across sessions). |
| **`/open <path>`** | Utilities | — | Force the path to open inside your default system editor. |
| **[`/permissions`](/docs/cli/commands/permissions)** | Configurations | — | Open the interactive tool permissions manager panel. |
| **`/planning`** | Configurations | — | Enable multi-turn plan generation mode for complex engineering tasks. |
| **`/rename <name>`** | Conversations | — | Rename the current session thread. |
| **[`/resume`](/docs/cli/commands/resume)** | Conversations | `/switch`, `/conversation` | Open the [conversation picker overlay](/docs/cli/commands/resume) to select and load previous threads. |
| **`/rewind`** | Conversations | `/undo` | Roll back your conversation history to a previous message. |
| **`/skills`** | Tools & Tasks | — | Browse loaded local and global Agent Skills. |
| **[`/statusline`](/docs/cli/commands/statusline)** | Configurations | — | Open the Status Bar customization overlay. |
| **`/tasks`** | Tools & Tasks | — | Open the Task Manager Panel to monitor background shell execution logs. |
| **[`/title`](/docs/cli/commands/title) \[on/off\]** | Configurations | — | Toggle or set terminal window title updates. |
| **[`/usage`](/docs/cli/commands/usage)** | Utilities | `/quota` | Display model quota usage. |

## Default keybindings

Keyboard shortcut commands mapping global, prompt, navigation, and approval operations.

### Global controls

These hotkeys are always active regardless of which panel, overlay, or prompt is currently focused.

| Key | TUI Command | Action Behavior |
|----|----|----|
| **`Esc`** | `cli.escape` | Closes active panels, halts active streams, or clears empty prompts. |
| **`Ctrl+C`** | `cli.exit` | Terminates the CLI session (prompts for confirmation if agent is working). |
| **`Ctrl+D`** | `cli.exit` | Exits the CLI session (only when the prompt box is empty). |
| **`Ctrl+L`** | `cli.clear_screen` | Refreshes and clears the visual terminal buffer. |

### Prompt focus keys

These keys are active when writing instructions inside the prompt box.

| Key | TUI Command | Action Behavior |
|----|----|----|
| **`Enter`** | `prompt.submit` | Submits your prompt or active menu selection to the agent. |
| **`Shift+Enter`** / **`Ctrl+J`** | `prompt.newline` | Inserts a clean newline without submitting. |
| **`Ctrl+V`** | `prompt.paste` | Pastes graphic media files or clipboard blocks into the prompt. |
| **`Ctrl+O`** | `prompt.toggle_trajectory` | Expands or collapses detailed tool reasoning outputs. |
| **`Ctrl+R`** | `prompt.open_review` | Opens the Artifact Review Panel. |
| **`Ctrl+G`** | `prompt.external_editor` | Launches your default `$EDITOR` shell to compose your prompt. |
| **`Alt+J`** | `prompt.teleport_agent` | Instantly switches focus to the next subagent awaiting confirmation. |
| **`Ctrl+K`** | `prompt.fast_approve` | Instantly approves the pending subagent action listed in the status alert. |
| **`Ctrl+A`** | `prompt.cursor_start` | Moves the prompt insertion cursor to the beginning of the line. |
| **`Ctrl+E`** | `prompt.cursor_end` | Moves the prompt insertion cursor to the end of the line. |
| **`Ctrl+Z`** | `prompt.undo_text` | Reverts the last edit. |
| **`Ctrl+Shift+Z`** | `prompt.redo_text` | Redoes the last undone text operation. |
| **`Ctrl+D`** | `—` | Forward delete (only when the prompt box is non-empty). |

### Navigation & scrolling

Used inside select panels, menus, and scrollable text boxes.

| Key | TUI Command | Action Behavior |
|----|----|----|
| **`↑`** / **`↓`** | `navigation.up` / `navigation.down` | Scrolls highlighted selections up or down by one item. |
| **`PgUp`** / **`Shift+↑`** | `navigation.page_up` | Scrolls the active text viewport up by one page block. |
| **`PgDn`** / **`Shift+↓`** | `navigation.page_down` | Scrolls the active text viewport down by one page block. |
| **`←`** / **`→`** | `navigation.left` / `navigation.right` | Swaps pages inside multipage structures (like the Session Picker). |
| **`Tab`** | `navigation.tab` | Confirms the highlighted slash-command autofill option. |

### Tool confirmations

Active during confirmation prompts.

| Key | TUI Command | Action Behavior |
|----|----|----|
| **`y`** | `confirm.yes` | Authorizes the proposed tool, command, or active artifact. |
| **`n`** | `confirm.no` | Rejects the proposed tool, command, or active artifact. |
| **`A`** | `—` | (Inside Review Panel) Approves all generated artifacts in one action (built-in shortcut). |

## Configuration keys (`settings.json`)

Primary settings key names, data types, system defaults, and expected parameters.

### Example `settings.json`

content_copy

    {
      "colorScheme": "tokyo night",
      "altScreenMode": "always",
      "toolPermission": "request-review",
      "notifications": true,
      "enableTerminalSandbox": true
    }

| Option Key Name | Value Type | System Default | Parameter Characteristics & Options |
|----|----|----|----|
| **`colorScheme`** | string | `"terminal"` | Color theme: `"light"`, `"solarized light"`, `"colorblind-friendly light"`, `"dark"`, `"solarized dark"`, `"colorblind-friendly dark"`, `"tokyo night"`, or `"terminal"` (inherits native shell colors). |
| **`altScreenMode`** | string | `"default"` | Screen buffer usage: `"default"` (adaptive inline/altscreen), `"always"` (force alternate screen buffer), or `"never"` (force inline sequential output). |
| **`toolPermission`** | string | `"request-review"` | Global safety presets: `"request-review"` (prompts for write/bash/web tools), `"proceed-in-sandbox"` (auto-proceed inside sandbox), `"always-proceed"` (never prompts), or `"strict"` (prompts for all non-read tools). |
| **`artifactReviewPolicy`** | string | `"asks-for-review"` | Code review policy: `"asks-for-review"` (always prompts before writing code), `"agent-decides"` (prompts dynamically), or `"always-proceed"` (never prompts). |
| **`notifications`** | boolean | `false` | Emits system desktop and terminal bell chime notifications upon task completions. |
| **`showTips`** | boolean | `true` | Displays helpful agentic tips above the prompt panel during generation turns. |
| **`showFeedbackSurvey`** | boolean | `true` | Displays periodic quality feedback surveys upon active task completions. |
| **`editor`** | string | `"auto"` | Target text editor utility: `"auto"` (consults system `$EDITOR`), `"vim"`, `"emacs"`, or custom text labels. |
| **`editorMode`** | string | `"default"` | Prompt editing model: `"default"` (flat text editing) or `"vim"` (modal editing). Distinct from `editor`, which selects an external program. See [Vim Editor Mode](/docs/cli/vim-editor-mode). |
| **`vimInsertFirst`** | boolean | `false` | Starts Vim editing in Insert mode and makes a bare `Enter` submit. Requires `editorMode` set to `"vim"`. |
| **`allowNonWorkspaceAccess`** | boolean | `false` | Permits the agent’s file read and write tools to navigate outside recognized Git/workspace roots. |
| **`enableTerminalSandbox`** | boolean | `false` | Restricts all local execution commands launched by agents to OS containment rings. |
| **`useG1Credits`** | boolean | `false` | *External builds only.* Uses personal AI credits for model calls once plan quotas are exhausted. |
| **`enableTelemetry`** | boolean | `true` | Permits metric collection and crash log streaming to improve tool reliability. |
| **`verbosity`** | string | `"high"` | Visual verbosity level: `"high"` (renders full thoughts and tool outputs) or `"low"` (displays only minimal visual progress indicators). |
| **`runningLightSpeed`** | string | `"medium"` | Visual running light progress animation speed: `"fast"`, `"medium"`, `"slow"`, or `"off"`. |

## Next steps

Learn how to safely deploy permission policies, sandboxes, and customize plugins:

- **[Permissions & Sandbox](/docs/cli/sandbox)**: Enforce command-line containment rules.
- **[Plugins & Skills](/docs/cli/plugins)**: Create your own custom skills slash commands.
- **[Installation & Auth](/docs/cli/install)**: Update your CLI install.
