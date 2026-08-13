---
source: 15
category: docs
title: Title
url: "https://antigravity.google/docs/cli/title"
final_url: "https://antigravity.google/docs/cli/title"
fetched: 2026-08-13
status: 200
---
# Terminal title customization

Configure dynamic window titles, map custom scripting configurations, and format JSON state outputs to customize terminal headers.

infoTo toggle or set the terminal title interactively, see the Window Title Command.

## Overview

The terminal window title feature displays agent details, active workspace basenames, and active conversation parameters inside your terminal emulator’s title bar. This lets you monitor agent progress even when the terminal window is minimized or unfocused.

## Custom title scripting

For customized window title formatting, you can route active TUI state details into a custom shell script.

### Configuration

Add a `title` configuration block to your `~/.gemini/antigravity-cli/settings.json` file:

content_copy

    {
      "title": {
        "type": "command",
        "command": "~/.gemini/antigravity-cli/title.sh"
      }
    }

Whenever the agent state changes, the TUI executes your command script, pipes a detailed state JSON payload directly to the script’s `stdin`, reads your formatted string from `stdout`, and updates your terminal window title. Non-printable characters and ANSI escape sequences are automatically stripped before rendering.

### JSON state payload schema

The JSON state payload is the same as the one sent to the custom status line script. It includes detailed properties representing `cwd`, `conversation_id`, `agent_state`, `vcs` details, and more. See the **[Status Line Schema](/docs/cli/statusline#available-json-fields)** for the complete property list.

### Example script

You can download a complete, layout-adaptive script from the official [title.sh example on GitHub](https://github.com/google-antigravity/antigravity-cli/blob/main/examples/title/title.sh). This script extracts the active workspace folder basename and renders a structured terminal title containing live agent states and conversation session prefixes.

Save the script to `~/.gemini/antigravity-cli/title.sh` and make it executable:

content_copy

    chmod +x ~/.gemini/antigravity-cli/title.sh

## See also

- **[Window Title Command](/docs/cli/commands/title)**: Toggle or set the terminal title interactively.
- **[Status Line Customization](/docs/cli/statusline)**: Customize dynamic TUI status bars.
- **[Settings, Rendering & Keybindings](/docs/cli/settings)**: Customize keyboard hotkeys and buffers.
- **[Permissions & Sandbox](/docs/cli/sandbox)**: Manage secure directory permissions.
