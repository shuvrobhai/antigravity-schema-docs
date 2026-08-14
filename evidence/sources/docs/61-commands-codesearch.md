---
source: 61
category: docs
title: Code Search Command (/codesearch)
url: "https://antigravity.google/docs/cli/commands/codesearch"
final_url: "https://antigravity.google/docs/cli/commands/codesearch"
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
- Code Search (/codesearch)

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Code Search Command (/codesearch)<a href="#code-search-command-codesearch" class="deep-link-anchor" aria-label="Link to section">link</a>

Interactively search the code in your workspace from inside the TUI, without leaving your session or interrupting the agent.

## Overview<a href="#overview" class="deep-link-anchor" aria-label="Link to section">link</a>

The `/codesearch` command opens a fullscreen **Code Search** panel that runs a search across your current workspace and shows the matches grouped by file, with surrounding context and the matched text highlighted. It is handy for quickly locating a symbol, string, or pattern and then jumping straight to the file at the matching line. `/codesearch` directly queries your workspace and returns results instantly.

The command has two aliases: `/cs` and `/search`.

## Running a search<a href="#running-a-search" class="deep-link-anchor" aria-label="Link to section">link</a>

1.  Type `/codesearch` followed by your query in the prompt box.
2.  Press `Enter`.

<div class="code-container" data-code-container="" data-clean-code="/codesearch UserSession" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/codesearch UserSession
```

</div>

</div>

The Code Search panel opens with the results grouped by file. The header shows your query and the number of matches, and each match is displayed with one line of context above and below. The matched text is highlighted:

![The Code Search panel showing matches for a query grouped by file with highlighted results](/assets/image/docs/cli/codesearch-results.png)

### Navigation and controls<a href="#navigation-and-controls" class="deep-link-anchor" aria-label="Link to section">link</a>

The panel is fully keyboard driven:

| Key | Action |
|:---|:---|
| `↑` / `↓` | Move between individual matches |
| `←` / `→` | Jump to the previous / next file group |
| `Enter` | Open the highlighted result in the file viewer at the matching line |
| `Ctrl+G` | Open the highlighted result in your external editor at the matching line |
| `Esc` | Close the panel and return to the prompt |

## Query syntax<a href="#query-syntax" class="deep-link-anchor" aria-label="Link to section">link</a>

By default, queries are interpreted as **regular expressions** and matching is case-insensitive unless your query contains an uppercase letter (smart case).

### Literal (fixed-string) matching<a href="#literal-fixed-string-matching" class="deep-link-anchor" aria-label="Link to section">link</a>

Add `-F` (or `--literal`) anywhere in the query to disable regex and match the text literally. This is useful when your query contains regex metacharacters such as `.`, `(`, or `*`:

<div class="code-container" data-code-container="" data-clean-code="/codesearch -F map[string]*UserSession" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/codesearch -F map[string]*UserSession
```

</div>

</div>

### Filtering by file path<a href="#filtering-by-file-path" class="deep-link-anchor" aria-label="Link to section">link</a>

Restrict a search to certain files with `f:` (aliases `file:` and `path:`) followed by a glob. Prefix the filter with `-` to *exclude* matching files instead:

<div class="code-container" data-code-container="" data-clean-code="/codesearch f:store.go Session" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/codesearch f:store.go Session
```

</div>

</div>

<div class="code-container" data-code-container="" data-clean-code="/codesearch -f:*_test.go NewUserSession" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/codesearch -f:*_test.go NewUserSession
```

</div>

</div>

![The Code Search panel scoped to a single file using an f: path filter](/assets/image/docs/cli/codesearch-filter.png)

## Opening a file and commenting on lines<a href="#opening-a-file-and-commenting-on-lines" class="deep-link-anchor" aria-label="Link to section">link</a>

Code Search is more than a viewer — you can open any result and give the agent precise, line-level feedback without leaving the CLI.

### Open a result<a href="#open-a-result" class="deep-link-anchor" aria-label="Link to section">link</a>

Highlight a match with `↑` / `↓` and press `Enter` to open that file in the built-in file viewer, scrolled to the matching line. Use `Ctrl+G` instead to open it in your external editor.

Inside the file viewer, the footer shows the available actions:

<div class="code-container" data-code-container="" data-clean-code="↑/↓ scroll · pgup/pgdown page · shift+g bottom · g top · c comment · ctrl+g editor · / search" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
↑/↓ scroll · pgup/pgdown page · shift+g bottom · g top · c comment · ctrl+g editor · / search
```

</div>

</div>

### Comment on a specific line<a href="#comment-on-a-specific-line" class="deep-link-anchor" aria-label="Link to section">link</a>

1.  Move the cursor (`↑` / `↓`) to the line you want to annotate.
2.  Press `c` to open the inline comment editor for that line.
3.  Type your note. Use `Shift+Enter` (or `Alt`/`\`+`Enter`) for a new line, and press `Enter` to save it.

A saved comment is stored against that line and marked with a 💬 icon in the gutter. Repeat for as many lines as you like. To remove a comment, place the cursor on the line and press the delete key (`d`).

![Leaving a line comment in the file viewer opened from Code Search](/assets/image/docs/cli/codesearch-comment.png)

### Send your comments to the agent<a href="#send-your-comments-to-the-agent" class="deep-link-anchor" aria-label="Link to section">link</a>

When you leave the file viewer with `Esc`, any pending comments are collected and the CLI asks whether to send them:

- `y` — **send + close**: your comments are delivered to the agent as your next message, formatted as `<file>:<line>: <comment>` so the model knows exactly which lines you mean.
- `n` — **discard + close**: exit without sending.
- `Esc` — cancel and keep editing.

![Confirming whether to send unsent line comments to the agent](/assets/image/docs/cli/codesearch-comment-send.png)

This makes Code Search a fast way to find relevant code and hand the agent targeted, line-anchored instructions in a single flow.

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

- **[CLI Features](/docs/cli/features)**: Explore the rest of the interactive TUI capabilities.
- **[Prompting Guide](/docs/cli/prompting)**: Learn how to direct the agent to search and edit code for you.
- **[Resume Command (/resume)](/docs/cli/commands/resume)**: Navigate and manage your past conversations.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
