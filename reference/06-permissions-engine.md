## 6. Permissions Engine

### 6.1 Macro Level

`toolPermission` setting controls broad authorization flow `[DOCS]`:

| Mode | Behavior |
|---|---|
| `request-review` | Prompts for write/bash/web tools (default) |
| `proceed-in-sandbox` | Auto-runs if sandboxed; otherwise prompts |
| `strict` | Prompts for all non-read tools |
| `always-proceed` | No prompts |

### 6.2 Fine-Grained Level

```json
{
  "permissions": {
    "allow": ["command(git)", "read_file(/var/log/app)"],
    "deny": ["command(rm -rf)", "command(sudo)"],
    "ask": ["command(*)", "execute_url(aws.amazon.com)"]
  }
}
```

**Precedence:** Deny > Ask > Allow `[DOCS]`.

### 6.3 Action Types `[DOCS]`

| Action | Target | Default |
|---|---|---|
| `read_file` | path or `*` | Ask (workspace auto-allowed) |
| `write_file` | path or `*` | Ask (workspace auto-allowed) |
| `read_url` | domain or `*` | Ask |
| `execute_url` | domain or `*` | Ask |
| `command` | prefix/regex or `*` | Ask |
| `unsandboxed` | prefix or `*` | Ask |
| `mcp` | server/tool or `*` | Ask |

### 6.4 Implicit Rules `[DOCS]`

- Write implies Read (allowing `write_file` auto-grants `read_file`)
- Deny Read implies Deny Write
- Cross-platform path normalization applied

### 6.5 Default Behaviors `[DOCS]`

1. Workspace read/write = auto-allowed
2. Web browsing = Ask
3. Everything else = Ask

### 6.6 Browser Security `[DOCS]`

| Layer | Mechanism | Behavior |
|---|---|---|
| Denylist | Server-side (Google BadUrlsChecker) | Checked via RPC. Server unavailable = deny. Cannot be overridden. |
| Allowlist | Local text file | Initialized with `localhost`. Denylist takes precedence. |

### 6.7 Agent Settings (Desktop) `[DOCS]`

- **Terminal Command Auto Execution:** `Request Review` (default) or `Always Proceed`
- **Non-Workspace File Access:** Disabled by default. Agent limited to project folders + `~/.gemini/antigravity/`

### 6.8 Permission Inheritance `[DOCS]`

Subagents inherit terminal command prefixes, file scopes, and sandbox settings. Authorization requests bubble up to main UI.

### 6.9 Three Permission Scopes `[LIVE-1.1.12 · 2026-08-13]` `EV-015`

Permissions editor exposes three scopes.

| Scope | Backing file |
|---|---|
| `project` | workspace-level permissions |
| `shared` | `<HOME>/.gemini/config/config.json → userSettings.globalPermissionGrants` |
| `global` | `<HOME>/.gemini/antigravity-cli/settings.json → permissions` |

Interactive `/permissions`:

```text
Permissions — Global
Permissions — Shared with Antigravity
Permissions — Project
```

Structured `/permissions`:

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

`command.data.permissions[]` object shape:

```text
scope: "project" | "shared" | "global"
allow?: string[]
deny?: string[]
ask?: string[]
```

`project` may appear with no arrays when empty:

```json
{"scope": "project"}
```

Observed list prefixes in `response` text:

```text
global<TAB>allow
global<TAB>deny
shared<TAB>allow
shared<TAB>deny
```
