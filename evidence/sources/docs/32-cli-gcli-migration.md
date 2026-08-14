---
source: 32
category: docs
title: Migration (Gemini CLI)
url: "https://antigravity.google/docs/cli/gcli-migration"
final_url: "https://antigravity.google/docs/cli/gcli-migration"
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
- Gemini Migration

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Migrating from Gemini CLI<a href="#migrating-from-gemini-cli" class="deep-link-anchor" aria-label="Link to section">link</a>

Convert your legacy configurations, import Gemini CLI extensions as native plugins, adapt custom skills paths, and reformat Model Context Protocol configurations.

## Overview<a href="#overview" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI preserves backward compatibility with the core developer-experience constructs popularized by Gemini CLI. To ensure a seamless upgrade, the CLI offers automatic onboarding conversion alongside explicit CLI migration command sequences.

## First-launch onboarding<a href="#first-launch-onboarding" class="deep-link-anchor" aria-label="Link to section">link</a>

When you execute `agy` for the first time in an environment containing legacy configurations, the CLI automatically detects your existing profiles. An interactive checklist prompts you to choose which assets to migrate:

1.  **Auto-conversion**: Select the extensions and global configurations you wish to convert.
2.  **Keyring storage**: The CLI migrates your active session tokens securely into your operating system’s native keyring storage.
3.  **Settings alignment**: Default visual parameters and rendering buffers map automatically to your new settings profile.

<div class="announcement" style="background: var(--theme-surface-surface-container);">

<div class="icon" style="color: var(--theme-primary);">

info

</div>

<div class="text caption">

Partial Parity: While we preserve support for workspace skills, rules, and MCP servers, certain customized terminal themes or experimental visual overlays from Gemini CLI may not be supported.

</div>

</div>

## Converting extensions to plugins<a href="#converting-extensions-to-plugins" class="deep-link-anchor" aria-label="Link to section">link</a>

Since Gemini CLI launched, the industry has standardized on the term **plugins**. You can manually convert your legacy Gemini extensions to native Antigravity plugins by executing:

<div class="code-container" data-code-container="" data-clean-code="agy plugin import gemini" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
agy plugin import gemini
```

</div>

</div>

This utility searches your legacy local directories, parses your extension manifests, and converts files into native layout blocks.

### Expected import output<a href="#expected-import-output" class="deep-link-anchor" aria-label="Link to section">link</a>

<div class="code-container" data-code-container="" data-clean-code="[ok]   conductor-tools
       - skills     : skipped (none detected)
       - agents     : skipped (none detected)
       ✔ commands   : 4 legacy commands converted to skills
       - mcpServers : skipped (none detected)
[ok]   google-workspace
       ✔ skills     : 5 skills processed
       - agents     : skipped (none detected)
       ✔ commands   : 2 legacy commands converted to skills
       ✔ mcpServers : 1 server definition migrated to mcp_config.json" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
[ok]   conductor-tools
       - skills     : skipped (none detected)
       - agents     : skipped (none detected)
       ✔ commands   : 4 legacy commands converted to skills
       - mcpServers : skipped (none detected)
[ok]   google-workspace
       ✔ skills     : 5 skills processed
       - agents     : skipped (none detected)
       ✔ commands   : 2 legacy commands converted to skills
       ✔ mcpServers : 1 server definition migrated to mcp_config.json
```

</div>

</div>

## Context files and workspace rules<a href="#context-files-and-workspace-rules" class="deep-link-anchor" aria-label="Link to section">link</a>

Both CLI platforms utilize identical workspace context rules. No modifications are needed to your existing rule documents:

- **Workspace local context**: The agent continues to parse and enforce rule constraints defined inside your active directory’s `GEMINI.md` and `AGENTS.md` files.
- **Global developer context**: The agent automatically consults and enforces your global constraints located at `~/.gemini/GEMINI.md`.

## Updated skills paths<a href="#updated-skills-paths" class="deep-link-anchor" aria-label="Link to section">link</a>

While global shared skills remain in your user home directory, the target folder path for local workspace-specific skills has been updated.

| Configuration | Gemini CLI | Antigravity CLI |
|:---|:---|:---|
| **Global shared path** | `~/.gemini/skills/` | `~/.gemini/antigravity-cli/skills/` |
| **Workspace project path** | `.gemini/skills/` | `.agents/skills/` |

<div class="announcement" style="background: var(--theme-surface-surface-container);">

<div class="icon" style="color: var(--theme-primary);">

warning

</div>

<div class="text caption">

Action Required: If your project contains custom workspace skills defined in .gemini/skills/, you must manually rename or relocate the folder to .agents/skills/ for the Antigravity agent to recognize them as active slash commands.

</div>

</div>

## MCP config formatting changes<a href="#mcp-config-formatting-changes" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI separates Model Context Protocol servers into dedicated, lightweight JSON profiles instead of nesting them inside your primary preferences configuration.

### Directory mapping<a href="#directory-mapping" class="deep-link-anchor" aria-label="Link to section">link</a>

- **Legacy Gemini Config**: Servers were declared inline within `~/.gemini/settings.json`.
- **Antigravity CLI Config**: Servers are defined inside a standalone `mcp_config.json` profile:
  - Global servers: `~/.gemini/config/mcp_config.json`
  - Workspace servers: `.agents/mcp_config.json`

### Required schema updates<a href="#required-schema-updates" class="deep-link-anchor" aria-label="Link to section">link</a>

When manually migrating remote websocket or SSE server definitions, update the URI key parameter to match the current standard:

- **Legacy schema keys**: `url` or `httpUrl`
- **Modern schema key**: `serverUrl`

<div class="code-container" data-code-container="" data-clean-code="{
    &quot;mcpServers&quot;: {
        &quot;remote-indexer&quot;: {
            &quot;serverUrl&quot;: &quot;https://mcp.internal.enterprise.com/sse&quot;,
            &quot;env&quot;: {
                &quot;AUTH_TOKEN&quot;: &quot;secure_alpha_token&quot;
            }
        }
    }
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "mcpServers": {
    "remote-indexer": {
      "serverUrl": "https://mcp.internal.enterprise.com/sse",
      "env": {
        "AUTH_TOKEN": "secure_alpha_token"
      }
    }
  }
}
```

</div>

</div>

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

Begin configuring your new visual parameters and troubleshooting any setup anomalies:

- **[Settings, Rendering & Keybindings](/docs/cli/settings)**: Customize keyboard hotkeys, themes, and screen buffers.
- **[Troubleshooting](/docs/cli/troubleshooting)**: Learn how to resolve authentication lockouts or path issues.
- **[CLI Reference](/docs/cli/reference)**: Access standard parameters lists and slash command mappings.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
