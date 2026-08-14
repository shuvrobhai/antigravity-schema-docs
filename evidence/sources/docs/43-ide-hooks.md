---
source: 43
category: docs
title: IDE Hooks
url: "https://antigravity.google/docs/ide/hooks"
final_url: "https://antigravity.google/docs/ide/hooks"
fetched: 2026-08-14
status: 200
---
<div class="page-nav-overlay" data-overlay="" data-astro-cid-zfittpdt="">

</div>

<div class="docs-page" data-docs-page="" data-astro-cid-zfittpdt="">

<div class="docs-main-container" data-astro-cid-zfittpdt="">

<div class="docs-nav docs-page-nav" data-sidebar="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

</div>

</div>

<div class="docs-main-content" data-astro-cid-zfittpdt="">

- side_navigation
- Antigravity IDE
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Customizations
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Hooks

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Hooks<a href="#hooks" class="deep-link-anchor" aria-label="Link to section">link</a>

Hooks allow you to run custom scripts or shell commands at specific points during Antigravity’s execution loop. This is powerful for enforcing custom rules, running linters, or capturing diagnostics automatically.

## Configuration<a href="#configuration" class="deep-link-anchor" aria-label="Link to section">link</a>

Hooks are configured in a `hooks.json` file located in your customization directory (e.g., `.agents/` in your workspace or `~/.gemini/config/`).

## Schema and File Format<a href="#schema-and-file-format" class="deep-link-anchor" aria-label="Link to section">link</a>

The `hooks.json` file maps hook names to their event configurations.

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;my-linter-hook&quot;: {
    &quot;PostToolUse&quot;: [
      {
        &quot;matcher&quot;: &quot;run_command&quot;,
        &quot;hooks&quot;: [
          {
            &quot;type&quot;: &quot;command&quot;,
            &quot;command&quot;: &quot;./scripts/lint.sh&quot;,
            &quot;timeout&quot;: 10
          }
        ]
      }
    ]
  },
  &quot;safety-gate&quot;: {
    &quot;enabled&quot;: false,
    &quot;PreToolUse&quot;: [
      {
        &quot;matcher&quot;: &quot;run_command&quot;,
        &quot;hooks&quot;: [
          {
            &quot;command&quot;: &quot;./scripts/safety-check.sh&quot;
          }
        ]
      }
    ]
  },
  &quot;reminder&quot;: {
    &quot;PreInvocation&quot;: [
      {
        &quot;type&quot;: &quot;command&quot;,
        &quot;command&quot;: &quot;./scripts/reminder.sh&quot;
      }
    ]
  }
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "my-linter-hook": {
    "PostToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/lint.sh",
            "timeout": 10
          }
        ]
      }
    ]
  },
  "safety-gate": {
    "enabled": false,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "command": "./scripts/safety-check.sh"
          }
        ]
      }
    ]
  },
  "reminder": {
    "PreInvocation": [
      {
        "type": "command",
        "command": "./scripts/reminder.sh"
      }
    ]
  }
}
```

</div>

</div>

### Hook Definition Fields<a href="#hook-definition-fields" class="deep-link-anchor" aria-label="Link to section">link</a>

| Field | Type | Description |
|:---|:---|:---|
| `enabled` | boolean | Optional. Set to `false` to disable the hook without removing it. Defaults to `true`. |
| `PreToolUse` | array | Handlers that run before a tool is executed. |
| `PostToolUse` | array | Handlers that run after a tool completes. |
| `PreInvocation` | array | Handlers that run before Antigravity calls the model. |
| `PostInvocation` | array | Handlers that run after tool calls finish. |
| `Stop` | array | Handlers that run when the execution loop terminates. |

## Supported Events<a href="#supported-events" class="deep-link-anchor" aria-label="Link to section">link</a>

| Event | Description | Matcher Target |
|:---|:---|:---|
| `PreToolUse` | Fires before a tool is executed. | Tool name (e.g., `run_command`) |
| `PostToolUse` | Fires after a tool completes. | Tool name |
| `PreInvocation` | Fires before the model is called. | N/A (matcher ignored) |
| `PostInvocation` | Fires after tool calls finish. | N/A (matcher ignored) |
| `Stop` | Fires when execution terminates. | N/A (matcher ignored) |

### Matcher<a href="#matcher" class="deep-link-anchor" aria-label="Link to section">link</a>

For `PreToolUse` and `PostToolUse`, you can use a regular expression in the `matcher` field to specify which tools trigger the hook:

- `""` or `"*"`: Match all tools.
- `"run_command"`: Match exactly `run_command`.
- `"run_command|view_file"`: Match either tool.
- `"browser_.*"`: Match any tool starting with `browser_`.

<div class="announcement" style="background: var(--theme-surface-surface-container);">

<div class="icon" style="color: var(--theme-primary);">

info

</div>

<div class="text caption">

Note: For PreInvocation, PostInvocation, and Stop, the structure is simpler (a list of handlers directly under the event key) and the matcher is ignored.

</div>

</div>

## Supported Tools<a href="#supported-tools" class="deep-link-anchor" aria-label="Link to section">link</a>

For `PreToolUse` and `PostToolUse` matchers, you can match against the following tool names, grouped by category:

### File and Directory Operations<a href="#file-and-directory-operations" class="deep-link-anchor" aria-label="Link to section">link</a>

- **`view_file`**: View the contents of a file.
  - Arguments: `AbsolutePath`, `StartLine` (optional), `EndLine` (optional), `IsSkillFile` (optional)
- **`write_to_file`**: Create new files.
  - Arguments: `TargetFile`, `Overwrite`, `CodeContent`, `Description`, `IsArtifact` (optional), `ArtifactMetadata` (optional)
- **`replace_file_content`**: Edit a single contiguous block of text in a file.
  - Arguments: `TargetFile`, `Instruction`, `Description`, `AllowMultiple`, `TargetContent`, `ReplacementContent`, `StartLine`, `EndLine`, `TargetLintErrorIds` (optional)
- **`multi_replace_file_content`**: Make multiple, non-contiguous edits to the same file.
  - Arguments: `TargetFile`, `Instruction`, `Description`, `ReplacementChunks` (array of chunks), `TargetLintErrorIds` (optional), `ArtifactMetadata` (optional)
- **`list_dir`**: List the contents of a directory.
  - Arguments: `DirectoryPath`
- **`find_by_name`**: Search for files and directories using glob patterns.
  - Arguments: `SearchDirectory`, `Pattern`, `Type` (optional), `Excludes` (optional), `Extensions` (optional), `FullPath` (optional), `MaxDepth` (optional)

### Search and Research<a href="#search-and-research" class="deep-link-anchor" aria-label="Link to section">link</a>

- **`grep_search`**: Fast text searches within specific paths.
  - Arguments: `SearchPath`, `Query`, `IsRegex` (optional), `CaseInsensitive` (optional), `Includes` (optional), `MatchPerLine` (optional)
- **`search_web`**: Perform a general web search.
  - Arguments: `query`, `domain` (optional)
- **`read_url_content`**: Fetch text content of a public URL.
  - Arguments: `Url`

### System and Execution<a href="#system-and-execution" class="deep-link-anchor" aria-label="Link to section">link</a>

- **`run_command`**: Propose a bash command to run.
  - Arguments: `CommandLine`, `Cwd`, `WaitMsBeforeAsync`, `RunPersistent` (optional), `RequestedTerminalID` (optional)
- **`manage_task`**: Interact with background tasks.
  - Arguments: `Action` (`'list'`, `'kill'`, `'status'`, `'send_input'`), `TaskId` (optional), `Input` (optional)
- **`schedule`**: Set timers or recurring cron jobs.
  - Arguments: `DurationSeconds` (optional), `CronExpression` (optional), `MaxIterations` (optional), `Prompt`
- **`list_permissions`**: View current resource access grants.
  - Arguments: None
- **`ask_permission`**: Request additional scoped permissions.
  - Arguments: `Action`, `Target`, `Reason`

### Agent Collaboration<a href="#agent-collaboration" class="deep-link-anchor" aria-label="Link to section">link</a>

- **`invoke_subagent`**: Spawn specialized sub-agents.
  - Arguments: `Subagents` (array of specs with `Prompt`, `Role`, `TypeName`, `Workspace` (optional))
- **`define_subagent`**: Create a custom sub-agent.
  - Arguments: `name`, `description`, `system_prompt`, `enable_mcp_tools` (optional), `enable_write_tools` (optional), `enable_subagent_tools` (optional)
- **`send_message`**: Communicate with other agents.
  - Arguments: `Recipient`, `Message`
- **`manage_subagents`**: List or terminate active sub-agents.
  - Arguments: `Action` (`'list'`, `'kill'`, `'kill_all'`), `ConversationIds` (optional)

### Interaction and Media<a href="#interaction-and-media" class="deep-link-anchor" aria-label="Link to section">link</a>

- **`ask_question`**: Ask multiple-choice questions.
  - Arguments: `questions` (array of questions with `question`, `options`, `is_multi_select`)
- **`generate_image`**: Create or edit images.
  - Arguments: `Prompt`, `ImageName`, `ImagePaths` (optional)

## Hook Handler Configuration<a href="#hook-handler-configuration" class="deep-link-anchor" aria-label="Link to section">link</a>

Each item in the `hooks` array supports:

| Field | Type | Description |
|:---|:---|:---|
| `type` | string | Optional. Currently only `"command"` is supported. Defaults to `"command"`. |
| `command` | string | Required. The shell command to execute. |
| `timeout` | integer | Optional. Timeout in seconds. Defaults to `30`. |

## Input/Output Contract<a href="#inputoutput-contract" class="deep-link-anchor" aria-label="Link to section">link</a>

Hooks receive input via **stdin** as JSON and should return output via **stdout** as JSON. Field names use camelCase.

### Common Input Fields<a href="#common-input-fields" class="deep-link-anchor" aria-label="Link to section">link</a>

All hooks receive the following system metadata fields in their input payload on `stdin`:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Field</th>
<th style="text-align: left;">Type</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><code>conversationId</code></td>
<td style="text-align: left;">string</td>
<td style="text-align: left;">The unique UUID of the active agent conversation.</td>
</tr>
<tr>
<td style="text-align: left;"><code>workspacePaths</code></td>
<td style="text-align: left;">array of strings</td>
<td style="text-align: left;">Absolute directory paths representing the user’s mounted workspaces.</td>
</tr>
<tr>
<td style="text-align: left;"><code>transcriptPath</code></td>
<td style="text-align: left;">string</td>
<td style="text-align: left;">The absolute path to the persistent <code>transcript.jsonl</code> conversation logs.<br />
<strong>Note</strong>: This file lives in: <code>&lt;app_data_dir&gt;/brain/&lt;conversationId&gt;/.system_generated/logs/transcript.jsonl</code> where <code>&lt;app_data_dir&gt;</code> is <code>~/.gemini/antigravity-ide</code></td>
</tr>
<tr>
<td style="text-align: left;"><code>artifactDirectoryPath</code></td>
<td style="text-align: left;">string</td>
<td style="text-align: left;">The absolute path to the directory containing all conversation artifacts and screenshots.</td>
</tr>
</tbody>
</table>

------------------------------------------------------------------------

### PreToolUse<a href="#pretooluse" class="deep-link-anchor" aria-label="Link to section">link</a>

Fires before a tool is executed.

**Schema**

**Input Fields (stdin)**:

| Field | Type | Description |
|:---|:---|:---|
| `toolCall` | object | Details of the proposed tool call. |
| `toolCall.name` | string | The name of the tool being executed (e.g., `run_command`). |
| `toolCall.args` | object | The arguments passed to the tool. |
| `stepIdx` | integer | The 0-based index of the current step in the trajectory. |
| *(Common Fields)* |  | Includes `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`. |

**Output Fields (stdout)**:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Field</th>
<th style="text-align: left;">Type</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><code>decision</code></td>
<td style="text-align: left;">string</td>
<td style="text-align: left;"><strong>Required.</strong> Controls how the tool call is gated:<br />
- <code>"allow"</code>: Automatically allows the tool execution.<br />
- <code>"deny"</code>: Hard blocks execution immediately.<br />
- <code>"ask"</code>: Prompts the user, but respects “Always Allow” settings.<br />
- <code>"force_ask"</code>: Always prompts the user, ignoring cached permissions.</td>
</tr>
<tr>
<td style="text-align: left;"><code>reason</code></td>
<td style="text-align: left;">string</td>
<td style="text-align: left;"><strong>Optional.</strong> The explanation shown to the agent or user for the decision.</td>
</tr>
<tr>
<td style="text-align: left;"><code>permissionOverrides</code></td>
<td style="text-align: left;">array of strings</td>
<td style="text-align: left;"><strong>Optional.</strong> A list of resource strings (e.g. <code>["read_file(/path)", "command(args)"]</code>) to override default tool permissions.</td>
</tr>
</tbody>
</table>

**Example**

- **Input (stdin)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;toolCall&quot;: {
    &quot;name&quot;: &quot;run_command&quot;,
    &quot;args&quot;: {
      &quot;CommandLine&quot;: &quot;npm test&quot;,
      &quot;Cwd&quot;: &quot;/workspace/project&quot;,
      &quot;WaitMsBeforeAsync&quot;: 5000
    }
  },
  &quot;stepIdx&quot;: 19,
  &quot;conversationId&quot;: &quot;ec33ebf9-0cba-4100-8142-c61503f6c587&quot;,
  &quot;workspacePaths&quot;: [&quot;/workspace/project&quot;],
  &quot;transcriptPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl&quot;,
  &quot;artifactDirectoryPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "toolCall": {
    "name": "run_command",
    "args": {
      "CommandLine": "npm test",
      "Cwd": "/workspace/project",
      "WaitMsBeforeAsync": 5000
    }
  },
  "stepIdx": 19,
  "conversationId": "ec33ebf9-0cba-4100-8142-c61503f6c587",
  "workspacePaths": [
    "/workspace/project"
  ],
  "transcriptPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl",
  "artifactDirectoryPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587"
}
```

</div>

</div>

- **Output (stdout)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;decision&quot;: &quot;ask&quot;,
  &quot;reason&quot;: &quot;Requires confirmation for test execution.&quot;,
  &quot;permissionOverrides&quot;: [&quot;command(npm test)&quot;]
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "decision": "ask",
  "reason": "Requires confirmation for test execution.",
  "permissionOverrides": [
    "command(npm test)"
  ]
}
```

</div>

</div>

------------------------------------------------------------------------

### PostToolUse<a href="#posttooluse" class="deep-link-anchor" aria-label="Link to section">link</a>

Fires after a tool completes.

**Schema**

**Input Fields (stdin)**:

| Field | Type | Description |
|:---|:---|:---|
| `stepIdx` | integer | The 0-based index of the completed step. |
| `error` | string | Optional. The detailed runtime error message if the tool call failed. Empty if successful. |
| *(Common Fields)* |  | Includes `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`. |

**Output Fields (stdout)**: Returns an empty JSON object `{}`.

**Example**

- **Input (stdin)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;stepIdx&quot;: 5,
  &quot;error&quot;: &quot;exit status 1&quot;,
  &quot;conversationId&quot;: &quot;ec33ebf9-0cba-4100-8142-c61503f6c587&quot;,
  &quot;workspacePaths&quot;: [&quot;/workspace/project&quot;],
  &quot;transcriptPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl&quot;,
  &quot;artifactDirectoryPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "stepIdx": 5,
  "error": "exit status 1",
  "conversationId": "ec33ebf9-0cba-4100-8142-c61503f6c587",
  "workspacePaths": [
    "/workspace/project"
  ],
  "transcriptPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl",
  "artifactDirectoryPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587"
}
```

</div>

</div>

- **Output (stdout)**: `{}`

------------------------------------------------------------------------

### PreInvocation<a href="#preinvocation" class="deep-link-anchor" aria-label="Link to section">link</a>

Fires before the model is called (starts at 0).

**Schema**

**Input Fields (stdin)**:

| Field | Type | Description |
|:---|:---|:---|
| `invocationNum` | integer | The 0-indexed sequence number of the current model invocation (the first invocation is 0). |
| `initialNumSteps` | integer | The number of steps currently in the trajectory. |
| *(Common Fields)* |  | Includes `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`. |

**Output Fields (stdout)**:

| Field | Type | Description |
|:---|:---|:---|
| `injectSteps` | array of objects | **Optional.** List of steps to inject into the conversation trajectory before the model is called. |

*Injected Step Schema*: Each object in the `injectSteps` array can have one of the following fields:

- `toolCall` (object): A tool call to execute.
- `userMessage` (string): A message from the user.
- `ephemeralMessage` (string): A transient system message.

**Example**

- **Input (stdin)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;invocationNum&quot;: 3,
  &quot;initialNumSteps&quot;: 10,
  &quot;conversationId&quot;: &quot;ec33ebf9-0cba-4100-8142-c61503f6c587&quot;,
  &quot;workspacePaths&quot;: [&quot;/workspace/project&quot;],
  &quot;transcriptPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl&quot;,
  &quot;artifactDirectoryPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "invocationNum": 3,
  "initialNumSteps": 10,
  "conversationId": "ec33ebf9-0cba-4100-8142-c61503f6c587",
  "workspacePaths": [
    "/workspace/project"
  ],
  "transcriptPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl",
  "artifactDirectoryPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587"
}
```

</div>

</div>

- **Output (stdout)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;injectSteps&quot;: [{&quot;ephemeralMessage&quot;: &quot;Remember to lint&quot;}]
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "injectSteps": [
    {
      "ephemeralMessage": "Remember to lint"
    }
  ]
}
```

</div>

</div>

------------------------------------------------------------------------

### PostInvocation<a href="#postinvocation" class="deep-link-anchor" aria-label="Link to section">link</a>

Fires after tool calls finish.

**Schema**

**Input Fields (stdin)**: Same as `PreInvocation` input fields.

**Output Fields (stdout)**:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Field</th>
<th style="text-align: left;">Type</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><code>injectSteps</code></td>
<td style="text-align: left;">array of objects</td>
<td style="text-align: left;"><strong>Optional.</strong> List of steps to inject after the invocation completes (same schema as <code>PreInvocation</code> inject steps).</td>
</tr>
<tr>
<td style="text-align: left;"><code>terminationBehavior</code></td>
<td style="text-align: left;">string</td>
<td style="text-align: left;"><strong>Optional.</strong> Controls the execution flow after injection:<br />
- <code>"force_continue"</code>: Forces the loop to continue.<br />
- <code>"terminate"</code>: Forces the loop to terminate.<br />
- <code>""</code> (or omitted): Default behavior.</td>
</tr>
</tbody>
</table>

**Example**

- **Input (stdin)**: Same as `PreInvocation`
- **Output (stdout)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;injectSteps&quot;: [],
  &quot;terminationBehavior&quot;: &quot;&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "injectSteps": [],
  "terminationBehavior": ""
}
```

</div>

</div>

------------------------------------------------------------------------

### Stop<a href="#stop" class="deep-link-anchor" aria-label="Link to section">link</a>

Fires when the execution loop terminates.

**Schema**

**Input Fields (stdin)**:

| Field | Type | Description |
|:---|:---|:---|
| `executionNum` | integer | The sequence number of the execution attempt. |
| `terminationReason` | string | The reason why the execution is stopping (e.g., `"model_stop"`, `"max_steps_exceeded"`, `"error"`). |
| `error` | string | Optional. The error message if termination was caused by a system error. |
| `fullyIdle` | boolean | **Required.** `true` if the agent is completely finished and all background commands or asynchronous tasks have completed. `false` if active background tasks are still running. |
| *(Common Fields)* |  | Includes `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`. |

**Output Fields (stdout)**:

| Field | Type | Description |
|:---|:---|:---|
| `decision` | string | **Required.** Set to `"continue"` to prevent the agent from stopping and re-enter the execution loop. Any other value allows the stop. |
| `reason` | string | **Optional.** If `decision` is `"continue"`, this message is injected as a system message into the conversation. |

**Example**

- **Input (stdin)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;executionNum&quot;: 1,
  &quot;terminationReason&quot;: &quot;model_stop&quot;,
  &quot;error&quot;: &quot;&quot;,
  &quot;fullyIdle&quot;: true,
  &quot;conversationId&quot;: &quot;ec33ebf9-0cba-4100-8142-c61503f6c587&quot;,
  &quot;workspacePaths&quot;: [&quot;/workspace/project&quot;],
  &quot;transcriptPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl&quot;,
  &quot;artifactDirectoryPath&quot;: &quot;~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "executionNum": 1,
  "terminationReason": "model_stop",
  "error": "",
  "fullyIdle": true,
  "conversationId": "ec33ebf9-0cba-4100-8142-c61503f6c587",
  "workspacePaths": [
    "/workspace/project"
  ],
  "transcriptPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587/.system_generated/logs/transcript.jsonl",
  "artifactDirectoryPath": "~/.gemini/antigravity-ide/brain/ec33ebf9-0cba-4100-8142-c61503f6c587"
}
```

</div>

</div>

- **Output (stdout)**:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;decision&quot;: &quot;continue&quot;,
  &quot;reason&quot;: &quot;Not done yet&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "decision": "continue",
  "reason": "Not done yet"
}
```

</div>

</div>

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
