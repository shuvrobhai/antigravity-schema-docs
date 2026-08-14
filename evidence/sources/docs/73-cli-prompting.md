---
source: 73
category: docs
title: CLI Prompting
url: "https://antigravity.google/docs/cli/prompting"
final_url: "https://antigravity.google/docs/cli/prompting"
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
- Prompting

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Prompting & interaction<a href="#prompting--interaction" class="deep-link-anchor" aria-label="Link to section">link</a>

Master primary interaction patterns, multiline composition workflows, session interruption controls, and terminal media pasting.

## The prompt box<a href="#the-prompt-box" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI features a sticky prompt panel positioned at the bottom of your terminal screen. This panel handles standard user entries, multiline scripts, and direct media pasting.

<div class="code-container" data-code-container="" data-clean-code="───────────────────────────────────────────────────────────────────────────
&gt; Describe your next engineering task here...
───────────────────────────────────────────────────────────────────────────" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
───────────────────────────────────────────────────────────────────────────
> Describe your next engineering task here...
───────────────────────────────────────────────────────────────────────────
```

</div>

</div>

### Submitting prompts<a href="#submitting-prompts" class="deep-link-anchor" aria-label="Link to section">link</a>

To initiate an agent turn, type your instruction into the prompt panel and press `Enter`. The agent immediately analyzes your current directory workspace, reads required configurations, and begins formulating an execution plan.

### Interrupting active sessions<a href="#interrupting-active-sessions" class="deep-link-anchor" aria-label="Link to section">link</a>

If the agent initiates an undesired task or loops during command execution, press `Esc` to immediately halt the session.

<div class="announcement" style="background: var(--theme-surface-surface-container);">

<div class="icon" style="color: var(--theme-primary);">

lightbulb

</div>

<div class="text caption">

Universal Escape: The Esc key acts as a global escape hatch. Pressing Esc instantly cancels any active agent turn, closes overlay panels, and returns focus to a clean prompt box.

</div>

</div>

## Multiline composition<a href="#multiline-composition" class="deep-link-anchor" aria-label="Link to section">link</a>

For complex directives, structured test scenarios, or multi-paragraph instructions, use our built-in multiline features.

### Shorthand newline insertions<a href="#shorthand-newline-insertions" class="deep-link-anchor" aria-label="Link to section">link</a>

- **Standard**: Press `Shift+Enter` or `ctrl+j` to insert a clean newline within your active prompt window without submitting.
- **macOS Terminal Fallback**: If using Apple Terminal (which does not forward `Shift+Enter` by default), press `Option+Enter`. Ensure you check **Use Option as Meta key** in your Terminal Preferences profile.
- **Universal Slash Escape**: Type a trailing backslash `\` at the end of your active line and press `Enter`. The CLI automatically removes the backslash and inserts a newline.

### Editing prompts in `$EDITOR`<a href="#editing-prompts-in-editor" class="deep-link-anchor" aria-label="Link to section">link</a>

To draft or edit extensive prompt structures in your primary development editor:

1.  Press `ctrl+g` inside the empty prompt panel.
2.  The CLI launches your system’s default text editor (such as `vim`, `nano`, or `code`, configured via `/config` or your environment’s `$EDITOR` variable).
3.  Draft your multi-line instruction inside the temporary editor buffer.
4.  Save and exit the editor. The CLI automatically imports the edited buffer directly back into the terminal prompt.

## Attaching media<a href="#attaching-media" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI supports pasting rich media formats directly from your system clipboard. Press `ctrl+v` (or native terminal paste) inside the prompt panel to attach screenshot mockups or video recordings.

### Supported file types<a href="#supported-file-types" class="deep-link-anchor" aria-label="Link to section">link</a>

- **Images**: PNG, JPEG, GIF, WebP, BMP, TIFF, and SVG.
- **Videos**: MP4, MOV, WebM, and AVI.

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

After mastering interaction patterns, explore how the agent presents actions and requests verification:

- **[Reviewing Artifacts](/docs/cli/artifacts)**: Learn to inspect and manage file edits, plans, and test executions.
- **[Managing Conversations](/docs/cli/conversations)**: Resume prior threads and fork active sessions.
- **[Background Tasks & Subagents](/docs/cli/subagents)**: Monitor asynchronous background agents.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
