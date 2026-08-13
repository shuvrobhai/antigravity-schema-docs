## 15. Complete Path Inventory

### CLI Paths `[DOCS]`

| Path | Purpose |
|---|---|
| `~/.gemini/antigravity-cli/settings.json` | User preferences |
| `~/.gemini/antigravity-cli/keybindings.json` | Keybinding overrides. **Live 1.1.12:** absent by default; appears only after custom keybinding changes. |
| `~/.gemini/antigravity-cli/cache/last_conversations.json` | Session cache |
| `~/.gemini/antigravity-cli/cli.log` | Diagnostic log. **Live 1.1.12:** also `log/cli-<timestamp>.log` |
| `~/.gemini/antigravity-cli/updater/update.lock` | Self-updater advisory lock |
| `~/.gemini/antigravity-cli/updater/last_check.timestamp` | Self-updater 15-min TTL debounce marker |
| `~/.gemini/antigravity-cli/statusline.sh` | Example status line script path (per official statusline docs) |
| `~/.gemini/antigravity-cli/state.json` | CLI installation/runtime state `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/antigravity-cli/history.jsonl` | CLI prompt history `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/antigravity-cli/conversation_summaries.db` | Conversation summaries SQLite DB `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/antigravity-cli/installation_id` | Installation identifier `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/antigravity-cli/jetski_state.pbtxt` | Jetski state `[LIVE-1.1.12 · 2026-08-13]` |

**Conversation data (verified hands-on 2026-08-11):**

| Path | Purpose |
|---|---|
| `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript.jsonl` | Conversation transcript (JSONL; schema in §18.1) |
| `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript_full.jsonl` | Full transcript (native-typed tool args) |
| `~/.gemini/antigravity-cli/brain/<conversation_id>/scratch/` | Scratch directory |
| `~/.gemini/antigravity-cli/brain/<conversation_id>/.user_uploaded/` | User-uploaded files |
| `~/.gemini/antigravity-cli/conversations/<conversation_id>.db` | Conversation store (SQLite; `-shm`/`-wal` sidecars) |
| `~/.gemini/antigravity-cli/presence/<conversation_id>.lock` | Presence lock |
| `~/.gemini/tmp/ctx_<conversation_id>.json` | Context temp file |

Auto-update can be disabled with the `AGY_CLI_DISABLE_AUTO_UPDATE=true` environment variable `[DOCS]`.

**Live-observed CLI directories** `[LIVE-1.1.12 · 2026-08-13]`:

```text
agents/
bin/
brain/
builtin/
cache/
conversations/
crashes/
hooks/
implicit/
knowledge/
log/
mcp/
plugins/
presence/
rules/
scratch/
skills/
updater/
```

### Global Configuration `[DOCS]`

| Path | Purpose |
|---|---|
| `~/.gemini/config/skills/<name>/SKILL.md` | Global skills |
| `~/.gemini/config/mcp_config.json` | Global MCP servers |
| `~/.gemini/config/hooks.json` | Global hooks |
| `~/.gemini/config/plugins/<name>/` | Global plugins |
| `~/.gemini/config/agents/<name>/agent.md` | Global agents (recommended) |
| `~/.gemini/config/agents/<name>.md` | Global agents (flat file — backward compat) |
| `~/.gemini/GEMINI.md` | Global context rules |

**Live-verified additional roots** `[LIVE-1.1.12 · 2026-08-13]`:

| Path | Purpose |
|---|---|
| `~/.gemini/antigravity-cli/skills/` | CLI-local global skill root |
| `~/.gemini/antigravity-cli/plugins/` | Local/developer plugin root |
| `~/.gemini/config/plugins/<plugin>/skills/` | Plugin-shipped skills |
| `~/.gemini/antigravity-cli/plugins/<plugin>/skills/` | Local plugin-shipped skills |

### Workspace `[DOCS]`

| Path | Purpose |
|---|---|
| `.agents/skills/<name>/SKILL.md` | Workspace skills |
| `.agents/mcp_config.json` | Workspace MCP servers |
| `.agents/hooks.json` | Workspace hooks |
| `.agents/plugins/<name>/` | Workspace plugins |
| `.agents/agents/<name>/agent.md` | Workspace agents (recommended — directory pattern, as shown in official docs) |
| `.agents/agents/<name>.md` | Workspace agents (flat file — supported for backward compatibility) |
| `.agents/rules/` | Workspace rules |
| `GEMINI.md` | Workspace context rules |
| `AGENTS.md` | Workspace agent rules |

### 15.1 System Configuration Manifests & Security Exclusion Classification

#### System Manifests to INCLUDE & AUDIT:

| File Path | Schema Model | Purpose |
|---|---|---|
| `~/.gemini/config/config.json` | `MasterConfigSchema` | Master extensibility manifest storing enabled plugin states, global permission grants (allow/deny commands), browser JS execution policy, and artifact review modes. |
| `~/.gemini/config/import_manifest.json` | `ImportManifestSchema` | Cross-ecosystem plugin/skill migration history tracking source origins (`claude-code`, `gemini-cli`, `antigravity`) and components. `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/projects.json` | `ProjectsIndexSchema` | Map of all known workspace directory paths to project aliases. |
| `~/.gemini/antigravity/antigravity_state.pbtxt` | `DesktopStateSchema` | Antigravity 2.0 Desktop app state (`post_onboarding`, `seen_nuxs`, `agent_onboarding_completed`, `last_selected_agent_model`, `migrate_convos_into_projects`, `installation_uuid`, `migrate_retroactive_projects`, `migrations`). |
| `~/.gemini/antigravity-ide/` | `IDEStateSchema` | Antigravity IDE state (`installation_id`, `active_conversations_count`, `html_artifacts_count`, `browser_recordings`). |
| `~/.gemini/extension_integrity.json` | Cryptographic Verification Store | Extension integrity manifest verifying binary hashes and store cryptographic signatures. `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/trustedFolders.json` | JSON Key-Value Map | Trust policy map classifying folders into `TRUST_FOLDER` vs `DO_NOT_TRUST`. `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/trusted_hooks.json` | `TrustedHooksSchema` | Trusted statusline/script execution whitelist per directory. |
| `~/.gemini/config/trusted_hooks.json` | `TrustedHooksSchema` | Additional live-observed trusted hooks path; live contents `[]` `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/GEMINI.md` | `GEMINI.md` | Global behavioral constraints and user rules prompt. |
| `~/.gemini/antigravity-cli/state.json` | `CLIStateSchema` | CLI installation/runtime state `[LIVE-1.1.12 · 2026-08-13]` |
| `~/.gemini/antigravity-cli/history.jsonl` | `CLIHistoryEntrySchema` | CLI prompt history `[LIVE-1.1.12 · 2026-08-13]` |

**Live-observed `config.json` / `MasterConfigSchema`** `[LIVE-1.1.12 · 2026-08-13]` `EV-014`:

File path:

```text
<HOME>/.gemini/config/config.json
```

Observed `userSettings` keys:

```text
artifactReviewMode
autoExecutionPolicy
browserJsExecutionPolicy
enableTerminalSandbox
globalPermissionGrants
nonWorkspaceFileAccessPolicy
queuedMessageDeliveryStrategy
remoteControlHostname
themeMode
```

Observed enum examples:

```text
ARTIFACT_REVIEW_MODE_TURBO
CASCADE_COMMANDS_AUTO_EXECUTION_OFF
BROWSER_JS_EXECUTION_POLICY_TURBO
AGENT_SETTING_POLICY_ALLOW
MESSAGE_DELIVERY_STRATEGY_NEXT_INVOCATION
THEME_MODE_LIGHT
```

**Live-observed `projects.json` schema** `[LIVE-1.1.12 · 2026-08-13]`:

```json
{
  "projects": {
    "<absolute path>": "<project alias>"
  }
}
```

Duplicate basenames receive numeric suffixes:

```text
experiments
experiments-1
antigravity
antigravity-1
antigravity-skills-2
```

**Live-observed `trusted_hooks.json` schema** `[LIVE-1.1.12 · 2026-08-13]`:

```json
{
  "<directory-or-*>": [
    "statusLine:node <command>"
  ]
}
```

Observed hook type:

```text
statusLine
```

Also newly discovered path:

```text
<HOME>/.gemini/config/trusted_hooks.json
```

Live contents:

```json
[]
```

Purpose unverified.

**Live-observed `state.json` / `CLIStateSchema`** `[LIVE-1.1.12 · 2026-08-13]`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "runtimes": {
    "node": "v26.5.0",
    "python": "3.14.6",
    "docker": true,
    "gcloud": true
  },
  "providers": [
    {
      "id": "github",
      "status": "authenticated",
      "scopes": ["repo", "read:org", "workflow"]
    },
    {
      "id": "google",
      "status": "authenticated",
      "scopes": ["cloud-platform"]
    }
  ],
  "installed_tools": {
    "mcp_servers": [],
    "plugins": []
  }
}
```

**Live-observed `history.jsonl` / `CLIHistoryEntrySchema`** `[LIVE-1.1.12 · 2026-08-13]`:

```json
{
  "display": "/rewind",
  "timestamp": 1782007356100,
  "workspace": "<HOME>/.../RelayAI",
  "conversationId": "4b0bd273-012b-4068-837a-271bb16c42d8",
  "type": "slash_command"
}
```

`type` is optional; some slash-like entries omit it.

#### Sensitive & Transient Files to EXCLUDE & IGNORE:

| File / Folder | Classification | Reason |
|---|---|---|
| `~/.gemini/oauth_creds.json` | **SENSITIVE CREDENTIAL** | OAuth secret keys and access tokens (Strict Security Rule: NEVER read, output, or commit). |
| `~/.gemini/google_accounts.json` | **SENSITIVE CREDENTIAL** | Google Account user identifiers and authentication tokens. |
| `~/.gemini/antigravity-oauth-token` | **SENSITIVE CREDENTIAL** | Active OAuth session token payload. |
| `~/.gemini/antigravity-browser-profile/` | Transient Data | Local browser automation profiles, cookies, and local storage. |
| `~/.gemini/tmp/`, `crashes/`, `updater/` | Transient Data | Temporary IPC context dumps, crash stack traces, and updater lock files. |
| `~/.gemini/config/archived-skills/`, `config/backups/` | Legacy Archive | Superseded skill migration backups and stale setting backups (`.bak`). |

### Application `[DOCS]`

| Path | Purpose |
|---|---|
| `~/.gemini/antigravity/` | Desktop app data (CLI also references this tree for shared state) |
| `~/.gemini/antigravity/mcp_oauth_tokens.json` | OAuth tokens |
| `~/.gemini/antigravity/brain/...` | Desktop brain. **Note:** the official CLI statusline example shows this path, but the CLI's real transcript path (verified 2026-08-11 and officially confirmed 2026-08-13) is `~/.gemini/antigravity-cli/brain/...` — the docs example is stale. |

### System `[GOOGLE]`

| Path | Purpose |
|---|---|
| `/etc/gemini-cli/system-defaults.json` | System defaults (Linux) |
| `C:\ProgramData\gemini-cli\system-defaults.json` | System defaults (Windows) |
| `/Library/Application Support/GeminiCli/system-defaults.json` | System defaults (macOS) |
| `/etc/gemini-cli/settings.json` | System settings (Linux) |
| `C:\ProgramData\gemini-cli\settings.json` | System settings (Windows) |
| `/Library/Application Support/GeminiCli/settings.json` | System settings (macOS) |
| `~/.config/gcloud/application_default_credentials.json` | Google ADC |

### Install Paths `[DOCS]`

| Path | Platform |
|---|---|
| `~/.local/bin` | macOS/Linux |
| `C:\Users\<Username>\AppData\Local\agy\bin` | Windows (binary) |
| `C:\Program Files\Google\antigravity-cli` | Windows (PATH entry per troubleshooting docs) |
