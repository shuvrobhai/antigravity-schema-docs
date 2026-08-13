# Master Evidence File — Antigravity CLI Live Verification

**Live binary:** agy 1.1.12  
**Date:** 2026-08-13  
**Platform:** macOS Darwin 25.4.0 / arm64  
**Redaction:** `<HOME>` replaces the user home directory path.

---

## Evidence Summary

| ID | Subject | Result |
|----|---------|--------|
| EV-001 | `agy --version` | `1.1.12` |
| EV-002 | `agy agents --output-format json` | flag rejected |
| EV-003 | `agy models --output-format json` | flag rejected |
| EV-004 | `agy agents` | only global + plugin agents listed |
| EV-005 | `agy plugin -h` | full plugin subcommands confirmed |
| EV-006 | `agy plugin list` | JSON imports schema confirmed |
| EV-007 | plugin component detection | `rules` not surfaced for self-customizer |
| EV-008 | CLI plugin root | separate local plugin root confirmed |
| EV-009 | `config.json` vs `agy plugin list` | config contains additional plugin names |
| EV-010 | `plugin.json` manifests | minimal schema confirmed |
| EV-011 | agent frontmatter | skill path styles + model values confirmed |
| EV-012 | structured `/skills` output | skill object schema + roots confirmed |
| EV-013 | `settings.json` | live settings schema confirmed |
| EV-014 | `config.json` userSettings | live enum values confirmed |
| EV-015 | three permission scopes | project/shared/global confirmed |
| EV-016 | headless `/hooks` | returns empty `hooks: []` |
| EV-017 | untrusted workspace hook probe | hook did not fire |
| EV-018 | trusted workspace hook probe | hook did not fire |
| EV-019 | `keybindings.json` | absent by default |
| EV-020 | Headless hook probe (no permission skip) | hook did not fire (confound resolved) |

---

## EV-001 — CLI Version

**Command:**

```bash
agy --version
```

**Observed output:**

```text
1.1.12
```

**Interpretation:**  
All findings below are from version `1.1.12`.

---

## EV-002 — `agy agents --output-format json`

**Command:**

```bash
agy agents --output-format json
```

**Observed output:**

```text
Usage: agy agent [flags]

List available agents

Flags:
  -h      Show help
  --help  Show help
Error: flags provided but not defined: -output-format
```

**Interpretation:**  
The `1.1.12` changelog claim of machine-readable output for `agents` is not live-verified; the flag is rejected.

---

## EV-003 — `agy models --output-format json`

**Command:**

```bash
agy models --output-format json
```

**Observed output:**

```text
Usage: agy models [flags]

List available models

Flags:
  -h      Show help
  --help  Show help
Error: flags provided but not defined: -output-format
```

**Interpretation:**  
Same conflict as `EV-002`: the machine-readable output flag is not implemented live.

---

## EV-004 — `agy agents`

**Command:**

```bash
agy agents
```

**Observed output:**

```text
Available agents:
code-reviewer
documentation-writer
self-auditor
```

**Interpretation:**  
Only global and plugin-shipped agents are listed. No workspace-scoped agents appear.

---

## EV-005 — `agy plugin -h`

**Command:**

```bash
agy plugin -h
```

**Observed output:**

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

**Interpretation:**  
Full plugin subcommand surface confirmed.

---

## EV-006 — `agy plugin list`

**Command:**

```bash
agy plugin list
```

**Observed output summary:**

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

**Interpretation:**  
`agy plugin list` returns JSON by default. Confirmed component values include:

```text
skills
agents
hooks
commands
mcpServers
```

---

## EV-007 — Plugin Component Detection

**Commands:**

```bash
find <HOME>/.gemini/config/plugins/self-customizer -maxdepth 5 -type f | sort
agy plugin list
```

**Observed:**  
`self-customizer` contains:

```text
rules/safety-guardrails.md
```

But `agy plugin list` reported components only:

```json
["skills", "agents", "hooks"]
```

**Interpretation:**  
`rules` is documented but not surfaced by `agy plugin list`.

---

## EV-008 — Two Plugin Roots

**Commands:**

```bash
ls <HOME>/.gemini/antigravity-cli/plugins/
ls <HOME>/.gemini/config/plugins/ | head
```

**Observed CLI plugin root:**

```text
hello-world
provider-database-tools
```

**Observed config plugin root:**  
Many imported plugins, including `self-customizer`, `ponytail`, `product-management`.

**Interpretation:**  
There are two separate plugin roots. `agy plugin list` reports only the config plugin root.

---

## EV-009 — `config.json` vs `agy plugin list`

**Commands:**

```bash
cat <HOME>/.gemini/config/config.json
agy plugin list
```

**Observed:**  
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

**Interpretation:**  
`config.json` tracks a broader installed-plugin state than the import registry shown by `agy plugin list`.

---

## EV-010 — `plugin.json` Manifests

**Commands:**

```bash
cat <HOME>/.gemini/config/plugins/ponytail/plugin.json
cat <HOME>/.gemini/config/plugins/product-management/plugin.json
cat <HOME>/.gemini/config/plugins/self-customizer/plugin.json
```

**Observed:**

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

**Interpretation:**  
`name` is always present in observed manifests. `$schema` and `description` are optional.

---

## EV-011 — Agent Frontmatter

**Commands:**

```bash
cat <HOME>/.gemini/config/agents/code-reviewer/agent.md
cat <HOME>/.gemini/config/agents/documentation-writer/agent.md
cat <HOME>/.gemini/config/plugins/self-customizer/agents/self-auditor.md
```

**Observed key snippets:**

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

**Interpretation:**  
Agent `skills` accept bare names and plugin-qualified paths. `model` values `inherit` and `pro` verified. `mainAgent` and `subagent` can both be `true`.

---

## EV-012 — Structured `/skills` Output

**Command:**

```bash
agy -p "/skills" --output-format json
```

**Observed structural summary:**

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

**Interpretation:**  
Read-only slash commands in print mode produce a `command` object. Skill roots confirmed:

```text
<HOME>/.gemini/config/skills/
<HOME>/.gemini/antigravity-cli/skills/
<HOME>/.gemini/config/plugins/<plugin>/skills/
<HOME>/.gemini/antigravity-cli/plugins/<plugin>/skills/
```

---

## EV-013 — `settings.json`

**Command:**

```bash
cat <HOME>/.gemini/antigravity-cli/settings.json
```

**Observed redacted keys:**

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

**Interpretation:**  
Live `settings.json` schema confirmed. `statusLine` was simpler than the full documented optional schema.

---

## EV-014 — `config.json` userSettings

**Command:**

```bash
cat <HOME>/.gemini/config/config.json
```

**Observed userSettings keys:**

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

**Observed enum examples:**

```text
ARTIFACT_REVIEW_MODE_TURBO
CASCADE_COMMANDS_AUTO_EXECUTION_OFF
BROWSER_JS_EXECUTION_POLICY_TURBO
AGENT_SETTING_POLICY_ALLOW
MESSAGE_DELIVERY_STRATEGY_NEXT_INVOCATION
THEME_MODE_LIGHT
```

**Interpretation:**  
`MasterConfigSchema` should include these live `userSettings` fields.

---

## EV-015 — Three Permission Scopes

**Interactive `/permissions` observed:**

```text
Permissions — Project
Permissions — Shared with Antigravity
Permissions — Global
```

**Structured `/permissions` observed:**

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

**Interpretation:**  
Three permission scopes are live and backed by separate files.

---

## EV-016 — Headless `/hooks`

**Command:**

```bash
agy -p "/hooks" --output-format json
```

**Observed output:**

```json
{
  "name": "hooks",
  "data": {
    "hooks": []
  }
}
```

**Interpretation:**  
Headless print mode does not enumerate hooks, even when valid hook files exist.

---

## EV-017 — Untrusted Workspace Hook Probe

**Command summary:**

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

**Observed result:**

```text
MARKER MISSING
status: SUCCESS
```

**Interpretation:**  
Hook did not fire in an untrusted temp workspace.

---

## EV-018 — Trusted Workspace Hook Probe

**Command summary:**

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

**Observed result:**

```text
MARKER MISSING
status: SUCCESS
```

**Interpretation:**  
Hook did not fire even in a trusted workspace.

**Confound:**  
Both probes used `--dangerously-skip-permissions`.

---

## EV-019 — `keybindings.json` Absence

**Command:**

```bash
cat <HOME>/.gemini/antigravity-cli/keybindings.json
```

**Observed output:**

```text
cat: <HOME>/.gemini/antigravity-cli/keybindings.json: No such file or directory
```

**Interpretation:**  
`keybindings.json` is not present by default; it is created after custom keybinding changes.

---

## EV-020 — Headless Hook Probe without Permission Skip

**Context & Motivation:**  
Probes EV-017 and EV-018 showed that workspace hooks defined in `.agents/hooks.json` failed to fire during headless mode (`agy -p`) execution. However, both previous probes included the `--dangerously-skip-permissions` flag, creating a potential confound: did the hook fail because `--dangerously-skip-permissions` actively bypasses hook lifecycle dispatch, or because headless print-mode itself does not execute hooks?

To resolve this confound, probe EV-020 tested headless mode execution **without** `--dangerously-skip-permissions`, granting required permissions ahead of time via `.agents/settings.json` and `.agents/permissions.json`.

**Command summary:**

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

**Observed result:**

```text
MARKER MISSING (/tmp/agy_hook_marker_exp01.txt was not created)
CLI status: SUCCESS (duration: 3.3s, num_turns: 1)
```

**Supplementary Probe EXP-02a (Absolute Path Command Hook):**

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

**Observed result:**

```text
MARKER MISSING (/tmp/agy_hook_marker_exp02a.txt was not created)
CLI status: SUCCESS
```

**Interpretation & Confound Resolution:**  
1. **Confound Resolved:** The failure of hooks to execute in EV-017 and EV-018 was **not** caused by `--dangerously-skip-permissions`.
2. **Headless Execution Omission:** In `agy 1.1.12`, non-interactive headless print mode (`agy -p`) does not load or execute lifecycle hooks (such as `PreToolUse` or `PostToolUse`) defined in workspace `.agents/hooks.json`, even when permissions are fully granted via configuration and no permission skip flags are passed.

