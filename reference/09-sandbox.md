## 9. Sandbox
[DOCS:06]

Enforces native operating system process isolation, manages execution containment boundaries, and protects local workstation environments from unauthorized remote calls or destructive terminal operations `[DOCS:06]`.

### Native OS Containment Rings `[DOCS:06]`

| Platform | Sandboxing Technology | Filesystem Containment | Network Egress Policy |
|---|---|---|---|
| **Linux** | `nsjail` | Kernel namespaces (`CLONE_NEWNS`, `CLONE_NEWUSER`), cgroups v2 resource bounds, read-only system root (`/`), private workspace mount | Network namespace unsharing (`CLONE_NEWNET`) isolates network stack; raw outbound sockets blocked. |
| **macOS** | `sandbox-exec` (Seatbelt / SBPL) | Scheme-based policy profiles (`.sb`) enforcing `(allow file-read*)` and `(allow file-write* (subpath <workspace>))` | `(deny network-outbound)` blocks unauthorized outbound socket connections. |
| **Windows** | `AppContainer` | Low-integrity restricted token, workspace DACL access grants, isolated registry namespace | Network client capabilities restricted via AppContainer security attributes. |

### Sandbox Activation & Security Guarantees `[DOCS:06]`

Sandboxing is configured inside global preferences (`~/.gemini/antigravity-cli/settings.json` or `~/.gemini/settings.json`):

```json
{
  "enableTerminalSandbox": true
}
```

- **`enableTerminalSandbox`** (boolean, default: `false`): Restricts all local terminal tools and execution commands launched by agents to OS containment rings.
- **Fail-Closed Security Guarantee `[INFERRED]`:** If the underlying OS sandbox binary or namespace capabilities are missing (e.g. inside an unprivileged Docker container lacking namespace privileges), execution is inferred to **fail closed** with a hard error rather than silently executing unprotected (security design contract).
- **Symlink Escape Prevention `[INFERRED]`:** Symlinks within the project directory pointing to targets outside the workspace root are restricted to prevent directory traversal escapes (`../`).


### Interactive Approval Behavior `[DOCS:06]`

When an agent attempts shell tool execution, the TUI prompt adapts dynamically to your sandboxing state:

- **Sandbox Enabled**: Prompt offers a temporary escape option:
  1. *Yes*
  2. *Yes, and run without sandbox restrictions* (bypasses containment exclusively for that single run)
  3. *No*
- **Sandbox Disabled**: Prompt allows forcing containment for a high-risk command:
  1. *Yes*
  2. *Yes, and run in sandbox* (forces single-execution containment ring)
  3. *No*
