## 14. Workspace Governance Recommendations
[DOCS:17]

To maximize development velocity while maintaining complete control, enterprise and local engineering teams should establish structured workspace governance paradigms aligned with official Antigravity CLI best practices `[DOCS:17]`.

### 1. Establish Local Verification Loops
- Ensure a workspace test suite or build script is defined before initiating agent tasks.
- Instruct agents to write test cases first, execute local verification scripts (e.g. `npm test`, `pytest`), and iterate on test outputs automatically.

### 2. Enforce the Three-Phase Execution Pattern `[DOCS:17,28]`
- **Exploration**: Direct the agent to explore codebase references and explain architecture before modifying code.
- **Planning**: Request a structured implementation plan artifact outlining file paths, dependencies, and logic overrides.
- **Execution**: Apply code edits only after reviewing and approving the implementation plan.

### 3. Maintain Codebase Rule Files `[DOCS:20]`
- Place a `GEMINI.md` or `AGENTS.md` file at the workspace root to define coding standards, styling paradigms, test flags, and deprecation notices.
- Agents automatically parse root rule files on startup to guide code generation.

### 4. Configure Structured Safety Barriers `[DOCS:03,07]`
Configure `~/.gemini/antigravity-cli/settings.json` based on team risk tolerance:

| Permission Preset | Behavior | Recommended Use |
|---|---|---|
| **`request-review`** | Prompts for confirmation before non-read operations. | Standard default mode. |
| **`proceed-in-sandbox`** | Confines terminal execution to an OS kernel sandbox ring (`enableTerminalSandbox: true`). | High-autonomy untrusted script execution. |
| **`strict`** | Always prompts for all write and shell actions with line-by-line transparency. | High-security enterprise repositories. |

### 5. Active Session Management & Branching `[DOCS:12,14]`
- **Immediate Escape Hatch (`Esc`)**: Interrupts active agent execution immediately if search or code generation deviates.
- **History Rollback (`/rewind` / `/undo`)**: Rolls back conversation thread and filesystem state to a stable prior baseline.
- **Parallel Speculative Branching (`/fork`)**: Forks a session to experiment with alternative implementations without polluting the main thread.

### 6. Non-Interactive Scripting & Subagent Fan-Out `[DOCS:05,10]`
- Use `agy -p "prompt"` for non-interactive one-shot CI/CD queries and git hook automation.
- Dispatch concurrent background subagents for large-scale multi-file refactoring without blocking the main TUI prompt.
