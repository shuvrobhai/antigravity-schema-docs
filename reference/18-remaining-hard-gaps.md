## 18. Remaining Hard Gaps

These are specific pieces of information that no source — official, Google-owned, community, or live — has fully resolved:

| Gap | Status | Impact | How to Resolve |
|---|---|---|---|
| **Headless hook execution vs permission-skip** | **INCONCLUSIVE:** Both probes (EV-017, EV-018) used `--dangerously-skip-permissions`, making it impossible to determine which factor suppressed hook execution. Three possible explanations remain: (1) `--dangerously-skip-permissions` suppresses hooks by design (most likely, and would be a reasonable safety feature); (2) headless `-p` mode never fires workspace hooks regardless of flags; (3) a CLI bug. Evidence tier: **Weak**. | Automation relying on headless hooks may be unsafe if explanation (2) is correct. If (1), simply avoid the flag when hooks are needed. | **Priority test:** Run the same hook probe without `--dangerously-skip-permissions` in a trusted workspace with `permissions.allow` pre-configured to cover the test command. Compare marker output. |
| **`transcript.jsonl` field-level schema** | **RESOLVED 2026-08-11 (hands-on):** full line schema captured from live `agy` 1.1.11 sessions; see §18.1. Transcripts confirmed at `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript.jsonl` (+ `transcript_full.jsonl`). | No longer a blocker. | — |
| **Headless mode `status` enum values** | **RESOLVED 2026-08-11:** `SUCCESS`, `ERROR`, `CANCELED`, `INTERRUPTED`, `INVALID`, `WAITING`, `RUNNING`. Exit codes also documented: `0` success, non-zero failure. | No longer a blocker. | — |
| **`general.defaultApprovalMode` enum values** | **RESOLVED 2026-08-11:** `default`, `auto_edit`, `plan` (default: `default`). Docs relocated to `geminicli.com`; old `google.github.io` URL 404s. | Minor migration impact. | — |
| **Plugin `agents/` subdirectory** | **RESOLVED 2026-08-11 (hands-on) for the global path:** plugins DO support `agents/` (and `commands`) components — `agy plugin list` reports `agents` on installed plugins (`self-customizer` ships `agents/self-auditor.md`), `agy agents` lists `self-auditor`, and the `self-auditor` transcript proves execution. The plugins docs page directory structure is incomplete. **Workspace-scoped `.agents/plugins/` agents (MEASURED 2026-08-11): surfaced only in the interactive TUI** — not listed by `agy agents`, not loaded by headless `--agent` (silent fallback), not tracked by `agy plugin list`; but the TUI `/agents` selector lists them (user-verified). See §4.4 and §17. | Global path: no longer a blocker. Workspace path: TUI = works; headless/CLI = not surfaced (silent fallback). | Fixture: `tests/fixtures/plugin-workspace/` |
| **CLI brain directory path** | **RESOLVED 2026-08-11 (hands-on):** actual CLI path is `~/.gemini/antigravity-cli/brain/<conversation_id>/`. The docs' statusline example (`~/.gemini/antigravity/brain/`) is stale — it mirrors the desktop path. Officially confirmed 2026-08-13. | No longer a blocker. | — |

---

## 18.1 Transcript Schema — Verified Hands-On (2026-08-11)

Source: live `agy` 1.1.11 sessions — 2 headless probes plus an interactive `self-auditor` agent run (72 entries, 40 tool calls across view_file/list_dir/find_by_name/grep_search/run_command). Enum completeness further verified by a full-brain audit (2026-08-11): **49,586 lines across 33 sessions** scanned with `scripts/audit_transcripts.py`; evidence at `audits/transcript-audit-2026-08-10.json` in the reference repo. Files confirmed at:

- `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript.jsonl`
- `~/.gemini/antigravity-cli/brain/<conversation_id>/.system_generated/logs/transcript_full.jsonl`

Both files share the same line schema. Difference observed: `transcript_full.jsonl` stores tool-call args as native JSON values; `transcript.jsonl` stores them as escaped strings.

**Line schema (one JSON object per line):**

| Field | Type | Presence | Notes |
|---|---|---|---|
| `step_index` | int | Always | Zero-based step order |
| `source` | enum | Always | `USER_EXPLICIT`, `SYSTEM`, `MODEL` — complete (audit confirmed no others) |
| `type` | enum | Always | Full-brain audit (2026-08-11) confirmed 19 values: `USER_INPUT`, `CONVERSATION_HISTORY`, `PLANNER_RESPONSE`, `CHECKPOINT`, `ERROR_MESSAGE`, `VIEW_FILE`, `LIST_DIRECTORY`, `FIND`, `GREP_SEARCH`, `RUN_COMMAND`, `ASK_QUESTION`, `CODE_ACTION`, `EPHEMERAL_MESSAGE`, `GENERIC`, `INVOKE_SUBAGENT`, `MCP_TOOL`, `READ_URL_CONTENT`, `SEARCH_WEB`, `SYSTEM_MESSAGE`. Additional values observed in live `~/.gemini/` (2026-08-13): `TOOL_CALL`, `SUBAGENT_DELEGATION`, `SUBAGENT_RESPONSE`, `RECOVERY`. Tool entries use the SCREAMING_SNAKE tool name; `CODE_ACTION` (3,756×) and `ASK_QUESTION` (225×) are the most common non-doc values |
| `status` | enum | Always | `DONE` (49,070×), `RUNNING` (408×, in-progress/background steps), `ERROR` (108×, failed steps) — complete per audit; the earlier `ACTIVE` guess is superseded |
| `created_at` | string | Always | ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`) — present on all observed entries; added to `TranscriptStepSchema` 2026-08-13 |
| `content` | string | Optional | `USER_INPUT`: prompt wrapped in `<USER_REQUEST>`/`<ADDITIONAL_METADATA>`/`<USER_SETTINGS_CHANGE>` tags; `PLANNER_RESPONSE`: model reply; `RUN_COMMAND`: command output; `CHECKPOINT`: truncation summary with `{{ CHECKPOINT N }}` marker |
| `thinking` | string | Optional | Model reasoning; observed on `PLANNER_RESPONSE` |
| `tool_calls` | array | Optional | Tools invoked on `PLANNER_RESPONSE`. Each: `{name, args}`; `args` are tool-specific (e.g. `CommandLine`, `Cwd`, `WaitMsBeforeAsync`, `toolAction`, `toolSummary` for `run_command`) |
| `exit_code` | int | Optional | Observed on `RUN_COMMAND` |

**Implications for tooling:**

- The `created_at` field is UTC, but tool-output `content` opens with a `Created At`/`Completed At` header in LOCAL time (with offset) — parse accordingly.
- `conversation_id` is **not** stored in the file — derive it from the directory name.
- Checkpoint entries embed absolute paths to the log files.
- `step_index` is not necessarily contiguous: one `PLANNER_RESPONSE` may issue multiple `tool_calls`, leaving gaps between entries.
- Tool entries expose their args in `PLANNER_RESPONSE.tool_calls` — each `{name, args}` where args carry tool-specific fields (e.g. `AbsolutePath` for view_file, `DirectoryPath` for list_dir, `CommandLine`/`Cwd`/`WaitMsBeforeAsync` for run_command) plus metadata fields `toolAction` and `toolSummary`.
- `ERROR_MESSAGE` entries (source `SYSTEM`) embed the failure text with `Guidance` and `Retries remaining: N`; they carry no `exit_code`.
- `status` distinguishes lifecycle: `RUNNING` marks in-progress steps (e.g. background `RUN_COMMAND` with task id), `ERROR` marks failed steps, `DONE` marks completion.
- `MCP_TOOL` entries carry MCP tool output (e.g. `Found 3 collections`); `ASK_QUESTION` entries embed the user's answers (`A1: ...`) in `content`; `INVOKE_SUBAGENT` entries embed subagent creation JSON.
- `LIST_DIRECTORY` output is JSON-lines: `{"name": ..., "sizeBytes": ...}` per entry.
- In the headless probe run, `RUN_COMMAND` executed with `Cwd` = `~/.gemini/antigravity-cli` (the CLI config dir) rather than the invocation directory — an interactive run used the correct workspace cwd, so this looks headless-specific; verify before relying on cwd in automation.
