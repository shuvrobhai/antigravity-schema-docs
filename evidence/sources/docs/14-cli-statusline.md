---
source: 14
category: docs
title: Status Line
url: "https://antigravity.google/docs/cli/statusline"
final_url: "https://antigravity.google/docs/cli/statusline"
fetched: 2026-08-13
status: 200
---
# Status line customization

Define custom scripting configurations and format dynamic JSON state payloads to customize your TUI status line.

infoTo toggle the status line on/off or configure it from the TUI, see the Status Line Command.

## Overview

The status line is positioned at the bottom of the TUI prompt panel. It provides at-a-glance context regarding active agent cycles, workspace environments, context token window usages, and background execution tasks.

## Custom status line scripting

For advanced terminal layouts or custom status bar displays, you can route active agent metadata into a custom script.

### Configuration

Add a `statusLine` configuration block to your `~/.gemini/antigravity-cli/settings.json` file:

content_copy

    {
      "statusLine": {
        "type": "command",
        "command": "~/.gemini/antigravity-cli/statusline.sh"
      }
    }

Whenever the agent state changes, the TUI executes your command script, pipes a detailed state JSON payload directly to the script’s `stdin`, reads your formatted string from `stdout`, and renders the result in the prompt’s status line. Full ANSI color codes are supported.

The block accepts three more optional keys: `padding` adds blank lines above the status line, `enabled` set to `false` suspends the script while keeping the command on file, and `stack_with_default` set to `true` renders your script below the built-in line instead of replacing it.

### Available JSON fields

The JSON payload piped to your script contains the following top-level fields:

| Field | Type | Description |
|----|----|----|
| `cwd` | string | Current working directory when the CLI was launched. |
| `session_id` | string | Backward-compatibility alias for `conversation_id`. |
| `conversation_id` | string | Current unique conversation ID. |
| `transcript_path` | string | Absolute path to the active conversation transcript log file (optional). |
| `model` | object | Contains `id` and `display_name` of the active model. |
| `workspace` | object | Contains `current_dir` and `project_dir` paths. |
| `version` | string | CLI version string. |
| `context_window` | object | Contains token usage details: `total_input_tokens`, `total_output_tokens`, `context_window_size`, `used_percentage`, `remaining_percentage`, and `current_usage` sub-object. |
| `exceeds_200k_tokens` | bool | True if the conversation context has exceeded 200k tokens (null before first API call). |
| `product` | string | Application name (e.g., `antigravity`). |
| `quota` | object | Maps model/bucket IDs to their quota status, containing `remaining_fraction`, `reset_time`, and `reset_in_seconds` (optional). |
| `agent_state` | string | Current state: `idle`, `thinking`, `working`, `tool_use`, `initializing`. |
| `vcs` | object | Version control info: `type` (git/jj/hg), `branch`, `client`, `dirty` (optional). |
| `sandbox` | object | Sandbox configuration: `enabled`, `allow_network` (optional). |
| `artifact_count` | int | Number of artifacts produced in the conversation. |
| `plan_tier` | string | Subscription tier of the authenticated user (optional). |
| `email` | string | Email/LDAP of the authenticated user. |
| `pending_input_count` | int | Number of queued user messages. |
| `tool_confirmation_pending` | bool | True when a tool confirmation dialog is showing. |
| `task_count` | int | Number of running background tasks. |
| `terminal_width` | int | Live width of the interactive terminal. |
| `execution_mode` | string | Current active prompt execution mode (e.g., `planning`, `fast`). |
| `vim` | object | Vim editing state: `mode` is `NORMAL`, `INSERT`, `VISUAL`, or `VISUAL LINE`. Present only when [Vim editor mode](/docs/cli/vim-editor-mode) is enabled. |

### JSON payload example

Here is a fully sanitized, typical JSON payload piped to your status line script:

content_copy

    {
      "cwd": "/home/user/my-project",
      "session_id": "12345678-abcd-ef01-2345-6789abcdef01",
      "conversation_id": "12345678-abcd-ef01-2345-6789abcdef01",
      "transcript_path": "/home/user/.gemini/antigravity/brain/12345678-abcd-ef01-2345-6789abcdef01/.system_generated/logs/transcript.jsonl",
      "model": {
        "id": "Gemini 3.5 Flash (High)",
        "display_name": "Gemini 3.5 Flash (High)"
      },
      "workspace": {
        "current_dir": "/home/user/my-project",
        "project_dir": "/home/user/my-project"
      },
      "version": "1.0.13",
      "context_window": {
        "total_input_tokens": 88244,
        "total_output_tokens": 61074,
        "context_window_size": 1048576,
        "used_percentage": 14.24,
        "remaining_percentage": 85.76,
        "current_usage": {
          "input_tokens": 63382,
          "output_tokens": 346,
          "cache_creation_input_tokens": 0,
          "cache_read_input_tokens": 20857
        }
      },
      "exceeds_200k_tokens": false,
      "product": "antigravity",
      "quota": {
        "gemini-weekly": {
          "remaining_fraction": 0.9378,
          "reset_time": "2026-07-06T07:50:32Z",
          "reset_in_seconds": 560580
        }
      },
      "agent_state": "idle",
      "vcs": {
        "type": "git",
        "branch": "main",
        "dirty": false
      },
      "sandbox": {
        "enabled": false
      },
      "artifact_count": 2,
      "plan_tier": "Pro",
      "email": "developer@email.com",
      "task_count": 1,
      "terminal_width": 111,
      "execution_mode": "planning"
    }

### Example script

You can download a complete, layout-adaptive script from the official [statusline.sh example on GitHub](https://github.com/google-antigravity/antigravity-cli/blob/main/examples/statusline/statusline.sh). This script renders state badges, handles active branches, and formats context window progress bars dynamically.

Save the script to `~/.gemini/antigravity-cli/statusline.sh` and make it executable:

content_copy

    chmod +x ~/.gemini/antigravity-cli/statusline.sh

## See also

- **[Status Line Command](/docs/cli/commands/statusline)**: Toggle status line elements interactively.
- **[Terminal Title Customization](/docs/cli/title)**: Configure dynamic window titles.
- **[Settings, Rendering & Keybindings](/docs/cli/settings)**: Customize keyboard hotkeys and buffers.
- **[Permissions & Sandbox](/docs/cli/sandbox)**: Manage secure directory permissions.
