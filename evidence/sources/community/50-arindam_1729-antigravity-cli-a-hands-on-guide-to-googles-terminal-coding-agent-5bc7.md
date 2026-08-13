---
source: 50
category: community
title: Antigravity CLI hands-on guide (dev.to)
url: "https://dev.to/arindam_1729/antigravity-cli-a-hands-on-guide-to-googles-terminal-coding-agent-5bc7"
final_url: "https://dev.to/arindam_1729/antigravity-cli-a-hands-on-guide-to-googles-terminal-coding-agent-5bc7"
fetched: 2026-08-13
status: 200
---
The AI coding agent space has been reshuffling fast. Anthropic has Claude Code, OpenAI has Codex CLI, xAI has Grok CLI, and now Google has retired Gemini CLI and replaced it with something bigger: **Antigravity CLI**, a Go-based terminal agent that shares its engine with the Antigravity 2.0 desktop application.

In this tutorial, I will walk you through everything you need to know to get started with Antigravity CLI. We will cover the installation process, authentication, the agent and command modes, and build two practical projects that show what this tool can actually do. By the end, you will have a solid foundation for using Antigravity CLI in your real development workflow.

------------------------------------------------------------------------

## What Is Antigravity CLI?

[![ ](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fxtl1z3by4rl2tunkhbnh.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fxtl1z3by4rl2tunkhbnh.png)

Antigravity CLI is Google's command-line coding agent powered by the Gemini family of models (with optional support for Claude and open-source backends). Unlike a simple chat wrapper, it is designed to reason across your project, edit multiple files at once, spawn subagents for parallel work, and call tools on your behalf.

Google describes it as a lightweight Terminal User Interface (TUI) that brings the core capabilities of Antigravity 2.0 (multi-step reasoning, multi-file editing, tool calling, and persistent history) directly to your terminal. It is the official replacement for Gemini CLI, which sunsets for individual Google AI Pro and Ultra users on **June 18, 2026**.

Here is a quick look at what makes Antigravity CLI stand out:

- **Built in Go**: snappier startup and lower memory footprint than the Node-based Gemini CLI it replaces.
- **Shared agent engine with Antigravity 2.0**: the desktop app and the CLI use the same runtime, so updates land everywhere at once.
- **Bidirectional sync with the GUI**: preferences, permissions, and even active sessions can be exported from the terminal into the desktop app and back.
- **Async subagents**: long-running refactors and research tasks run in parallel without blocking your prompt.
- **First-class extensibility**: Agent Skills, Hooks, Subagents, MCP servers, and Plugins (the rebrand of Gemini CLI Extensions) are all supported.
- **SSH-aware authentication**: detects remote sessions and gives you an auth URL to open on your local browser.

------------------------------------------------------------------------

## Prerequisites

Before you get started, make sure you have the following in place:

- **Operating system**: macOS, Linux, or Windows (native PowerShell, no WSL required).
- **Curl** (macOS/Linux) or PowerShell 5+ (Windows): used by the installer.
- **A Google account**: any Google AI Pro, Ultra, or free-tier account works. Code Assist Standard/Enterprise customers can use their existing license.
- **Basic terminal comfort**: you do not need to be a shell expert, but knowing how to navigate directories and run commands will help.

------------------------------------------------------------------------

## Installing Antigravity CLI

Installation is a single command. Open your terminal and run the one that matches your OS.

**macOS / Linux:**\

    curl -fsSL https://antigravity.google/cli/install.sh | bash

**Windows (PowerShell):**\

    irm https://antigravity.google/cli/install.ps1 | iex

The installer detects your environment, drops the binary (named `agy`, not `antigravity`) into `~/.local/bin/` on Unix or `%LOCALAPPDATA%\Antigravity\` on Windows, and prints the line you need to add to your shell profile if the directory is not already on `PATH`.

Once it finishes, restart your terminal and verify the installation worked:\

    agy --version

You should see the version number printed. If the command is not found, double-check that the install directory is on your `PATH`.

------------------------------------------------------------------------

## Authentication

The first time you run `agy`, it kicks off a Google Sign-In flow. On a desktop machine it opens your browser automatically and walks you through the OAuth grant. Credentials are then cached in your system keyring (Keychain on macOS, Credential Manager on Windows, libsecret on Linux).

If you are working over SSH or in a headless server environment, Antigravity CLI detects the remote session and prints an authorization URL plus a one-time code. Open the URL on your local machine, paste the code, and the CLI completes the handshake. This fixes one of the more painful flows in the old Gemini CLI.

If you would rather use an API key (for CI or scripting), set it before running any command:\

    export ANTIGRAVITY_API_KEY=your_api_key_here

To make this permanent, add the export line to your `~/.bashrc` or `~/.zshrc` file, then source it:\

    source ~/.zshrc

------------------------------------------------------------------------

## Understanding the Operating Modes

Antigravity CLI gives you three distinct ways to interact with it, each suited to a different context.

### 1. Interactive Agent Mode

This is the default mode. Running `agy` from any project directory launches the full TUI: a scrollable conversation pane, a `>` prompt, and a status bar showing the active model, token usage, and any running subagents.\

    agy

[![Image11](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fxlpmgn1u109d77m9b0fo.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fxlpmgn1u109d77m9b0fo.png)

Once inside, you can type natural language prompts. A few starter prompts to try in any repo:\

    Explain this repo

    What does @src/main.go do and where is it called from?

The `@` syntax pulls a file into context without you having to paste it. You can also reference whole directories (`@src/`) or glob patterns (`@**/*.ts`).

You can switch models mid-session using the `/model` slash command. Antigravity CLI ships with access to Gemini 3.5 Flash, Gemini 3.1 Pro, Claude Sonnet, Claude Opus, and GPT-OSS 120B (subject to your plan):\

    /model gemini-3.1-pro

Useful built-in slash commands inside the TUI:

- `/help`: list every command and keyboard shortcut.
- `/context`: show token usage broken down by category and manage checkpoints.
- `/usage`: quota and rate-limit status across all available models.
- `/export`: push the current session into Antigravity 2.0 so you can keep working in the GUI.

### 2. Command Mode

Command mode is designed for quick, inline assistance: getting a one-shot completion or a terminal command without leaving whatever you were doing. Trigger it with **Cmd + I** on macOS or **Ctrl + I** on Windows/Linux from inside the TUI, or invoke it headlessly:\

    agy -p "Write a Go function that reads a CSV and returns a summary struct"

For structured output that you can pipe into other tools, add `--output-format`:\

    agy -p "List all TODOs in this codebase" --output-format json

This is the mode you reach for from shell scripts, Git hooks, or CI jobs.

### 3. Async Subagent Mode

Antigravity CLI's headline upgrade over Gemini CLI is asynchronous subagents. From inside the TUI you can dispatch a long-running task to a background agent and keep prompting in the foreground:\

    /agent refactor "Convert all callback-based handlers in @internal/api to use context.Context"

The subagent reports progress in the status bar and posts its diff back into the conversation when finished. You can run several in parallel, which is handy for splitting a big refactor across packages.

------------------------------------------------------------------------

## Inspecting Your Project Context

When you drop Antigravity CLI into a new project, the most useful command to run is `agy inspect`:\

    agy inspect

This prints a summary of everything the agent has discovered, including:

- Configuration files it has loaded (`.agents/`, `AGENTS.md`, project-level instructions).
- Agent Skills available globally (`~/.gemini/antigravity-cli/skills/`) and per-workspace (`.agents/skills/`).
- Plugins loaded (including any Gemini CLI extensions you imported).
- Hooks registered for the project.
- MCP servers connected from `mcp_config.json`.

If Antigravity CLI is not behaving the way you expect, `agy inspect` is your first debugging step. It shows you exactly what context the agent is working with.

------------------------------------------------------------------------

## Migrating From Gemini CLI

If you were already using Gemini CLI, Antigravity CLI ships a one-shot importer that pulls your old extensions, model preferences, and auth state across:\

    agy plugin import gemini

It walks the legacy `~/.gemini/` directory, converts each extension into a Plugin, and rewrites your `settings.json` into the new schema. Original files are left untouched until you confirm.

The official migration guide lives at `antigravity.google/docs/gcli-migration` and covers edge cases like custom auth providers and air-gapped enterprise installs.

## Customizing Antigravity CLI for Your Project

Antigravity CLI supports project-level customization through a few mechanisms.

**AGENTS.md**: drop a plain-English instruction file at the root of your project. Anything you write here gets prepended to every prompt processed inside that directory:\

    Always use TypeScript. Prefer functional patterns over class-based ones. Never use `any` as a type.
    Run `pnpm test` after every change that touches src/.

**Agent Skills**: reusable slash commands. Place a Markdown file at `.agents/skills/lint.md` and it becomes `/lint` inside the TUI. Skills can include their own prompts, allowed tools, and even nested subagent definitions. Global skills live at `~/.gemini/antigravity-cli/skills/`.

**Hooks**: JSON-defined lifecycle interceptors that fire before a tool call, after a file edit, or on session start. Use them for things like auto-running `gofmt` after every write or blocking edits to `vendor/`.

**MCP servers**: both local (stdio) and remote (HTTP) Model Context Protocol servers are supported, configured in a dedicated `mcp_config.json`. Remote servers require a `serverUrl` field.

Run `agy inspect` any time to confirm which of these are active in the current directory.

------------------------------------------------------------------------

## Custom Model Configuration

If you want to pin the CLI to a specific model or point it at a self-hosted or third-party endpoint, edit your config file (`~/.config/antigravity/config.toml`). The configuration accepts:

- `model`: the model identifier (e.g. `gemini-3.1-pro`, `claude-opus`, `gpt-oss-120b`)
- `base_url`: the API base URL, useful for proxies or self-hosted Gemma deployments
- `name`: a human-readable label shown in the TUI
- `env_key`: the environment variable that holds the API key

After adding a custom model, select it with the `-m` flag:\

    agy -m my-custom-model -p "Summarize the changes in the last 5 commits"

Or switch to it inside the TUI with `/model my-custom-model`.

------------------------------------------------------------------------

## Honest Assessment: Strengths and Limitations

Antigravity CLI is the most polished launch of a Google developer tool in a while, but it is worth going in with calibrated expectations.

**Where it shines:**

- The Go rewrite is noticeably faster than Gemini CLI. Startup feels instant and the TUI stays responsive even under long sessions.
- Async subagents are a genuine workflow upgrade. Splitting a refactor across three background agents and watching their diffs land one by one is genuinely useful, not a gimmick.
- SSH-aware auth fixes the single biggest pain point of Gemini CLI for remote developers.
- Bidirectional sync with Antigravity 2.0 means you can switch between the terminal and the GUI without losing context.
- Built-in support for multiple model families (Gemini, Claude, GPT-OSS) lets you pick the right tool for each task.

**Where to be careful:**

- Like every LLM-based coding agent, it can produce plausible-looking code with subtle bugs. Always review generated output before running it in production.
- The plugin ecosystem is essentially Gemini CLI's extension ecosystem with a coat of paint. Many extensions work but a few have not been re-tested against the new runtime.
- Async subagents are powerful but they consume your quota in parallel. Watch `/usage` if you are on a metered plan.
- Enterprise (Code Assist Standard/Enterprise) users can stay on Gemini CLI indefinitely, but everyone else needs to migrate before **June 18, 2026** or lose access entirely.

------------------------------------------------------------------------

## What to Learn Next

Now that you have Antigravity CLI running and you have seen what it can do, here are some directions worth exploring:

- **Agent Skills**: write a small Markdown file to turn a common prompt into a reusable slash command for your team.
- **MCP servers**: connect Antigravity CLI to your database, internal docs, or issue tracker so the agent can pull live context.
- **Subagent recipes**: experiment with patterns like "researcher + writer" or "scout + fixer" pairs that run async.
- **Antigravity 2.0 desktop**: use `/export` to push a hard problem from the terminal into the GUI when you want richer file diffs and graph views.
- **Antigravity SDK**: if you want to embed agent capabilities inside your own apps, the SDK exposes the same runtime that powers the CLI.

The official Antigravity documentation at `antigravity.google/docs` is the best place to go deeper on all of these topics.

------------------------------------------------------------------------

## Final Thoughts

Antigravity CLI is more than a rebrand of Gemini CLI. The Go rewrite, async subagents, shared runtime with the desktop app, and SSH-aware auth add up to a genuinely different product. It is fast to install, thoughtfully designed around extensibility, and its mix of interactive, command, and async modes covers a wide range of real development scenarios.

The fact that Google built it as a peer of the Antigravity 2.0 desktop application, not a stripped-down companion, is a sign that the terminal is being treated as a first-class surface, not an afterthought.

Give it a try in your next project and see where it fits.

![pic](https://media2.dev.to/dynamic/image/width=256,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png) [Create template](/settings/response-templates)

Templates let you quickly answer FAQs or store snippets for re-use.

Submit

Preview

[Dismiss](/404.html)

[![npravdin profile image](https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1342489%2F03deee49-6ba6-47bb-ae5d-fdb8244e22ac.jpeg)](https://dev.to/npravdin) [npravdin](https://dev.to/npravdin)

npravdin

[![](https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1342489%2F03deee49-6ba6-47bb-ae5d-fdb8244e22ac.jpeg) npravdin](/npravdin)

Follow

- Joined Mar 10, 2024

• [May 26](https://dev.to/arindam_1729/antigravity-cli-a-hands-on-guide-to-googles-terminal-coding-agent-5bc7#comment-38dci)

It doesn't seem to be working:\

    > agy -p "List all TODOs in this codebase" --output-format json
    flags provided but not defined: -output-format
    Usage of C:\Users\unnamed\AppData\Local\agy\bin\agy.exe:
      --add-dir                       Add a directory to the workspace (repeatable) (default [])
      -c                              Short alias for --continue
      --continue                      Continue the most recent conversation
      --conversation                  Resume a previous conversation by ID
      --dangerously-skip-permissions  Auto-approve all tool permission requests without prompting
      -i                              Short alias for --prompt-interactive
      --log-file                      Override CLI log file path
      -p                              Short alias for --print
      --print                         Run a single prompt non-interactively and print the response
      --print-timeout                 Timeout for print mode wait (default 5m0s)
      --prompt                        Alias for --print
      --prompt-interactive            Run an initial prompt interactively and continue the session
      --sandbox                       Run in a sandbox with terminal restrictions enabled

    Available subcommands:
      changelog       Show changelog and release notes
      help            Show help for subcommands
      install         Configure environment paths and shell settings
      plugin          Manage plugins (install, uninstall, list, enable, disable)
      plugins         Alias for plugin
      update          Update CLI

[![peacockz profile image](https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F3948608%2F4afe1938-c625-4d4d-8570-561d29f35988.jpeg)](https://dev.to/peacockz) [Zach Peacock](https://dev.to/peacockz)

Zach Peacock

[![](https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F3948608%2F4afe1938-c625-4d4d-8570-561d29f35988.jpeg) Zach Peacock](/peacockz)

Follow

- Joined May 24, 2026

• [May 24](https://dev.to/arindam_1729/antigravity-cli-a-hands-on-guide-to-googles-terminal-coding-agent-5bc7#comment-38bcj)

What is the toml to use local models in AGY? I've tried all combinations I can think of and nothing works. I can't find any other details outside of this article about it.

[![charlesbasis profile image](https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F2277394%2F0ba55cea-df1c-4ab6-b97d-7f1060bf9885.png)](https://dev.to/charlesbasis) [Charles Valerio Howlader](https://dev.to/charlesbasis)

Charles Valerio Howlader

[![](https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F2277394%2F0ba55cea-df1c-4ab6-b97d-7f1060bf9885.png) Charles Valerio Howlader](/charlesbasis)

Follow

- Joined Oct 26, 2024

• [May 24](https://dev.to/arindam_1729/antigravity-cli-a-hands-on-guide-to-googles-terminal-coding-agent-5bc7#comment-38bha)

Thanks for sharing! How can I preview file changes before accepting edits?

[![jeremy_whalen_456f6171824 profile image](https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F3949788%2F0a2fef0c-07ed-405e-b721-74ac70417dfa.jpg)](https://dev.to/jeremy_whalen_456f6171824) [Jeremy Whalen](https://dev.to/jeremy_whalen_456f6171824)

Jeremy Whalen

[![](https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F3949788%2F0a2fef0c-07ed-405e-b721-74ac70417dfa.jpg) Jeremy Whalen](/jeremy_whalen_456f6171824)

Follow

- Joined May 25, 2026

• [May 25](https://dev.to/arindam_1729/antigravity-cli-a-hands-on-guide-to-googles-terminal-coding-agent-5bc7#comment-38c84)

The "agy inspect" command seems to be part of the SDK. No worries, this is early days for the CLI and the documentation is SPARSE.

Are you sure you want to hide this comment? It will become hidden in your post, but will still be visible via the comment's [permalink](#).

Hide child comments as well

Confirm

For further actions, you may consider blocking this person and/or [reporting abuse](/report-abuse)
