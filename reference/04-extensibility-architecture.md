## 4. Extensibility Architecture

Antigravity CLI supports seven extensibility mechanisms.

### 4.1 Progressive Disclosure Engine

This is an officially documented three-phase design pattern `[DOCS]`:

| Phase | What Loads | When | Token Cost |
|---|---|---|---|
| **Phase 1 — Metadata** | `name` and `description` from YAML frontmatter | Session start | ~100 tokens per skill `[GOOGLE]` |
| **Phase 2 — Instructions** | Full `SKILL.md` body | Agent determines relevance | <5,000 tokens recommended `[GOOGLE]` |
| **Phase 3 — Resources** | `scripts/`, `examples/`, `resources/` subdirectories | On demand | Variable |

**Phase 1 token costs and Phase 2 size recommendations** come from the Agent Skills 101 Codelab `[GOOGLE]`, not from the official docs pages.

### 4.2 Skills System

**Definition:** Skills are an open standard for extending agent capabilities. A skill is a folder containing a `SKILL.md` file with instructions that the agent can follow `[DOCS]`.

Skills are agent-triggered — the model detects intent and dynamically loads relevant skills. Unlike System Prompts (always loaded), Skills load on demand `[DOCS]`.

**Paths:** `[DOCS]`

| Scope | Path |
|---|---|
| **Global** | `~/.gemini/config/skills/<skill-folder>/` |
| **Workspace** | `<workspace-root>/.agents/skills/<skill-folder>/` |

Note: `.agent/skills` (singular) supported for backward compatibility `[DOCS]`.

**Live-verified additional skill roots** `[LIVE-1.1.12 · 2026-08-13]`:

From `agy -p "/skills" --output-format json` `EV-012`:

```text
<HOME>/.gemini/config/skills/
<HOME>/.gemini/antigravity-cli/skills/
<HOME>/.gemini/config/plugins/<plugin>/skills/
<HOME>/.gemini/antigravity-cli/plugins/<plugin>/skills/
```

Corrected report statement:

> Antigravity CLI loads skills from both global skill roots and both plugin roots.

**SKILL.md Format:** `[DOCS]`

```
---
name: my-skill
description: Helps with a specific task. Use when you need to do X or Y.
---

# My Skill

Detailed instructions for the agent go here.

## When to use this skill
- Use this when...

## How to use it
Step-by-step guidance...
```

**Frontmatter Specification:** `[DOCS]`

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | **No** | Folder name | Unique identifier (lowercase, hyphens) |
| `description` | **Yes** | — | What the skill does and when to use it |
| `metadata` | No | `{}` | Optional arbitrary metadata object `[LIVE-1.1.12 · 2026-08-13]` |
| `disable-slash-command` | No | `false` | Hides the skill from the `/` menu and `/name` resolution while leaving it discoverable and invocable by the model. Useful when a large skill library floods the command menu. Added in v1.1.12. `[DOCS]` |

**These are the only two required frontmatter fields for Skills.** Attributes such as `disable-model-invocation`, `argument-hint`, and `user-invocable` are not documented in official sources. For granular execution control, use Custom Agents (Section 4.3).

**Live-verified frontmatter addition** `[LIVE-1.1.12 · 2026-08-13]` `EV-012`:

```yaml
---
name: self-customize
metadata:
  category: Tooling
  version: 1.1.0
description: >-
  ...
---
```

**Model invocability:** `model_invocable` is now live-verified `[LIVE-1.1.12 · 2026-08-13]`. In structured `/skills` output, it is always present and observed as `true` or `false`.

**Tip:** Write descriptions in third person with keywords for recognition. Example: "Generates unit tests for Python code using pytest conventions." `[DOCS]`

**Folder Structure:** `[DOCS]`

```
.agents/skills/my-skill/
├── SKILL.md       # Main instructions (required)
├── scripts/       # Helper scripts (optional)
├── examples/      # Reference implementations (optional)
└── resources/     # Templates and other assets (optional)
```

**Progressive Disclosure Behavior:** `[DOCS]`

1. **Discovery:** Agent sees skill names and descriptions at session start
2. **Activation:** If relevant, agent reads full `SKILL.md` content
3. **Execution:** Agent follows instructions while working

Explicit mention of a skill by name ensures use, but is not required `[DOCS]`.

**Best Practices:** `[DOCS]`

- Keep skills focused — one skill per distinct task
- Write clear, specific descriptions
- Use scripts as black boxes — encourage `--help` first
- Include decision trees for complex skills

**Structured `/skills` output** `[LIVE-1.1.12 · 2026-08-13]`:

`command.data.skills[]` object schema:

```json
{
  "name": "self-customizer:self-customize",
  "description": "...",
  "path": "<HOME>/.gemini/config/plugins/self-customizer/skills/self-customize/SKILL.md",
  "plugin": "self-customizer",
  "builtin": false,
  "model_invocable": true
}
```

| Field | Presence |
|---|---|
| `name` | always |
| `description` | always |
| `path` | always |
| `builtin` | always |
| `model_invocable` | always |
| `plugin` | plugin skills only |

### 4.3 Custom Agents

**Definition:** Reusable persona definitions in Markdown format with YAML frontmatter. Define *who* the agent is (capabilities, tools, execution policy, model) rather than *what* to do `[DOCS]`.

Two creation paths:

1. **File-based:** `.agents/agents/<name>.md` — persistent, discoverable
2. **Tool-based:** `define_subagent` tool — ephemeral, session-scoped

**Discovery Locations:** `[DOCS]`

| Location | Path | Scope |
|---|---|---|
| Workspace | `.agents/agents/<name>.md` or `.agents/agents/<name>/agent.md` | Repository |
| Global | `~/.gemini/config/agents/<name>.md` or `.../agents/<name>/agent.md` | Machine-wide |
| Plugins | `plugins/<plugin_name>/agents/` | Bundled package |

**Frontmatter Specification:** `[DOCS]`

| Property | Type | Default | Description |
|---|---|---|---|
| `name` | string | **Required** | Unique identifier |
| `description` | string | **Required** | Used by planner to determine delegation |
| `tools` | string[] | `[]` | Permitted tools (e.g., `view_file`, `run_command`) |
| `mainAgent` | boolean | `true` | Allow selection as primary agent in chat |
| `subagent` | boolean | `true` | Allow invocation via `invoke_subagent` |
| `model` | string | `inherit` | Model tier (`inherit`, `flash`, `pro`) |
| `commandExecutionPolicy` | string | `sandbox` | Shell command policy (`off`, `auto`, `eager`, `sandbox`) |
| `mcpServers` | object[] | `[]` | Custom MCP servers for this subagent |
| `skills` / `plugins` | string[] | `[]` | Skill paths or plugin dependencies |

**Live-verified frontmatter notes** `[LIVE-1.1.12 · 2026-08-13]` `EV-011`:

- `skills` accepts both bare names and plugin-qualified paths:
  ```yaml
  skills:
    - plugins/mattpocock-skills/skills/code-review
    - plugins/superpowers/skills/receiving-code-review
  ```
  ```yaml
  skills:
    - file-search
    - obsidian-markdown
    - writing-clearly-and-concisely
  ```
- `model` accepts `inherit` and `pro` in live agent files.
- `subagent: true` and `mainAgent: true` are **not** mutually exclusive; both were observed together.

**Known Issue (documented):** Misspelled tool names in the `tools` list may cause the subagent to hang. Fix planned `[DOCS]`.

**Example (`code-auditor.md`):** `[DOCS]`

```yaml
---
name: code-auditor
description: Specialized subagent for security audits, static analysis, and code quality reviews.
tools:
  - view_file
  - grep_search
  - run_command
subagent: true
mainAgent: false
model: pro
commandExecutionPolicy: sandbox
skills:
  - skills/security-checklist
---

# System Prompt
You are an expert security auditor and code reviewer.

# Review Guidelines
1. Perform thorough static analysis without altering files unless explicitly asked.
2. Flag potential injection flaws, unvalidated inputs, or hardcoded secrets.
3. Provide concise, actionable remediation steps.
```

**Built-in Subagents:** `[DOCS]`

| Name | Purpose | Invocation |
|---|---|---|
| `research` | Codebase research, file navigation, structural exploration | Via `invoke_subagent` |
| `browser` | Sandboxed web browser testing | Exclusively via `/browser` |
| `self` | Clone of calling agent with identical system instructions and toolsets | Via `invoke_subagent` |

**Subagent Lifecycle States:** `[DOCS]`

| State | Behavior |
|---|---|
| **Running** | Actively executing. Can be cancelled (`k` in CLI) or interrupted by parent. |
| **Done** | Task completed successfully. Visible as `done` in the `/agents` panel. |
| **Error** | Subagent encountered an error. Visible as `error` in the `/agents` panel. |
| **Killed** | Permanently terminated. Worktrees cleaned up. Historical transcripts remain in JSONL logs. |

Note: The main document previously listed **Idle** as a lifecycle state — this was inferred from the subagents documentation and is not confirmed in the `/agents` panel documentation. The `/agents` panel displays `running`, `done`, `error`, and `killed`. The `idle` state may exist internally but is not surfaced in the UI.

**Inline Tool Approvals in `/agents` Panel:** `[DOCS]`

When a subagent attempts a protected operation (e.g., modifying a file outside the sandbox or running a non-allowed command), the authorization prompt displays inline in the `/agents` panel. Press `a` to approve or `d` to deny directly from the list. This avoids context-switching between the subagent and the main session.

**Agent Switching Behavior:** `[DOCS]`

If you are currently inside an active conversation, switching custom agents via `/agents` automatically forks your current session. This creates a new conversation with the selected agent while preserving the original.

**Inter-Agent Communication:** `[DOCS]`

| Aspect | Detail |
|---|---|
| Routing | Via unique agent conversation IDs |
| Topology | Parent ↔ subagent, peer ↔ peer (if ID known) |
| Auto-Wake | Messages to idle subagents trigger re-awakening |
| Shared Transcripts | Agents can read each other's conversation transcripts |
| Nesting Limit | **Maximum 10 levels** (strictly enforced) |

**Permissions Inheritance:** `[DOCS]`

Subagents inherit terminal command prefixes, file read/write scopes, and sandbox settings from parent. Parent retains full access to subagent workspaces. Tool authorization requests bubble up to the main UI.

**Multi-Agent Teamwork:** `[DOCS]`

| Aspect | Detail |
|---|---|
| Command | `/teamwork-preview` |
| Availability | Ultra Plan ($200/mo) only |
| Status | Preview |
| Features | Error recovery, automatic retries, task coordination |

**Workspace Options:** `[DOCS]`

| Mode | Behavior |
|---|---|
| `inherit` | Read-only copy of parent workspace |
| `branch` | Isolated Git worktree (read-write, merge-back) |
| `share` | Direct access to parent workspace |

**Live `agy agents` scope correction** `[LIVE-1.1.12 · 2026-08-13]` `EV-004`:

```
Available agents:
code-reviewer
documentation-writer
self-auditor
```

Discovered sources:

| Agent | Source |
|---|---|
| `code-reviewer` | `<HOME>/.gemini/config/agents/code-reviewer/agent.md` |
| `documentation-writer` | `<HOME>/.gemini/config/agents/documentation-writer/agent.md` |
| `self-auditor` | `<HOME>/.gemini/config/plugins/self-customizer/agents/self-auditor.md` |

Corrected statement:

> `agy agents` lists **global and plugin-shipped agents only**.
>
> Workspace-scoped agents are **not** listed by `agy agents` and are **not** loaded by headless `-p --agent`.
>
> The interactive TUI `/agents` selector remains the only verified surface for discovering workspace agents.

### 4.4 Plugins

**Definition:** Namespaced bundles that group skills, rules, MCP servers, and hooks into a single package `[DOCS]`.

**Directory Structure (docs version):** `[DOCS]`

```
plugins/<plugin-name>/
├── plugin.json       # Required marker file
├── mcp_config.json   # Optional MCP server definitions
├── hooks.json        # Optional hooks definition
├── skills/           # Optional skills
│   └── <skill-name>/
│       └── SKILL.md
└── rules/            # Optional rules
    └── <rule-name>.md
```

**Directory Structure (live-verified component detection):** `[LIVE-1.1.12 · 2026-08-13]` `EV-007`

| Component | Live detection trigger |
|---|---|
| `skills` | root-level `skills/` directory |
| `agents` | root-level `agents/` directory |
| `commands` | root-level `commands/` directory |
| `hooks` | root-level `hooks.json` |
| `mcpServers` | root-level `mcp_config.json` |
| `rules` | documented, but **not** confirmed by `agy plugin list` |

`self-customizer` contains `rules/safety-guardrails.md`, but `agy plugin list` reported only `["skills", "agents", "hooks"]` — so `rules` was not surfaced despite existing.

**Manifest (`plugin.json`):** `[DOCS]`

```json
{
  "name": "my-custom-plugin"
}
```

The `name` field is **optional** — defaults to directory name.

**Live-observed manifest schema** `[LIVE-1.1.12 · 2026-08-13]` `EV-010`:

```json
{"name": "ponytail"}
```

```json
{"name": "product-management"}
```

```json
{
  "$schema": "https://antigravity.google/schemas/v1/plugin.json",
  "name": "self-customizer",
  "description": "Teaches antigravity-cli..."
}
```

```text
$schema      optional
name         observed in all manifests
description  optional
```

No other manifest keys were observed.

**Supported Components:** `[DOCS]` — Skills, Rules, MCP Servers, Hooks (4 components). **Verified hands-on 2026-08-11:** plugins also support `agents/` and `commands` components — the plugins page directory structure is **incomplete**.

**Agents component (verified hands-on):** The subagents page references `plugins/<plugin_name>/agents/` as a discovery location and the plugins page omits it — the **subagents page is correct**. Evidence chain: (1) `agy plugin list` reports `agents` as a component of installed plugins, e.g. `self-customizer` (source: `antigravity`), which ships `~/.gemini/config/plugins/self-customizer/agents/self-auditor.md`; (2) `agy agents` lists `self-auditor` alongside global agents — it is discoverable as a loadable agent. (Workspace-scoped `.agents/plugins/` agent discovery was **MEASURED 2026-08-11 — NOT surfaced on the CLI/headless surfaces**: a fixture workspace containing `.agents/plugins/marker-plugin/agents/marker-agent.md` and a plain `.agents/agents/workspace-control.md` was probed; `agy agents` run from inside that workspace listed only the three global/plugin agents, and headless `-p --agent <name>` for both fixture agents produced the default agent's generic reply — the marker system prompts never fired. `agy agents` also has no `--output-format json` mode. **Interactive TUI `/agents` DOES list workspace-scoped agents** (user-verified 2026-08-11) — discovery is surface-dependent: TUI = global + plugin + workspace; headless/CLI = global + plugin only, with silent fallback for anything else. Fixture preserved in the repo at `tests/fixtures/plugin-workspace/`.)

**Commands component (observed):** Plugins imported from gemini-cli / claude-code carry a `commands` component (e.g. `ponytail`, `product-management`) — also absent from the plugins page.

**plugin.json `$schema`:** Installed antigravity plugins reference `https://antigravity.google/schemas/v1/plugin.json`. However, a live fetch of this URL returned an error — the schema endpoint is either not publicly hosted, requires authentication, or has not been published. Downgraded from `[B]` to `[C]`. The `$schema` field may be aspirational or internally hosted. `[LIVE-1.1.12 · 2026-08-13]`

**Management surface (verified hands-on):** `agy plugin <command>` — `list` (JSON: `imports[]` with `name`, `source` (`antigravity`/`gemini-cli`/`claude-code`), `importedAt`, `components[]`), `import [source]`, `install <target>` (supports `plugin@marketplace`), `uninstall`, `enable`, `disable`, `validate [path]`, `link`.

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

**`agy plugin list` output schema** `[LIVE-1.1.12 · 2026-08-13]` `EV-006`:

```json
{
  "imports": [
    {
      "name": "obsidian",
      "source": "claude-code",
      "importedAt": "2026-06-18T13:01:21Z",
      "components": ["skills"]
    }
  ]
}
```

Observed `source` values:

```text
antigravity
claude-code
gemini-cli
```

Observed `components` values across install:

```text
skills
agents
hooks
commands
mcpServers
```

**Discovery Paths:** `[DOCS]`

| Scope | Path |
|---|---|
| Workspace | `.agents/plugins/` or `_agents/plugins/` |
| Global | `~/.gemini/config/plugins/` |

**Live-verified second plugin root** `[LIVE-1.1.12 · 2026-08-13]` `EV-008`:

| Path | Role |
|---|---|
| `<HOME>/.gemini/config/plugins/` | Imported plugins shown by `agy plugin list` |
| `<HOME>/.gemini/antigravity-cli/plugins/` | Local/developer plugins such as `hello-world`, `provider-database-tools` |

`agy plugin list` did **not** list the `antigravity-cli/plugins/` plugins.

**Two distinct plugin registries** `[LIVE-1.1.12 · 2026-08-13]` `EV-009`:

- `agy plugin list` = imported plugins
- `~/.gemini/config/config.json` = enabled/disabled state for a broader plugin set

Names present in `config.json` but absent from `agy plugin list`:

```text
antigravity-history-ingest
chrome-devtools-plugin
data
google-antigravity-sdk
modern-web-guidance-plugin
okf-knowledge
presentations
superpowers
```

**Adding Plugins:** `[DOCS]`

| Method | Description |
|---|---|
| Bundled (Build with Google) | Browse from Customizations page |
| Manual | Place in workspace or global plugin directories |

**MCP Store (IDE and Desktop):** `[DOCS]`

In addition to manual `mcp_config.json` configuration, Antigravity 2.0 and Antigravity IDE provide an **MCP Store** — a searchable, curated catalog of MCP servers accessible via the MCP Manager UI (`Add MCP` button). The MCP Store handles installation, authentication configuration, and versioning without requiring manual JSON editing. Confirmed integrations in the store include Figma `[DOCS]`, Google Workspace (Gmail, Drive, Docs, Sheets, Slides, Calendar, Chat, People) `[GOOGLE]`, and 50+ other services.

Note: MCP Store installations may configure authentication differently than manual `mcp_config.json` entries. If a server works via the Store but not via manual config, check the Store's installed configuration for reference.

### 4.5 Model Context Protocol (MCP)

**Definition:** Open standard connecting AI agents to local developer tools, databases, file parsers, and remote APIs `[DOCS]` + `[PROTOCOL]`.

**Configuration Paths:** `[DOCS]`

| Scope | Path |
|---|---|
| Global | `~/.gemini/config/mcp_config.json` |
| Workspace | `.agents/mcp_config.json` |

**Configuration Structure:** `[DOCS]`

```json
{
  "mcpServers": {
    "sqlite-explorer": {
      "command": "node",
      "args": ["/usr/local/bin/sqlite-mcp-server.js"],
      "env": { "SQLITE_DB_PATH": "/var/data/app.db" }
    },
    "my-remote-server": {
      "serverUrl": "https://api.example.com/mcp/",
      "headers": { "Authorization": "Bearer YOUR_API_TOKEN" }
    }
  }
}
```

**Configuration Properties:** `[DOCS]`

*Transport (one required):*

| Property | Type | Transport | Description |
|---|---|---|---|
| `command` | string | Stdio | Path to executable |
| `serverUrl` | string | Remote | **Required** for SSE, Streamable HTTP, or websocket connections |

**Warning:** The official docs state that legacy fields `url` and `httpUrl` are not supported and that `serverUrl` must be used `[DOCS]`. However, Google's own Developer Knowledge MCP setup guide (`developers.google.com/...`) shows `httpUrl` in an Antigravity CLI configuration example `[GOOGLE]`. **This discrepancy needs independent verification.** Possible explanations: (1) `httpUrl` still works as a deprecated alias; (2) the Developer Knowledge page is outdated; (3) the `serverUrl` requirement applies only to certain transport types. If migrating from Gemini CLI, test both fields against your installed version.

*Optional:*

| Property | Type | Description |
|---|---|---|
| `args` | string[] | CLI arguments for Stdio |
| `env` | object | Environment variables. Supports `$VAR`, `${VAR}`, `${VAR:-default}`, `%VAR%` (Windows) |
| `cwd` | string | Working directory for Stdio |
| `headers` | object | Custom HTTP headers for remote servers |
| `authProviderType` | string | `"google_credentials"` for Google ADC |
| `oauth` | object | `{clientId, clientSecret}` for manual OAuth |
| `disabled` | boolean | Temporarily disable without removing |
| `disabledTools` | string[] | Withhold specific tools from model |
| `timeout` | number | Request timeout |

**Authentication:** `[DOCS]`

| Method | Configuration | Details |
|---|---|---|
| Google Credentials | `"authProviderType": "google_credentials"` | Requires `gcloud auth application-default login` |
| OAuth (DCR) | No additional config | Automatic for servers supporting Dynamic Client Registration |
| OAuth (Manual) | `"oauth": {"clientId": "...", "clientSecret": "..."}` | Redirect URI: `https://antigravity.google/oauth-callback` |
| Custom Headers | `"headers": {"Authorization": "Bearer ..."}` | For API keys or bearer tokens |

**OAuth Token Storage:** `~/.gemini/antigravity/mcp_oauth_tokens.json` `[DOCS]`. Auto-refresh on expiry; auto-remove on invalidation.

**MCP Permissions:** `[DOCS]`

| Target Pattern | Scope |
|---|---|
| `mcp(server/tool)` | Specific tool on specific server |
| `mcp(server/*)` | All tools on specified server |
| `mcp(*)` | Any MCP tool across all servers |

Unconfigured MCP tools default to Ask mode.

**Interactive MCP Manager:** `/mcp` command. View status rings, reload configs, inspect logs `[DOCS]`.

**MCP Store:** 50+ direct integrations including AlloyDB, BigQuery, Bigtable, Chrome DevTools, ClickHouse, Cloud SQL (MySQL/PostgreSQL/SQL Server), Dataplex, Figma, Firebase, **Google Workspace (Gmail, Drive, Docs, Sheets, Slides, Calendar, Chat, People API)** `[GOOGLE]`, GitHub, GitLab, GKE, Heroku, Linear, MongoDB, Neon, Netlify, Notion, PayPal, Perplexity, Pinecone, PostHog, Postman, Prisma, Redis, Stripe, Supabase, and more `[DOCS]`.

**SDK Integration:** Antigravity SDK auto-discovers servers from `.agents/mcp_config.json` `[DOCS]`.

### 4.6 Rules

**Definition:** Markdown files defining constraints or guidelines for agent behavior `[DOCS]`.

| Scope | Path |
|---|---|
| Global | `~/.gemini/GEMINI.md` |
| Workspace | `.agents/rules/` |

Backward compat: `.agent/rules` (singular) `[DOCS]`.

**Size Limit:** 12,000 characters per rule file `[DOCS]`.

**Activation Modes:** `[DOCS]`

| Mode | Behavior |
|---|---|
| `Manual` | Activated via @ mention |
| `Always On` | Always applied |
| `Model Decision` | Agent decides based on rule description |
| `Glob` | Applied to files matching a pattern |

**@ File References:** Relative paths resolve from rules file location; absolute paths resolve directly; otherwise relative to repository `[DOCS]`.

### 4.7 Workflows

**Definition:** Markdown files with title, description, and step sequences `[DOCS]`.

| Aspect | Detail |
|---|---|
| Invocation | `/workflow-name` |
| Scope | Global or Workspace |
| Composition | Workflows can call other workflows |
| Execution | Sequential |
| Management | Customizations panel |

**Distinction from Rules:** Rules = persistent context at prompt level. Workflows = structured sequences at trajectory level `[DOCS]`.

### 4.8 Lifecycle Hooks

**Definition:** Run custom scripts at specific points during the execution loop `[DOCS]`.

**Configuration Paths:** `[DOCS]`

| Scope | Path |
|---|---|
| Workspace | `.agents/hooks.json` |
| Global | `~/.gemini/config/hooks.json` |

**Hook Schema:** `[DOCS]`

```json
{
  "my-linter-hook": {
    "PostToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/lint.sh",
            "timeout": 10
          }
        ]
      }
    ]
  },
  "safety-gate": {
    "enabled": false,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [{ "command": "./scripts/safety-check.sh" }]
      }
    ]
  }
}
```

**Hook Definition Fields:** `[DOCS]`

| Field | Type | Description |
|---|---|---|
| `enabled` | Boolean | Optional. `false` to disable without removing. Default `true`. |
| `PreToolUse` | Array | Before tool execution |
| `PostToolUse` | Array | After tool completion |
| `PreInvocation` | Array | Before model call |
| `PostInvocation` | Array | After model invocation |
| `Stop` | Array | When execution terminates |

**Confirmed Lifecycle Events:** `[DOCS]`

| Event | Description | Matcher Target |
|---|---|---|
| `PreToolUse` | Before tool execution | Tool name |
| `PostToolUse` | After tool completion | Tool name |
| `PreInvocation` | Before model call | N/A |
| `PostInvocation` | After model invocation | N/A |
| `Stop` | Execution terminates | N/A |

**Official Hooks documentation additions** `[DOCS]`:

- Events: `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`
- `PreInvocation`, `PostInvocation`, `Stop` ignore matcher
- Handler `type` defaults to `"command"`
- Handler `timeout` defaults to `30`
- Hook stdin common fields:

```text
conversationId
workspacePaths
transcriptPath
artifactDirectoryPath
modelName
```

- CLI transcript path officially confirmed:

```text
<app_data_dir>/brain/<conversationId>/.system_generated/logs/transcript.jsonl
```

For CLI:

```text
~/.gemini/antigravity-cli/brain/...
```

This resolves the stale docs path issue.

**Note:** Community sources reference `AfterAgent` and `AfterTool` event names `[COMMUNITY]`. These may be aliases for `PostInvocation` and `PostToolUse`. Discrepancy unresolved.

**Matcher Patterns:** `[DOCS]`

| Pattern | Behavior |
|---|---|
| `""` or `"*"` | Match all tools |
| `"run_command"` | Match exactly |
| `"run_command\|view_file"` | Match either |
| `"browser_.*"` | Regex prefix match |

**IPC:** JSON stdin/stdout. Non-zero exit from `PreToolUse` cancels execution `[DOCS]`.

**Live-verified gap — `/hooks` enumeration:** `[LIVE-1.1.12 · 2026-08-13]` `EV-016`

```bash
agy -p "/hooks" --output-format json
```

Result:

```json
{
  "name": "hooks",
  "data": {
    "hooks": []
  }
}
```

Even though valid files existed:

- `<HOME>/.gemini/config/plugins/self-customizer/hooks.json`
- `<HOME>/.gemini/config/plugins/i-have-adhd/hooks.json`
- controlled workspace `.agents/hooks.json`

**Live-verified gap — headless hook firing:** `[LIVE-1.1.12 · 2026-08-13]` `EV-017`, `EV-018`

Hooks did not fire in `-p` mode in two probe runs.

- **EV-017 — untrusted workspace:** Marker file `MARKER MISSING`; agent completed command successfully.
- **EV-018 — trusted workspace:** Marker file `MARKER MISSING`; agent completed command successfully.

**Confound:** Both probe runs used `--dangerously-skip-permissions`.

Therefore the current statement is:

> Headless `-p` did not execute workspace `PreToolUse` hooks in live tests. It is unresolved whether this is a headless limitation, permission-skip suppression, or a CLI bug.

### 4.9 Component Relationships

`[DOCS]`

| Component | Analogy | Nature | Loading |
|---|---|---|---|
| MCP Servers | "Hands" | Persistent external connections | Always connected |
| Skills | "Brains" | Ephemeral task definitions | On-demand |
| Rules | "Laws" | Global constraints | Always loaded |
| Workflows | "Playbooks" | Multi-step orchestrations | On-demand |
| Agents | "Personas" | Capability profiles | On invocation |
| Plugins | "Packages" | Bundled combinations | On installation |
| Hooks | "Guards" | Lifecycle interceptors | Event-triggered |

### 4.10 Antigravity SDK Architecture

`[DOCS]` — Official SDK overview at `antigravity.google/docs/sdk/overview`; announcement at `antigravity.google/blog/introducing-google-antigravity-sdk` `[GOOGLE]`; source at `github.com/google-antigravity/antigravity-sdk-python` `[DOCS]`.

**What it is:** The Antigravity SDK (`pip install google-antigravity`, Apache 2.0, research preview) is a Python framework that "extends the same core agent harness that powers the Antigravity CLI and Antigravity 2.0" `[DOCS]`. It is a **pre-packaged runtime**, not a loop-building kit: agent logic is decoupled from where it runs `[DOCS]`, and a remotely-hosted harness is on the roadmap with no application rewrite `[GOOGLE]`.

**Bundled runtime binary:** The SDK ships a compiled runtime binary inside platform-specific PyPI wheels — cloning the repo alone is insufficient; always install from PyPI `[GOOGLE]`. Per the developer guide by Google Cloud's Karl Weinmeister: *"The Python SDK interfaces with a bundled Go harness over WebSockets. The local Go harness runs the core agentic loop and manages sandboxed tool execution. Python acts as the control plane"* `[COMMUNITY]` (author: Google Cloud Developer Advocate; the transport detail corroborates the official "same core agent harness" statement `[DOCS]`).

**Three-layer architecture** `[GOOGLE]`:

| Layer | Purpose | Key Classes |
|---|---|---|
| Layer 1 — Simplified | High-level, batteries-included entry point | `Agent`, `LocalAgentConfig` |
| Layer 2 — Session | Stateful session: step history, context compaction, token tracking | `Conversation`, `ChatResponse`, `Step`, `ToolCall`, `AgentConfig`, `HookRunner`, `ToolRunner`, `TriggerRunner` |
| Layer 3 — Adapter | Transport/backend abstraction (local = WebSocket to Go harness; designed for future remote backends) | `Connection`, `ConnectionStrategy`, `LocalConnection` |

**Tool model [DOCS]:** four tool sources (built-in tools, custom Python functions, MCP servers, and agent skills) share a unified execution pipeline `[DOCS]`; they share one streaming infrastructure and one safety-policy set `[GOOGLE]`.

**Safety policies [DOCS]:** declarative, deny-by-default. Default `LocalAgentConfig` enables built-in tools but applies `confirm_run_command()` (shell execution denied unless approved); full autonomy via `policies=[policy.allow_all()]`. Rules composed with `from google.antigravity.hooks.policy import deny, allow, ask_user` `[DOCS]`; evaluation is priority-based. `CapabilitiesConfig.disabled_tools` *removes* a tool's JSON schema from the context window (token savings); `policy.deny()` *blocks at runtime* while keeping the tool visible `[COMMUNITY]`.

**SDK hooks — a distinct system from CLI JSON hooks:** The SDK defines three programmatic **hook categories** `[DOCS]`, enforced by the type system. This differs from the JSON configuration hooks of §4.8 (event-triggered scripts over stdin/stdout IPC) — two separate hook systems for two surfaces (SDK vs CLI); do not conflate them:

| Category | Blocking | Can modify? | Use | Example |
|---|---|---|---|---|
| **Inspect** | No | No | Observe events (logging, metrics, audit trails) | `PostToolCallHook` |
| **Decide** | Yes | No | Approve/deny (policies are built on this) | `PreToolCallDecideHook` |
| **Transform** | Yes | Yes | Reshape data in transit, error recovery | `OnToolErrorHook` |

Nine concrete lifecycle points `[DOCS]` (including session start, pre/post turn, pre/post tool call `[DOCS]`; others like tool-error recovery, user-interaction handling, context compaction, and decorator shortcuts are Google-sourced `[GOOGLE]`).

**Multimodal input** `[DOCS]`: pass images, PDFs, audio, and video alongside text prompts. `from_file("spec.pdf")` auto-detects type/MIME; content classes (`Image(data=..., mime_type=..., description=...)`) accept raw bytes; prompts are mixed lists of text + content classes.

**SDK authentication** `[GOOGLE]`: Application Default Credentials (ADC) by default; `GEMINI_API_KEY` env var or `api_key=` in `LocalAgentConfig`; Vertex mode via `vertex=True` + `project`/`location` (or `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`). Community CI workflows commonly store the key as a secret named `ANTIGRAVITY_API_KEY` `[COMMUNITY]`. Default model: Gemini 3.5 Flash `[GOOGLE]`.

**Other capabilities:** streaming (accessing live model reasoning/output chunks as they are generated) `[DOCS]`, structured output utilizing Pydantic models `[DOCS]`, sub-agents (spawning child agents with independent tools and contexts to build multi-agent teams) `[DOCS]`, human-in-the-loop handlers (pausing execution to ask structured questions) `[DOCS]`, observability (turn and cumulative token usage, thinking traces) `[DOCS]`. Multi-cursor streaming, cascading safety policies, triggers, and thinking levels are `[GOOGLE]`.
