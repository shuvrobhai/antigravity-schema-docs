## 10. Headless Mode

`[DOCS]` — Re-verified against live docs 2026-08-11 and live `agy 1.1.12` 2026-08-13.

**Run flags:** `-p`, `--print`, `--prompt`

**Full flag reference:**

| Flag | Default | Description |
|---|---|---|
| `-p`, `--print`, `--prompt` | — | Run a single prompt non-interactively and print the response |
| `--output-format` | `text` | `text`, `json`, or `stream-json` |
| `--json-schema` | — | Schema string, `.json` file path, or primitive type name (`string`, `number`, `integer`, `boolean`) |
| `--model` | — | Model slug for the run (list with `agy models`) |
| `--effort` | — | Reasoning effort: `low`, `medium`, `high` |
| `--agent` | — | Agent for the run (list with `agy agents`) |
| `--continue`, `-c` | `false` | Continue the most recent conversation |
| `--conversation` | — | Resume a conversation by ID |
| `--dangerously-skip-permissions` | `false` | Auto-approve all tool permission requests |
| `--print-timeout` | `5m` | Maximum time to wait for a response |
| `--sandbox` | `false` | Run with terminal sandbox restrictions enabled |
| `--add-dir` | `[]` | Add a directory to the workspace (repeatable) |
| `--disable-slash-commands` | `false` | Disable slash command and skill expansion in print mode |
| `--log-file` | — | Override CLI log file path |
| `--mode` | — | Agent execution mode: `accept-edits`, `plan` |
| `--prompt-interactive`, `-i` | — | Run an initial prompt interactively and continue the session |

**Status enum (complete, re-verified):**

| Status | Meaning |
|---|---|
| `SUCCESS` | Run completed and produced a response |
| `ERROR` | Run ended with an error |
| `CANCELED` | Run was canceled |
| `INTERRUPTED` | Run was interrupted (e.g., SIGINT) |
| `INVALID` | Run reached an invalid state |
| `WAITING` | Run ended while waiting on input |
| `RUNNING` | Run did not reach a terminal state |

**Exit codes:** `0` on success; non-zero when no response is produced (reason written to stderr). In `json`/`stream-json` modes, failures also surface in the `status` and `error` fields. Pinning an unknown `--model` exits non-zero with `ERROR` — no silent fallback.

**Note on `--agent` (verified hands-on 2026-08-11 and live 1.1.12):** unlike `--model`, `--agent` does **not** reject unknown names in headless mode — a run with `--agent definitely-not-an-agent` succeeds silently with the default agent. Custom agents (including plugin-shipped ones) are discoverable via `agy agents`. Headless loading of **workspace-scoped** custom agents was **MEASURED 2026-08-11 and does not occur**: a fixture workspace's plugin agent (`marker-agent`) and plain workspace agent (`workspace-control`) both returned the default agent's generic reply under `-p --agent <name>` — their marker system prompts never fired, and unknown names fall back silently too. Global plugin agents (e.g. `self-auditor`) are the only custom agents confirmed to load (interactive session, transcript `a1e51ef2`). Note the surface split: the interactive TUI `/agents` selector **does** list workspace-scoped agents (user-verified 2026-08-11); only headless `--agent` and `agy agents` ignore them.

**Live `agy agents` scope correction** `[LIVE-1.1.12 · 2026-08-13]` `EV-004`: `agy agents` lists global and plugin-shipped agents only. Workspace agents are not listed and not loaded by headless `-p --agent`. The interactive TUI `/agents` selector remains the only verified surface for discovering workspace agents.

**JSON Envelope (`--output-format json`):**

| Field | Type | Presence |
|---|---|---|
| `conversation_id` | string | Always |
| `status` | string | Always (see status enum) |
| `response` | string | Always |
| `error` | string | Failure only |
| `duration_seconds` | number | Always |
| `num_turns` | number | Always |
| `structured_output` | object | With `--json-schema` only |
| `json_schema` | object | With `--json-schema` only |
| `usage` | object | `input_tokens`, `output_tokens`, `thinking_tokens`, `cache_read_tokens`, `total_tokens` |
| `command` | object | Read-only slash commands only `[LIVE-1.1.12 · 2026-08-13]` |

**Command object addition** `[LIVE-1.1.12 · 2026-08-13]`:

Read-only slash commands in print mode now include a `command` object. Observed for:

```text
/skills
/permissions
/hooks
```

Example:

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
    "data": {}
  }
}
```

These commands consume zero quota.

**Structured `/permissions` output** `[LIVE-1.1.12 · 2026-08-13]` `EV-015`:

```text
command.data.permissions[]:
scope: "project" | "shared" | "global"
allow?: string[]
deny?: string[]
ask?: string[]
```

**Structured `/skills` output** `[LIVE-1.1.12 · 2026-08-13]` `EV-012`:

```text
command.data.skills[]:
name: string
description: string
path: string
builtin: boolean
model_invocable: boolean
plugin?: string
```

**Streaming (`--output-format stream-json`):** Newline-delimited JSON (NDJSON) events: `init` (once), `step_update` (per step transition or text delta), `result` (once, same shape as `json`). `step_update` payloads carry `state` (`ACTIVE`/`DONE`), `step_type` (`user_input`, `agent_response`, `tool`, `checkpoint`), `tool_name`, `text_delta`, `usage`, `tool_info` (`name`, `parameters`, `output`, `error{type,message}`), and `subagent_info` (`subagents` with `type_name`, `role`, `conversation_id`, `log_uri`, `workspace_uris`). The `init` payload records `cwd`, `tools`, `permission_mode` (`request-review` default; `always-proceed` under `--dangerously-skip-permissions`), and optional `model`/`agent`/`json_schema`.

**Permissions in headless:** No interactive prompts exist. Tools requiring approval are soft-denied: the run continues, exits `0`, and prints a stderr notice naming the tool. Pre-grant via `permissions.allow` rules in `~/.gemini/antigravity-cli/settings.json`, or auto-approve with `--dangerously-skip-permissions`. Workspace reads/writes are auto-allowed.

**Subcommands:** `agy models` lists model slugs (e.g., `gemini-3.6-flash-high`, `gemini-3.6-flash-medium`, `gemini-3.5-flash-medium`, `gemini-3.1-pro-high`, `claude-sonnet-4-6`); `agy agents` lists available agents (global + plugin-shipped); `agy plugin` manages plugins; see Section 7 for the full subcommand inventory. Note: `agy models` and `agy agents` can hang in some contexts (observed 2026-08-11) — likely awaiting a network call. **Live 1.1.12 conflict:** neither `agy agents` nor `agy models` accepts `--output-format`, despite the changelog explicitly claiming "Added machine-readable output to the `models` and `agents` subcommands through an `--output-format` flag accepting `json` and `stream-json`" (v1.1.12 changelog, confirmed verbatim). This is a confirmed changelog-vs-binary inconsistency.

**Authentication:** Cached credentials (OAuth) required. Non-interactive environments without cached credentials get `authentication required` error. **API-key authentication is NOT supported by the CLI as of 2026-08-13:** feature request `google-antigravity/antigravity-cli#78` (open) proposes `GEMINI_API_KEY`/`ANTIGRAVITY_API_KEY` env detection and a `--api-key` flag; a Google staff comment (2026-06-29) states "Gemini API Key is not supported currently... For using an API key in Antigravity you can use the SDK." Community guides showing `export ANTIGRAVITY_API_KEY=...` for the CLI `[COMMUNITY]` should be treated as unverified — the same variable **is** used in SDK-based CI workflows (e.g. the `run-agy-sdk` GitHub Action) `[COMMUNITY]`, where the officially documented env var is `GEMINI_API_KEY` `[GOOGLE]` (see §4.10).

**Project flag:** `--project=<project_id>` combinable with headless mode. **Official Projects documentation** `[DOCS]`:

- Default project: `default-cli-project`
- Open session in specific project: `agy --project=<project_id>`
- Create new project: `agy --new-project`
- Resumed conversations automatically use their stored project.
- Fork conversation: `/fork <project_id>`
