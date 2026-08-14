---
source: 68
category: docs
title: Model Quotas (/usage)
url: "https://antigravity.google/docs/cli/commands/usage"
final_url: "https://antigravity.google/docs/cli/commands/usage"
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
- Model Quotas (/usage, /quota)

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Model Quotas (/usage)<a href="#model-quotas-usage" class="deep-link-anchor" aria-label="Link to section">link</a>

View your active model quota usage and refresh your configuration.

## Overview<a href="#overview" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI provides the `/usage` command (alias `/quota`) to help you monitor your resource consumption. When run, the command refreshes your model configuration and quota status from the backend and opens an interactive TUI panel.

## Viewing your usage<a href="#viewing-your-usage" class="deep-link-anchor" aria-label="Link to section">link</a>

To open the Model Quotas panel:

1.  Type `/usage` (or `/quota`) in the prompt box.
2.  Press `Enter`.

<div class="code-container" data-code-container="" data-clean-code="/usage" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/usage
```

</div>

</div>

![Quota & Credits TUI](/assets/image/docs/cli/usage-tui.png)

### Interactive Panel Features<a href="#interactive-panel-features" class="deep-link-anchor" aria-label="Link to section">link</a>

The panel displays:

- **Model Quotas**: A breakdown of your usage limits and remaining requests/tokens for each supported model (e.g., Gemini 3.5 Flash, Gemini 3.1 Pro).
- **Active Refresh**: The CLI automatically triggers a fresh check of your quotas on disk and from the backend service when you open this panel.

### Navigation Controls<a href="#navigation-controls" class="deep-link-anchor" aria-label="Link to section">link</a>

Use the following keyboard shortcuts to navigate the panel:

| Key                      | Action                                    |
|:-------------------------|:------------------------------------------|
| `↑` / `↓` (or `j` / `k`) | Scroll up or down by one line.            |
| `PgUp` / `PgDn`          | Scroll up or down by one page.            |
| `g` / `G`                | Jump to the top or bottom of the list.    |
| `Esc` (or `q`)           | Close the panel and return to the prompt. |

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

- **[CLI Reference](/docs/cli/reference)**: See all available slash commands and keybindings.
- **[Settings & Rendering](/docs/cli/settings)**: Configure your default models and credit usage preferences.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
