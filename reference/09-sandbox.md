## 9. Sandbox

`[DOCS]`

Enforces native operating system process isolation, manages execution containment boundaries, and protects local workstation environments from unauthorized remote calls or destructive terminal operations `[DOCS]`.

### Native OS Containment Ring

| Platform | Sandboxing Utility | Security & Containment Characteristics |
|---|---|---|
| **Linux** | `nsjail` | Open-source process isolator using kernel namespaces & cgroups to confine CPU, memory, and path visibility `[DOCS]`. |
| **macOS** | `sandbox-exec` | Native system tool enforcing policy profiles that restrict absolute filesystem access and raw TCP queries `[DOCS]`. |
| **Windows** | `AppContainer` | Desktop security containment ring isolating filesystem permissions and registry visibility `[DOCS]`. |

### Sandbox Activation & Configuration

Sandboxing is configured inside global preferences (`~/.gemini/antigravity-cli/settings.json` or `~/.gemini/settings.json`) `[DOCS]`:

```json
{
  "enableTerminalSandbox": true
}
```

- **`enableTerminalSandbox`** (boolean, default: `false`): Restricts all local terminal tools and execution commands launched by agents to OS containment rings `[DOCS]`.

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
