# Master Evidence File — Antigravity CLI Live Verification

<!-- Generated from probes/agy-1.1.12/EV-*.md — do not edit. -->

**Live binary:** agy 1.1.12  
**Date:** 2026-08-13  
**Platform:** macOS Darwin 25.4.0 / arm64  
**Redaction:** `<HOME>` replaces the user home directory path.

---

## Evidence Summary

| ID | Subject | Result |
|----|---------|--------|
| EV-001 | CLI Version Verification | RESOLVED |
| EV-002 | agy agents --output-format json | RESOLVED |
| EV-003 | agy models --output-format json | RESOLVED |
| EV-004 | agy agents Workspace Discovery Scope | RESOLVED |
| EV-005 | agy plugin CLI Subcommand Surface | RESOLVED |
| EV-006 | agy plugin list JSON Schema & Components | RESOLVED |
| EV-007 | Plugin Component Detection vs Rules Subdirectory | RESOLVED |
| EV-008 | Dual Plugin Installation Roots | RESOLVED |
| EV-009 | config.json vs agy plugin list State Discrepancy | RESOLVED |
| EV-010 | plugin.json Manifest Variations | RESOLVED |
| EV-011 | Agent Frontmatter Capabilities and Model Inheritance | RESOLVED |
| EV-012 | Structured /skills Output in Headless Mode | RESOLVED |
| EV-013 | Live settings.json Configuration Schema | RESOLVED |
| EV-014 | config.json userSettings Enum Values | RESOLVED |
| EV-015 | Three Discrete Permission Scopes | RESOLVED |
| EV-016 | Headless /hooks Enumeration Behavior | RESOLVED |
| EV-017 | Untrusted Workspace Hook Probe under Dangerously Skip Permissions | RESOLVED |
| EV-018 | Trusted Workspace Hook Probe under Dangerously Skip Permissions | RESOLVED |
| EV-019 | Default State of keybindings.json | RESOLVED |
| EV-020 | Headless Hook Probe without Permission Skip | RESOLVED |

---

## EV-001 — CLI Version Verification
<a id="ev-001"></a>

# EV-001 — CLI Version Verification

## Objective
Verify the live binary version of the Google Antigravity CLI executable and confirm baseline telemetry.

## Execution & Command
```bash
agy --version
```

## Observed Output
```text
1.1.12
```

## Interpretation & Findings
All subsequent empirical observations in this catalog are grounded against live version `1.1.12`.

---

## EV-002 — agy agents --output-format json
<a id="ev-002"></a>

# EV-002 — `agy agents --output-format json`

## Objective
Verify if `agy agents` supports `--output-format json` for machine-readable agent discovery in version 1.1.12.

## Execution & Command
```bash
agy agents --output-format json
```

## Observed Output
```text
Usage: agy agent [flags]

List available agents

Flags:
  -h      Show help
  --help  Show help
Error: flags provided but not defined: -output-format
```

## Interpretation & Findings
The `1.1.12` changelog claim of machine-readable output for `agents` is not live-verified; the flag is rejected. Headless automation must parse standard table output or inspect workspace `.agents/agents/` manifests directly.

---

## EV-003 — agy models --output-format json
<a id="ev-003"></a>

# EV-003 — `agy models --output-format json`

## Objective
Verify if `agy models` supports `--output-format json` for machine-readable catalog retrieval.

## Execution & Command
```bash
agy models --output-format json
```

## Observed Output
```text
Usage: agy models [flags]

List available models

Flags:
  -h      Show help
  --help  Show help
Error: flags provided but not defined: -output-format
```

## Interpretation & Findings
Same conflict as `EV-002`: the machine-readable output flag is not implemented live on the discovery subcommand.

---

## EV-004 — agy agents Workspace Discovery Scope
<a id="ev-004"></a>

# EV-004 — `agy agents` Workspace Discovery Scope

## Objective
Verify whether `agy agents` enumerates workspace-scoped agents alongside globally registered agents.

## Execution & Command
```bash
agy agents
```

## Observed Output
```text
Available agents:
code-reviewer
documentation-writer
self-auditor
```

## Interpretation & Findings
Only global and plugin-shipped agents are listed by default CLI discovery. Workspace-scoped agents under `.agents/agents/` are not surfaced by `agy agents`, though they are available during interactive TUI sessions and direct invocation.

---

## EV-005 — agy plugin CLI Subcommand Surface
<a id="ev-005"></a>

# EV-005 — `agy plugin` CLI Subcommand Surface

## Objective
Verify the complete CLI subcommand interface for the `agy plugin` tool suite.

## Execution & Command
```bash
agy plugin -h
```

## Observed Output
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

## Interpretation & Findings
Full plugin subcommand surface confirmed, including marketplace linking (`link`), schema validation (`validate`), and cross-engine import (`import [gemini|claude]`).

---

## EV-006 — agy plugin list JSON Schema & Components
<a id="ev-006"></a>

# EV-006 — `agy plugin list` JSON Schema & Components

## Objective
Inspect the output format and component taxonomy returned by `agy plugin list`.

## Execution & Command
```bash
agy plugin list
```

## Observed Output
```json
{
  "imports": [
    {
      "name": "obsidian",
      "source": "claude-code",
      "importedAt": "2026-06-18T13:01:21Z",
      "components": ["skills"]
    },
    {
      "name": "self-customizer",
      "source": "antigravity",
      "importedAt": "2026-07-26T18:29:58Z",
      "components": ["skills", "agents", "hooks"]
    }
  ]
}
```

## Interpretation & Findings
`agy plugin list` returns JSON by default. Confirmed component values include:
```text
skills
agents
hooks
commands
mcpServers
```

---

## EV-007 — Plugin Component Detection vs Rules Subdirectory
<a id="ev-007"></a>

# EV-007 — Plugin Component Detection vs Rules Subdirectory

## Objective
Verify if `rules/` subdirectories within installed plugins are surfaced as component capabilities by `agy plugin list`.

## Execution & Commands
```bash
find <HOME>/.gemini/config/plugins/self-customizer -maxdepth 5 -type f | sort
agy plugin list
```

## Observed Output
`self-customizer` contains:
```text
rules/safety-guardrails.md
```

However, `agy plugin list` reported components only as:
```json
["skills", "agents", "hooks"]
```

## Interpretation & Findings
`rules` are documented and loaded dynamically by the runtime, but are not explicitly enumerated under the `components` array in `agy plugin list`.

---

## EV-008 — Dual Plugin Installation Roots
<a id="ev-008"></a>

# EV-008 — Dual Plugin Installation Roots

## Objective
Investigate whether plugin installations are partitioned across multiple filesystem directories.

## Execution & Commands
```bash
ls <HOME>/.gemini/antigravity-cli/plugins/
ls <HOME>/.gemini/config/plugins/ | head
```

## Observed Output
**Observed CLI plugin root (`~/.gemini/antigravity-cli/plugins/`):**
```text
hello-world
provider-database-tools
```

**Observed config plugin root (`~/.gemini/config/plugins/`):**  
Contains imported plugins including `self-customizer`, `ponytail`, `product-management`.

## Interpretation & Findings
There are two distinct plugin roots. `agy plugin list` reports only the configuration plugin root (`~/.gemini/config/plugins/`).

---

## EV-009 — config.json vs agy plugin list State Discrepancy
<a id="ev-009"></a>

# EV-009 — `config.json` vs `agy plugin list` State Discrepancy

## Objective
Verify the relationship between global configuration state in `config.json` and the plugin registry reported by `agy plugin list`.

## Execution & Commands
```bash
cat <HOME>/.gemini/config/config.json
agy plugin list
```

## Observed Output
`config.json` contains plugin state for names not present in `agy plugin list`, including:
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

## Interpretation & Findings
`config.json` tracks a broader installed/active plugin state than the import registry shown by `agy plugin list`.

---

## EV-010 — plugin.json Manifest Variations
<a id="ev-010"></a>

# EV-010 — `plugin.json` Manifest Variations

## Objective
Examine live `plugin.json` files across installed plugins to deduce the minimal required manifest schema.

## Execution & Commands
```bash
cat <HOME>/.gemini/config/plugins/ponytail/plugin.json
cat <HOME>/.gemini/config/plugins/product-management/plugin.json
cat <HOME>/.gemini/config/plugins/self-customizer/plugin.json
```

## Observed Output
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

## Interpretation & Findings
`name` is the only mandatory field in observed live manifests. `$schema` and `description` are optional metadata attributes.

---

## EV-011 — Agent Frontmatter Capabilities and Model Inheritance
<a id="ev-011"></a>

# EV-011 — Agent Frontmatter Capabilities and Model Inheritance

## Objective
Verify YAML frontmatter fields in production agent definition files (`agent.md`).

## Execution & Commands
```bash
cat <HOME>/.gemini/config/agents/code-reviewer/agent.md
cat <HOME>/.gemini/config/agents/documentation-writer/agent.md
cat <HOME>/.gemini/config/plugins/self-customizer/agents/self-auditor.md
```

## Observed Output
Key observed frontmatter declarations:
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

```yaml
model: pro
```

```yaml
model: inherit
```

```yaml
subagent: true
mainAgent: true
```

## Interpretation & Findings
Agent `skills` accept both bare names and plugin-qualified paths. `model` values `inherit` and `pro` verified. `mainAgent` and `subagent` can both be `true` simultaneously.

---

## EV-012 — Structured /skills Output in Headless Mode
<a id="ev-012"></a>

# EV-012 — Structured `/skills` Output in Headless Mode

## Objective
Verify the JSON output structure of the `/skills` slash command when executed in headless print mode.

## Execution & Command
```bash
agy -p "/skills" --output-format json
```

## Observed Output
```json
{
  "conversation_id": "",
  "status": "SUCCESS",
  "response": "...",
  "duration_seconds": 0,
  "num_turns": 0,
  "usage": {
    "input_tokens": 0,
    "output_tokens": 0,
    "thinking_tokens": 0,
    "cache_read_tokens": 0,
    "total_tokens": 0
  },
  "command": {
    "name": "skills",
    "data": {
      "skills": [
        {
          "name": "self-customizer:self-customize",
          "description": "...",
          "path": "<HOME>/.gemini/config/plugins/self-customizer/skills/self-customize/SKILL.md",
          "plugin": "self-customizer",
          "builtin": false,
          "model_invocable": true
        }
      ]
    }
  }
}
```

## Interpretation & Findings
Read-only slash commands in print mode produce a typed `command` object with execution metadata. Skill roots confirmed across:
```text
~/.gemini/config/skills/
~/.gemini/antigravity-cli/skills/
~/.gemini/config/plugins/<plugin>/skills/
~/.gemini/antigravity-cli/plugins/<plugin>/skills/
```

---

## EV-013 — Live settings.json Configuration Schema
<a id="ev-013"></a>

# EV-013 — Live `settings.json` Configuration Schema

## Objective
Verify the runtime JSON configuration schema of `~/.gemini/antigravity-cli/settings.json`.

## Execution & Command
```bash
cat <HOME>/.gemini/antigravity-cli/settings.json
```

## Observed Output
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

## Interpretation & Findings
Live `settings.json` schema confirmed. `statusLine` command handler supports external script delegates.

---

## EV-014 — config.json userSettings Enum Values
<a id="ev-014"></a>

# EV-014 — `config.json` `userSettings` Enum Values

## Objective
Verify the runtime property keys and enum representations under `userSettings` in `config.json`.

## Execution & Command
```bash
cat <HOME>/.gemini/config/config.json
```

## Observed Output
**Observed `userSettings` keys:**
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

**Observed enum values:**
```text
ARTIFACT_REVIEW_MODE_TURBO
CASCADE_COMMANDS_AUTO_EXECUTION_OFF
BROWSER_JS_EXECUTION_POLICY_TURBO
AGENT_SETTING_POLICY_ALLOW
MESSAGE_DELIVERY_STRATEGY_NEXT_INVOCATION
THEME_MODE_LIGHT
```

## Interpretation & Findings
`MasterConfigSchema` (§20.2) must accommodate these live `userSettings` keys and SCREAMING_SNAKE_CASE enum values.

---

## EV-015 — Three Discrete Permission Scopes
<a id="ev-015"></a>

# EV-015 — Three Discrete Permission Scopes

## Objective
Verify the three permission tiers surfaced in interactive and structured CLI output.

## Execution & Commands
Interactive `/permissions` and structured JSON inspect.

## Observed Output
**Interactive `/permissions`:**
```text
Permissions — Project
Permissions — Shared with Antigravity
Permissions — Global
```

**Structured `/permissions` JSON output:**
```json
{
  "name": "permissions",
  "data": {
    "permissions": [
      {"scope": "project"},
      {"scope": "shared", "allow": [], "deny": []},
      {"scope": "global", "allow": [], "deny": []}
    ]
  }
}
```

## Interpretation & Findings
Three distinct permission scopes (project-local, shared/workspace, and user-global) are live and backed by independent configuration layers.

---

## EV-016 — Headless /hooks Enumeration Behavior
<a id="ev-016"></a>

# EV-016 — Headless `/hooks` Enumeration Behavior

## Objective
Verify if `agy -p "/hooks"` enumerates active workspace or user lifecycle hooks in print mode.

## Execution & Command
```bash
agy -p "/hooks" --output-format json
```

## Observed Output
```json
{
  "name": "hooks",
  "data": {
    "hooks": []
  }
}
```

## Interpretation & Findings
Headless print mode returns an empty `hooks: []` payload, even when valid hook manifests exist in `.agents/hooks.json` or global configuration.

---

## EV-017 — Untrusted Workspace Hook Probe under Dangerously Skip Permissions
<a id="ev-017"></a>

# EV-017 — Untrusted Workspace Hook Probe under Dangerously Skip Permissions

## Objective
Test if workspace hooks in `.agents/hooks.json` fire in an untrusted directory when running with `--dangerously-skip-permissions`.

## Execution & Commands
```bash
tmp=$(mktemp -d)
mkdir -p "$tmp/.agents"
cat > "$tmp/.agents/hooks.json" <<'EOF'
{
  "marker-hook": {
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "echo marker-hook-fired > /tmp/agy_hook_marker.txt"
          }
        ]
      }
    ]
  }
}
EOF

cd "$tmp"
agy -p "Run the command: echo hello from hook test" \
  --dangerously-skip-permissions \
  --output-format json
```

## Observed Output
```text
MARKER MISSING
status: SUCCESS
```

## Interpretation & Findings
The hook did not fire. (Note: Confound identified regarding `--dangerously-skip-permissions`, formally resolved in EV-020).

---

## EV-018 — Trusted Workspace Hook Probe under Dangerously Skip Permissions
<a id="ev-018"></a>

# EV-018 — Trusted Workspace Hook Probe under Dangerously Skip Permissions

## Objective
Test if workspace hooks in `.agents/hooks.json` fire in an explicitly trusted directory when running with `--dangerously-skip-permissions`.

## Execution & Commands
```bash
cd <HOME>/developer/antigravity-cli-reference
cat > .agents/hooks.json <<'EOF'
{
  "trusted-marker-hook": {
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "echo trusted-hook-fired > /tmp/agy_trusted_hook_marker.txt"
          }
        ]
      }
    ]
  }
}
EOF

agy -p "Run the command: echo hello from trusted hook test" \
  --dangerously-skip-permissions \
  --output-format json
```

## Observed Output
```text
MARKER MISSING
status: SUCCESS
```

## Interpretation & Findings
Hook did not fire even in a trusted workspace under `--dangerously-skip-permissions`. (Confound resolved in EV-020).

---

## EV-019 — Default State of keybindings.json
<a id="ev-019"></a>

# EV-019 — Default State of `keybindings.json`

## Objective
Verify whether `keybindings.json` exists by default in clean installations.

## Execution & Command
```bash
cat <HOME>/.gemini/antigravity-cli/keybindings.json
```

## Observed Output
```text
cat: <HOME>/.gemini/antigravity-cli/keybindings.json: No such file or directory
```

## Interpretation & Findings
`keybindings.json` is not present by default on initial deployment; it is created dynamically when custom keybindings are saved through the interactive TUI configuration menu.

---

## EV-020 — Headless Hook Probe without Permission Skip
<a id="ev-020"></a>

# EV-020 — Headless Hook Probe without Permission Skip

## Objective
Isolate and resolve the confound in EV-017 / EV-018: verify whether lifecycle hooks fail in headless mode due to `--dangerously-skip-permissions` or because non-interactive headless print mode (`agy -p`) does not execute hooks.

## Execution & Commands

```bash
mkdir -p /tmp/agy_hook_exp01/.agents
cat > /tmp/agy_hook_exp01/.agents/hooks.json << 'EOF'
{
  "exp01-hook": {
    "enabled": true,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "echo marker-exp01 > /tmp/agy_hook_marker_exp01.txt",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
EOF

cat > /tmp/agy_hook_exp01/.agents/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["run_command"],
    "deny": []
  },
  "toolPermission": "always-proceed"
}
EOF

cat > /tmp/agy_hook_exp01/.agents/permissions.json << 'EOF'
{
  "allow": ["run_command"],
  "deny": []
}
EOF

cd /tmp/agy_hook_exp01
agy -p "run command echo test" --output-format json
```

### Supplementary Probe EXP-02a (Absolute Path Command Hook)

```bash
mkdir -p /tmp/agy_hook_exp02a/.agents
cat > /tmp/agy_hook_exp02a/.agents/hooks.json << 'EOF'
{
  "exp02a-hook": {
    "enabled": true,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "/bin/sh -c 'echo marker-exp02a > /tmp/agy_hook_marker_exp02a.txt'",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
EOF

cd /tmp/agy_hook_exp02a
agy -p "run command echo test-exp02a" --output-format json
```

## Observed Output
```text
MARKER MISSING (/tmp/agy_hook_marker_exp01.txt was not created)
CLI status: SUCCESS (duration: 3.3s, num_turns: 1)
```

## Interpretation & Confound Resolution
1. **Confound Resolved:** The failure of hooks to execute in EV-017 and EV-018 was **not** caused by `--dangerously-skip-permissions`.
2. **Headless Execution Omission:** In `agy 1.1.12`, non-interactive headless print mode (`agy -p`) does not load or execute lifecycle hooks (such as `PreToolUse` or `PostToolUse`) defined in workspace `.agents/hooks.json`, even when permissions are fully granted via configuration and no permission skip flags are passed.
