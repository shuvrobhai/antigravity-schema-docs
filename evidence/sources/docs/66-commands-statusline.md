---
source: 66
category: docs
title: Status Line Command (/statusline)
url: "https://antigravity.google/docs/cli/commands/statusline"
final_url: "https://antigravity.google/docs/cli/commands/statusline"
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
- Status Line (/statusline)

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Status Line Command (/statusline)<a href="#status-line-command-statusline" class="deep-link-anchor" aria-label="Link to section">link</a>

Toggle the TUI status line or configure a custom rendering command.

## Overview<a href="#overview" class="deep-link-anchor" aria-label="Link to section">link</a>

The `/statusline` command allows you to quickly enable or disable the status line at the bottom of your TUI, or configure a custom shell command to render it dynamically, without manually editing your settings file.

For details on how to write custom status line scripts and the JSON state payload schema, see the conceptual **[Status Line Customization Guide](/docs/cli/statusline)**.

## Usage<a href="#usage" class="deep-link-anchor" aria-label="Link to section">link</a>

Run the `/statusline` command with the following arguments to control its behavior:

### Toggle Status Line<a href="#toggle-status-line" class="deep-link-anchor" aria-label="Link to section">link</a>

Type `/statusline` with no arguments to toggle the status line on and off:

<div class="code-container" data-code-container="" data-clean-code="/statusline" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/statusline
```

</div>

</div>

### Enable or Disable Explicitly<a href="#enable-or-disable-explicitly" class="deep-link-anchor" aria-label="Link to section">link</a>

You can explicitly enable or disable the status line:

- **Enable**: `/statusline on` or `/statusline enable`
- **Disable**: `/statusline off` or `/statusline disable`

<div class="code-container" data-code-container="" data-clean-code="/statusline off" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
/statusline off
```

</div>

</div>

### Configure a Custom Command<a href="#configure-a-custom-command" class="deep-link-anchor" aria-label="Link to section">link</a>

To route the agent state JSON payload to a custom script and render its output in the status line, pass the command as an argument:

<div class="code-container" data-code-container="" data-clean-code="/statusline ~/.gemini/antigravity-cli/statusline.sh" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
/statusline ~/.gemini/antigravity-cli/statusline.sh
```

</div>

</div>

This immediately updates your settings and starts running the script to render the status line.

### Revert to Default<a href="#revert-to-default" class="deep-link-anchor" aria-label="Link to section">link</a>

To delete your custom command configuration and revert to the built-in default status line:

<div class="code-container" data-code-container="" data-clean-code="/statusline delete" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
/statusline delete
```

</div>

</div>

*(Note: `/statusline reset` is also supported).*

### Show Help<a href="#show-help" class="deep-link-anchor" aria-label="Link to section">link</a>

To view the quick command reference:

<div class="code-container" data-code-container="" data-clean-code="/statusline help" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
/statusline help
```

</div>

</div>

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

- **[Status Line Guide](/docs/cli/statusline)**: Learn how to write custom scripts and handle the JSON payload.
- **[Window Title Command](/docs/cli/commands/title)**: Configure dynamic terminal window titles.
- **[CLI Reference](/docs/cli/reference)**: See all available slash commands.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
