---
source: 5
category: docs
title: Subagents
url: "https://antigravity.google/docs/subagents"
final_url: "https://antigravity.google/docs/subagents"
fetched: 2026-08-13
status: 200
---
# Asynchronous Subagents

Subagents are an excellent way to parallelize complex tasks and preserve the context of your main agent. Instead of executing every step serially, an agent can delegate tasks—such as running tests or performing extensive codebase searches—to dedicated subagents. This architecture frees the parent agent to continue working on other tasks in parallel and prevents its context window from being polluted by the details of a subagent’s work.

> **Antigravity CLI Reference:** Working in the terminal? See [CLI Background Tasks & Subagents](/docs/cli/subagents) and the [`/agents` Command Reference](/docs/cli/commands/agents) for TUI controls and keyboard shortcuts like `Alt+J` and `Ctrl+K`.

## Invoking Subagents

The parent agent calls the `invoke_subagent` tool to spawn a new concurrent session with a dedicated role and initial prompt.

- **Workspace Options**: The subagent can either inherit the same workspace as its parent (`inherit`), create an isolated Git worktree (`branch`), or share directory storage (`share`).
- **Context Isolation**: The subagent runs using the specified model tier but does not inherit the parent’s existing conversation history (context window), starting with a clean slate.
- **Execution**: Once invoked, the subagent immediately begins executing its task. A parent agent can invoke multiple subagents concurrently.
- **Monitoring**: You can directly monitor the progress of any subagent by clicking into its conversation via the subagent panel or pressing `Alt+J` in the CLI.

## Built-In Subagents

Antigravity comes pre-packaged with several specialized subagents out of the box:

- **`research`**: Optimized for codebase research, file navigation, and structural exploration.
- **`browser`**: Operates sandboxed web browsers to perform interactive browser testing (invoked exclusively via the `/browser` slash command).
- **`self`**: A direct clone of the calling agent, sharing identical system instructions and toolsets.

## Defining Custom Subagents (.md)

You can define reusable custom subagents in Markdown format (`.md`) with YAML frontmatter, or create transient subagents during a session using the `define_subagent` tool.

### Agent Location and Discovery

Antigravity automatically discovers custom subagent `.md` files in the following locations:

| Location | Path | Scope |
|----|----|----|
| **Workspace Customizations** | `.agents/agents/<name>.md` or `.agents/agents/<name>/agent.md` | Workspace / Repository Root |
| **Global Customizations** | `~/.gemini/config/agents/<name>.md` or `.../agents/<name>/agent.md` | Machine-wide / All Projects |
| **Plugins** | `plugins/<plugin_name>/agents/` | Bundled Plugin Package |

### Frontmatter Configuration (YAML)

Define agent metadata, capability limits, and execution policies using YAML frontmatter at the top of your `.md` file:

| Property | Type | Default | Description |
|----|----|----|----|
| `name` | `string` | *(Required)* | The unique identifier for the custom agent. |
| `description` | `string` | *(Required)* | Detailed description used by the planner to determine when to delegate tasks to this agent. |
| `tools` | `string[]` | `[]` | Explicit list of tools permitted for this subagent (e.g. `view_file`, `replace_file_content`, `grep_search`, `run_command`). |
| `mainAgent` | `boolean` | `true` | If `true`, allows selection as the primary agent in chat interfaces. |
| `subagent` | `boolean` | `true` | If `true`, allows invocation via the `invoke_subagent` tool. |
| `model` | `string` | `inherit` | Model tier used when invoked (`inherit`, `flash`, or `pro`). |
| `commandExecutionPolicy` | `string` | `sandbox` | Auto-execution policy for shell commands (`off`, `auto`, `eager`, `sandbox`). |
| `mcpServers` | `object[]` | `[]` | Custom Model Context Protocol servers configured for this subagent. |
| `skills` / `plugins` | `string[]` | `[]` | Skill paths (e.g. `skills/my-helper-skill`) or plugin dependencies. |

> **Known Issue (Tool Validation)**: Specifying an unmapped or misspelled tool name in the `tools` list may cause the subagent process to hang during execution. Please double-check exact tool names (such as `view_file` or `run_command`) when configuring custom subagents. Enhanced schema validation and a fix for this behavior will be released in an upcoming update.

### System Prompt & Markdown Body

The content following the YAML `---` delimiter defines the subagent’s system prompt. You can organize instructions using standard Markdown H1 headings (`# System Prompt`, `# Review Guidelines`).

### Example Markdown Custom Agent (`code-auditor.md`)

content_copy

    ---
    name: code-auditor
    description: Specialized subagent for security audits, static analysis, and code quality reviews.
    tools:
      - view_file
      - grep_search
      - run_command
    subagent: true
    mainAgent: false
    model: pro
    commandExecutionPolicy: sandbox
    skills:
      - skills/security-checklist
    ---

    # System Prompt
    You are an expert security auditor and code reviewer. Your primary objective is to inspect source code for security vulnerabilities, memory leaks, and anti-patterns.

    # Review Guidelines
    1. Perform thorough static analysis without altering files unless explicitly asked.
    2. Flag potential injection flaws, unvalidated inputs, or hardcoded secrets.
    3. Provide concise, actionable remediation steps for each finding.

## Subagent Lifecycle and States

Subagents run asynchronously in the background. At any point during a session, a subagent exists in one of three states:

### 1. Running

The subagent is actively executing its task, calling tools, and generating responses.

- **Cancellation**: You can cancel a running subagent by clicking **Stop Subagent** in the subagent panel (or pressing `k` in the CLI).
- **Parent Control**: The parent agent can interrupt a subagent by sending a message or terminating it.

### 2. Idle

The subagent has completed its task, sent a result message to its parent agent, and paused execution.

- **Re-awakening**: An idle agent automatically re-awakens to the *Running* state upon receiving a message from another agent.
- **Context Retention**: When awoken, the agent retains all context from its prior execution turns.

### 3. Killed

The subagent is permanently terminated and cannot be re-awoken.

- **Cleanup**: Any temporary Git worktrees generated for the subagent are automatically cleaned up.
- **Visibility**: Historical conversation transcripts remain readable in JSONL logs.

## Inter-Agent Communication & Nesting Limits

Agents communicate by sending messages to each other using unique agent conversation IDs.

- **Flexible Routing**: Agents can communicate with parent agents, subagents, or peer agents whose ID is known.
- **Auto-Wake**: Sending a message to an idle subagent automatically re-awakens it to process incoming instructions.
- **Shared Transcripts**: Agents can read each other’s conversation transcripts to audit multi-step workflows.

warningNesting Depth Limit: A maximum nesting depth of 10 levels (layers of subagents beneath the primary agent) is strictly enforced to prevent runaway recursion or resource exhaustion.

## Permissions and Configuration Inheritance

Subagents inherit safety configurations from their parent agent to maintain security boundaries:

- **Inherited Scopes**: Subagents automatically inherit the parent’s allowed terminal command prefixes, file read/write directory scopes, and sandbox settings.
- **Workspace Access**: Parent agents retain full access to their subagents’ workspaces, including isolated Git worktrees.
- **Permission Bubbling**: If a subagent encounters a tool execution requiring user authorization, the request automatically bubbles up to the main UI/Subagent panel.

## Multi-Agent Teamwork (Ultra Plan Only)

Antigravity 2.0 introduces advanced multi-agent orchestration for complex high-level goals.

starUltra Plan Exclusive: The /teamwork-preview slash command is currently in preview and is exclusive to users on the Ultra (\$200/mo) plan.

Using `/teamwork-preview` prompts the main agent to launch a collaborative multi-agent framework. This framework features built-in error recovery, automatic retries, and task coordination, allowing you to define the high-level goal while the platform manages the agent team.
