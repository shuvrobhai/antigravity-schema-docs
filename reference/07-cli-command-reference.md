## 7. Complete CLI Command Reference

35 confirmed slash commands:

### Core `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/exit` | `/quit` | Close TUI |

### Conversations `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/resume` | `/switch`, `/conversation` | Browse, search, resume past conversations |
| `/fork` | `/branch` | Clone conversation or fork to different project |
| `/rename <name>` | — | Rename session |
| `/rewind` | `/undo` | Roll back to previous message |

### Configurations `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/config` | `/settings` | Interactive settings editor |
| `/model` | — | Choose reasoning model |
| `/fast` | — | Enable fast mode |
| `/planning` | — | Enable planning mode |
| `/keybindings` | — | Keyboard shortcut editor |

### Agent Control `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/agents` | — | Agent selection, discovery, subagent monitoring |
| `/browser` | — | Open sandboxed Chrome browser |
| `/goal` | — | Run until task is completely finished without intermediate input |
| `/grill-me` | — | Before implementing, ask clarifying questions to align on plan details |
| `/schedule` | — | Run instruction as one-time timer or recurring schedule. **One-time timers capped at 15 minutes (900 s)** `[GOOGLE]`; cron-style recurring schedules have a separate (unspecified) limit `[GOOGLE]` |

### Tools and Tasks `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/codesearch` | `/cs`, `/search` | Interactive code search with regex and line commenting |
| `/hooks` | — | Browse active hooks |
| `/mcp` | — | Interactive MCP manager |
| `/permissions` | — | Fine-grained permissions editor |
| `/skills` | — | Browse loaded skills |
| `/tasks` | — | Task Manager Panel for background logs |

### Utilities `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/add-dir` | — | Add working directory |
| `/artifact` | — | Open artifact picker |
| `/btw` | — | Provide additional context |
| `/clear` | — | Clear terminal history |
| `/context` | — | Inspect memory and token usage |
| `/copy` | — | Copy content to clipboard |
| `/diff` | — | Workspace diff viewer |
| `/open <path>` | — | Open in default editor |
| `/feedback` | — | Feedback submission |
| `/title` | — | Toggle/configure terminal titles |
| `/statusline` | — | Configure custom status line |

### Account `[DOCS]`

| Command | Alias | Description |
|---|---|---|
| `/credits` | — | Manage AI Premium credits |
| `/logout` | — | Disconnect, purge auth tokens |
| `/usage` | `/quota` | View model quota |

### Special Input `[DOCS]`

| Input | Description |
|---|---|
| `! <command>` | Direct bash execution (shell mode) |
| `@ <path>` | File autocompletion overlay |

### Cross-Product (community-observed) `[COMMUNITY]`

| Command | Description |
|---|---|
| `/export` | Push the current terminal session into the Antigravity 2.0 desktop GUI to continue the same conversation in a richer surface (file diffs, graph views) `[COMMUNITY]` |

**Verification note (2026-08-13):** `/export` is corroborated by multiple independent community sources (aibuilderclub CLI guide 2026-06-21; dev.to hands-on guide 2026-05-21; neurals.ca conversation-history guide) but is **absent from the official CLI reference page** (`antigravity.google/docs/cli/reference`) as of 2026-08-13 — treat as community-observed until officially documented or live-verified.

### Binary Subcommands

| Command | Description |
|---|---|
| `agy agents` / `agy agent` | List available agents. **Live 1.1.12:** lists global + plugin-shipped agents only; does **not** list workspace agents. |
| `agy models` | List available models |
| `agy plugin` / `agy plugins` | Manage plugins: list, import, install, uninstall, enable, disable, validate, link |
| `agy changelog` | Show changelog and release notes |
| `agy install` | Configure environment paths and shell settings |
| `agy update` | Update CLI |

**Live conflict — `--output-format` on `agents` / `models`** `[LIVE-1.1.12 · 2026-08-13]`:

The 1.1.12 changelog says:

> Added machine-readable output to the `models` and `agents` subcommands through an `--output-format` flag accepting `json` and `stream-json`.

Live CLI contradicts this.

`EV-002`:

```bash
agy agents --output-format json
```

```text
Error: flags provided but not defined: -output-format
```

`EV-003`:

```bash
agy models --output-format json
```

```text
Error: flags provided but not defined: -output-format
```

Both `stream-json` attempts fail identically.

Corrected report statement:

> As of live `1.1.12`, `agy agents` and `agy models` do **not** implement `--output-format`, despite the changelog.

**Full `agy plugin` command surface** `[LIVE-1.1.12 · 2026-08-13]` `EV-005`:

```text
Usage: agy plugin <command> [arguments]

Commands:
  list                   List imported plugins
  import [source]        Import plugins from gemini or claude
  install <target>       Install a plugin (supports plugin@marketplace)
  uninstall <name>       Uninstall a plugin
  enable <name>          Enable a plugin
  disable <name>         Disable a plugin
  validate [path]        Validate a plugin
  link <mp> <target>     Generate link to a marketplace
  help                   Show this help
```
