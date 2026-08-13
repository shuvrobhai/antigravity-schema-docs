---
source: 6
category: docs
title: Sandbox
url: "https://antigravity.google/docs/cli/sandbox"
final_url: "https://antigravity.google/docs/cli/sandbox"
fetched: 2026-08-13
status: 200
---
# Sandbox

Enforce native operating system process isolation, manage execution containment boundaries, and protect your local workstation.

## The security model

Because autonomous development agents run local terminal commands, edit source codes, and execute tests directly in your workspace, maintaining a secure workstation environment is critical. Antigravity CLI integrates a native **Terminal Sandbox** to restrict destructive shell operations or unauthorized remote network calls.

### Native OS containment

Unlike heavy virtual containers or isolated virtual machines that slow down execution speeds, Antigravity uses lightweight, native operating system kernel utilities to create secure process rings with zero execution overhead:

| Operating System | Sandboxing Utility | Security Characteristics |
|----|----|----|
| **Linux** | `nsjail` | Open-source process isolator utilizing kernel namespaces and cgroups to confine CPU, memory, and path visibility. |
| **macOS** | `sandbox-exec` | Native system tool enforcing policy profiles that restrict absolute filesystem access and raw TCP queries. |
| **Windows** | `AppContainer` | Desktop security containment ring isolating filesystem permissions and registry visibility. |

## Activating the sandbox

You configure the sandbox directly inside your global preferences:

content_copy

    ~/.gemini/antigravity-cli/settings.json

### Sandbox configurations

Add the sandboxing toggle to your settings profile:

content_copy

    {
      "enableTerminalSandbox": true
    }

- **`enableTerminalSandbox`** (boolean, default: `false`): Restricts all local execution commands launched by agents to OS containment rings.

## Interactive approvals with sandbox

When the agent attempts to run a terminal tool or shell command, the TUI prompt block adapts dynamically based on your sandboxing state:

- **When Sandbox is Enabled**: The prompt panel offers a temporary escape option:

  content_copy

      Do you want to proceed?
      1. Yes
      2. Yes, and run without sandbox restrictions
      3. No

  Choosing Option 2 bypasses the containment barrier exclusively for that single execution run.

- **When Sandbox is Disabled**: The prompt lets you force containment for a risky command:

  content_copy

      Do you want to proceed?
      1. Yes
      2. Yes, and run in sandbox
      3. No

## See also

- **[Permissions Engine](/docs/cli/permissions)**: Configure fine-grained allow/deny policy rules.
- **[Plugins & Skills](/docs/cli/plugins)**: Create your own custom skills slash commands.
- **[Settings, Rendering & Keybindings](/docs/cli/settings)**: Customize keyboard hotkeys and buffers.
