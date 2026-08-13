## 8. Built-in Agent Tool API

> [!NOTE]
> The official documentation lags the live CLI. While the official docs document only 18 tools, the live CLI exposes a complete set of **56 tools** (verified via the headless `stream-json` `init` event's `tools` array as of 2026-08-11).
> Tool argument signatures are only officially verified for the original 18 tools plus official hook tool argument corrections from 2026-08-13. The remaining tools are verified by name, but their argument signatures are unverified (and thus no parameters are specified to avoid hallucinations).
> Description provenance follows the same rule: the verified tools have descriptions sourced from official docs and observed transcripts; name-verified tools carry best-effort descriptions inferred from their tool names. The knowledge JSON flags this per tool (`args_verified`, `description_verified`) so agents can weigh each entry.

### File Operations (`file` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `list_dir` | `DirectoryPath` (string) | Yes | List directory |
| `multi_replace_file_content` | `TargetFile` (string), `Instruction` (string), `Description` (string), `ReplacementChunks` (array), `TargetLintErrorIds` (array), `ArtifactMetadata` (object) | Yes | Multiple non-contiguous edits |
| `replace_file_content` | `TargetFile` (string), `Instruction` (string), `Description` (string), `AllowMultiple` (bool), `TargetContent` (string), `ReplacementContent` (string), `StartLine` (int), `EndLine` (int), `TargetLintErrorIds` (array) | Yes | Replace text block |
| `sed_file` | — | No | Perform regex replacements in a file |
| `view_file` | `AbsolutePath` (string), `StartLine` (int), `EndLine` (int), `ContentOffset` (int), `IsSkillFile` (bool) | Yes | Read file ranges |
| `write_to_file` | `TargetFile` (string), `Overwrite` (bool), `CodeContent` (string), `Description` (string), `IsArtifact` (bool), `ArtifactMetadata` (object) | Yes | Write files |

### Search and Research (`search` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `find_by_name` | `SearchDirectory` (string), `Pattern` (string), `Type` (string), `Excludes` (array), `Extensions` (array), `FullPath` (bool), `MaxDepth` (int) | Yes | Glob search |
| `grep_search` | `SearchPath` (string), `Query` (string), `IsRegex` (bool), `CaseInsensitive` (bool), `Includes` (string), `MatchPerLine` (bool) | Yes | Text search |
| `search_web` | `query` (string), `domain` (string) | Yes | Web search |
| `read_url_content` | `Url` (string) | Yes | Fetch URL content. **Correction:** official args use `Url`, not `URL`. |

### Execution and System (`execution` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `call_mcp_tool` | `ServerName` (string), `ToolName` (string), `Arguments` (object) | Yes | Lazy MCP tool execution |
| `delete_knowledge` | — | No | Delete a knowledge file or memory entry |
| `generate_image` | `Prompt`, `ImageName`, `ImagePaths?` | Yes | Generate an image using the internal Nano Banana model |
| `run_command` | `CommandLine` (string), `Cwd` (string), `WaitMsBeforeAsync` (int), `RunPersistent` (bool), `RequestedTerminalID` (string) | Yes | Execute bash |

### Control and Safety (`control` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `ask_permission` | `Action` (string), `Target` (string), `Reason` (string) | Yes | Request permissions |
| `ask_question` | `questions` | Yes | Ask the user one or more multiple-choice questions |
| `command_status` | — | No | Check the status of a running background command |
| `finish` | — | No | Mark the current goal/task as successfully completed |
| `list_permissions` | (no args) | Yes | View current grants |
| `manage_task` | `Action` (`list`/`kill`/`status`/`send_input`), `TaskId?`, `Input?` | Yes | Background task control |
| `schedule` | `DurationSeconds?`, `CronExpression?`, `MaxIterations?`, `Prompt` | Yes | Timers and cron jobs. One-time `DurationSeconds` capped at 900 (15 min) per official Google Cloud tutorial `[GOOGLE]` |
| `send_command_input` | — | No | Send input text to a running background task |
| `wait` | — | No | Wait for a specified condition or duration |
| `wait_5_seconds` | — | No | Wait exactly 5 seconds |

### Agent Collaboration (`collaboration` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `define_subagent` | `name`, `description`, `system_prompt`, `enable_mcp_tools?`, `enable_write_tools?`, `enable_subagent_tools?` | Yes | Create transient subagent template |
| `invoke_subagent` | `Subagents[]` with `Prompt`, `Role`, `TypeName`, `Workspace?` | Yes | Spawn subagent |
| `manage_inbox` | — | No | Manage user-queued messages and system notifications |
| `manage_subagents` | `Action`, `ConversationIds?` | Yes | Manage background subagents |
| `send_message` | `Message` (string), `Recipient` (string) | Yes | Inter-agent / subagent messaging |

### Resources (`resources` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `list_resources` | — | No | List resources exposed by loaded MCP servers |
| `read_resource` | — | No | Read contents of a loaded MCP resource |

### Notebooks (`notebook` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `notebook_edit` | — | No | Edit code cells in a Jupyter notebook |
| `notebook_execution` | — | No | Execute cells in a Jupyter notebook |

### Browser Automation (`browser` family)

| Tool | Arguments | Args Verified | Description |
|---|---|---|---|
| `browser_click_element` | — | No | Click an element on the active browser page |
| `browser_drag_pixel_to_pixel` | — | No | Drag from one pixel coordinate to another |
| `browser_get_dom` | — | No | Retrieve the DOM structure of the active page |
| `browser_get_network_request` | — | No | Get detailed info for a specific network request |
| `browser_input` | — | No | Input text into a browser input field |
| `browser_list_network_requests` | — | No | List network requests captured for the active page |
| `browser_mouse_down` | — | No | Trigger a mouse down event at coordinates |
| `browser_mouse_up` | — | No | Trigger a mouse up event at coordinates |
| `browser_move_mouse` | — | No | Move the mouse to specific coordinates |
| `browser_press_key` | — | No | Press a key or key combination on the page |
| `browser_refresh_page` | — | No | Refresh the active browser page |
| `browser_resize_window` | — | No | Resize the browser window dimensions |
| `browser_scroll` | — | No | Scroll the browser window by an offset |
| `browser_scroll_dom` | — | No | Scroll a specific DOM element by selector |
| `browser_select_option` | — | No | Select an option from a dropdown element |
| `browser_subagent` | — | No | Invoke the browser subagent |
| `capture_browser_console_logs` | — | No | Retrieve console logs from the active page |
| `capture_browser_screenshot` | — | No | Take a screenshot of the active browser window |
| `click_browser_pixel` | — | No | Click specific pixel coordinates on the screen |
| `execute_browser_javascript` | — | No | Execute arbitrary JavaScript on the active page |
| `list_browser_pages` | — | No | List all active pages/tabs in the browser profile |
| `open_browser_url` | — | No | Open a URL in the browser profile |
| `read_browser_page` | — | No | Read text/HTML content of the active page |
