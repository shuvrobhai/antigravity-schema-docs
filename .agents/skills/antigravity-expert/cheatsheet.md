# Google Antigravity Cheatsheet & Decision Matrices

Quick-reference tables, CLI commands, configuration precedence, and architectural rules of thumb.

---

## 1. CLI Commands & Quick Flags (`agy`)

| Command / Flag | Purpose | Example |
|---|---|---|
| `agy` | Launch interactive terminal pair programming session | `agy` |
| `agy --resume <ID>` | Resume prior conversation session by ID | `agy --resume c77e6671` |
| `agy --model <model>` | Override active model tier (`pro`, `flash`, `inherit`) | `agy --model gemini-2.5-pro` |
| `agy --policy <policy>` | Set command execution policy (`sandbox`, `auto`, `eager`, `off`) | `agy --policy sandbox` |
| `agy --approval <mode>` | Set tool approval mode (`default`, `auto_edit`, `plan`) | `agy --approval auto_edit` |
| `agy doctor` | Diagnose environment, MCP connections, and quota health | `agy doctor --json` |
| `agy audit --dir <path>` | Run AJV schema compliance audit against workspace directory | `agy audit --dir . --fix` |

---

## 2. Configuration Precedence & Resolution Matrix

| Resource Type | Project-Local | User CLI Profile | Global / System Root | Resolution Behavior |
|---|---|---|---|---|
| **Settings** | `.agents/settings.json` | `~/.gemini/antigravity-cli/settings.json` | `~/.gemini/config/settings.json` | Shallow merge (Local > CLI > Global) |
| **Rules** | `AGENTS.md`, `.agents/rules/*.md` | `~/.gemini/antigravity-cli/rules/` | `~/.gemini/GEMINI.md`, `~/.gemini/config/rules/` | Directory walk-up merge + Global (Max 12k chars/file) |
| **Skills** | `.agents/skills/<name>/` | `~/.gemini/antigravity-cli/skills/<name>/` | `~/.gemini/config/skills/<name>/` | Dual-root scan; local overrides global |
| **MCP Servers** | `mcp_config.json`, `.agents/mcp_config.json` | `~/.gemini/antigravity-cli/mcp_config.json` | `~/.gemini/config/mcp_config.json` | Merged server keys |
| **Hooks** | `hooks.json`, `.agents/hooks.json` | `~/.gemini/antigravity-cli/hooks.json` | `~/.gemini/config/hooks.json` | Merged event arrays |

---

## 3. Schema Checklist (20 Native JSON Schemas)

| Schema ID | Canonical Path | Primary Validation Target |
|---|---|---|
| `settings` | `settings.json` | Security policies, tool approval, theme |
| `mcp_config` | `mcp_config.json` | Stdio/Remote MCP connectors, headers, timeout |
| `hooks` | `hooks.json` | Lifecycle handlers for 5 hook events |
| `hook_payload` | Stdin/Stdout validation | Typed event context and step injection payloads |
| `plugin` | `plugins/<name>/plugin.json` | Plugin package manifest and components |
| `skill` | `.agents/skills/<name>/SKILL.md` | Skill YAML frontmatter (`name`, `description`, `metadata`) |
| `agent` | `.agents/agents/<name>.md` | Custom subagent persona, tools, execution policy |
| `rule` | `.agents/rules/<name>.md` | Behavioral rules, triggers (`always_on`, `glob`), activation |
| `workflow` | `.agents/workflows/<name>.md` | Sequential multi-step automation recipes |
| `status_line` | Hook status payload | Real-time CLI footer metrics and telemetry |
| `transcript_step` | `.system_generated/logs/*.jsonl` | Structured conversation event transcript records |

---

## 4. Decision Rules & Heuristics

1. **Rule vs. Skill**:
   - Use a **Rule** when you want a *boundary* or *constraint* that is always active (e.g. "Always write TypeScript in strict mode").
   - Use a **Skill** when you want a *procedure* or *workflow* loaded on-demand (e.g. "Step-by-step TDD refactoring guide").
2. **Subagent vs. Workflow**:
   - Use a **Subagent** when delegating open-ended autonomous tasks requiring separate context and tool permissions.
   - Use a **Workflow** (`/workflow-name`) when executing a deterministic, multi-phase sequence of instructions in the main thread.
3. **Stdio vs. Remote MCP**:
   - Use **Stdio** (`command` + `args`) for local CLI binaries (`npx`, `docker`, Python scripts).
   - Use **Remote** (`serverUrl` + `headers`) for centralized corporate microservices or SSE endpoints.
