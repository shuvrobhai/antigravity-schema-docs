---
source: 36
category: docs
title: Sidecars
url: "https://antigravity.google/docs/sidecars"
final_url: "https://antigravity.google/docs/sidecars"
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
- Antigravity 2.0
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Customizations
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Sidecars

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Sidecars<a href="#sidecars" class="deep-link-anchor" aria-label="Link to section">link</a>

Sidecars are background processes that run alongside Antigravity. Antigravity manages the lifecycle of sidecars, automatically launching them and restarting them if they crash or error.\
They are useful for persistent background scripts, scheduled recurring tasks, and reacting to events.

## Configuration<a href="#configuration" class="deep-link-anchor" aria-label="Link to section">link</a>

Sidecars are discovered by searching for `sidecar.json` configuration files. They can be defined in two locations:

- Global sidecars: Under `~/.gemini/config/sidecars/`
- Plugin sidecars: Under `~/.gemini/config/plugins/<pluginName>/sidecars/`

Each sidecar has its own directory and the directory name is used as the sidecar’s ID. Sidecars loaded from plugins have the ID `<pluginName>/<sidecarName>`.

The sidecar’s directory must contain a `sidecar.json` file and may also contain other helper files like scripts to run. The sidecar’s directory also acts as the current working directory for the sidecar’s command.

Example directory structure

<div class="code-container" data-code-container="" data-clean-code="~/.gemini/config/sidecars/
├── sidecar1/
│   ├── sidecar.json
│   └── script.py
└── sidecar2/
    └── sidecar.json

~/.gemini/config/plugins/
└── my-plugin/
      └── sidecars/
            └── plugin-sidecar/
                  └── sidecar.json" data-astro-cid-4g3kud3p="">

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
~/.gemini/config/sidecars/
├── sidecar1/
│   ├── sidecar.json
│   └── script.py
└── sidecar2/
    └── sidecar.json

~/.gemini/config/plugins/
└── my-plugin/
      └── sidecars/
            └── plugin-sidecar/
                  └── sidecar.json
```

</div>

</div>

### Config Schema (sidecar.json)<a href="#config-schema-sidecarjson" class="deep-link-anchor" aria-label="Link to section">link</a>

- **`command`** (string): Command/executable (e.g., `python3` or `/bin/bash` ). Mutually exclusive with `builtin`.
- **`builtin`** (string): Builtin command to execute. Currently supports `schedule`. Mutually exclusive with `command`.
- **`args`** (string\[\]): Optional. Arguments passed to the command or builtin function.
- **`restart_policy`** (string): Optional. Restart behavior. One of `always`, `on-failure`, or `never`. Defaults to `always`.
- **`description`** (string): Optional. Human-readable description of what the sidecar does.
- **`env`** (object): Optional. Map of environment variables to set for the sidecar process.
- **`display_name`** (string): Optional. Display name used in the UI.

One of `command` or `builtin` must be set.

Examples:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;description&quot;: &quot;Background worker&quot;,
  &quot;command&quot;: &quot;python3&quot;,
  &quot;args&quot;: [&quot;worker.py&quot;],
  &quot;restart_policy&quot;: &quot;on-failure&quot;
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "description": "Background worker",
  "command": "python3",
  "args": [
    "worker.py"
  ],
  "restart_policy": "on-failure"
}
```

</div>

</div>

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;description&quot;: &quot;Hourly agent to triage review requests.&quot;,
  &quot;builtin&quot;: &quot;schedule&quot;,
  &quot;args&quot;: [
    &quot;0 * * * *&quot;,
    &quot;agentapi&quot;,
    &quot;new-conversation&quot;,
    &quot;Give me a summary of incoming review requests.&quot;
  ]
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "description": "Hourly agent to triage review requests.",
  "builtin": "schedule",
  "args": [
    "0 * * * *",
    "agentapi",
    "new-conversation",
    "Give me a summary of incoming review requests."
  ]
}
```

</div>

</div>

### User Configuration (config.json)<a href="#user-configuration-configjson" class="deep-link-anchor" aria-label="Link to section">link</a>

Sidecars are disabled unless explicitly enabled by the user in the global configuration file, located at `~/.gemini/config/config.json`.

- **`enabled`** (boolean): Whether the sidecar is enabled.
- **`projectId`** (string): Optional. The ID of the project `agentapi` will create conversations in.

Example:

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;sidecars&quot;: {
    &quot;sidecar1&quot;: {
      &quot;enabled&quot;: true
    },
    &quot;my-plugin/plugin-sidecar&quot;: {
      &quot;enabled&quot;: true,
      &quot;projectId&quot;: &quot;&lt;projectId&gt;&quot;
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
  "sidecars": {
    "sidecar1": {
      "enabled": true
    },
    "my-plugin/plugin-sidecar": {
      "enabled": true,
      "projectId": "<projectId>"
    }
  }
}
```

</div>

</div>

### Runtime Data<a href="#runtime-data" class="deep-link-anchor" aria-label="Link to section">link</a>

Runtime data produced by sidecars are stored in `~/.gemini/antigravity/sidecar_data/<sidecarId>/`.

This includes:

- **`data/`**: Subdirectory for any persistent data. This path is available via the `ANTIGRAVITY_EXECUTABLE_DATA_DIR` environment variable.
- **`logs/`**: Auto-generated timestamped logs from stdout and stderr.
- **`events/`**: JSON files recorded for `agentapi` calls.

### `schedule` builtin<a href="#schedule-builtin" class="deep-link-anchor" aria-label="Link to section">link</a>

`schedule` is a simple builtin scheduler for running recurring commands.

<div class="code-container" data-code-container="" data-clean-code="{
  &quot;builtin&quot;: &quot;schedule&quot;,
  &quot;args&quot;: [
    &quot;* * * * *&quot;,
    &quot;&lt;command&gt;&quot;,
    &quot;&lt;arg1&gt;&quot;,
    &quot;&lt;arg2&gt;&quot;
  ]
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "builtin": "schedule",
  "args": [
    "* * * * *",
    "<command>",
    "<arg1>",
    "<arg2>"
  ]
}
```

</div>

</div>

The first argument is a standard 5-field cron expression. The remaining arguments are the command and arguments to run on the specified schedule.

### `agentapi`<a href="#agentapi" class="deep-link-anchor" aria-label="Link to section">link</a>

Sidecars can use the `agentapi` CLI to programmatically interact with Antigravity. The executable is automatically added to the sidecar’s path and available as `agentapi`.

- `agentapi new-conversation <prompt>`\
  Sidecars creating conversations must have a `projectId` set.
- `agentapi send-message <conversation_id> <prompt>`

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
