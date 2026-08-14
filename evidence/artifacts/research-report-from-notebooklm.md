# Google Antigravity Ecosystem: Unified Master Reference Manual
### Comprehensive Configuration, Extensibility Architecture, and Systems-Engineering Gap Analysis
#### Version 8.10 — Production-Grade Reference (agy 1.1.12 · Desktop 2.8.1 · SDK 0.1.10 · IDE 2.5.5)

**Document Control Metadata:**
*   **Active Specification Version:** 8.10 (Unified Edition) [1]
*   **Live Verification Date:** 2026-08-13 [1]
*   **Target Binaries:** `agy` CLI v1.1.12, Antigravity Desktop v2.8.1, Python SDK v0.1.10, Antigravity IDE v2.5.5 [1, 4]
*   **Host System Baseline:** macOS Darwin 25.4.0 (arm64, Apple Silicon) / Linux deb & rpm [1, 163, 164]
*   **Status:** Grounded, Peer-Reviewed Systems Engineering Specification [1, 5]

---

## 1. Executive Summary

The **Google Antigravity Ecosystem** is an advanced, agent-first development platform designed to orchestrate autonomous subagents, schedule background tasks, manage workspace permissions, and execute interactive local code verification [1, 7]. By bringing foundation-model intelligence directly into the local development environment, the platform moves beyond simple code completion into autonomous codebase refactoring and browser-in-the-loop verification [363].

### 1.1 Core Subsystems
The ecosystem consists of four major user-facing product surfaces [1, 13]:
1.  **Antigravity 2.0 (Desktop):** A standalone desktop command center for orchestrating multiple parallel agents, organizing folders into structured Projects, and managing scheduled background tasks [13, 107].
2.  **Antigravity IDE:** A VS Code-forked development environment with tightly integrated agent side panels, tab autocomplete, and visual artifact review [13, 412]. (Note: Enterprise licenses are excluded from the IDE [540]).
3.  **Antigravity CLI (`agy`):** A fast, lightweight terminal surface supporting natural-language prompts, interactive slash commands, multi-threaded subagent monitoring, and headless pipeline automation [7, 102].
4.  **Antigravity SDK:** A programmatic Python framework (`google-antigravity`) for building custom agents, registering custom functions as tools, and defining declarative security policies [13, 281, 566].

### 1.2 Open Extensibility Principles
To prevent vendor lock-in and minimize token overhead, the extensibility layers are built entirely on open, portable standards [7, 15]:
*   **Markdown Frontmatter:** Custom skills, persona definitions (Agents), modular Rules, and step playbooks (Workflows) are declared as Markdown files with YAML frontmatter [7, 15]. This format is fully portable to alternative agent tools such as Claude Code, Cursor, and Codex CLI [7].
*   **Model Context Protocol (MCP):** Connects AI agents securely to local files, databases, search APIs, and external remote tools via SSE or Stdio [15, 455].
*   **JSON Schemas:** Runtime state, hooks, preferences, and prompt histories are mapped to structured, machine-readable JSON schemas supporting offline auditing and validation [15, 94].

---

## 2. Sourcing Hierarchy & Confidence Tiers

To ensure complete accuracy in production deployments, this reference maps all technical specifications to an empirical sourcing model, distinguishing between confirmed documentation, live system observations, and inferred behavior [9].

### 2.1 Sourcing Taxonomy
*   **`[DOCS]` / `[DOCS:NN]`:** Stated directly in the official retrieved pages hosted at `antigravity.google/docs/*`. High-reliability, safe for production decisions [9].
*   **`[LIVE-1.1.12 · 2026-08-13]`:** Directly observed and verified on a live, user-configured `agy 1.1.12` installation on macOS Darwin. Denoted by **Evidence IDs (EV-001 through EV-020)**. Used to resolve conflicts between documentation and binary behavior [4, 9, 10].
*   **`[GOOGLE]`:** Ingested from alternative Google-managed sources, including Codelabs, developer blog posts, or official GitHub repositories [9].
*   **`[PROTOCOL]`:** Sourced from the official `modelcontextprotocol.io` specifications [9].
*   **`[COMMUNITY]`:** Third-party developer forums, issue trackers, and blog summaries. Included only when official documentation is silent [9, 12].

### 2.2 Confidence Tiers
| Tier | Label | Definition |
| ------ | ------ | ------ |
| **A** | **Confirmed by Sources** | Directly stated in a retrieved source or live binary probe. Safe to rely on for production [9]. |
| **B** | **Reasonable Inference** | Logically extrapolated from confirmed information. Validate before production reliance [9]. |
| **C** | **Requires Verification** | Sourced from community findings or unreleased APIs. Treated as directional indicators [9, 11]. |

---

## 3. Product Family, Model, and Identity Mapping

### 3.1 Product Surface Matrices
The four primary platforms operate across diverse operating systems and target environments:

*   **Antigravity 2.0 (Desktop):** Supports macOS 12+ (Apple Silicon natively; Intel supported via separate build) [109, 391], Windows 10 (64-bit) [391], and Linux (glibc >= 2.28) [391]. Runs in standalone workspace mode.
*   **Antigravity IDE:** Matches Desktop OS support [385]. Sources extensions exclusively from the **Open VSX Registry** (Eclipse Foundation) instead of the Microsoft VS Code Marketplace [14]. Extensions like the **C# Dev Kit** are absent from Open VSX and are unsupported [14].
*   **Antigravity CLI (`agy`):** Installed via shell wrappers [378] on macOS, Linux, and Windows (PowerShell/CMD). Configured under `~/.gemini/antigravity-cli/` [69].
*   **Antigravity SDK:** Installed via standard wheel packages `pip install google-antigravity` [120]. Includes a platform-specific compiled Go binary runtime harness that communicates via WebSockets [120, 78].

### 3.2 Reasoning Model Ecosystem
Model availability and tier constraints are strictly controlled by licensing and subscriptions [15, 612]:

| Model Slug [402] | Free & AI Plus [15, 172] | AI Pro [15, 517] | AI Ultra [15, 517] | Enterprise [15, 517] | Description |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `gemini-3.7-flash-high` | Yes | Yes | Yes | Yes | Gemini 3.7 Flash (High Effort) [402, 517] |
| `gemini-3.7-flash-medium`| Yes | Yes | Yes | Yes | Gemini 3.7 Flash (Medium Effort) [402, 517] |
| `gemini-3.6-flash-high` | Yes | Yes | Yes | Yes | Gemini 3.6 Flash (High Effort) [402, 517] |
| `gemini-3.6-flash-medium`| Yes | Yes | Yes | Yes | Gemini 3.6 Flash (Medium Effort) [402, 517] |
| `gemini-3.5-flash-medium`| Yes | Yes | Yes | Yes | Gemini 3.5 Flash (Medium Effort) [402, 517] |
| `gemini-3.1-pro-high` | Yes | Yes | Yes | Yes | Gemini 3.1 Pro (High Effort) [402, 517] |
| `claude-sonnet-4-6` | Yes | Yes | Yes | **No** | Claude Sonnet 4.6 (Thinking enabled) [15, 402] |
| `claude-opus-4-6` | Yes | Yes | Yes | **No** | Claude Opus 4.6 (Thinking enabled) [15] |
| `gpt-oss-120b` | Yes | Yes | Yes | **No** | GPT-OSS-120b [15] |

*   **Nano Banana 2:** An internal, non-customizable vision-generative model used natively by the `generate_image` tool to render UI mockups, page assets, and architectural diagrams [15, 518].
*   **Model "Stickiness":** Model selections are strictly "sticky" within a conversation [15, 518]. If you modify the reasoning model mid-execution, the agent continues to use the original model until the active turn finishes or is explicitly canceled [518].

### 3.3 Terms of Service and API Gaps
*   **Third-Party Tool Blocks:** Utilizing third-party software, terminal emulators, or alternative client wrappers (e.g., *Claude Code*, *OpenClaw*, or *OpenCode*) with your Antigravity OAuth session is a **direct violation of the Terms of Service** [188, 341]. Violations severely degrade the service and are grounds for immediate account suspension or termination [188, 341].
*   **CLI Authentication Limitation:** The Antigravity CLI **does not support local API-key authentication** (open issue google-antigravity/antigravity-cli#78) [8.1, 86]. Developers must use Application Default Credentials (ADC) or OAuth [8.1, 86]. In contrast, the SDK fully supports `api_key` configuration or `GEMINI_API_KEY` environment variables [8.1, 86, 160].

---

## 4. Extensibility Architecture & Structural Specifications

The shared ecosystem core leverages **seven modular, decoupled interfaces** to expand agent capabilities [15, 17].

```
                ┌──────────────────────────────────┐
                │      Shared Ecosystem Core       │
                └────────────────/─────────────────┘
                                /
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  Custom Skills          Custom Agents          Native Plugins
 (SKILL.md + YAML)       (.md + Frontmatter)    (plugin.json manifest)
        │                      │                      │
        ▼                      ▼                      ▼
 ~/.gemini/.../skills/  .agents/agents/        ~/.gemini/config/plugins/
```

### 4.1 Progressive Disclosure Engine
To prevent token bloat, the runtime handles extensibility assets via an officially documented three-phase progressive disclosure pattern [17]:
1.  **Phase 1 - Discovery (Metadata):** At session start, only the name and description are read from YAML frontmatter (~100 tokens per skill) [17, 21].
2.  **Phase 2 - Activation (Instructions):** If the model flags a skill/agent as relevant, the full instructions within `SKILL.md` are loaded (<5,000 tokens recommended) [17].
3.  **Phase 3 - Execution (Resources):** Specialized scripts, references, or asset files inside subdirectories are called on demand by the agent [17, 21].

### 4.2 Custom Skills System
Skills map to interactive slash commands (e.g., `/my-skill`) and are stored in global or workspace roots [18, 639].

*   **Skill Layout:**
    ```
    .agents/skills/my-skill/
    ├── SKILL.md       # Required instruction manifest
    ├── scripts/       # Optional helper scripts (black boxes)
    ├── examples/      # Optional reference implementations
    └── resources/     # Optional design templates or assets
    ``` [771]
*   **Frontmatter Spec (`SKILL.md`):**
    ```yaml
    ---
    name: format-tests             # Unique lowercase identifier (defaults to folder name)
    description: Standardizes tests # Required. Scanned in Phase 1 for activation
    metadata: {}                    # Optional metadata object [LIVE-1.1.12]
    disable-slash-command: false    # Optional. Set to true to hide from TUI slash menu
    ---
    ``` [19, 770]

### 4.3 Custom Agents Specification
Agents define *who* is executing the task (persona, tools, model, and execution policy) rather than *what* to do [22].
*   **Discovery Locations:** [23]
    *   *Workspace:* `.agents/agents/<name>.md` or `.agents/agents/<name>/agent.md`
    *   *Global:* `~/.gemini/config/agents/<name>.md` or `.../agents/<name>/agent.md`
    *   *Plugins:* `plugins/<plugin_name>/agents/`
*   **Frontmatter Spec:**
    ```yaml
    ---
    name: code-reviewer             # Required name
    description: Inspects code      # Required description for delegator
    tools:                          # Permitted tools
      - view_file
      - grep_search
    mainAgent: true                 # Allow selection as primary chat agent
    subagent: true                  # Allow delegation via invoke_subagent
    model: inherit                  # pro, flash, or inherit (cascades to parent model)
    commandExecutionPolicy: sandbox  # sandbox, auto, eager, off
    mcpServers: []                  # Inline custom MCP servers
    skills: []                      # Custom skill associations
    ---
    ``` [23, 24]

*   **The Workspace Discovery Divergence [LIVE-1.1.12 · EV-004]:** The binary subcommand `agy agents` lists **global and plugin-shipped agents only** [26]. Workspace-scoped agents (located in `.agents/agents/`) are **not** displayed by `agy agents` or discovered by headless mode (`agy -p --agent <name>`), which silently falls back to the default agent [25, 26]. Workspace agents are discoverable **exclusively within the interactive TUI's `/agents` picker panel** [25, 26]. To target a workspace agent headlessly, developers must pass the explicit relative file path to the manifest [25].

### 4.4 Native Plugins
Plugins group multiple extensibility components into a single package [27, 618].
*   **Filesystem Directory Structure (Live-Verified [LIVE-1.1.12 · EV-007]):**
    ```
    ~/.gemini/antigravity-cli/plugins/<plugin_name>/
    ├── plugin.json                 # Required manifest file
    ├── mcp_config.json             # Optional MCP definitions
    ├── hooks.json                  # Optional lifecycle event hooks
    ├── skills/                     # Optional folder containing skills/
    ├── agents/                     # Optional folder containing custom agents
    └── rules/                      # Optional custom rules folder
    ``` [28, 356, 636]
*   **The Manifest (`plugin.json`):**
    ```json
    {
      "$schema": "https://antigravity.google/schemas/v1/plugin.json",
      "name": "git-assistant",
      "description": "Helper tools for Git workflows"
    }
    ``` [29, 637]
    *(Note: Live testing EV-010 verified that `$schema`, `name`, and `description` are the only evaluated manifest fields [28].)*

### 4.5 Model Context Protocol (MCP)
An open connection standard translating files and remote resources to LLM tools [33, 455].
*   **Configuration Paths:** [33, 503]
    *   *Global:* `~/.gemini/config/mcp_config.json`
    *   *Workspace:* `.agents/mcp_config.json`
*   **JSON Schema Structure:** [458]
    ```json
    {
      "mcpServers": {
        "sqlite-explorer": {
          "command": "node",
          "args": ["/usr/local/bin/sqlite-mcp-server.js"],
          "env": {
            "SQLITE_DB_PATH": "/var/data/app.db"
          }
        },
        "remote-bridge": {
          "serverUrl": "https://api.example.com/mcp/",
          "headers": {
            "Authorization": "Bearer SECURE_TOKEN"
          }
        }
      }
    }
    ```

### 4.6 Modular Rules
Markdown files outlining behavioral rules and code formatting guidelines [35, 703].
*   **File Paths:** [35, 704]
    *   *Global Context File:* `~/.gemini/GEMINI.md` (Always loaded)
    *   *Global Rule Store:* `~/.gemini/config/rules/`
    *   *Workspace Modular Rules:* `.agents/rules/*.md`
    *   *Directory Scope Context:* `<cwd>/GEMINI.md` or `<cwd>/AGENTS.md` (Hierarchical auto-discovery)
*   **Size Limit:** Strictly capped at **12,000 characters** per rule file [36, 704].
*   **Activation Modes:** [36, 704]
    *   `Manual`: User mentions the rule in chat using `@rule-name` notation.
    *   `Always On`: Rule is loaded into every prompt automatically.
    *   `Model Decision`: Semantic similarity matches rule descriptions to active tasks.
    *   `Glob`: Loaded only when files in the active session match specific patterns (e.g., `src/**/*.tsx`, `**/*.proto`).

### 4.7 Multi-Step Workflows
Step playbooks that direct agents sequentially through repetitive integration tasks [37, 706].
*   **Invocation:** Triggered in chat via `/workflow-name` [37, 706].
*   **Size Limit:** Capped at **12,000 characters** per workflow file [37, 707].
*   **Interactive Control:** Supports non-interactive sequential execution via the `// turbo` and `// turbo-all` script annotations [37].

### 4.8 Lifecycle Event Hooks
Hooks run customized local shell commands or scripts at key state transitions in the agent loop [38, 418].
*   **Configuration Locations:** `~/.gemini/config/hooks.json` or `.agents/hooks.json` [38, 418].
*   **Supported Events:** [38, 420]
    *   `PreToolUse`: Fires before tool invocation. Must return a decision (`proceed`, `deny`, or `ask`). Matcher target: tool name.
    *   `PostToolUse`: Fires after tool completes. Returns execution error strings if present. Matcher target: tool name.
    *   `PreInvocation`: Fires before calling the model. Supports injecting steps into the prompt history. (Matcher ignored).
    *   `PostInvocation`: Fires after model invocation completes. Supports injecting steps and forcing execution loop continuation/termination. (Matcher ignored).
    *   `Stop`: Fires when execution terminates. Returns a decision on whether to continue. (Matcher ignored).

*   **Hook Definition Schema (`hooks.json`):** [38, 419]
    ```json
    {
      "pre-flight-hook": {
        "PreToolUse": [
          {
            "matcher": "run_command",
            "hooks": [
              {
                "type": "command",
                "command": "./scripts/preflight-checks.sh",
                "timeout": 15
              }
            ]
          }
        ]
      }
    }
    ```

---

## 5. Configuration System, settings.json Schema & Keybindings

The configuration layer aggregates settings from global files, project overrides, and runtime CLI flags [46, 145, 149].

### 5.1 Precedence Priority
When settings conflict, configurations are merged using strict system priority rules [145]:
1.  **CLI Command Flags** (e.g., `agy --mode=plan` overrides session settings with warning indicator) [46].
2.  **Project-Specific Settings** (stored under `~/.gemini/config/projects/` or `.agents/settings.json`) [145, 149].
3.  **Global App Settings** (located at `~/.gemini/antigravity-cli/settings.json`) [48, 145].

### 5.2 Settings Schema Matrix
The following keys are supported inside `settings.json` [43, 750]:

| Key Name | Data Type | Default Value | Valid Options | Purpose |
| ------ | ------ | ------ | ------ | ------ |
| `toolPermission` | string | `"request-review"` | `request-review`, `proceed-in-sandbox`, `always-proceed`, `strict` | Gating behavior for active tool execution [43, 750]. |
| `commandExecutionPolicy`| string | `"sandbox"` | `sandbox`, `auto`, `eager`, `off` | Shell execution containment mode [43, 84]. |
| `artifactReviewPolicy` | string | `"asks-for-review"` | `asks-for-review`, `agent-decides`, `always-proceed` | Review prompt gating for code artifacts [43, 84]. |
| `enableTerminalSandbox` | boolean | `false` | `true`, `false` | Enables Terminal Sandbox process isolation [43, 750]. |
| `allowNonWorkspaceAccess`| boolean | `false` | `true`, `false` | Restricts agent file lookups to project boundaries [43, 750]. |
| `trustedWorkspaces` | string[] | `[]` | List of directory paths | Explicit allowlist for repository folder mounting [43]. |
| `general.defaultApprovalMode`| string | `"default"` | `default`, `auto_edit`, `plan` | Execution mode defaults [84]. |

### 5.3 Live-Verified settings.json Example [LIVE-1.1.12 · EV-013]:
```json
{
  "colorScheme": "tokyo night",
  "altScreenMode": "always",
  "toolPermission": "request-review",
  "enableTerminalSandbox": true,
  "allowNonWorkspaceAccess": false,
  "permissions": {
    "allow": ["read_file(**/*.py)", "command(git status)"],
    "deny": ["read_file(/path/secrets/*)"]
  }
}
``` [44, 48, 291]

### 5.4 Keybinding Registry
Reconciled against the live official CLI reference to correct several community myths [45]:

*   **TUI Prompt & Navigation:**
    *   `Ctrl+D`: Exit TUI (only when input box is empty) [45].
    *   `Ctrl+G`: Launch `prompt` within `$EDITOR` to draft long prompts [668].
    *   `Ctrl+Z`: Undo prompt text buffer edit (replaces community myth of OS suspend) [45].
    *   `Ctrl+Shift+Z`: Redo prompt text buffer edit [45].
    *   `Alt+J` / `Ctrl+K`: Scroll through conversation history or autocomplete items [45].
    *   `Shift+Tab`: Cycle active execution mode during a session (`default` -> `accept-edits` -> `plan`) [140, 299].

*   **TUI Artifact Picker Panel (ctrl+r):** [61, 62, 692]
    *   `↑` / `↓`: Scroll selections up and down through list entries.
    *   `h` / `l` (or `←` / `→`): Toggle buttons (`open`, `approve`, `reject`).
    *   `p`: Toggle quick 12-line inline file preview.
    *   `y`: Instantly approve selected artifact.
    *   `n`: Instantly reject selected artifact.
    *   `Shift+A`: Bulk-approve all pending artifacts simultaneously.
    *   `Shift+R`: Bulk-reject all pending artifacts.
    *   `t`: (Inside Artifact Viewer) Open a quick markdown section outline.

---

## 6. Unified Permissions Engine & DSL Syntax

Antigravity executes commands and reads files using a unified **fail-closed** permission matching engine [84].

### 6.1 Interactive Prompts & Runtime Scope Expansion
When the agent executes a blocked or "Ask" tool, an interactive prompt card appears in the TUI or editor [575, 583].
*   **Target Scope Editing:** Before selecting **Allow**, users can directly edit the proposed resource string in the prompt card [575, 583]. For example, broadening `read_file(/project/src/main.py)` to `read_file(/project/src/)` applies the expanded grant for the remainder of the session [575, 583].
*   *Security Note:* Scope editing is **strictly disabled for terminal command resources** to prevent accidental privilege escalations [575, 583].

### 6.2 Default Behaviors & Constraints
1.  **Workspaces are Auto-Allowed:** Workspace file reads and writes within mounted folders are automatically allowed [47, 576].
2.  **Web Browsing Defaults to Ask:** Egress network calls (`read_url` or `execute_url`) default to **Ask** [47, 576].
3.  **Deny Read implies Deny Write:** If a rule denies reading a sensitive path, writing to that path is automatically denied by default [574, 575].

### 6.3 Permission DSL Reference Guide
Rules are evaluated in standard `allow`, `deny`, and `ask` arrays using a granular domain-specific language (DSL) [48, 49]:

| DSL Rule Pattern | Target Tool / Scope | Description |
| ------ | ------ | ------ |
| `unsandboxed(<path_or_cmd>)` | `run_command` | Executes command directly on host OS, bypassing sandbox containers [49]. |
| `command(<cmd_prefix>)` | `run_command` | Authorizes execution of commands matching the leading string prefix [49]. |
| `read_url(<domain_pattern>)` | `read_url_content` / Web | Authorizes HTTP text fetching and egress to matching host domains [49]. |
| `read_file(<path_pattern>)` | `view_file` / Core | Restricts or allows reading files matching workspace paths [49]. |
| `mcp(<server_name>/<tool_name>)`| MCP Tool Dispatch | Blocks or allows specific Model Context Protocol tool operations [49]. |

---

## 7. Complete CLI Command Reference

Antigravity CLI supports **35 interactive slash commands** inside the prompt interface [50, 51].

### 7.1 Core Commands
*   `/exit` (alias `/quit`): Terminate session and close TUI [50].
*   `/help` (alias `/h`): View help menus and listed capabilities [135].

### 7.2 Conversation Management
*   `/resume` (aliases `/switch`, `/conversation`): Browse and search conversation SQLite databases to load past sessions [50, 149].
*   `/fork <project_id>` (alias `/branch`): Clone the current conversation history and bind it to a different project container [50, 65].
*   `/rename <name>`: Rename active conversation session [50].
*   `/rewind` (alias `/undo`): Roll back the conversation state and file changes to a previous stable prompt boundary [50, 265].
*   `/export`: Push the active terminal TUI conversation directly into the Antigravity Desktop app, loading active diffs and charts natively [50].

### 7.3 Tasks and Customizations
*   `/codesearch` (aliases `/cs`, `/search`): Opens the interactive fullscreen code search engine (regular expression support, inline commenting, incremental stream loading) [51, 136, 137].
*   `/hooks`: Inspect loaded event hook configurations [51, 642].
*   `/mcp`: Opens the interactive Model Context Protocol manager overlay to enable, disable, and configure servers [51, 149].
*   `/permissions`: Opens the in-TUI permissions editor to inspect global, shared, and project rules [51, 149].
*   `/skills`: Browse currently discovered custom and global skills [51].
*   `/tasks`: Opens the background task manager to inspect logs and terminate parallel subagents [51].

### 7.4 Utilities & Parameters
*   `/add-dir <path>`: Mount additional folders into the active conversation project scope [51].
*   `/artifact`: Opens the full-screen visual artifact picker panel [51].
*   `/btw`: Launch a single-turn question using a token-efficient ephemeral subagent [51, 131, 148].
*   `/clear`: Clear terminal history buffer [51].
*   `/context`: Inspect active context size, remaining window space, and exact token counts [51, 130].
*   `/copy <index>`: Copy the n-th model response to the clipboard [51, 136].
*   `/diff`: Opens the unified visual diff viewer panel (supports VCS, Turn, and Commit modes) [51, 317, 318].
*   `/open <path>`: Open file in default system editor [51].
*   `/feedback`: Submit logs or system diagnostics to Google [51].
*   `/title`: Configure terminal window title preferences [51, 821].
*   `/statusline`: Toggle or edit status line reporting widgets [51, 798].
*   `/usage` (alias `/quota`): Opens the Model Quota panel displaying credit balances [511, 512].
*   `/credits`: View and purchase AI Premium credits interactively [221].

### 7.5 Agent Directives (Slash Prefix Commands)
*   `/goal`: Execute specified instruction continuously without halting for intermediate approvals [143].
*   `/grill-me`: Instruct agent to ask clarifying questions before writing code [394].
*   `/schedule`: Set up one-time or recurring tasks on cron intervals. (One-time timers are capped at 900 seconds) [56, 394].
*   `/browser`: Explicitly force the agent to use browser automation and Chrome DevTools MCP tools [394].

---

## 8. Built-in Agent Tool API

The runtime exposes a mature set of **56 tools** [52].

### 8.1 Documented Tools and verified Signatures
*   **File Operations:**
    *   `list_dir(DirectoryPath)`: List folder files [53].
    *   `view_file(AbsolutePath, StartLine?, EndLine?)`: Read explicit file ranges [53].
    *   `write_to_file(TargetFile, CodeContent, Overwrite, Description)`: Create new file [53].
    *   `replace_file_content(TargetFile, TargetContent, ReplacementContent, Instruction, StartLine, EndLine)`: Edit single contiguous text block [53].
    *   `multi_replace_file_content(TargetFile, ReplacementChunks, Instruction)`: Execute non-contiguous multi-hunk edits [53].
*   **Search & Research:**
    *   `find_by_name(SearchDirectory, Pattern, Type?)`: Scan directory using standard globs [54].
    *   `grep_search(SearchPath, Query, IsRegex?, CaseInsensitive?)`: Regex search workspace text [54].
    *   `search_web(query, domain?)`: Search Google [54].
    *   `read_url_content(Url)`: Fetch URL text. *(Note: argument is `Url` uppercase U only, not `URL`)* [54].
*   **System & Integrations:**
    *   `run_command(CommandLine, Cwd)`: Execute shell command inside sandbox [55].
    *   `call_mcp_tool(ServerName, ToolName, Arguments)`: Dispatch call to MCP server [55].
    *   `generate_image(Prompt, ImageName, ImagePaths?)`: Generate image using Nano Banana [55].
*   **Scheduling & Automation:**
    *   `schedule(DurationSeconds?, CronExpression?, Prompt)`: Program timers. (DurationSeconds <= 900) [56].
    *   `manage_task(Action, TaskId?)`: Control parallel subagents [56].

---

## 9. Process Containment and Sandbox Customization

To secure developer workstations, the execution of shell commands via `run_command` is strictly isolated within native operating system container sandboxes [721].

### 9.1 OS Containment Matrix [84]:
*   **Linux:** Uses `nsjail` leveraging namespaces, cgroups, and network routing policies to enforce isolated runtimes.
*   **macOS:** Uses `sandbox-exec` utilizing custom SBPL profiles to restrict directory egress and network sockets.
*   **Windows:** Uses `AppContainer` leveraging restricted security tokens, SID matching, and DACL isolation.

### 9.2 The "Fail-Closed" Safety Motif
If `enableTerminalSandbox` is set to `true` inside `settings.json`, the isolation layers are strictly mandatory [43, 84]. If the sandbox container service fails to initialize or is missing from the host OS path, **the execution engine exits with a hard error and aborts the command** [84]. Fallback to unsandboxed execution is denied by default to prevent silent security leaks [84].

---

## 10. Headless Execution Mode & NDJSON Streams

For CI/CD and programmatic pipelines, the CLI provides non-interactive headless execution [404, 405].

*   **Flag References:** [404]
    *   `-p`, `--print <prompt>`: Execute prompt non-interactively and exit.
    *   `--output-format`: `text` (default), `json`, or `stream-json`.
    *   `--json-schema`: Path or schema string to enforce structured JSON output.
    *   `--dangerously-skip-permissions`: Skip all interactive prompts and automatically allow all tool calls.

### 10.1 Stream Payload (stream-json)
Stream mode outputs Newline-Delimited JSON (NDJSON) events [58].
*   `init`: Fired once. Reports tools, permissions, models, and active directory [58].
*   `step_update`: Reports step status (`ACTIVE`/`DONE`), `step_type` (`user_input`, `agent_response`, `tool`, `checkpoint`), and `tool_info` (with tool parameters and outcomes) [58, 401].
*   `result`: Final summary including response string, token usage, and error objects [58, 403].

### 10.2 Headless Hook Omission Bug [LIVE-1.1.12 · EV-020]
Non-interactive headless print runs (`agy -p`) **do not load or execute workspace-scoped lifecycle hooks** defined in `.agents/hooks.json` [59, 81, 84]. Live system probe **EV-020** proved that this is an architectural constraint of the headless mode engine rather than a permission or safety setting [81, 84]. Automated pipelines requiring pre/post-tool linter or security scripts must invoke check wrappers before launching `agy -p` [81, 84].

---

## 11. Browser Automation & Integration

The browser subagent provides browser-in-the-loop iteration and layout screenshotting [201, 202, 554].

### 11.1 Security and Navigation Boundaries
*   **Fail-Closed URL Denylist:** Navigations are checked against a server-side `BadUrlsChecker` RPC [47]. If the Google validation servers are unreachable, **browser navigation is denied by default** to safeguard sandbox networks [47]. Local allowlists can augment but never override the denylist [47, 241].
*   **Media Generation:** Screenshots are captured on-demand and saved as image artifacts [727, 733]. Video recordings are saved as `.webm` media files inside the conversation artifact folder [350].

---

## 12. Artifacts, Tasks, and Implementation Plans

Artifacts serve as the primary asynchronous co-steering mechanism, allowing developers to manage code change blast-radii without manual step-by-step tool monitoring [60, 524, 689].

### 12.1 Implementation Plan Co-Steering Lifecycle
1.  **Generate:** The agent analyzes the task and writes an `implementation_plan.md` artifact to the conversation scratch folder [63, 596].
2.  **Review:** TUI users press `ctrl+r` (or click "Review Changes" in the IDE toolbar) to open the interactive diff viewer [61, 682].
3.  **Comment & Co-Steer:** Users add line-anchored comments directly onto the diff hunk [63, 320].
4.  **Execute:** Clicking **Proceed** authorizes the agent to execute code edits matching your feedback comments [63, 597].

### 12.2 Artifact Review Policies
Configured in settings under `artifactReviewPolicy` [43, 750]:
*   `asks-for-review` (Default): Agent halts and requests confirmation before modifying local files [43, 248, 750].
*   `agent-decides`: Agent automatically evaluates change complexity and only prompts if high-impact edits are planned [43, 750].
*   `always-proceed`: Agent writes changes immediately without blocking [43, 248, 750].

---

## 13. Enterprise Features

Secure corporate deployments are managed through Google Cloud terms and integrations [328].

### 13.1 GCP IAM Permission Matrix
To configure Gemini Enterprise Agent Platform, users need specific Cloud IAM roles [330]:
*   `roles/resourcemanager.projectCreator` (Permission: `resourcemanager.projects.create`): Create the backend GCP project [330].
*   `roles/serviceusage.serviceUsageAdmin` (Permission: `serviceusage.services.enable`): Enable Agent Platform API [330].
*   `roles/aiplatform.user` (Permission: `aiplatform.user`): Use Antigravity reasoning models [330].

### 13.2 Regional Egress & Capabilities
Regionalized model inferencing guarantees data residency within designated regions [64, 128]:
*   `us` (US Multi-Region): Supports text generation, codebase inference, and multimodal inputs [65].
*   `eu` (EU Multi-Region): Supports text generation, codebase inference, and multimodal inputs [65].
*   `global` (Global Endpoint): Supports all capabilities including Vision-Generative **Image Generation** via Nano Banana [65, 333].

*   **IDE Support Boundary:** Antigravity IDE **does not support enterprise authentication or Google Cloud terms** [540]. Teams requiring enterprise security thresholds, BYOID, or Workforce Identity Federation (WIF) must utilize **Antigravity 2.0 (Desktop) or the Antigravity CLI** [540].

---

## 14. Workspace Governance and Verification Loops

Production teams should enforce structured workstation rules to ensure code quality and safety [67].

### 14.1 Structured Verification Loops
Before launching an agent, ensure a local testing mechanism exists (e.g., `pytest`, `npm test`, or `make build`) [67, 260]. Direct the agent to write a corresponding test file *first*, execute the local build script, and iterate on the test results automatically [67, 260].

### 14.2 Codebase Rule Files
Enforce standards by placing markdown rule files at project roots [68]:
*   `GEMINI.md` / `AGENTS.md` (Project root): Outlines styling guidelines, lint thresholds, and testing flags [68, 264].
*   `~/.gemini/GEMINI.md` (User home): Establishes global constraints enforced across every workspace on the machine [35, 501].

---

## 15. Complete Path Inventory

Standard file layouts across product platforms:

*   **Global Preferences & Logs:**
    *   `~/.gemini/antigravity-cli/settings.json`: CLI preferences [69].
    *   `~/.gemini/antigravity-cli/keybindings.json`: Hotkey overrides [69].
    *   `~/.gemini/antigravity-cli/state.json`: Installation ID and onboarding state [69, 72].
    *   `~/.gemini/antigravity-cli/cli.log`: Primary diagnostic log [66, 69].
    *   `~/.gemini/config/config.json`: Master extensibility configuration [72].
    *   `~/.gemini/config/import_manifest.json`: Conversion history of Gemini CLI extensions [72].
    *   `~/.gemini/projects.json`: Database mapping directory paths to project labels [72].

*   **Conversation Databases & Transcripts:**
    *   `~/.gemini/antigravity-cli/conversations/<conversation_id>.db`: Conversation SQLite store [70].
    *   `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript.jsonl`: Escape-string tool argument log [70, 86].
    *   `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript_full.jsonl`: Native JSON tool argument log [70, 86].

*   **Local Workspace Customizations:**
    *   `.agents/skills/`: Workspace-scoped skills directory [18].
    *   `.agents/rules/`: Workspace modular rules markdown files [35].
    *   `.agents/hooks.json`: Workspace-level hooks JSON [38].
    *   `.agents/mcp_config.json`: Workspace Model Context Protocol configuration [33].

---

## 16. Undocumented Behavioral Contracts & Live Conflicts

Live-system auditing of `agy 1.1.12` resolved five critical behavioral discrepancies:

*   **Changelog Discrepancy (Bug #1):** The official changelog claims `agy agents` and `agy models` accept `--output-format json` [135]. **Testing proves this is false (EV-002, EV-003)** [82]; the CLI fails with a hard error [82].
*   **Rules Reporting Gap (Bug #2):** Although rule files can be shipped inside plugins under `rules/` [619, 636], **`agy plugin list` completely fails to report the rules component** in its JSON payload (EV-007) [27, 28, 82].
*   **Hooks Enumeration Bug (Bug #3):** Running `/hooks` inside headless print mode returns an empty list `hooks: []` [82], even when completely valid active `hooks.json` are loaded globally and locally (EV-016) [40, 82].
*   **Workspace Agent Exclusion (Bug #4):** The CLI command `agy agents` and headless mode `agy -p --agent <name>` are **completely blind to workspace-scoped custom agents** defined in `.agents/agents/` (EV-004) [25, 26, 82]. Interactive selector panels are the only surfaced discovery channels [25, 26].
*   **Headless Hook Omission (Bug #5):** Live system probe **EV-020** resolved the hook execution confound: headless mode (`agy -p`) does not load or fire workspace pre/post-tool lifecycle hooks defined in `.agents/hooks.json` [41, 59, 81].

---

## 17. Unified 20 Native Schemas Matrix

The schema toolkit manages and audits all **20 native JSON configuration and runtime schemas** across the product boundaries [4, 94]:

| # [94] | Schema Key | Model Class | Standard File / Location | Purpose |
| ------ | ------ | ------ | ------ | ------ |
| 1 | `settings` | `SettingsSchema` | `~/.gemini/antigravity-cli/settings.json` | General user preferences [94]. |
| 2 | `plugin` | `PluginManifestSchema`| `plugins/<name>/plugin.json` | Plugin package identifier and metadata [94]. |
| 3 | `agent` | `AgentFrontmatterSchema`| `.agents/agents/<name>.md` | YAML custom persona definitions [94]. |
| 4 | `skill` | `SkillFrontmatterSchema`| `.agents/skills/<name>/SKILL.md` | YAML skill activations [94]. |
| 5 | `mcp` | `MCPConfigSchema` | `~/.gemini/config/mcp_config.json` | MCP stdio/SSE server connections [94]. |
| 6 | `hooks` | `HooksConfigSchema` | `~/.gemini/config/hooks.json` | Pre/Post tool event hooks config [94]. |
| 7 | `transcript` | `TranscriptStepSchema` | `brain/<id>/.system/logs/transcript.jsonl` | Line-level runtime conversation step logs [94]. |
| 8 | `keybindings` | `KeybindingsSchema` | `~/.gemini/antigravity-cli/keybindings.json` | Custom keybindings [94]. |
| 9 | `status_line` | `StatusLinePayloadSchema`| Custom Stdio status script | Status Line JSON payload [94]. |
| 10 | `master_config` | `MasterConfigSchema` | `~/.gemini/config/config.json` | Plugin enabling states and shared permissions [94]. |
| 11 | `projects` | `ProjectsIndexSchema` | `~/.gemini/projects.json` | Workspace directory mapping index [94]. |
| 12 | `desktop_state` | `DesktopStateSchema` | `~/.gemini/antigravity/state.pbtxt` | Standalone app onboardings [94]. |
| 13 | `ide_state` | `IDEStateSchema` | `~/.gemini/antigravity-ide/` | IDE conversations and html counts [94]. |
| 14 | `rule` | `RuleFileSchema` | `.agents/rules/*.md` | Markdown glob and manual constraints [94]. |
| 15 | `cli_state` | `CLIStateSchema` | `~/.gemini/antigravity-cli/state.json` | CLI runtime state [94]. |
| 16 | `history` | `CLIHistoryEntrySchema` | `~/.gemini/antigravity-cli/history.jsonl` | CLI prompt history entries [94]. |
| 17 | `trusted_hooks` | `TrustedHooksSchema` | `~/.gemini/trusted_hooks.json` | Script/Statusline trusted folder list [94]. |
| 18 | `import_manifest`| `ImportManifestSchema` | `~/.gemini/config/import_manifest.json`| Legacy extension migration logs [94]. |
| 19 | `workflow` | `WorkflowFrontmatterSchema`| `.agents/workflows/<name>.md` | Markdown title and step playbooks [4, 94].|
| 20 | `hook_payload` | `HookPayloadSchema` | Custom hook stdin/stdout IPC | Live Pre/Post tool stdout decisions [4, 94]. |

---

## 18. Sourced Slices bibliography & References

Deduplicated bibliography of references used to construct and verify this technical manual [88]:

1.  **Hooks Spec:** `https://antigravity.google/docs/hooks` [88:1]
2.  **MCP Spec:** `https://antigravity.google/docs/mcp` [88:2]
3.  **Settings Guide:** `https://antigravity.google/docs/cli/settings` [88:3]
4.  **CLI Reference:** `https://antigravity.google/docs/cli/reference` [88:4]
5.  **Subagents Specification:** `https://antigravity.google/docs/subagents` [88:5]
6.  **Sandbox Spec:** `https://antigravity.google/docs/cli/sandbox` [88:6]
7.  **Permissions Config:** `https://antigravity.google/docs/cli/permissions` [88:7]
8.  **Skills Spec:** `https://antigravity.google/docs/skills` [88:8]
9.  **Plugins Spec:** `https://antigravity.google/docs/plugins` [88:9]
10. **Headless Mode Spec:** `https://antigravity.google/docs/cli/headless` [88:10]
11. **Projects Command:** `https://antigravity.google/docs/cli/projects` [88:11]
12. **Conversations Guide:** `https://antigravity.google/docs/cli/conversations` [88:12]
13. **Artifacts Spec:** `https://antigravity.google/docs/cli/artifacts` [88:13]
14. **Status Line Customizer:** `https://antigravity.google/docs/cli/statusline` [88:14]
15. **Terminal Title Customizer:** `https://antigravity.google/docs/cli/title` [88:15]
16. **Troubleshooting:** `https://antigravity.google/docs/cli/troubleshooting` [88:16]
17. **CLI Best Practices:** `https://antigravity.google/docs/cli/best-practices` [88:17]
18. **Enterprise Docs:** `https://antigravity.google/docs/enterprise` [88:18]
19. **Reasoning Models:** `https://antigravity.google/docs/models` [88:19]
20. **Rules & Workflows:** `https://antigravity.google/docs/rules-workflows` [88:20]
21. **Agent Settings:** `https://antigravity.google/docs/agent-settings` [88:21]
22. **Artifact Review:** `https://antigravity.google/docs/artifact-review` [88:22]
23. **Browser Use:** `https://antigravity.google/docs/ide/browser` [88:23]
24. **Allowlist / Denylist:** `https://antigravity.google/docs/ide/allowlist-denylist` [88:24]
25. **Agent Side Panel:** `https://antigravity.google/docs/ide/agent-side-panel` [88:25]
26. **Separate Chrome Profile:** `https://antigravity.google/docs/ide/separate-chrome-profile` [88:26]
27. **Screenshots:** `https://antigravity.google/docs/screenshots` [88:27]
28. **Implementation Plan:** `https://antigravity.google/docs/implementation-plan` [88:28]
29. **Google Antigravity Landing Page:** `https://antigravity.google/docs/` [88:29]
30. **SDK Quick Start:** `https://antigravity.google/docs/sdk/overview` [88:30]
31. **Installation & Auth:** `https://antigravity.google/docs/cli/install` [88:31]
32. **Migration (Gemini CLI):** `https://antigravity.google/docs/cli/gcli-migration` [88:32]
33. **IDE Rules Spec:** `https://antigravity.google/docs/ide/rules` [88:33]
34. **IDE Workflows:** `https://antigravity.google/docs/ide/workflows` [88:34]
35. **SDK MCP Configuration:** `https://antigravity.google/docs/sdk/mcp` [88:35]
36. **Sidecars Specification:** `https://antigravity.google/docs/sidecars` [88:36]
37. **Task Groups:** `https://antigravity.google/docs/task-groups` [88:37]
38. **Ecosystem Tools:** `https://antigravity.google/docs/tools` [88:38]
39. **FAQ page:** `https://antigravity.google/docs/faq` [88:39]
40. **CLI Modes:** `https://antigravity.google/docs/cli/modes` [88:40]
41. **Vim Editor Mode:** `https://antigravity.google/docs/cli/vim-editor-mode` [88:41]
42. **AI Credits:** `https://antigravity.google/docs/cli/credits` [88:42]
43. **IDE Hooks:** `https://antigravity.google/docs/ide/hooks` [88:43]
44. **IDE Settings:** `https://antigravity.google/docs/ide/settings` [88:44]
45. **IDE Plugins:** `https://antigravity.google/docs/ide/plugins` [88:45]
46. **IDE MCP Integration:** `https://antigravity.google/docs/ide/mcp` [88:46]
47. **Agents Command (/agents):** `https://antigravity.google/docs/cli/commands/agents` [91:60]
48. **Code Search Command (/codesearch):** `https://antigravity.google/docs/cli/commands/codesearch` [91:61]
49. **AI Credits Command (/credits):** `https://antigravity.google/docs/cli/commands/credits` [91:62]
50. **Diff Command (/diff):** `https://antigravity.google/docs/cli/commands/diff` [91:63]
51. **Permissions Command (/permissions):** `https://antigravity.google/docs/cli/commands/permissions` [91:64]
52. **Resume Command (/resume):** `https://antigravity.google/docs/cli/commands/resume` [91:65]
53. **Status Line Command (/statusline):** `https://antigravity.google/docs/cli/commands/statusline` [91:66]
54. **Window Title Command (/title):** `https://antigravity.google/docs/cli/commands/title` [91:67]
55. **Model Quotas (/usage):** `https://antigravity.google/docs/cli/commands/usage` [91:68]
56. **IDE Overview:** `https://antigravity.google/docs/ide/overview` [91:69]
57. **IDE Getting Started:** `https://antigravity.google/docs/ide/getting-started` [91:70]
58. **CLI Overview:** `https://antigravity.google/docs/cli/overview` [91:71]
59. **CLI Features:** `https://antigravity.google/docs/cli/features` [91:72]
60. **CLI Prompting:** `https://antigravity.google/docs/cli/prompting` [91:73]
61. **Codelab Agent Skills 101:** `https://codelabs.developers.google.com/getting-started-with-antigravity-skills` [89:47]
62. **Gemini CLI Configuration:** `https://geminicli.com/docs/reference/configuration/` [89:48]
63. **SDK Announcement Blog:** `https://antigravity.google/blog/introducing-google-antigravity-sdk` [89:49]
64. **antigravity-sdk-python official repo:** `https://github.com/google-antigravity/antigravity-sdk-python` [89:50]
65. **CLI API-key Auth Feature Request:** `https://github.com/google-antigravity/antigravity-cli/issues/78` [89:51]
66. **Model Context Protocol Specification:** `https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro` [90:52]
67. **Third Party integrations:** `https://docs.claude-mem.ai/antigravity-cli/setup` [90:53]
68. **Security considerations:** `https://embracethered.com/blog/posts/2026/scary-agent-skills/` [90:54]
69. **community skill conventions:** `https://github.com/omnifaces/claude-faces-expert` [90:55]
70. **SDK developer guide (K. Weinmeister):** `https://www.linkedin.com/pulse/google-antigravity-sdk-developer-guide-karl-weinmeister-nymsc` [90:56]
71. **community extension bugs:** `https://github.com/microsoft/vscode-dotnettools/issues/2557` [90:57]
72. **SDK integration setups:** `https://github.com/rsamborski/run-agy-sdk` [90:58]
73. **Gemini CLI shutdown guide:** `https://harshrastogi.tech/blog/gemini-cli-shutdown-antigravity-migration-guide` [90:59]

---

### Systems-Engineering Audit Sign-off:
*"This unified specification represents a complete and rigorous map of the Google Antigravity Ecosystem. By auditing live binaries alongside official docs, we have minimized configuration drift and eliminated critical developer blind spots."*
**— Senior Systems Engineer, Antigravity Systems Schema Extraction Expert**
