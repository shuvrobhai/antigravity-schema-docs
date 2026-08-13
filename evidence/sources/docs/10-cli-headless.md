---
source: 10
category: docs
title: Headless Mode
url: "https://antigravity.google/docs/cli/headless"
final_url: "https://antigravity.google/docs/cli/headless"
fetched: 2026-08-13
status: 200
---
# Headless mode

Run Antigravity CLI non-interactively to script agent tasks, integrate with CI pipelines, and capture machine-readable output.

Headless mode (also called print mode) sends a single prompt to the agent, streams or returns the response, and exits. Use it whenever you need the agent’s output in a program instead of a terminal UI.

## Run a single prompt

Pass a prompt with `-p` (or its aliases `--print` and `--prompt`) to run once and exit:

content_copy

    agy -p "In one sentence, what is a git rebase?"

content_copy

    A git rebase rewrites the commit history by transplanting a sequence of commits onto a new base commit, imposing a strictly linear progression of changes that eliminates arbitrary merge artifacts.

The response goes to `stdout`. Diagnostics — errors, authentication prompts, progress, and permission notices — go to `stderr`. This split keeps the captured response clean:

content_copy

    # Capture only the model response; diagnostics still print to the terminal.
    answer=$(agy -p "Name three popular version control systems, comma-separated.")

> **Note:** Headless mode uses your cached credentials. Authenticate once with an interactive `agy` session first. In a non-interactive environment with no terminal (for example, CI), a run that is not already authenticated exits with an `authentication required` error instead of hanging.

## Output formats

The `--output-format` flag controls the shape of `stdout`. It accepts three values:

| Format | `stdout` shape | Use it for |
|----|----|----|
| `text` | The response text (default) | Human-readable output, quick scripts |
| `json` | One JSON object printed on completion | Capturing a result plus metadata |
| `stream-json` | Newline-delimited JSON (NDJSON) events | Monitoring progress, tools, and token usage |

### Text

The default. The response text goes straight to `stdout` with no wrapping:

content_copy

    agy -p "In one sentence, what does the command git bisect do?"

content_copy

    Git bisect executes a binary search algorithm across a project's commit history to rapidly isolate the precise commit responsible for introducing a defect.

### JSON

Set `--output-format json` to get a single JSON envelope after the run completes. The CLI emits it on one line; pipe through `jq` to pretty-print:

content_copy

    agy -p "In one sentence, what is a git rebase?" --output-format json | jq

content_copy

    {
      "conversation_id": "055a398f-db14-4c5f-abbb-1bf03f8120a7",
      "status": "SUCCESS",
      "response": "A git rebase rewrites the commit history by transplanting a sequence of commits onto a new base commit, imposing a strictly linear progression of changes that eliminates arbitrary merge artifacts.\n",
      "duration_seconds": 7.16,
      "num_turns": 1,
      "usage": {
        "input_tokens": 10415,
        "output_tokens": 657,
        "thinking_tokens": 616,
        "cache_read_tokens": 8113,
        "total_tokens": 11072
      }
    }

The envelope contains these fields:

| Field | Type | Description |
|----|----|----|
| `conversation_id` | string | ID of the conversation, for resuming later |
| `status` | string | Terminal status (see [Status values](#status-values)) |
| `response` | string | The agent’s free-text response |
| `error` | string | Error message; present only on failure |
| `duration_seconds` | number | Wall-clock duration of the run |
| `num_turns` | number | Number of user turns in the conversation |
| `structured_output` | object | Parsed schema output; present only with `--json-schema` |
| `json_schema` | object | The schema that was enforced; present only with `--json-schema` |
| `usage` | object | Token counts: `input_tokens`, `output_tokens`, `thinking_tokens`, `cache_read_tokens`, `total_tokens` |

#### Structured output with a schema

Pass `--json-schema` to constrain the answer to a schema. The parsed object appears in `structured_output`, and `response` holds the same payload serialized as a string:

content_copy

    agy -p "Parse the semantic version string v2.14.3 into an object with integer fields major, minor, and patch." \
      --output-format json \
      --json-schema '{"type":"object","properties":{"major":{"type":"integer"},"minor":{"type":"integer"},"patch":{"type":"integer"}},"required":["major","minor","patch"]}' | jq

content_copy

    {
      "conversation_id": "4e502687-290c-4030-b908-5ed6c68fa5dc",
      "status": "SUCCESS",
      "response": "{\"major\":2,\"minor\":14,\"patch\":3}\n",
      "duration_seconds": 4.45,
      "num_turns": 1,
      "structured_output": {
        "major": 2,
        "minor": 14,
        "patch": 3
      },
      "json_schema": {
        "type": "object",
        "properties": {
          "major": {
            "type": "integer"
          },
          "minor": {
            "type": "integer"
          },
          "patch": {
            "type": "integer"
          }
        },
        "required": [
          "major",
          "minor",
          "patch"
        ]
      },
      "usage": {
        "input_tokens": 10522,
        "output_tokens": 354,
        "thinking_tokens": 329,
        "cache_read_tokens": 8112,
        "total_tokens": 10876
      }
    }

The flag accepts a schema string, a path to a `.json` schema file, or a primitive type name (`string`, `number`, `integer`, `boolean`). Read the parsed value from `structured_output`:

content_copy

    agy -p "Parse the semantic version string v2.14.3 into an object with integer fields major, minor, and patch." \
      --output-format json \
      --json-schema '{"type":"object","properties":{"major":{"type":"integer"},"minor":{"type":"integer"},"patch":{"type":"integer"}},"required":["major","minor","patch"]}' \
      | jq '.structured_output'

### Streaming JSON

Set `--output-format stream-json` to emit one JSON object per line (NDJSON) as the run progresses. Use this format to observe tool calls and token usage in real time.

content_copy

    agy -p "In one sentence, what is a git rebase?" --output-format stream-json

The stream begins with one `init` event, followed by any number of `step_update` events, and ends with exactly one `result` event (the `cwd` and `tools` array are abbreviated below):

content_copy

    {"event":"init","conversation_id":"c3b66b04-872b-4fbe-a3a4-058a026ef20a","init":{"cwd":"/home/user/project","tools":["ask_permission","run_command","write_to_file","..."],"permission_mode":"request-review"}}
    {"event":"step_update","step_update":{"conversation_id":"c3b66b04-872b-4fbe-a3a4-058a026ef20a","step_index":0,"state":"DONE","step_type":"user_input"}}
    {"event":"step_update","step_update":{"conversation_id":"c3b66b04-872b-4fbe-a3a4-058a026ef20a","step_index":3,"state":"DONE","step_type":"agent_response","text_delta":"Git rebase destructively rewrites a branch's commit history by systematically detaching its unique commits and sequentially reapplying them onto a new base commit.\n","duration_seconds":6.28,"usage":{"input_tokens":10302,"output_tokens":582,"thinking_tokens":551,"cache_read_tokens":8113,"total_tokens":10884}}}
    {"event":"step_update","step_update":{"conversation_id":"c3b66b04-872b-4fbe-a3a4-058a026ef20a","step_index":4,"state":"DONE","step_type":"checkpoint","duration_seconds":0.53,"usage":{"input_tokens":116,"output_tokens":7,"thinking_tokens":0,"cache_read_tokens":0,"total_tokens":123}}}
    {"event":"result","result":{"conversation_id":"c3b66b04-872b-4fbe-a3a4-058a026ef20a","status":"SUCCESS","response":"Git rebase destructively rewrites a branch's commit history by systematically detaching its unique commits and sequentially reapplying them onto a new base commit.\n","duration_seconds":6.88,"num_turns":1,"usage":{"input_tokens":10418,"output_tokens":589,"thinking_tokens":551,"cache_read_tokens":8113,"total_tokens":11007}}}

When the response streams in chunks, the `agent_response` step emits one or more `ACTIVE` events carrying partial `text_delta` fragments before its final `DONE`; short responses like this one arrive in a single `DONE`.

Every line is an event object whose `event` field names its type:

| `event`       | Payload key   | Emitted                                 |
|---------------|---------------|-----------------------------------------|
| `init`        | `init`        | Once, at stream start                   |
| `step_update` | `step_update` | For each step transition or text delta  |
| `result`      | `result`      | Once, at the end (same shape as `json`) |

The `init` payload records the run configuration. `model` and `agent` appear only when set with `--model` or `--agent`; `permission_mode` is `request-review` by default (and `always-proceed` under `--dangerously-skip-permissions`):

| Field | Type | Description |
|----|----|----|
| `cwd` | string | Working directory |
| `tools` | string\[\] | Names of all available tools |
| `permission_mode` | string | Effective permission mode |
| `model` | string | Model in use, when overridden |
| `agent` | string | Active agent, when overridden |
| `json_schema` | object | Enforced schema, when set with `--json-schema` |

Each `step_update` payload describes one step. Observed `step_type` values include `user_input`, `agent_response`, `tool`, and `checkpoint`; `state` is `ACTIVE` while a step runs and `DONE` when it finishes:

| Field | Type | Description |
|----|----|----|
| `conversation_id` | string | ID of the conversation |
| `step_index` | number | Zero-based index of the step |
| `state` | string | `ACTIVE` or `DONE` |
| `step_type` | string | Step category, for example `agent_response` or `tool` |
| `tool_name` | string | Canonical tool name, on tool steps |
| `text_delta` | string | Incremental response text |
| `duration_seconds` | number | Step duration, when known |
| `usage` | object | Per-step token usage, when known |
| `tool_info` | object | Tool invocation details (see below) |
| `subagent_info` | object | Subagent invocation details |

#### Tool calls in the stream

On tool steps, `tool_info` carries the call and its result. This is a real tool step from a run that executed `echo hello_headless_demo`:

content_copy

    {
      "event": "step_update",
      "step_update": {
        "conversation_id": "edb1c8c1-50ba-4f3f-87eb-412d0e9d47c3",
        "step_index": 4,
        "state": "DONE",
        "step_type": "tool",
        "tool_name": "run_command",
        "duration_seconds": 0.07,
        "tool_info": {
          "name": "run_command",
          "parameters": {
            "CommandLine": "echo hello_headless_demo"
          },
          "output": "hello_headless_demo\r\n"
        }
      }
    }

`tool_info` holds `name`, `parameters`, `output`, and — when the tool fails — an `error` object with `type` and `message`. Steps that spawn subagents carry `subagent_info` instead, listing each subagent under `subagents` (with `type_name`, `role`, `conversation_id`, `log_uri`, and `workspace_uris`).

#### Structured output in the stream

With `--json-schema`, the schema applies to the terminal `result` event, which carries the same `structured_output` and `json_schema` fields as the `json` envelope.

## Parse output with jq

`stdout` is machine-readable, so `jq` extracts exactly what you need.

Get the response text from a JSON run:

content_copy

    agy -p "Name three popular version control systems, comma-separated." --output-format json | jq -r '.response'

content_copy

    Git, Subversion, Mercurial.

Concatenate streaming text as it arrives:

content_copy

    agy -p "Explain what a merge conflict is in two sentences." --output-format stream-json \
      | jq -j 'select(.event=="step_update") | .step_update.text_delta // empty'

Read token usage from the terminal `result` event:

content_copy

    agy -p "In one sentence, what is a git rebase?" --output-format stream-json \
      | jq 'select(.event=="result") | .result.usage'

> **Tip:** Use `jq -j` (join output) when concatenating `text_delta` fragments so `jq` does not insert newlines between them.

## Continue a conversation

Headless runs are stateless by default. Resume prior context with `--continue` (`-c`) for the most recent conversation, or `--conversation` with an ID from a previous run’s `conversation_id`:

content_copy

    # Continue the most recent conversation.
    agy -p "Now explain your previous answer in more detail" --continue

    # Resume a specific conversation by ID.
    agy -p "Summarize what we discussed" --conversation 055a398f-db14-4c5f-abbb-1bf03f8120a7

## Select a model, effort, or agent

List the available model slugs, then pin one for the run:

content_copy

    agy models

content_copy

    gemini-3.7-flash-high     Gemini 3.7 Flash (High)
    gemini-3.7-flash-medium   Gemini 3.7 Flash (Medium)
    gemini-3.6-flash-high     Gemini 3.6 Flash (High)
    gemini-3.6-flash-medium   Gemini 3.6 Flash (Medium)
    gemini-3.5-flash-medium   Gemini 3.5 Flash (Medium)
    gemini-3.1-pro-high       Gemini 3.1 Pro (High)
    claude-sonnet-4-6         Claude Sonnet 4.6 (Thinking)
    ...

content_copy

    # Pin a model by slug.
    agy -p "Reverse the string antigravity." --model gemini-3.5-flash-medium

    # Set reasoning effort (low, medium, or high).
    agy -p "Outline a plan to add caching to this service." --effort high

    # Select an agent (list them with `agy agents`).
    agy -p "Review this function for edge cases." --agent <agent-name>

Unlike the interactive UI, headless mode does not silently fall back when `--model` names an unknown model. It exits non-zero with an `ERROR` status so a pinned pipeline fails loudly instead of running the wrong model.

## Permissions in headless mode

There is no interactive prompt in headless mode, so tools that would normally ask for confirmation are handled by policy.

By default, the CLI respects the permission mode in your settings. A tool that requires approval it cannot obtain is soft-denied: the run continues, exits `0`, and prints a notice to `stderr` naming the tool and how to allow it. Reading and writing files inside your active workspace is auto-allowed; actions such as shell commands default to **Ask** and are soft-denied in headless mode unless you grant them.

Grant a tool ahead of time by adding an `action(target)` rule under `permissions.allow` in `~/.gemini/antigravity-cli/settings.json`:

content_copy

    {
      "permissions": {
        "allow": [
          "command(git)",
          "command(npm run (build|lint|test))",
          "write_file(src/)"
        ]
      }
    }

To auto-approve every tool for a run, pass `--dangerously-skip-permissions`:

content_copy

    agy -p "Run the test suite and report failures" --dangerously-skip-permissions

> **Warning:** `--dangerously-skip-permissions` approves all tool calls, including file writes and command execution. Prefer scoped `permissions.allow` rules unless you fully trust the prompt and environment. See [Permissions](/docs/cli/permissions) for the full rule syntax.

## Handle exit codes and errors

A successful run exits `0`. A run that fails to produce a response exits non-zero and writes the reason to `stderr`. In `json` and `stream-json` modes, the failure also appears in the `status` and `error` fields.

For example, pinning an unknown model exits `1` and returns an error envelope:

content_copy

    agy -p "hi" --model does-not-exist-model --output-format json; echo "exit=$?"

content_copy

    {
      "conversation_id": "",
      "status": "ERROR",
      "response": "",
      "error": "invalid model selection (--model \"does-not-exist-model\" --effort \"\"): model does-not-exist-model is not recognized as a known model or custom model in settings\nAvailable models:\n  Gemini 3.6 Flash (High)\n  ...",
      "duration_seconds": 0,
      "num_turns": 0,
      "usage": {
        "input_tokens": 0,
        "output_tokens": 0,
        "thinking_tokens": 0,
        "cache_read_tokens": 0,
        "total_tokens": 0
      }
    }

content_copy

    exit=1

The `status` field reports the terminal state of the run:

| Status        | Meaning                                         |
|---------------|-------------------------------------------------|
| `SUCCESS`     | The run completed and produced a response       |
| `ERROR`       | The run ended with an error                     |
| `CANCELED`    | The run was canceled                            |
| `INTERRUPTED` | The run was interrupted (for example, `SIGINT`) |
| `INVALID`     | The run reached an invalid state                |
| `WAITING`     | The run ended while waiting on input            |
| `RUNNING`     | The run did not reach a terminal state          |

By default, a run waits up to five minutes for a response. Adjust the ceiling with `--print-timeout`:

content_copy

    agy -p "Summarize the design tradeoffs of optimistic locking." --print-timeout 15m

## Flag reference

| Flag | Default | Description |
|----|----|----|
| `-p`, `--print`, `--prompt` | — | Run a single prompt non-interactively and print the response |
| `--output-format` | `text` | Output format: `text`, `json`, or `stream-json` |
| `--json-schema` | — | Schema string or file path to enforce structured output |
| `--model` | — | Model slug for this run (see `agy models`) |
| `--effort` | — | Reasoning effort: `low`, `medium`, or `high` |
| `--agent` | — | Agent for this run (see `agy agents`) |
| `--continue`, `-c` | `false` | Continue the most recent conversation |
| `--conversation` | — | Resume a conversation by ID |
| `--dangerously-skip-permissions` | `false` | Auto-approve all tool permission requests |
| `--print-timeout` | `5m` | Maximum time to wait for a response |
| `--sandbox` | `false` | Run with terminal sandbox restrictions enabled |

## Example: run the agent in CI

Fail the job on error and save the response:

content_copy

    #!/usr/bin/env bash
    set -euo pipefail

    result=$(agy -p "Name three popular version control systems, comma-separated." \
      --output-format json \
      --print-timeout 10m)

    status=$(echo "$result" | jq -r '.status')
    if [[ "$status" != "SUCCESS" ]]; then
      echo "Agent run failed: $(echo "$result" | jq -r '.error')" >&2
      exit 1
    fi

    echo "$result" | jq -r '.response' > result.txt

## Next steps

- [Prompting & Interaction](/docs/cli/prompting): Write effective prompts for the agent.
- [Permissions](/docs/cli/permissions): Configure allow, deny, and ask rules.
- [Background Tasks & Subagents](/docs/cli/subagents): Delegate work to specialized agents.
- [Reference](/docs/cli/reference): Full command and flag reference.
