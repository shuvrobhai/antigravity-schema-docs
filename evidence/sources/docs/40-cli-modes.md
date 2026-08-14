---
source: 40
category: docs
title: CLI Modes
url: "https://antigravity.google/docs/cli/modes"
final_url: "https://antigravity.google/docs/cli/modes"
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
- Antigravity CLI
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Agent Capabilities
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Choose an execution mode

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Choose an execution mode<a href="#choose-an-execution-mode" class="deep-link-anchor" aria-label="Link to section">link</a>

Control whether Antigravity CLI pauses to ask before modifying files or executing commands during a session.

## Before you begin<a href="#before-you-begin" class="deep-link-anchor" aria-label="Link to section">link</a>

- [Install Antigravity CLI](/docs/cli/install)
- Have an active project repository with source code to edit

## Available modes<a href="#available-modes" class="deep-link-anchor" aria-label="Link to section">link</a>

Each execution mode makes a different tradeoff between conversational autonomy and developer oversight. The table below shows how Antigravity CLI handles file operations and planning in each mode.

| Mode | Behavior | Best for |
|:---|:---|:---|
| `default` | Pauses for interactive diff review before modifying or creating files. | Standard development, reviewing sensitive code changes, and careful refactoring. |
| `accept-edits` | Automatically approves file edits and creations (`mkdir`, `touch`, file writes). | Rapid prototyping, iterating on trusted code, and reducing prompt interruptions. |
| `plan` | Prepends the `/plan` instruction prefix to analyze and outline steps before writing code. | Exploring unfamiliar architecture or designing complex multi-step features. |

> **Note:** Tool permission rules configured via `/permissions` or `--dangerously-skip-permissions` continue to govern shell commands (`run_command`) across all execution modes.

## Cycle execution modes during a session<a href="#cycle-execution-modes-during-a-session" class="deep-link-anchor" aria-label="Link to section">link</a>

You can switch execution modes mid-session without interrupting active tasks or restarting the terminal.

1.  Press `Shift+Tab` inside the prompt box to cycle through the active sequence: `default` → `accept-edits` → `plan` → `default`

2.  Observe the status bar indicator below the prompt input to confirm your active mode (`[accept-edits]` or `[plan]`).

> **Tip:** When Antigravity CLI pauses for a pending file edit confirmation in `default` mode, you can press `Shift+Tab` to instantly switch to `accept-edits` mode and approve all pending file modifications.

## Review modifications in default mode<a href="#review-modifications-in-default-mode" class="deep-link-anchor" aria-label="Link to section">link</a>

In `default` mode (`request-review`), Antigravity CLI pauses before applying any file writes to disk and renders an inline, syntax-highlighted diff preview.

<div class="code-container" data-code-container="" data-clean-code="# Launch in default interactive review mode
agy" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
# Launch in default interactive review mode
agy
```

</div>

</div>

When prompted with a pending file modification:

- Press `y` to accept the changes and save the file to disk.
- Press `n` to reject the edits and keep the existing file unchanged.
- Press `f` (`KeyViewDiff`) to open a full-screen, scrollable diff review with 3 context lines and hunk separators.
- Press `Ctrl+G` to open the file inside your `$EDITOR` for manual adjustments.
- Type instructions in the prompt box and press `Enter` to reject the edit and tell the agent what to do differently.

![The default mode file edit diff review panel showing line modifications and action choices](/assets/image/docs/cli/modes-edit-file-preview.png)

### New file creation previews<a href="#new-file-creation-previews" class="deep-link-anchor" aria-label="Link to section">link</a>

When Antigravity CLI creates a brand-new file, the confirmation panel displays an addition-only diff preview with a dedicated `"Create file"` header and explicit allow/deny prompts:

<div class="code-container" data-code-container="" data-clean-code="Create file: src/utils/formatter.ts
Allow create this file? [y/n/f]" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
Create file: src/utils/formatter.ts
Allow create this file? [y/n/f]
```

</div>

</div>

![The addition-only diff confirmation panel displayed when creating a new file in default mode](/assets/image/docs/cli/modes-create-file-preview.png)

## Auto-approve edits with accept-edits mode<a href="#auto-approve-edits-with-accept-edits-mode" class="deep-link-anchor" aria-label="Link to section">link</a>

Select `accept-edits` mode when you want Antigravity CLI to work in longer, uninterrupted stretches across your filesystem without pausing for each file modification.

<div class="code-container" data-code-container="" data-clean-code="# Launch directly in accept-edits mode
agy --mode=accept-edits" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
# Launch directly in accept-edits mode
agy --mode=accept-edits
```

</div>

</div>

In this mode, all standard file read, creation, and replacement operations (`write_to_file`, `replace_file_content`, `multi_replace_file_content`) run automatically. Subagents spawned during the session also inherit the `accept-edits` setting, preventing background file writes from queueing for manual approval.

![The CLI running in accept-edits mode showing the status indicator and automatic file modification](/assets/image/docs/cli/modes-accept-edits-status.png)

## Analyze tasks before editing with plan mode<a href="#analyze-tasks-before-editing-with-plan-mode" class="deep-link-anchor" aria-label="Link to section">link</a>

Use `plan` mode when taking on complex refactoring, multi-file architectural changes, or unfamiliar codebase investigations.

<div class="code-container" data-code-container="" data-clean-code="# Launch directly in planning mode
agy --mode=plan" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
# Launch directly in planning mode
agy --mode=plan
```

</div>

</div>

When `plan` mode is active via `Shift+Tab` cycling or the `--mode` flag, the CLI automatically prepends the `/plan` instruction prefix to your prompts. The agent investigates relevant files using read-only tools (`code_search`, `grep_search`, `view_file`) and presents a structured execution outline for your approval before writing code.

![The CLI running in plan mode analyzing code and structuring an execution outline](/assets/image/docs/cli/modes-plan-execution.png)

## Persist or override your default mode<a href="#persist-or-override-your-default-mode" class="deep-link-anchor" aria-label="Link to section">link</a>

You can set your preferred startup execution mode permanently across sessions or override it for specific invocations.

### Using the interactive settings panel<a href="#using-the-interactive-settings-panel" class="deep-link-anchor" aria-label="Link to section">link</a>

Open the interactive settings panel mid-session to inspect or update your default configuration.

<div class="code-container" data-code-container="" data-clean-code="/settings" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
/settings
```

</div>

</div>

![The interactive settings panel with the Agent Mode option highlighted](/assets/image/docs/cli/modes-settings-panel.png)

Navigate to **Agent Mode** using `↑`/`↓`, press `Enter` or `Space` to select your default (`default`, `accept-edits`, or `plan`), and press `Ctrl+S` to save. Modifying this option synchronizes your runtime `CycleMode` immediately.

### Setting `agentMode` in `settings.json`<a href="#setting-agentmode-in-settingsjson" class="deep-link-anchor" aria-label="Link to section">link</a>

Set `agentMode` directly inside your user or project configuration file:

<div class="code-container" data-code-container="" data-clean-code="{
    &quot;agentMode&quot;: &quot;accept-edits&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "agentMode": "accept-edits"
}
```

</div>

</div>

The CLI loads this file from `~/.gemini/antigravity-cli/settings.json` at startup and applies your chosen baseline execution mode.

### Command-line flag overrides<a href="#command-line-flag-overrides" class="deep-link-anchor" aria-label="Link to section">link</a>

Pass the `--mode` flag to temporarily override your persistent default mode for a single terminal run:

<div class="code-container" data-code-container="" data-clean-code="# Override settings.json to run in planning mode
agy --mode=plan" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
# Override settings.json to run in planning mode
agy --mode=plan
```

</div>

</div>

## Common mistakes<a href="#common-mistakes" class="deep-link-anchor" aria-label="Link to section">link</a>

| Mistake | Why it fails | Fix |
|:---|:---|:---|
| Expecting `sandbox` in `Shift+Tab` cycling | `sandbox` is an OS containment permission setting, not an execution mode | Configure sandbox auto-approval rules inside `/permissions` |
| Using legacy `/planning` or `/fast` commands | These vestigial commands were removed in `1.1.0` | Press `Shift+Tab` to cycle modes or type `/plan` before your prompt |
| Passing `--permission-mode` | `agy` uses `--mode` (`--mode=accept-edits` or `--mode=plan`) for execution overrides | Run `agy --mode=accept-edits` or check `agy --help` |

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

- [Permissions](/docs/cli/permissions): Configure fine-grained tool approval rules and wildcard matching
- [Settings, Rendering & Keybindings](/docs/cli/settings): Customize configuration overrides and interactive preferences
- [Background Tasks & Subagents](/docs/cli/subagents): Manage parallel subagent execution and asynchronous task queues

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
