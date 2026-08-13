---
source: 7
category: docs
title: Permissions
url: "https://antigravity.google/docs/cli/permissions"
final_url: "https://antigravity.google/docs/cli/permissions"
fetched: 2026-08-13
status: 200
---
# Permissions

Secure your local workstation, restrict absolute file paths, configure custom allow/deny/ask policies, and manage interactive approvals. You can also manage these rules interactively using the **[Permissions Command](/docs/cli/commands/permissions)**.

## Fine-grained permissions

To secure your workstation while enabling autonomous workflows, Antigravity CLI integrates a robust **Fine-Grained Permissions Engine**. Every sensitive operation the agent performs is represented as a **permission resource** formatted as `action(target)`.

Permissions are evaluated across three distinct access lists configured inside your global settings:

content_copy

    ~/.gemini/antigravity-cli/settings.json

- **`deny`**: The action is blocked immediately.
- **`ask`**: The agent pauses and prompts for your explicit approval before proceeding.
- **`allow`**: The action is auto-approved without prompting.

warningPrecedence Rule: Conflicting rules are strictly evaluated in priority order: Deny \> Ask \> Allow. For example, if you configure command(\*) in your ask list and command(git) in your allow list, the ask rule takes precedence and prompts before every command.

## Supported actions & matching rules

Fine-grained permissions follow a standard schema pattern:

content_copy

    action(target)

The supported actions, target format specifications, and matching algorithms are:

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr>
<th>Action</th>
<th>Target Format</th>
<th>Matching Behavior</th>
<th>Default Fallback</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong><code>read_file</code></strong></td>
<td><code>read_file(/path)</code>, <code>read_file(dir)</code>, or <code>read_file(*)</code></td>
<td>Matches absolute paths or paths relative to workspace roots. Grants recursive read access to all contained files/folders. <code>read_file(*)</code> matches all files on the system.</td>
<td><strong>Ask</strong> (Auto-allowed in workspace)</td>
</tr>
<tr>
<td><strong><code>write_file</code></strong></td>
<td><code>write_file(/path)</code> or <code>write_file(*)</code></td>
<td>Same as <code>read_file</code>. Implicitly grants <code>read_file</code> for the exact same target path.</td>
<td><strong>Ask</strong> (Auto-allowed in workspace)</td>
</tr>
<tr>
<td><strong><code>read_url</code></strong></td>
<td><code>read_url(domain)</code> or <code>read_url(*)</code></td>
<td>Matches hostnames and subdomains (e.g., <code>google.com</code> covers <code>mail.google.com</code>). Ignores URL path segments. <code>read_url(*)</code> matches any domain.</td>
<td><strong>Ask</strong></td>
</tr>
<tr>
<td><strong><code>execute_url</code></strong></td>
<td><code>execute_url(domain)</code> or <code>execute_url(*)</code></td>
<td>Actuating on web elements (clicking, typing) or driving interactive browser workflows on a domain.</td>
<td><strong>Ask</strong></td>
</tr>
<tr>
<td><strong><code>command</code></strong></td>
<td><code>command(prefix)</code>, <code>command(regex)</code>, or <code>command(*)</code></td>
<td>Matches commands by exact word/token prefix. Each whitespace-separated token is evaluated as an anchored regular expression (<code>^(?:pattern)$</code>).<br />
<br />
For example, <code>command(npm run (build|lint|test))</code> matches <code>npm run build</code> and <code>npm run test</code>.</td>
<td><strong>Ask</strong></td>
</tr>
<tr>
<td><strong><code>unsandboxed</code></strong></td>
<td><code>unsandboxed(prefix)</code> or <code>unsandboxed(*)</code></td>
<td>Matches commands by exact word/token prefix. Commands matching this grant will be executed outside of container isolation (only applicable when terminal sandboxing is enabled).</td>
<td><strong>Ask</strong></td>
</tr>
<tr>
<td><strong><code>mcp</code></strong></td>
<td><code>mcp(server/tool)</code> or <code>mcp(*)</code></td>
<td>Matches exact MCP tools or all tools on a specified server (applies to local <code>mcp</code> servers and remote connections). <code>mcp(*)</code> matches any tool.</td>
<td><strong>Ask</strong></td>
</tr>
</tbody>
</table>

### Global wildcard syntax

Across all supported action types, passing the global wildcard `*` (such as `read_file(*)`, `command(*)`, `mcp(*)`) matches all targets within that entire action namespace.

### Implicit permission rules

- **Write implies Read**: Allowing `write_file` on a path automatically grants `read_file` on that path.
- **Deny Read implies Deny Write**: Denying `read_file` on a path immediately blocks `write_file` on that path.

### Cross-platform path normalization

Antigravity ensures your permission rules work flawlessly whether you are developing on macOS, Linux, or Windows. On macOS and Linux, paths use standard forward slashes (`/`). On Windows, Antigravity automatically normalizes paths prior to rule evaluation by stripping drive letters (e.g., `C:`) and converting all backslashes (`\`) to forward slashes (`/`).

------------------------------------------------------------------------

## Default system behaviors & guardrails

When an action is not explicitly listed in your `allow`, `deny`, or `ask` lists, the system falls back to secure system defaults:

1.  **Workspaces are Auto-Allowed**: In standard operation, reading and writing files inside your active project directory is automatically allowed.
2.  **Web Browsing Defaults to Ask**: Actions for `read_url` and `execute_url` default to **Ask**. Before the agent navigates to or actuates on any web page, it will pause and prompt for your approval unless an allow rule is configured.
3.  **Unconfigured Actions Default to Ask**: All other unconfigured actions (`command`, `mcp`, `execute_url`, non-workspace files) default to **Ask**.

------------------------------------------------------------------------

## Interactive permission prompts

When the agent encounters an operation requiring approval (**Ask** mode), an interactive prompt card appears in your TUI.

Before confirming **Allow** for file, URL, or MCP permissions, you can directly edit the target string in the prompt card to expand the granted scope (e.g., broadening a single file request like `/project/file.txt` to the parent directory `/project`). The CLI validates that your edited target safely covers the operation and applies the expanded grant for the remainder of the turn, preventing repeated prompts for related operations. *(Note: Scope editing is not supported for terminal commands).*

------------------------------------------------------------------------

## Configuration examples

Add these rules to your `~/.gemini/antigravity-cli/settings.json` file:

content_copy

    {
      "permissions": {
        "allow": [
          "command(git)",
          "command(npm run (build|lint|test))",
          "unsandboxed(git push)",
          "read_file(/var/log/app)",
          "write_file(src/)",
          "read_url(google.com)",
          "mcp(linter/*)"
        ],
        "deny": [
          "command(rm -rf)",
          "command(curl .*)",
          "command(sudo)",
          "write_file(.git/)",
          "write_file(/home/user/.ssh)"
        ],
        "ask": [
          "command(*)",
          "execute_url(aws.amazon.com)",
          "mcp(sql/execute_mutation)"
        ]
      }
    }

## See also

- **[Permissions Command](/docs/cli/commands/permissions)**: Manage rules interactively in the TUI.
- **[Sandbox Customization](/docs/cli/sandbox)**: Enforce OS-level container isolation boundaries.
- **[Plugins & Skills](/docs/cli/plugins)**: Create your own custom skills slash commands.
- **[Settings, Rendering & Keybindings](/docs/cli/settings)**: Customize keyboard hotkeys and buffers.
