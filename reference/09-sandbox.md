## 9. Sandbox

`[DOCS]`

Enforces native operating system process isolation, manages execution containment boundaries, and protects local workstation environments from unauthorized remote calls or destructive terminal operations `[DOCS]`.

### Native OS Containment Rings

| Platform | Sandboxing Technology | Filesystem Containment | Network Egress Policy |
|---|---|---|---|
| **Linux** | `nsjail` | Kernel namespaces (`CLONE_NEWNS`, `CLONE_NEWUSER`), cgroups v2 resource bounds, read-only system root (`/`), private workspace mount | Network namespace unsharing (`CLONE_NEWNET`) isolates network stack; raw outbound sockets blocked `[DOCS]`. |
| **macOS** | `sandbox-exec` (Seatbelt / SBPL) | Scheme-based policy profiles (`.sb`) enforcing `(allow file-read*)` and `(allow file-write* (subpath <workspace>))` | `(deny network-outbound)` blocks unauthorized outbound socket connections `[DOCS]`. |
| **Windows** | `AppContainer` | Low-integrity restricted token, workspace DACL access grants, isolated registry namespace | Network client capabilities restricted via AppContainer security attributes `[DOCS]`. |

### Sandbox Activation & Security Guarantees

Sandboxing is configured inside global preferences (`~/.gemini/antigravity-cli/settings.json` or `~/.gemini/settings.json`) `[DOCS]`:

```json
{
  "enableTerminalSandbox": true
}
```

- **`enableTerminalSandbox`** (boolean, default: `false`): Restricts all local terminal tools and execution commands launched by agents to OS containment rings `[DOCS]`.
- **Fail-Closed Security Guarantee:** If the underlying OS sandbox binary or namespace capabilities are missing (e.g. inside an unprivileged Docker container lacking namespace privileges), execution **fails closed** with a hard error rather than silently executing unprotected `[DOCS]` / `[GOOGLE]`.
- **Symlink Escape Prevention:** Symlinks within the project directory pointing to targets outside the workspace root are blocked to prevent directory traversal escapes (`../`) `[DOCS]` / `[GOOGLE]`.

### Interactive Approval Behavior

When an agent attempts shell tool execution, the TUI prompt adapts dynamically to your sandboxing state `[DOCS]`:

- **Sandbox Enabled**: Prompt offers a temporary escape option:
  1. *Yes*
  2. *Yes, and run without sandbox restrictions* (bypasses containment exclusively for that single run)
  3. *No*
- **Sandbox Disabled**: Prompt allows forcing containment for a high-risk command:
  1. *Yes*
  2. *Yes, and run in sandbox* (forces single-execution containment ring)
  3. *No*
