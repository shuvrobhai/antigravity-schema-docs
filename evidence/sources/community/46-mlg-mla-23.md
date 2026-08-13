---
source: 46
category: community
title: Claude Code Components
url: "https://ocdevel.com/mlg/mla-23"
final_url: "https://ocdevel.com/mlg/mla-23"
fetched: 2026-08-13
status: 200
---
Subscribe

[Episodes](/mlg)[Resources](/mlg/resources)

# MLA 023 Claude Code Components

All Episodes

Apr 12, 2025 (updated Feb 21, 2026)

Click to Play Episode

Claude Code distinguishes itself through a deterministic hook system and model-invoked skills that maintain project consistency better than visual-first tools like Cursor. Its multi-surface architecture allows developers to move sessions between CLI, web sandboxes, and mobile while maintaining persistent context.

### Vibe Coding Mini Series

- [Part 1: Vibe Coding](/mlg/mla-22)
- Part 2: Claude Code Components
- [Part 3: Agentic Software Engineering](/mlg/mla-24)

## Resources

Resources best viewed [here](/mlg/resources)Loading...

## Show Notes

[![CTA](/assets/walk_learn-Ch_lcLVe.avif)](/walk)

###### Learn Faster with a Walking DeskWalk While You Learn

Sitting for hours drains energy and focus. A walking desk boosts alertness, helping you retain complex ML topics more effectively.Boost focus and energy to learn faster and retain more.Discover the benefitsDiscover the benefits

### Agent Comparison

- **Cursor**: VS Code fork. Uses visual interactions (Cmd+K, Composer mode), multi-line tab completion, and background cloud agents. Credit-based billing (\$20 to \$200).
- **Codex CLI**: Terminal-first Rust agent. Uses GPT-5.3-Codex. Features three autonomy modes (Suggest, Auto-approve, Full Auto). Included in \$20 ChatGPT Plus.
- **Antigravity**: Agent-first interface using Gemini 3 Pro. Manager View orchestrates parallel agents that produce verifiable task lists and recordings.
- **Claude Code**: Terminal, IDE, and mobile sessions. Uses Sonnet/Opus 4.5/4.6. Differentiates via deep composability and cross-surface persistence.

### Persistent Memory and Skills

- **CLAUDE.md**: 4-tier hierarchy (Enterprise, Project, User, Local). Loads recursively, enabling monorepo support where child directories load lazily. Imports use `@` syntax.
- **Skills**: Model-invoked capability folders. Three-stage loading (metadata, instructions, supporting resources) minimizes context use. Claude triggers them based on description fields.
- **Commands**: User-triggered slash commands. `/compact` preserves topics while trimming history, `/init` generates memory files, and `/checkpoint` manages rollbacks.

### Enforcement and Integration

- **Hooks**: Deterministic shell commands or LLM prompts. Fired at 10 events, including `PreToolUse` (blocking), `PostToolUse` (formatting), and `Stop` (self-correction). Exit code 2 blocks actions, code 0 allows.
- **MCP**: Standard for connecting external tools (PostgreSQL, GitHub, Sentry). Tool Search activates when metadata exceeds 10% context window. Claude Code can serve its own tools via MCP.
- **Subagents**: Isolated context workers. `Explore` uses Haiku for discovery, `Plan` uses Sonnet for research. `isolation: worktree` provides filesystem-level separation.
- **Agent Teams**: Persistent multi-pane coordination via tmux. Modes: Hub-and-Spoke, Task Queue, Pipeline, Competitive, and Watchdog.

### Operations and Security

- **Checkpoints**: Granular undo allows independent rollback of code changes or conversation history.
- **Thinking Triggers**: Keywords `Think` to `Ultrathink` adjust reasoning compute allocation.
- **Headless**: `--print` or `--headless` flags enable CI/CD. GitHub Action uses four parallel agents to score review findings above 80% confidence.
- **Sandboxing**: Uses Apple Seatbelt (macOS) or Bubblewrap (Linux). Restricts filesystem and network access, reducing permission prompts by 84%.
- **Output Styles**: Modifies system prompts for `Default`, `Explanatory`, or `Learning` personas.

[![CTA](/assets/tts-IMcdDh0-.avif)](https://gnothiai.com/series)

###### Never Run Out of ML ContentGenerate Your Own Episodes

Want to go deeper on a topic this podcast didn't cover? Generate your own episodes - AI agents, transformers, diffusion models, whatever you're curious about. They appear right in your podcast app.Turn any ML topic into a podcast episode in your app.Start Generating →Start Generating →

## Transcript

# Claude Code Components

Vibe-coding - describing what you want in natural language and letting an AI agent write the code - was coined by Andrej Karpathy in February 2025. Within a year, roughly 44% of developers reported using AI coding agents daily. This guide covers the major tools, then goes deep on Claude Code - its components, how they compose, and what confuses people. By the end, you should understand every moving piece well enough to configure a productive setup from scratch.

------------------------------------------------------------------------

## Section 1: The landscape - four tools, four philosophies

You already know the players. Here's what actually differentiates them.

### Cursor

Cursor is an AI-native IDE - a VS Code fork - where the AI lives inside the editor. Its core interaction model is visual. Tab completion predicts multi-line blocks before you type them. Cmd+K does inline edits right where your cursor sits. Composer mode handles multi-file refactors from a single conversation. Version 2.2 added a built-in browser with DevTools-style click-and-drag visual editing and a Debug Mode agent that instruments your code to find root causes.

Cursor supports multiple model providers - Claude, GPT, Gemini, and its own proprietary model - and runs Background Agents in remote cloud environments for async work. The idea with Background Agents is that you can kick off a task, close your laptop, and come back later to review what the agent did while you were away.

Its biggest strength is the seamless GUI experience; you never leave the editor, and the AI feels like a natural extension of your IDE workflow rather than a separate tool. Its biggest weakness is pricing opacity: a mid-2025 shift from request-based to credit-based billing reduced effective usage and frustrated many users. Plans range from \$20 to \$200 per month, and it's genuinely hard to predict what your actual bill will look like until you've used it for a while.

If you're the kind of developer who lives in VS Code and wants AI assistance without changing your workflow, Cursor is the natural choice. If you prefer working in the terminal, or need deep extensibility and automation, it's less ideal.

### OpenAI Codex CLI

Codex CLI is Claude Code's most direct competitor - a terminal-first coding agent, fully open-source, built in Rust. It also has a cloud version inside ChatGPT called Codex Cloud. Three graduated approval modes - Suggest, Auto-approve, and Full Auto - control how much autonomy you give it. Suggest mode shows proposed changes and waits for approval. Auto-approve lets it make file changes without asking. Full Auto gives it complete freedom including running shell commands. The default model is GPT-5.3-Codex, which was purpose-built for agentic coding tasks.

What makes Codex interesting: it bundles with ChatGPT subscriptions at \$20/month, so if you're already paying for ChatGPT Plus you get a terminal coding agent included. It disables network access during code execution by default as a security measure, which means code it runs can't phone home or exfiltrate data - a meaningful safety advantage. And it can uniquely function as an MCP server itself, exposing its tools to other agents, which opens up interesting composition patterns.

It uses AGENTS.md for project memory, which serves the same purpose as Claude Code's CLAUDE.md - a markdown file at the project root that tells the agent about your project's conventions and setup. The downsides are confusing branding (it shares a name with OpenAI's deprecated 2023 API, leading to constant confusion in searches and discussions), aggressive usage limits on the Plus tier that power users hit quickly, and spotty Windows support.

### Google Antigravity

Antigravity launched alongside Gemini 3 in November 2025 as a free public preview. Its differentiator is being agent-first rather than editor-first. While Cursor and VS Code treat the AI as a sidebar assistant to the editor, Antigravity flips the relationship - the agents are the primary interface, and the editor is a supporting view.

The defining feature is a "Manager View" dashboard for orchestrating multiple agents working in parallel. You might have one agent refactoring backend code, another writing tests for the changes, and a third researching documentation - all visible and manageable from a single control panel. Agents generate verifiable artifacts like task lists and browser recordings rather than just raw tool calls, which gives you better visibility into what they're actually doing. And built-in browser automation lets agents write code, launch the resulting application, and test the UI autonomously without human intervention.

The default model is Gemini 3 Pro with generous free rate limits, though Claude and GPT models are also supported. As the newest entrant at barely three months old, its track record is thin and the ecosystem is immature. But the agent-first design philosophy is genuinely novel and worth watching.

### Why Claude Code for the rest of this guide

Claude Code wins on three axes. First, model quality - Sonnet 4.5 and Opus 4.5/4.6 are widely regarded as the strongest coding models available, capable of sustained 30-plus-hour autonomous coding sessions. Second, extensibility depth - no other tool matches its layered system of CLAUDE.md, Skills, Hooks, Subagents, Agent Teams, MCP servers, Plugins, and Output Styles, all of which compose together. You can build remarkably sophisticated workflows by combining these components, and that composability is what separates Claude Code from tools that offer a flatter feature set. Third, surface breadth - it runs as a terminal CLI, a VS Code extension, a JetBrains plugin, a web interface, a desktop app, an iOS app, and a Chrome extension, all sharing sessions seamlessly. You can literally start a coding session on your phone during your commute and pick it up in the terminal when you sit down at your desk.

It also has the most mature GitHub integration and the most developed ecosystem of community-contributed Skills and MCP servers. The rest of this guide covers every component in detail.

------------------------------------------------------------------------

## Section 2: Every component of Claude Code

We'll walk through each component one at a time. For each, we'll cover what it is, how it works mechanically, when you'd use it, and how it compares to what competitors offer.

### CLAUDE.md - persistent project memory

CLAUDE.md is a markdown file that acts as persistent, session-spanning memory. It's loaded into context automatically at the start of every session. You put everything Claude needs to know about your project here - build and test commands, code style rules, architectural decisions, workflow conventions, team-specific patterns. Think of it as onboarding documentation, but written for an AI that's going to be actively working in your codebase.

What makes this more than just a dotfile is the four-tier hierarchy. Memory loads in a strict precedence order. The highest-priority tier is enterprise policy, installed at the system level by IT admins - this is how organizations enforce company-wide standards that individual developers can't override. Next is project memory - a CLAUDE.md at the repo root, checked into source control and shared with your team. This is where most teams put their build commands, test commands, code style preferences, and architectural guidelines. Then there's user memory, stored in your home directory, which applies across all your projects - useful for personal preferences like "I prefer verbose git commit messages" or "always explain your reasoning before making changes." Finally, local project memory - a CLAUDE.local.md at the repo root that's gitignored and personal to you - useful for things like "I'm currently working on the payments module, prioritize that context" or project-specific preferences that don't apply to the rest of your team. All four tiers merge together at session start.

Claude Code also reads CLAUDE.md files recursively, which matters a lot for larger projects. It walks up from the current working directory to the filesystem root, loading every CLAUDE.md it finds along the way. In monorepos, CLAUDE.md files in child subdirectories are discovered lazily - they only load when Claude actually reads files in that subtree. So a monorepo can have a root-level CLAUDE.md with global conventions like "we use TypeScript everywhere" and subdirectory-level ones with package-specific instructions like "this service uses Prisma for database access and Jest for testing." Claude loads the right ones at the right time without polluting context with information about packages you're not working in.

There's also an import system that lets one CLAUDE.md reference other files using an @ syntax - pointing at your README, your package.json, or a separate coding-standards document. This keeps your CLAUDE.md focused while still giving Claude access to detailed reference material when it needs it. Imports chain up to five levels deep, and imports inside code blocks are ignored so you can document the syntax without accidentally triggering it.

For day-to-day management, typing the hash symbol at the Claude Code prompt adds a memory snippet to whichever file you choose. The `/memory` command opens any memory file in your editor for manual editing. And `/init` auto-generates a CLAUDE.md by analyzing your codebase - it reads your package.json, looks at your directory structure, examines your config files, and produces a reasonable starting point that you can then refine. There's even an auto-memory system where Claude records its own learnings during sessions without you asking. If Claude discovers that your project uses pnpm instead of npm, or that your test suite requires a specific environment variable, it can note that for future sessions automatically.

A well-crafted CLAUDE.md is concise - under 500 lines is the official guidance - specific rather than vague, and focused on things Claude can't infer from the codebase itself. Good content includes your exact build, test, and lint commands with the right flags; code style preferences that your linter doesn't enforce, like naming conventions for React components or the structure of API response objects; architectural invariants like "we never import from the database layer directly in React components"; and project-specific pitfalls like "the payments service has a 30-second timeout that tests need to account for." Bad content includes linter rules that should be enforced by hooks rather than hope, ephemeral data like dependency versions that change frequently, and information Claude can easily discover by reading your code.

On the competitor side: Cursor uses `.cursorrules` files. Codex CLI uses AGENTS.md. Antigravity uses a conversation-based knowledge base that learns from your feedback. None offer the four-tier hierarchy, recursive directory walk, lazy subdirectory loading, or import system that Claude Code provides.

### Skills - model-invoked capability packs

Skills are the most powerful and least understood component, and understanding them well pays enormous dividends. They're organized folders containing instructions, scripts, and reference materials that Claude discovers and loads dynamically when they're relevant to your task.

The critical concept - and what makes Skills different from everything else - is that they are model-invoked. Claude autonomously decides when to use them based on each Skill's description field. You don't have to type a slash command, though you can if you want to invoke one explicitly. Here's how it works in practice: at the start of every session, Claude reads the descriptions of all available Skills and holds them in its awareness. When you give Claude a task - say, "prepare this code for a pull request" - Claude scans those descriptions, determines that your "prepare-pr" Skill is relevant, and loads its full instructions on demand. You never had to tell Claude the Skill existed or when to use it. It just recognized the match and acted.

This follows a progressive disclosure architecture designed to keep context lean, and understanding the three stages helps you design better Skills. Stage one happens at session start: Claude loads only Skill metadata - names and descriptions - consuming roughly 100 tokens for scanning all available Skills. This is cheap and constant regardless of how many Skills you have. Stage two happens when Claude determines a Skill applies: it loads the full instructions from the SKILL.md file, capped at about 5,000 tokens. Stage three happens only if needed: supporting resources within the Skill folder - reference docs, templates, example files - load only when Claude explicitly accesses them. This three-stage loading means you can have dozens of Skills available without any of them consuming context until they're actually relevant. It's one of the most elegant design decisions in the entire system.

Each Skill lives in a folder with a required SKILL.md file at its root. That file has YAML frontmatter with several important fields. The name field becomes the slash command - it must be lowercase with hyphens only, maximum 64 characters. The description field is arguably the most important field in the entire Skill because it's what Claude reads to decide relevance. It can be up to 1,024 characters, and writing a good description is an art - too vague and Claude won't know when to use it, too narrow and it'll miss valid use cases. A good description reads like an "if you see this kind of request, this Skill is relevant" statement.

There are several optional frontmatter fields worth knowing about in detail. "Allowed-tools" restricts which tools the Skill can use. This is important for safety and focus - you might limit a research Skill to only Read, Grep, and Glob so it can't accidentally modify files, or limit a deployment Skill to specific bash commands. "Context fork" is a particularly powerful field - it runs the Skill in an isolated subagent with its own context window, so the Skill's internal reasoning doesn't pollute your main conversation. This is ideal for Skills that involve a lot of intermediate work, like researching a codebase or running a multi-step analysis. "Agent" specifies which subagent type to use when context is forked - the lightweight Explore agent for read-only research, or a custom agent you've defined. "Disable-model-invocation" prevents Claude from triggering the Skill automatically, requiring you to explicitly type the slash command - useful for Skills with side effects you always want to trigger consciously, like deployment or database migration Skills. And "argument-hint" provides a hint that appears when you start typing the slash command, like "\[topic\]" or "\[file path\]."

The body of SKILL.md below the frontmatter contains the instructions Claude follows when the Skill is active. A special variable captures anything the user types after the slash command, so a Skill invoked as "/research authentication" would have "authentication" available as the argument.

Skills can live in four places. Personal Skills go in your home directory under `.claude/skills/` and are available across all your projects - good for workflow patterns you use everywhere, like your preferred commit message format or your code review checklist. Project-level Skills go in `.claude/skills/` at the repo root and get shared with your team via git - good for project-specific procedures like your deployment workflow or your data migration process. Skills can also come bundled within installed plugins, which we'll cover later. And they can come from directories you add via the `--add-dir` CLI flag, which supports live change detection - meaning you can edit a Skill in one window and test it immediately in Claude Code without restarting. This is essential for rapid iteration when you're developing a new Skill.

A Skill folder can contain anything alongside the SKILL.md: reference documentation that provides detailed context, example files showing expected input and output, helper scripts the Skill can invoke, and templates for generating standardized output. These supporting files are available to Claude when the Skill is active but don't consume context until Claude actually reads them.

One important note about the evolution of this system: custom slash commands and Skills have merged. The older approach of putting markdown files in a `.claude/commands/` directory and the newer approach of creating Skill folders in `.claude/skills/` both produce slash commands that work the same way. Skills just add more capabilities on top - supporting file directories, frontmatter for controlling invocation behavior, and the critical model-invocation feature where Claude uses them autonomously. For any new work, prefer the Skills approach. Existing command files in the commands directory continue to work without changes, so there's no migration pressure.

On the competitor side: Codex CLI has no Skills system. Cursor has no equivalent, relying on `.cursorrules` for project-level guidance. Antigravity has a similar folder-based pattern under `.agent/skills/`.

### Commands - user-invoked slash commands

Commands are the explicit-trigger counterpart to Skills. You type `/command-name` and it runs. While Skills can be invoked automatically by Claude based on context, Commands are always manual - you're explicitly pushing a button.

Claude Code ships with over 30 built-in commands, and knowing the important ones makes a real difference in your daily workflow. Let's walk through the categories.

For project setup, `/init` analyzes your codebase and generates a starter CLAUDE.md. You'll typically run this once when you first start using Claude Code on a project, then refine the output manually.

For context management - which becomes critical in longer sessions - `/compact` compresses your conversation history. You can optionally specify a focus topic, like "/compact focus on the authentication changes," and it'll preserve detail about that topic while aggressively compressing everything else. `/context` shows you a percentage of how much of your context window is currently used, which helps you know when it's time to compact or start fresh. And `/clear` fully resets everything.

For configuration and management, `/model` switches which AI model you're using mid-session - useful for dropping to a cheaper model for simple tasks and switching back to a more capable one for complex work. `/agents` manages your custom subagents. `/hooks` manages your hook configurations. `/mcp` manages your MCP server connections. These management commands let you inspect and modify your setup without leaving Claude Code.

For workflow actions, `/review` requests a code review of recent changes. `/rewind` restores code and/or conversation to a previous checkpoint - we'll cover checkpoints more later. `/install-github-app` sets up the Claude GitHub Action for PR automation. `/output-style` switches communication style. `/sandbox` enables sandboxed execution. `/teleport` moves your session between different surfaces, like from terminal to web. And `/tasks` shows you the status of any backgrounded subagent work.

Creating a custom command means writing a markdown file in a commands directory - `.claude/commands/` at the project root for shared commands, or `~/.claude/commands/` in your home directory for personal ones. The filename minus its extension becomes the command name, so `review-security.md` creates `/review-security`. The file body is the prompt that gets injected when you invoke it. Optional YAML frontmatter lets you restrict which tools the command can access, set a description, specify a model override, and provide an argument hint.

A few features make custom commands more powerful than they first appear. Dynamic arguments let you pass information to the command - everything typed after the command name is captured and injected into the prompt via a special variable. So "/commit fix the login bug" would pass "fix the login bug" as the argument. Positional variables let you access specific space-separated arguments individually.

Bang commands are particularly clever - they let you embed shell commands inside your prompt that execute before the prompt reaches Claude, with their output injected into context. So you could write a command that includes the current git diff, the output of your test runner, or a directory listing as part of its prompt, all generated fresh at invocation time. This is what makes commands context-aware without requiring Claude to run those commands itself.

File references use the @ prefix to point at specific files or directories, pulling their contents into the prompt. Subdirectories namespace commands - a file at `.claude/commands/frontend/component.md` creates `/component` labeled with a "project:frontend" tag, helping you organize commands by domain. And MCP servers can expose their own prompts as slash commands, appearing in the command list with a server-name prefix.

### Hooks - deterministic lifecycle enforcement

Hooks are the enforcement layer, and understanding them requires understanding how they differ from everything else in the system. CLAUDE.md is guidance that Claude usually follows. Skills are capabilities Claude chooses to use. Hooks are deterministic shell commands or LLM prompts that fire every single time their conditions are met, regardless of model behavior. This distinction is fundamental. If something must happen without exception - code formatting, security checks, context injection - it's a Hook. If it's something Claude should usually do but you can live with it occasionally skipping, it belongs in CLAUDE.md or a Skill.

Hook configuration lives in JSON settings files at any level of the settings hierarchy - user-level, project-level shared, or project-level local. This means you can have personal hooks that only apply to you, team hooks that everyone shares via git, and organization-wide hooks that IT manages. Each hook definition specifies an event to listen for, an optional matcher that filters which tool invocations trigger it, the command or prompt to execute, and a timeout.

The heart of the hooks system is the event lifecycle, which defines every point where hooks can fire. Let's walk through each event and when you'd use it.

`SessionStart` fires when a session begins or resumes. This is your injection point for startup context - running a script that fetches your latest Jira tickets, checking git status, loading environment-specific configuration, or printing a welcome message with current project state. Since sessions can be resumed across days, SessionStart hooks let you always begin with fresh context regardless of when you last worked.

`UserPromptSubmit` fires when you send a prompt, before Claude sees it. This can actually block the prompt entirely - useful for input validation, profanity filters in shared environments, or intercepting special keywords to trigger non-Claude workflows.

`PreToolUse` fires before Claude executes any tool, and this is where most security enforcement happens. You can block dangerous commands like writes to .env files, DROP TABLE statements, force pushes to main, or any other operation your team considers off-limits. When you block a tool call, the error message you provide gets fed back to Claude, so it can understand what went wrong and try a different approach.

`PermissionRequest` fires when the user would normally see a permission dialog asking them to approve or deny an operation. Hooks here can auto-approve safe operations (like running your test suite, which you know is always safe) or auto-deny risky ones. This is a major quality-of-life improvement - instead of clicking "approve" every time Claude wants to run npm test, a hook can approve it automatically.

`PostToolUse` fires after a tool completes successfully. The classic use case is auto-formatting: every time Claude writes or edits a file, your formatter runs automatically on that file. Claude never sees the formatting diff, the output is always clean, and you eliminate an entire category of tedious back-and-forth. Other uses include logging, metrics collection, and triggering downstream processes.

`PostToolUseFailure` fires after a tool fails, which is useful for error monitoring, automatic retry logic, or injecting diagnostic context to help Claude understand what went wrong.

`Stop` fires when the main agent finishes its turn, and here's the powerful part: you can force Claude to keep working instead of finishing. A Stop hook might run your test suite and, if tests fail, tell Claude "tests are failing, keep going." Or it might use an LLM to evaluate whether Claude actually completed all the tasks you asked for, forcing continuation if something was missed. This turns Claude from a single-shot responder into a self-correcting loop.

`SubagentStop` works the same way but for subagents. `PreCompact` fires before context compaction, letting you preserve specific information or inject a summary. `Notification` fires when Claude sends notifications, useful for routing them to Slack or desktop notification systems. And `SessionEnd` fires when the session ends, useful for cleanup and logging.

Each hook has a matcher that controls which tool invocations trigger it. Matchers support exact match, regex patterns, wildcards for matching everything, argument patterns for bash commands (like matching anything starting with "npm test"), and MCP tool patterns for matching tools from specific servers.

The exit code is the entire control mechanism, and it's elegantly simple. Exit 0 means success - the action proceeds normally. Exit 2 means block - the action is prevented, and anything written to stderr gets fed back to Claude as an error message so it can self-correct. Any other exit code is a non-blocking warning that gets noted but doesn't prevent anything. What "block" means varies by event: for PreToolUse, it prevents the tool call entirely. For Stop, it forces Claude to keep working. For UserPromptSubmit, it erases the prompt before Claude ever sees it.

There's also an advanced JSON output mode that enables even finer control. When a hook exits 0, it can write structured JSON to stdout. The most powerful feature here is the ability to modify tool inputs before execution - transparently sandboxing commands by adding flags, auto-correcting file paths, or injecting additional arguments without Claude being aware of the modification. For permission events, hooks can return an explicit allow or deny decision programmatically.

Beyond shell commands, hooks can also be prompt-based, using an LLM - Haiku by default - for semantic evaluation. This enables context-aware decisions that shell scripts can't make. For example, a Stop hook might use Haiku to read Claude's output and determine whether it actually addressed all the requirements in the original request, rather than using a brittle string match that would miss nuances. The prompt receives the full event context and returns a judgment.

The most common hook patterns you'll encounter and want to set up are: auto-formatting code after every file write using PostToolUse on Write and Edit tools; blocking dangerous commands using PreToolUse on Bash; auto-approving safe operations like running tests using PermissionRequest; injecting startup context like git status and recent tickets using SessionStart; enforcing test-passing before completion using Stop; sending desktop notifications when Claude needs input using the Notification event; and logging all tool usage for audit purposes using PostToolUse with a wildcard matcher.

On the competitor side: Cursor recently added hooks for MCP governance, specifically before and after MCP tool execution. Codex CLI has no hook system - it's a top-requested community feature. Antigravity has no documented hook support. Claude Code's hook system is substantially more comprehensive than anything competitors offer.

### MCP servers - the universal tool integration layer

MCP, or Model Context Protocol, is an open standard now governed by the Linux Foundation for connecting AI tools to external data sources and APIs. It's the universal language that lets coding agents talk to external services. Claude Code acts as an MCP client that can connect to any number of servers simultaneously, each providing tools and capabilities beyond the built-in set.

To understand MCP concretely: when you connect a PostgreSQL MCP server, Claude gains the ability to run SQL queries against your database. When you connect a GitHub MCP server, Claude can create PRs, read issues, and check CI status. When you connect a Sentry MCP server, Claude can look up recent errors and their stack traces. The MCP server handles the API communication and authentication; Claude just sees new tools it can use.

There are three ways to connect to an MCP server. HTTP is the recommended approach for remote or cloud-hosted servers - you point Claude at a URL and optionally provide authentication headers. This is how you'd connect to hosted services like the official GitHub MCP server or Notion's MCP endpoint. Stdio is the traditional approach for local servers - Claude launches a subprocess on your machine, typically via npx or uvx, that communicates over standard input and output. This is common for database servers, file-watching tools, and locally-hosted utilities. And SSE, or Server-Sent Events, is an older transport that some servers still use.

Servers install at three scopes, and the precedence matters. Local scope is the default and stores configuration private to you for one project - useful for servers that need your personal API keys. Project scope stores configuration in a `.mcp.json` file at the project root that gets committed to git and shared with your team - this is how you ensure everyone on the team has access to the same database tools and documentation servers. User scope stores configuration in your home directory and makes a server available across all your projects - good for personal utilities you use everywhere.

The `.mcp.json` file at your project root is the standard team-sharing mechanism, and it's worth understanding how it works in practice. You commit the file with the server structure - names, transport types, URLs - but use environment variable references for any secrets. The syntax supports variable expansion with default values, so you commit something like "use the environment variable DATABASE_URL, or fall back to localhost if it's not set." This way the team shares the configuration structure but each developer provides their own credentials through their local environment.

An important performance feature is MCP Tool Search. When you connect many MCP servers, the total description text of all available tools can get large. Once it exceeds 10% of your context window, Claude Code switches to deferred loading - tools are registered but their full descriptions aren't loaded until Claude actually needs them. This achieves 95% less context usage compared to loading everything eagerly. It's what makes it practical to have ten or more MCP servers connected simultaneously without drowning your context in tool descriptions. As a user, this is invisible - Claude just knows about the tools and loads the details when needed.

Claude Code can also run as an MCP server itself via a serve command, exposing its built-in tools like Read, Edit, LS, and Bash to other MCP clients. This means you can use Claude Code as a tool provider for Claude Desktop, for other agent frameworks, or even for other Claude Code instances. It opens up interesting composition patterns where one agent orchestrates another.

The most popular MCP servers in the ecosystem are worth knowing about. GitHub's server provides PR management, issue tracking, and CI status - essential for any team workflow. Sentry provides error monitoring integration, so Claude can look up recent crashes and their context. PostgreSQL and SQLite servers let Claude query your database directly, which is transformative for debugging data issues. Context7 is a particularly valuable server that provides up-to-date library documentation - it prevents the common problem where Claude hallucinates API methods that don't exist because its training data is outdated. Playwright provides browser automation and testing. And there are integrations for Notion, Slack, Stripe, Figma, Linear, and many others. Community directories track over 1,500 available servers, and the number is growing rapidly.

Because MCP is a shared protocol, servers are largely interchangeable across tools. A server that works with Claude Code usually works with Cursor, Codex CLI, and Antigravity as well. All four major tools now support MCP, making it a genuine industry standard rather than a proprietary lock-in.

### Subagents - isolated workers within your session

Subagents are specialized AI workers that Claude delegates tasks to within a single session. Each runs with its own context window, a custom system prompt, and configurable tool access. The key value proposition is isolation - when Claude encounters a complex task, it can spawn a subagent to handle a focused piece, keeping the main conversation uncluttered with implementation details. The subagent does its work, returns a summary to the parent, and its full working context is discarded. Your main conversation stays clean and focused.

To understand this concretely: imagine you ask Claude to implement a new feature and also review the existing code for security issues. Without subagents, Claude would do both in the same conversation, and the security review notes would clutter your context for the rest of the feature work. With subagents, Claude spawns a security reviewer in a separate context, gets back a summary of findings, and your main conversation only contains the summary - not the hundreds of lines of intermediate analysis.

Three built-in subagents ship by default, each optimized for different work. The general-purpose subagent uses Sonnet with full read/write access for complex multi-step implementation tasks - this is what Claude uses when it needs to delegate real coding work. The Plan subagent uses Sonnet with read-only access for codebase research during planning phases - it can explore the codebase thoroughly without accidentally changing anything. And the Explore subagent uses Haiku with read-only access for fast, cheap file discovery and code exploration - perfect for quick "find me where X is defined" queries where you don't need a powerful model.

You can create custom subagents by writing markdown files in a project-level agents directory or a user-level agents directory. The frontmatter defines the subagent's identity and constraints, and getting this right is what makes custom subagents effective.

The name field is the identifier. The description field is critical because Claude uses it to decide when to spawn the subagent automatically - like Skills, a well-written description means Claude reaches for the right subagent at the right time. For example, a description like "Expert security review - use proactively after code changes to check for OWASP Top 10 vulnerabilities" tells Claude exactly when this subagent is appropriate.

The tools field restricts available capabilities. You might limit a security reviewer to only reading files and running git diff, ensuring it can analyze code but never modify it. Or limit a test-writing subagent to only working in your test directory. The model field specifies which model to use: sonnet for capable general work, opus for the most complex reasoning, haiku for fast cheap tasks, or inherit to use whatever the parent session is using. And the isolation field can be set to "worktree" for true git worktree-based filesystem isolation, meaning the subagent works on a separate copy of your code that gets merged back - useful for experimental changes you might want to discard.

The body of the markdown file is the system prompt defining the subagent's personality, expertise, and behavioral instructions. A security reviewer might get instructions about OWASP categories to check, common vulnerability patterns, and the format for reporting findings. A documentation writer might get instructions about your team's documentation style, which files to update, and how to structure API docs.

There are several important constraints and capabilities to know about. Subagents cannot spawn other subagents - this hard limit prevents infinite nesting and runaway costs. Multiple subagents can run in parallel - when Claude determines that tasks are independent, it will spawn several simultaneously. You can press Ctrl+B to background a running subagent and continue working in your main session, then check on it later with the `/tasks` command. And subagents can be chained in your instructions - "first use the analyzer subagent to identify issues, then use the optimizer subagent to fix the highest-priority ones."

On the competitor side: Codex CLI has experimental multi-agent capabilities. Cursor's Background Agents are conceptually similar but run in cloud sandboxes rather than locally. Antigravity's agent system is the most developed competitor, with its Manager View providing visual orchestration of multiple parallel agents.

### Agent Teams - independent sessions that coordinate

Agent Teams are an experimental feature - you need to set an environment variable flag to enable them - that coordinate multiple independent Claude Code sessions working together. The fundamental difference from subagents is important to understand clearly, because it determines when you'd use one versus the other.

Subagents run within a single session's context. The parent spawns one, it does work, returns a result, and the context is freed. It's a temporary delegation. Agent Teams are something entirely different: each team member is a full, independent Claude Code session running in its own terminal pane with its own persistent context. They don't share a context window. They communicate through a file-based messaging system - JSON inbox files stored in a shared directory. They maintain state and awareness across the entire collaborative session, which could last hours.

The architecture has one team lead who orchestrates the work and multiple teammates who do it. The lead creates tasks with dependency information - "task B is blocked by task A" - and teammates self-assign unblocked work from the shared task list. All participants can send messages to each other. When a teammate finishes a task, they report back to the team, and the lead synthesizes results and creates follow-up tasks as needed.

There are five workflow patterns that teams can follow, each suited to different situations.

Hub-and-Spoke is the most common general pattern: the leader defines all the work, spawns workers, workers execute independently and report back, the leader synthesizes everything into a coherent result. This works well for most multi-agent tasks.

Task Queue works for embarrassingly parallel work where tasks don't depend on each other: the leader creates a pile of independent tasks like "migrate this file to TypeScript, now this one, now this one" and workers grab them from the queue as they become available.

Pipeline handles sequential processing stages: Agent A produces output (maybe a design document), Agent B picks it up once A is done and implements the design, then Agent C takes over once B finishes and writes the tests. Each agent is blocked on the previous one.

Competitive has multiple agents tackle the same problem from different angles, and the leader selects the best solution. This is useful when there are genuinely different approaches to a problem and you want to compare them - different algorithms, different architectures, different libraries.

And Watchdog has one agent execute the work while another agent monitors for problems in real time, with the authority to trigger a rollback if something goes wrong. This is useful for higher-risk operations where you want a safety net.

Agent Teams require tmux or iTerm2 for split-pane terminal support, since each team member needs its own terminal. They cost approximately twice as much as a normal session due to persistent context maintenance and inter-agent communication overhead. They're best suited for research requiring multiple perspectives, new features with naturally separate ownership across architectural layers (one agent on frontend, one on backend, one on tests, one on documentation), and debugging where you want to explore competing hypotheses simultaneously rather than sequentially.

On the competitor side, Antigravity's Agent Manager is the closest analogue, providing a visual dashboard for multi-agent orchestration. It arguably has a smoother user experience for this pattern since it was designed agent-first from the beginning, with a visual Manager View built specifically for this purpose. Cursor's Background Agents work independently but don't communicate with each other, so they can't coordinate. Codex CLI has experimental multi-agent collaboration but it's early.

### Output Styles - reshaping how Claude communicates

Output Styles modify Claude Code's system prompt directly, transforming its personality, domain assumptions, and response formatting. They're the simplest component conceptually but easy to overlook.

Three built-in styles ship by default. "Default" is concise and task-focused - Claude does the work and tells you what it did without unnecessary commentary. "Explanatory" adds educational "Insights" sections after completions that explain design choices, codebase patterns, and the reasoning behind decisions. This is genuinely valuable when you're learning a new codebase or reviewing AI-generated code and want to understand the why, not just the what. "Learning" switches to a collaborative mode where Claude guides you through implementation rather than doing it all. It adds TODO markers for code you should write yourself and explains concepts along the way - useful for developers who want to learn by doing rather than just having code generated for them.

You can switch styles with the `/output-style` command interactively or specify one directly. Creating custom styles generates a markdown file with frontmatter. The key field is "keep-coding-instructions" - set it to false to fully replace coding behavior with your custom personality (useful for turning Claude into a domain-specific advisor), or true to only modify the communication style while keeping standard coding instructions intact (useful for just changing tone or verbosity).

There's a layering nuance worth understanding because it affects how different configuration mechanisms interact. Output styles replace portions of the system prompt - they operate at the deepest level. CLAUDE.md content is injected as a user message after the system prompt - it's project knowledge that informs Claude's work. And the `--append-system-prompt` CLI flag appends text to the end of the system prompt - useful for operational overrides in CI/CD or headless scripts. When these mechanisms conflict, understanding the layering helps you predict which instruction wins.

### Headless mode - scripting, CI/CD, and automation

The `-p` or `--print` flag runs Claude Code non-interactively, making it scriptable and pipeline-ready. You pass a prompt as a string, Claude executes it, and output goes to stdout. This is the foundation for every non-interactive use case, and it's what makes Claude Code more than just an interactive tool - it's an automation primitive.

Several flags shape headless behavior. You can restrict which tools Claude can use, preventing it from modifying files or running arbitrary commands in contexts where that would be dangerous. You can set the autonomy level from supervised (still asks for permission) to fully autonomous (approves everything automatically, intended for sandboxed environments). And you can control the output format - plain text for simple scripting, structured JSON that includes a session ID for programmatic parsing, or real-time streaming JSON that emits individual events as they happen, which is useful for building UIs on top of Claude Code.

Standard input piping works naturally. You can pipe error logs into Claude and ask for analysis. You can pipe a PR diff and ask for a security review. You can pipe a file and ask Claude to convert it to a different format. Anything you can produce with a shell command, you can feed to Claude as context.

Multi-turn headless conversations are supported through session management. The first call returns a session ID in its JSON output. Subsequent calls pass a resume flag with that session ID to continue in the same conversation context. This lets you build multi-step automation workflows where each step builds on the context of previous steps.

The GitHub Actions integration deserves specific attention because it's one of the most practical automation use cases. Anthropic provides an official GitHub Action in the marketplace. Once configured with your API key, commenting @claude on any PR or issue triggers Claude to analyze the context - the PR diff, the issue description, the conversation history - and respond as GitHub comments. It can review code, suggest fixes, answer questions about the changes, or implement requested modifications directly on the branch. The built-in code review plugin is particularly impressive: it launches four review agents in parallel, each examining the code from a different angle, scores each finding for confidence, and outputs only issues above 80% confidence. This dramatically reduces noise compared to most automated code review tools.

Common batch patterns that people build with headless mode include fan-out file processing (looping over source files and passing each to Claude for migration, refactoring, or analysis), piped pipeline analysis (feeding build output or test failures into Claude for automated diagnosis and fix suggestions), dependency audit workflows (running on a schedule to check for outdated or vulnerable dependencies), documentation generation (pointing Claude at code that's changed since the last release and asking it to update the docs), and commit message generation (piping a git diff and getting back a well-structured commit message).

On the competitor side: Codex CLI has a similar print mode with comparable capabilities. Cursor has no headless mode because it's fundamentally an IDE, not a CLI tool. Antigravity uses its API for automation rather than a CLI flag.

### Web vs. local, sandboxes, and surfaces

Claude Code runs across five surfaces that share sessions seamlessly, and this multi-surface availability is a genuine differentiator - no competitor matches it.

The terminal CLI is the power-user experience with full feature access and the fastest interaction loop. The VS Code extension - with over 2 million installs - provides a graphical sidebar with inline diffs that show exactly what Claude changed, accept/reject buttons for each change, plan review before implementation begins, an auto-accept mode for when you trust the workflow, and checkpoint visualization showing your rollback points. The JetBrains plugin supports IntelliJ, PyCharm, and WebStorm with similar capabilities. The web interface at claude.ai/code runs in cloud sandboxes, which we'll discuss in a moment. And the iOS app provides mobile access for reviewing work, launching tasks, and monitoring progress.

You can use the `/teleport` command to move a session between surfaces. Start reviewing code on your phone during your commute, teleport the session to your terminal when you get to your desk, and continue right where you left off. The `/desktop` command hands off specifically to the desktop app.

The web interface deserves special attention because it changes the security model. Each web session gets an isolated cloud VM with filesystem and network restrictions. Git credentials never enter the sandbox - they're handled by a secure proxy outside the VM boundary. This architectural choice means you can safely run fully autonomous permission modes in the cloud without any risk to your local machine or credentials. The web interface also supports launching multiple parallel sessions working on different branches simultaneously, which makes it a natural fit for batch work and parallel experimentation.

Local sandboxing uses OS-level enforcement for similar protection when running on your own machine. On macOS, Apple's built-in Seatbelt framework works out of the box without additional configuration. On Linux and WSL2, Bubblewrap provides equivalent process-level isolation. Two security boundaries work together - filesystem isolation restricts Claude to only the directories you specify, and network isolation controls which domains bash commands can reach. Together, these reduce permission prompts by 84% while maintaining security, because Claude can freely operate within the sandbox boundaries without needing your approval for each action.

### Other essential features

There are several more features that don't warrant their own full section but are important to know about.

**Plugins** bundle slash commands, agents, MCP servers, and hooks into shareable packages distributed through marketplaces. The key insight is that a complete workflow - a Skill that knows how to do something, an MCP server that provides the tools it needs, and hooks that enforce quality gates - can ship as one installable unit. Install with a plugin command and register third-party marketplaces to access community packages. This is currently in public beta and is likely to become the primary distribution mechanism for community-contributed tooling.

**The Claude Agent SDK** exposes the same tools, agent loop, and context management that power Claude Code as a library for building custom agentic applications in Python and TypeScript. It's for developers who want to build their own agentic workflows - custom CI bots, specialized code reviewers, automated refactoring tools - using Claude Code's infrastructure without using the CLI interface directly.

**Checkpoints** automatically save code state before each change Claude makes. This is your safety net, and it's more granular than you might expect. Double-pressing Escape or running `/rewind` lets you restore code, conversation, or both - independently. You can rewind the code to undo a change while keeping the conversation so Claude remembers what it tried. Or you can rewind the conversation to re-prompt Claude while keeping the code changes it already made. No competitor offers this level of granular rollback.

**Thinking triggers** control reasoning depth through keywords in your prompt. "Think" allocates baseline extended thinking. "Think hard" allocates more. "Think harder" allocates even more. And "ultrathink" allocates the maximum thinking budget available. These keywords directly influence how much compute Claude spends reasoning before acting. They're worth reaching for on complex architectural decisions, tricky debugging, or any situation where a quick answer is likely to be wrong and you'd rather Claude spend more time reasoning carefully.

**The permission system** offers four modes that control how much autonomy Claude has. Default mode asks before file writes and most bash commands - you approve each action. AcceptEdits mode auto-approves file changes but still asks for bash commands - good for when you trust Claude with code but want oversight on system operations. BypassPermissions mode auto-approves everything, including arbitrary shell commands - this should only be used in sandboxed environments where the blast radius is contained. And PlanMode is read-only, preventing any writes at all - useful for research and exploration. On top of these modes, the allowlist system lets you permanently approve specific tool patterns. You can say "always allow npm test" or "always allow reads from the src directory" to reduce the permission prompts you see day to day while keeping guardrails on everything else.

**Context management** is critical for productive long sessions and is honestly one of the biggest practical differences between productive and frustrating Claude Code usage. New users often hit a wall where Claude seems to lose track of what it's doing or starts repeating itself - that's usually context pressure. The `/compact` command compresses conversation history, optionally focusing on a specific topic to preserve relevant detail while aggressively discarding the rest. `/context` shows usage as a percentage so you can monitor the situation. Claude automatically compacts before hitting hard limits, but proactively compacting between unrelated tasks keeps things much snappier. And `/clear` fully resets when you want a fresh start. Learning when to compact versus when to start a completely fresh session is a skill that develops with experience, but the general rule is: compact between tasks within a work session, start fresh between work sessions.

------------------------------------------------------------------------

## The differentiations that trip people up

Now that we've covered every component, let's untangle the overlaps that confuse people. There are four key distinctions worth internalizing, and we'll take each one in turn.

### Skills vs. Commands vs. MCP servers

All three extend what Claude can do, but they answer fundamentally different questions. Skills answer "what knowledge or processes should Claude have available and use at its discretion?" They're capability packs - packages of instructions and resources - that Claude loads autonomously when it recognizes them as relevant to the current task. Commands answer "what actions should I be able to trigger explicitly?" They're buttons you push when you want a specific thing to happen. MCP servers answer "what external systems should Claude be able to talk to?" They're connections to databases, APIs, and services that live outside your local environment.

In practice, the Skills/Commands distinction has blurred because both can create slash commands. The remaining differences are that Skills add model-invocation (Claude uses them without being asked), progressive disclosure loading (consuming context only when relevant), supporting file directories for reference material, and frontmatter configuration for controlling behavior. For any new work, prefer the Skills approach unless you need something dead simple - a quick one-file command with no supporting resources.

MCP servers are fundamentally different from both: they don't contain instructions or prompts - they expose tools. An MCP server gives Claude the ability to query your database. A Skill tells Claude how to use that ability well for a specific workflow, like running a data migration with proper safety checks. You often pair them - the MCP server provides the database connection, and the Skill provides the migration procedure that uses it. This pairing of capability (MCP) with expertise (Skill) is one of the most powerful composition patterns in Claude Code.

### Skills and CLAUDE.md vs. Hooks

This is the most important distinction to internalize because misunderstanding it leads to the most common frustration with Claude Code. When CLAUDE.md says "always run prettier after editing files" or a Skill says "in situation X, do Y," that's a soft instruction. Claude will usually follow it. But it might forget in a long session when context gets compressed. It might interpret the instruction differently than you intended. Or it might deprioritize it under context pressure when there's a lot going on. These are probabilistic, best-effort instructions.

When a Hook says "on PostToolUse for Write, run prettier," it always executes. Deterministically. Every single time. The shell command fires and the exit code determines what happens next, completely independent of what Claude is thinking or how much context pressure exists. Hooks don't depend on Claude's attention or interpretation - they're infrastructure.

The practical rule is straightforward. Use Skills and CLAUDE.md for conventions, preferences, and patterns that benefit from Claude's judgment - coding style, architectural approaches, when to write tests, how to structure commits, which libraries to prefer. These are situations where you want Claude to apply the guidance intelligently based on context. Use Hooks for enforcement that must happen every time without exception - auto-formatting, blocking dangerous commands, injecting context at session start, running linters, enforcing security policies. These are situations where there's no judgment call to make - the thing either happens or it doesn't.

A practical test: if you find yourself writing "ALWAYS do X" in bold or all caps in your CLAUDE.md, and Claude still sometimes doesn't do X, that's a clear signal it should be a Hook instead. Hooks are the answer to "Claude keeps forgetting to do this."

### Agent Teams vs. Subagents

Subagents are lightweight, ephemeral, and contained. The parent Claude spawns one within its own session, the subagent works in its own context window with restricted tools, returns a summary of what it found or did, and its full working context is freed. Subagents can't talk to each other. They can't spawn their own subagents. They're cheap and simple - think of them as function calls that happen to be powered by an LLM. Use them for isolated, focused tasks: a security review, a codebase exploration, a test-writing job. The parent asks, the subagent delivers, and life goes on.

Agent Teams are heavyweight, persistent, and collaborative. Each team member is a full independent Claude Code session running in its own terminal pane with its own persistent context. They communicate through JSON inbox files. The team lead orchestrates work by creating tasks with dependencies. Teammates self-assign available tasks. Anyone can message anyone. They maintain state and awareness across the entire collaborative session, which could last hours.

When to use which: if the work decomposes into independent chunks that don't need to share findings with each other, use subagents. Each subagent does its thing and reports back - they don't need to know what the other subagents found. If the work requires ongoing coordination - a frontend agent that needs to know what API shapes the backend agent decided on, or a test agent that needs to know what edge cases the implementation agent considered - use Agent Teams. The persistent context and inter-agent messaging make this coordination possible. But Teams cost about twice as much due to persistent context and messaging overhead, and they require tmux or iTerm2 for the multi-pane terminal setup, so treat them as a power tool you reach for when the situation warrants it.

### Output Styles vs. CLAUDE.md vs. append-system-prompt

These three mechanisms all influence Claude's behavior but operate at different layers of the system, and understanding the layering helps when they seem to conflict. Output Styles modify the system prompt itself - they change Claude's fundamental personality, communication patterns, and behavioral defaults. CLAUDE.md content is injected as a user message after the system prompt - it provides project knowledge and conventions that Claude should follow. And the append-system-prompt CLI flag appends text to the end of the system prompt - it's useful for operational overrides in CI/CD or headless scripts where you need to add behavioral constraints without modifying the project's CLAUDE.md.

When they conflict, the general principle is: earlier layers (system prompt, where styles operate) tend to win for behavioral instructions, but CLAUDE.md wins for project-specific factual knowledge because it's more specific. In practice, you'll use styles for "how Claude should talk," CLAUDE.md for "what Claude should know about this project," and append-system-prompt for "what Claude should do differently in this specific automated context."

### The quick decision guide

To tie it all together, here's how to choose the right component for what you're trying to accomplish.

If you want to set project conventions and give Claude knowledge about your codebase, that's CLAUDE.md. If you want to give Claude a reusable capability it invokes automatically when relevant, that's a Skill. If you want to create an action you trigger explicitly by typing a slash command, that's either a Command or a Skill with model-invocation disabled. If you want to connect Claude to an external API, database, or service, that's an MCP server. If you want to enforce something that must happen every time without exception, that's a Hook. If you want to delegate a focused, isolated task within your current session, that's a Subagent. If you want to coordinate multiple persistent agents on complex work that requires inter-agent communication, that's an Agent Team. If you want to change how Claude talks to you, that's an Output Style. If you want to run Claude in CI/CD, scripts, or automation, that's headless mode with the print flag. And if you want to share a bundle of all of the above as a reusable package, that's a Plugin.

------------------------------------------------------------------------

## Section 3: Getting started

### Hello-world in five minutes

Install Claude Code via the native installer, Homebrew, or npm (though the npm approach is deprecated in favor of the native installer). Navigate to your project directory and run `claude`. Authenticate via the browser OAuth flow - it works with a Claude Pro or Max subscription, or an Anthropic API key. You'll do this once and then you're set.

Run `/init` to have Claude analyze your codebase and generate a starter CLAUDE.md. This is genuinely the single highest-leverage thing you can do early on - a good CLAUDE.md improves every subsequent interaction. Review what Claude generated, edit it to be more specific where you can, and add any knowledge that Claude couldn't infer from the codebase. Then start working: ask Claude to explain the architecture, add a feature, fix a bug, write tests. Talk to it like you'd talk to a new team member who's smart but unfamiliar with the project.

Run `claude doctor` at any point to verify your setup is healthy. It checks your authentication, permissions, MCP connections, and configuration.

### After you've got your sea legs

Once basic usage feels comfortable - give it a few days of daily use - add two things that will meaningfully improve your workflow.

First, add an MCP server for something you reach for regularly. The most common first choice is Context7, which provides live library documentation and prevents the frustrating situation where Claude suggests API methods that don't exist because its training data is outdated. Add it via the CLI using the stdio transport and the Context7 npm package, and verify connectivity with the `/mcp` command. Other strong first choices are your project's database (so Claude can query it directly when debugging data issues), GitHub's MCP server (for richer PR interactions and issue management), or Sentry (so Claude can look up recent errors when you're debugging).

Second, add a PostToolUse Hook for auto-formatting. Configure it in your project's settings JSON to run your project's formatter on every file write. Whether you use prettier, black, gofmt, or any other formatter, set it up as a hook that runs after every Write and Edit tool use. This eliminates an entire category of tedious back-and-forth where Claude writes code with slightly wrong formatting and you have to ask it to fix indentation or trailing commas. The hook fires automatically, the formatter runs silently, and Claude never even sees the formatting diff. It's the kind of small automation that compounds dramatically over a day of work.

### A day in the life

Start by navigating to your project and running `claude`. If you're resuming work from yesterday, use `claude --continue` to pick up your previous session. Ask "What's changed since yesterday?" to get a git history summary and reorient yourself.

For each task you tackle, follow the Explore, Plan, Code, Commit rhythm. First, ask Claude to read relevant files without writing anything - something like "read the auth module and its tests, don't change anything, just summarize what you find." This loads context and gives you a chance to make sure Claude understands the current state of things. Then ask it to plan the approach - "think hard about how to add password reset functionality and give me a plan before coding." Use "think hard" or "think harder" for complex tasks to allocate more reasoning budget. Review the plan, iterate on it if something seems off, then greenlight implementation by telling Claude to go ahead and code it. Once you're satisfied with the changes, ask Claude to stage, commit, and optionally create a PR.

Between unrelated tasks, run `/compact` to keep context fresh. This is the most common mistake new users make - working through three or four different tasks in a single session without compacting, until context fills up with stale information from earlier work and Claude starts losing track of what it's supposed to be doing. Monitor context pressure with `/context` and compact proactively.

For independent parallel tasks - say, a bug fix that doesn't touch the same files as a feature you're building - use separate terminal instances with git worktrees. Each instance gets its own Claude session with its own context, working on its own branch.

At end of day, ask Claude to summarize what was accomplished and flag any open items. Sessions persist automatically, so you can resume any time with `claude --continue`.

------------------------------------------------------------------------

## Section 4: Where this is heading

The trajectory is clear: developers are shifting from writing code to orchestrating agents. Multi-agent system interest surged over 1,400% from early 2024 to mid-2025 according to Gartner. The pattern emerging across all tools is cooperative model routing - smaller, faster, cheaper models handle routine tasks while larger, more capable models activate for complex reasoning, with orchestrator agents managing the handoff automatically.

For Claude Code specifically, the visible trajectory includes maturing Agent Teams from experimental to production-ready, building out the Plugin ecosystem into a proper marketplace with community distribution, deepening enterprise governance and sandboxing for regulated industries, and expanding the Agent SDK as the platform layer for building custom agentic applications on top of Claude Code's infrastructure. MCP is becoming genuine industry infrastructure - now governed by the Linux Foundation's Agentic AI Foundation with Anthropic, OpenAI, Google, AWS, and Microsoft all as sponsors. That level of cross-industry backing suggests MCP will be the standard for tool integration in AI agents for years to come.

The honest risk worth keeping in mind: fast AI-generated codebases without review discipline create technical debt faster than they create features. Research shows roughly 45% of AI-generated code contains security flaws. The developers who thrive with these tools treat AI output as a first draft - reviewed, tested, and understood before merging. The encouraging thing about Claude Code's architecture is that its entire component system - CLAUDE.md for conventions, Hooks for enforcement, Skills for expertise, Subagents for code review - exists precisely to encode that discipline into the workflow itself, rather than relying on the developer to remember to be careful every time. The tooling can enforce the rigor so your willpower doesn't have to.

DeepLearning.AI Short CoursesAI Engineering: Building Applications with Foundation Models - Chip HuyenAnthropic Prompt Engineering Interactive Tutorial
