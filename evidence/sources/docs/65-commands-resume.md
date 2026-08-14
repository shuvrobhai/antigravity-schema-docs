---
source: 65
category: docs
title: Resume Command (/resume)
url: "https://antigravity.google/docs/cli/commands/resume"
final_url: "https://antigravity.google/docs/cli/commands/resume"
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
- Commands
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Resume (/resume)

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Resume Command (/resume)<a href="#resume-command-resume" class="deep-link-anchor" aria-label="Link to section">link</a>

Browse, search, and resume past conversation threads, or recover your last session instantly from the command line.

## Overview<a href="#overview" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI allows you to maintain multiple ongoing development threads. The `/resume` command opens an interactive **Session Picker** TUI panel to browse and load your history. You can also resume sessions directly from your host terminal using command-line flags.

------------------------------------------------------------------------

## Interactive Session Picker<a href="#interactive-session-picker" class="deep-link-anchor" aria-label="Link to section">link</a>

To open the Session Picker inside the TUI:

1.  Type `/resume` (or aliases `/switch`, `/conversation`) in the prompt box.
2.  Press `Enter`.

<div class="code-container" data-code-container="" data-clean-code="/resume" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/resume
```

</div>

</div>

### 1. Navigating and Searching Conversations<a href="#1-navigating-and-searching-conversations" class="deep-link-anchor" aria-label="Link to section">link</a>

The Session Picker displays a list of past conversations sorted by recency (newest first).

- **Search**: Start typing to instantly filter conversations by their title, preview text, or unique ID.
- **Navigate**: Use `↑`/`↓` to scroll through the filtered list.
- **Page**: Use `←`/`→` to page backward and forward through older history blocks.
- **Select**: Highlight your target session and press `Enter` to load it.
- **Exit**: Press `Esc` to close the picker and return to the active prompt.

![Navigating Conversations](/assets/image/docs/cli/resume-navigate.png)

### 2. Renaming a Conversation<a href="#2-renaming-a-conversation" class="deep-link-anchor" aria-label="Link to section">link</a>

To keep your history organized, you can rename conversations directly within the picker:

1.  Use `↑`/`↓` to highlight the conversation you want to rename.
2.  Press `F2`. An input field opens at the bottom of the panel, prefilled with the current title.
3.  Type the new name and press `Enter` to save, or `Esc` to cancel.

![Renaming a Conversation](/assets/image/docs/cli/resume-rename.png)

### 3. Deleting a Conversation<a href="#3-deleting-a-conversation" class="deep-link-anchor" aria-label="Link to section">link</a>

To clean up obsolete threads:

1.  Highlight the target conversation in the list.
2.  Press `Ctrl+Delete`. A confirmation prompt appears.
3.  Press `Enter` (or `y`) to confirm deletion, or `Esc` (or `n`) to cancel.

![Deleting a Conversation](/assets/image/docs/cli/resume-delete.png)

### 4. Importing from Antigravity 2.0<a href="#4-importing-from-antigravity-20" class="deep-link-anchor" aria-label="Link to section">link</a>

You can import and resume active threads initiated in the Antigravity 2.0 desktop application:

1.  With the Session Picker open, press `Tab` to switch from the **CLI** tab to the **Antigravity** tab.
2.  Highlight the desktop conversation you wish to import.
3.  Press `Enter`. A confirmation prompt `[Import this? (y/n)]` appears.
4.  Press `Enter` (or `y`) to confirm. The CLI clones the history, context, and tool trajectories into your terminal session.

![Importing from Antigravity 2.0](/assets/image/docs/cli/resume-antigravity.png)

------------------------------------------------------------------------

## Command-Line Shortcuts<a href="#command-line-shortcuts" class="deep-link-anchor" aria-label="Link to section">link</a>

You can bypass the TUI picker and resume sessions directly when launching `agy` from your host shell.

### Quick Resume Last Session (`-c` / `--continue`)<a href="#quick-resume-last-session--c----continue" class="deep-link-anchor" aria-label="Link to section">link</a>

To instantly resume the single most recent conversation associated with your active workspace:

<div class="code-container" data-code-container="" data-clean-code="agy -c" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
agy -c
```

</div>

</div>

*(Alternative: `agy --continue`)*

### Resume Specific Session (`--conversation`)<a href="#resume-specific-session---conversation" class="deep-link-anchor" aria-label="Link to section">link</a>

To load a specific conversation directly by its unique ID:

<div class="code-container" data-code-container="" data-clean-code="agy --conversation &lt;conversation-id&gt;" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
agy --conversation <conversation-id>
```

</div>

</div>

------------------------------------------------------------------------

## Under the Hood: The Session Cache<a href="#under-the-hood-the-session-cache" class="deep-link-anchor" aria-label="Link to section">link</a>

When you use the `-c` / `--continue` flag, the CLI resolves the target session using a local workspace-keyed cache.

### The Cache File<a href="#the-cache-file" class="deep-link-anchor" aria-label="Link to section">link</a>

- **Location**: `~/.gemini/antigravity-cli/cache/last_conversations.json`
- **Format**: A JSON map associating absolute workspace directory paths with their most recently active conversation ID:
  <div class="code-container" data-code-container="" data-clean-code="{
      &quot;/usr/local/google/home/username/Develop/my-project&quot;: &quot;a1b2c3d4-e5f6-7890-abcd-ef1234567890&quot;,
      &quot;/usr/local/google/home/username/Develop/another-repo&quot;: &quot;f9e8d7c6-b5a4-3210-fedc-ba9876543210&quot;
  }" data-astro-cid-4g3kud3p="">

  <div class="header" data-astro-cid-4g3kud3p="">

  <span class="title caption" data-astro-cid-4g3kud3p="">json</span>

  </div>

  content_copy
  <div class="snippet-area" data-astro-cid-4g3kud3p="">

  ``` json
  {
    "/usr/local/google/home/username/Develop/my-project": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "/usr/local/google/home/username/Develop/another-repo": "f9e8d7c6-b5a4-3210-fedc-ba9876543210"
  }
  ```

  </div>

  </div>

### Resolution Workflow<a href="#resolution-workflow" class="deep-link-anchor" aria-label="Link to section">link</a>

1.  **Launch**: You run `agy -c` from `/path/to/workspace`.
2.  **Lookup**: The CLI reads `last_conversations.json` and looks up the key `/path/to/workspace`.
3.  **Verification**: If an ID is found, the CLI queries the backend to verify the conversation still exists.
4.  **Load**:
    - If verified, it loads the session.
    - If the conversation was deleted or the key is missing, it starts a fresh session for that workspace.

------------------------------------------------------------------------

## See also<a href="#see-also" class="deep-link-anchor" aria-label="Link to section">link</a>

- **[Managing Conversations](/docs/cli/conversations)**: Learn about workspace scoping and branching with `/fork`.
- **[CLI Reference](/docs/cli/reference)**: See all available slash commands and default keybindings.
- **[Settings & Keybindings](/docs/cli/settings)**: Configure rendering modes and customize keyboard shortcuts.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
