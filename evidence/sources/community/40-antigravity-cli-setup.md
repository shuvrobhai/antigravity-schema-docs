---
source: 40
category: community
title: Antigravity CLI Setup
url: "https://docs.claude-mem.ai/antigravity-cli/setup"
final_url: "https://docs.claude-mem.ai/antigravity-cli/setup"
fetched: 2026-08-13
status: 200
---
# [​](#antigravity-cli-setup)Antigravity CLI Setup

> **Give Antigravity CLI persistent memory across sessions.**

Antigravity CLI (`agy`) is Google’s standalone successor to Gemini CLI — it reuses Gemini CLI’s `~/.gemini/` config tree and, per Google, “keeps the most critical features of Gemini CLI: Agent Skills, Hooks, Subagents, and Extensions.” Claude-mem changes what happens across sessions by capturing observations, decisions, and patterns — then injecting relevant context into each new session. **How it works:** Claude-mem installs lifecycle hooks into Antigravity CLI’s shared `~/.gemini/settings.json` that capture tool usage, agent responses, and session events. A local worker service extracts semantic observations and injects relevant history at session start — via `GEMINI.md`, an MCP server, and a rules file. Antigravity CLI is a different product from the Antigravity **desktop IDE** (`antigravity` binary) — both share the same `~/.gemini/antigravity` namespace, but the CLI’s own binary is `agy`. Detection checks for `agy` in your `PATH` (or an existing `~/.gemini/antigravity` directory).

## [​](#prerequisites)Prerequisites

- [Antigravity CLI](https://github.com/google-antigravity/antigravity-cli) (`agy`) installed — `curl -fsSL https://antigravity.google/cli/install.sh | bash`
- [Node.js](https://nodejs.org/) 18+
- The `~/.gemini` directory must exist (created by Antigravity CLI / Gemini CLI on first run)

## [​](#installation)Installation

### [​](#step-1-install-claude-mem)Step 1: Install claude-mem

    npx claude-mem install --ide antigravity

The installer will:

1.  Auto-detect Antigravity CLI (checks for `agy` in `PATH`, or an existing `~/.gemini/antigravity` directory)
2.  Install 8 lifecycle hooks into `~/.gemini/settings.json`
3.  Inject context configuration into `~/.gemini/GEMINI.md`
4.  Register claude-mem’s MCP server in `~/.gemini/antigravity/mcp_config.json` **and** `~/.gemini/config/mcp_config.json`
5.  Write a rules/context placeholder to `~/.agents/rules/claude-mem-context.md`
6.  Start the worker service

### [​](#step-2-configure-an-ai-provider)Step 2: Configure an AI provider

Claude-mem needs an AI provider to extract observations from your sessions. Choose one:

- Gemini API (Free)
- Claude SDK
- OpenRouter

The simplest option — use Gemini’s own API for observation extraction:

1.  Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2.  Add it to your settings:

<!-- -->

    mkdir -p ~/.claude-mem
    cat > ~/.claude-mem/settings.json << 'EOF'
    {
      "CLAUDE_MEM_PROVIDER": "gemini",
      "CLAUDE_MEM_GEMINI_API_KEY": "YOUR_API_KEY"
    }
    EOF

**Free tier:** generous daily quota with `gemini-flash-latest`. Enable billing on Google Cloud for higher RPM without charges.If you have a Claude API key:

    mkdir -p ~/.claude-mem
    cat > ~/.claude-mem/settings.json << 'EOF'
    {
      "CLAUDE_MEM_PROVIDER": "claude"
    }
    EOF

Set your API key via environment variable:

    export ANTHROPIC_API_KEY="your-key"

For access to 100+ models:

    mkdir -p ~/.claude-mem
    cat > ~/.claude-mem/settings.json << 'EOF'
    {
      "CLAUDE_MEM_PROVIDER": "openrouter",
      "CLAUDE_MEM_OPENROUTER_API_KEY": "YOUR_KEY"
    }
    EOF

### [​](#step-3-verify-installation)Step 3: Verify installation

    # Check worker is running
    npx claude-mem status

    # Check hooks are installed — look for claude-mem entries
    cat ~/.gemini/settings.json | grep claude-mem

    # Check MCP registration in either candidate config path
    cat ~/.gemini/antigravity/mcp_config.json | grep claude-mem
    cat ~/.gemini/config/mcp_config.json | grep claude-mem

Open the worker URL printed on startup to see the memory viewer.

### [​](#step-4-start-using-antigravity-cli)Step 4: Start using Antigravity CLI

Launch Antigravity CLI normally. Claude-mem works in the background:

    agy

On session start, you’ll see claude-mem context injected with your recent observations and project history.

## [​](#what-gets-captured)What gets captured

Claude-mem registers all 8 confirmed Antigravity CLI lifecycle hooks (verified against a live install):

| Hook | Internal event | Purpose |
|----|----|----|
| **SessionStart** | `context` | Injects memory context into the session |
| **BeforeAgent** | `session-init` | Captures user prompts |
| **AfterAgent** | `observation` | Records full agent responses |
| **BeforeTool** | `observation` | Logs tool invocations before execution |
| **AfterTool** | `observation` | Captures tool results after execution |
| **Notification** | `observation` | Records system events (permissions, etc.) |
| **PreCompress** | `summarize` | Captures session summary before compression |
| **SessionEnd** | `session-complete` | Marks session complete |

All 8 events above are **confirmed** — verified directly against a live, already-installed Antigravity CLI’s `~/.gemini/settings.json` (not assumed from Gemini CLI’s schema alone).

## [​](#mcp-registration)MCP registration

Antigravity CLI has native MCP support, but which config path it reads was genuinely ambiguous at the time of writing — two real candidate paths exist on disk with no definitive documentation resolving which one `agy` loads. Claude-mem writes to **both**, safely and idempotently:

- `~/.gemini/antigravity/mcp_config.json`
- `~/.gemini/config/mcp_config.json`

This gives claude-mem’s search tools (`search`, `smart_search`, `timeline`, etc.) a chance to register correctly regardless of which path Antigravity CLI actually reads.

## [​](#future-enhancement-not-implemented-in-this-release)Future enhancement (not implemented in this release)

Antigravity CLI ships a first-class plugin-marketplace subcommand system: `agy plugin {list,import,install,uninstall,enable,disable,validate,link}`. Notably, `agy plugin import gemini|claude` suggests native cross-tool plugin migration — structurally similar to Codex CLI’s `.codex-plugin/plugin.json` marketplace mechanism. This could eventually be a cleaner, more idiomatic way to bundle claude-mem’s hooks + MCP + skills registration than hand-editing `settings.json`. It isn’t implemented here because its manifest schema isn’t discoverable without running `agy plugin import`/`install` against a real manifest, which would mutate a user’s live local plugin state. Tracked as a candidate follow-up.

## [​](#troubleshooting)Troubleshooting

### [​](#hooks-not-firing)Hooks not firing

1.  Verify hooks exist in settings:

        cat ~/.gemini/settings.json

    You should see entries like `"SessionStart"`, `"AfterTool"`, etc. with claude-mem commands.

2.  Restart Antigravity CLI after installation.

3.  Re-run the installer:

        npx claude-mem install --ide antigravity

### [​](#worker-not-running)Worker not running

    # Check status
    npx claude-mem status

    # View logs
    npx claude-mem logs

    # Restart worker
    npx claude-mem restart

### [​](#no-context-appearing-at-session-start)No context appearing at session start

1.  Ensure the worker is running (`npm run worker:status`)
2.  You need at least one previous session with observations for context to appear
3.  Check your AI provider is configured in `~/.claude-mem/settings.json`

### [​](#raw-escape-codes-in-output)Raw escape codes in output

If you see characters like `[31m` or `[0m` in the session context, your claude-mem version may need updating — the Antigravity CLI adapter strips ANSI color codes automatically:

    npx claude-mem install --ide antigravity

## [​](#uninstalling)Uninstalling

    npx claude-mem uninstall

This removes claude-mem’s hooks from `~/.gemini/settings.json`, cleans up the context section in `~/.gemini/GEMINI.md`, removes claude-mem’s entry from both MCP config files, and removes the rules context section — while preserving everything else in those files.

## [​](#next-steps)Next Steps

- [Gemini Provider](/usage/gemini-provider) — Configure the Gemini AI provider for observation extraction
- [Configuration](/configuration) — All settings options
- [Search Tools](/usage/search-tools) — Search your memory from within sessions
- [Troubleshooting](/troubleshooting) — Common issues and solutions

⌘I
