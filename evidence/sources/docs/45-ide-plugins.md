---
source: 45
category: docs
title: IDE Plugins
url: "https://antigravity.google/docs/ide/plugins"
final_url: "https://antigravity.google/docs/ide/plugins"
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
- Plugins

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Plugins<a href="#plugins" class="deep-link-anchor" aria-label="Link to section">link</a>

Plugins are namespaced bundles that allow you to extend Antigravity’s capabilities by grouping skills, rules, MCP servers, and hooks into a single package.

## Directory Structure<a href="#directory-structure" class="deep-link-anchor" aria-label="Link to section">link</a>

If you want to create your own plugins or inspect existing ones, they follow a specific directory structure. A plugin is a directory containing a `plugin.json` file and optional subdirectories for different customization types:

<div class="code-container" data-code-container="" data-clean-code="plugins/&lt;plugin-name&gt;/
├── plugin.json       # Required marker file
├── mcp_config.json   # Optional MCP server definitions
├── hooks.json        # Optional hooks definition
├── skills/           # Optional skills
│   └── &lt;skill-name&gt;/
│       └── SKILL.md
└── rules/            # Optional rules
    └── &lt;rule-name&gt;.md" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
plugins/<plugin-name>/
├── plugin.json       # Required marker file
├── mcp_config.json   # Optional MCP server definitions
├── hooks.json        # Optional hooks definition
├── skills/           # Optional skills
│   └── <skill-name>/
│       └── SKILL.md
└── rules/            # Optional rules
    └── <rule-name>.md
```

</div>

</div>

### Manifest File (`plugin.json`)<a href="#manifest-file-pluginjson" class="deep-link-anchor" aria-label="Link to section">link</a>

Every plugin must have a `plugin.json` file at its root. This file identifies the directory as a plugin.

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;name&quot;: &quot;my-custom-plugin&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "name": "my-custom-plugin"
}
```

</div>

</div>

The `name` field is optional and defaults to the directory name if omitted.

## Supported Components<a href="#supported-components" class="deep-link-anchor" aria-label="Link to section">link</a>

A plugin can contain the following components:

1.  **Skills**: Located in the `skills/` subdirectory. Each skill must have a `SKILL.md` file containing instructions for the agent.
2.  **Rules**: Located in the `rules/` subdirectory. These are markdown files that define constraints or guidelines for the agent’s behavior.
3.  **MCP Servers**: Configured via `mcp_config.json` at the plugin root. This allows you to connect Antigravity to external tools and services.
4.  **Hooks**: Configured via `hooks.json` at the plugin root. These allow you to run scripts or commands when specific events occur.

## How to Add Plugins<a href="#how-to-add-plugins" class="deep-link-anchor" aria-label="Link to section">link</a>

There are two ways to add plugins to Antigravity:

### 1. Using Bundled Plugins (Build with Google)<a href="#1-using-bundled-plugins-build-with-google" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity comes with a variety of bundled plugins created by Google. You can browse and add these plugins directly from the user interface:

- Navigate to the **Customizations** page.
- For more details about the available Google-built plugins, see the [Build with Google Page](/docs/build-with-google).

### 2. Manually Adding Plugins<a href="#2-manually-adding-plugins" class="deep-link-anchor" aria-label="Link to section">link</a>

You can also add custom plugins by placing your plugin folders in one of the designated plugin locations. Antigravity automatically scans these directories to discover and load your customizations:

- **Workspace Level**: Place your plugin folder inside a `.agents/plugins/` or `_agents/plugins/` directory at the root of your opened workspace. This makes the plugin available only when working in this specific workspace.
- **Global Level**: Place your plugin folder inside `~/.gemini/config/plugins/` in your user home directory. This makes the plugin active across all workspaces.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
