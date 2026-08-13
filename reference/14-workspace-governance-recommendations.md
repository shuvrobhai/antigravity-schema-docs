## 14. Workspace Governance Recommendations

`[DOCS]`

To maximize development velocity while maintaining complete control, enterprise and local engineering teams should establish structured workspace governance paradigms aligned with official Antigravity CLI best practices `[DOCS]`.

### 1. Establish Local Verification Loops
- Ensure a workspace test suite or build script is defined before initiating agent tasks `[DOCS]`.
- Instruct agents to write test cases first, execute local verification scripts (e.g. `npm test`, `pytest`), and iterate on test outputs automatically `[DOCS]`.

### 2. Enforce the Three-Phase Execution Pattern
- **Exploration**: Direct the agent to explore codebase references and explain architecture before modifying code `[DOCS]`.
- **Planning**: Request a structured implementation plan artifact outlining file paths, dependencies, and logic overrides `[DOCS]`.
- **Execution**: Apply code edits only after reviewing and approving the implementation plan `[DOCS]`.

### 3. Maintain Codebase Rule Files
- Place a `GEMINI.md` or `AGENTS.md` file at the workspace root to define coding standards, styling paradigms, test flags, and deprecation notices `[DOCS]`.
- Agents automatically parse root rule files on startup to guide code generation `[DOCS]`.

### 4. Configure Structured Safety Barriers
Configure `~/.gemini/antigravity-cli/settings.json` based on team risk tolerance `[DOCS]`:

| Permission Preset | Behavior | Recommended Use |
|---|---|---|
| **`request-review`** | Prompts for confirmation before non-read operations `[DOCS]`. | Standard default mode `[DOCS]`. |
| **`proceed-in-sandbox`** | Confines terminal execution to an OS kernel sandbox ring (`enableTerminalSandbox: true`) `[DOCS]`. | High-autonomy untrusted script execution `[DOCS]`. |
| **`strict`** | Always prompts for all write and shell actions with line-by-line transparency `[DOCS]`. | High-security enterprise repositories `[DOCS]`. |

### 5. Active Session Management & Branching
- **Immediate Escape Hatch (`Esc`)**: Interrupts active agent execution immediately if search or code generation deviates `[DOCS]`.
- **History Rollback (`/rewind` / `/undo`)**: Rolls back conversation thread and filesystem state to a stable prior baseline `[DOCS]`.
- **Parallel Speculative Branching (`/fork`)**: Forks a session to experiment with alternative implementations without polluting the main thread `[DOCS]`.

### 6. Non-Interactive Scripting & Subagent Fan-Out
- Use `agy -p "prompt"` for non-interactive one-shot CI/CD queries and git hook automation `[DOCS]`.
- Dispatch concurrent background subagents for large-scale multi-file refactoring without blocking the main TUI prompt `[DOCS]`.
