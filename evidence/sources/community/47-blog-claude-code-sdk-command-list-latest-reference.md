---
source: 47
category: community
title: Claude Code SDK
url: "https://skywork.ai/blog/claude-code-sdk-command-list-latest-reference/"
final_url: "https://skywork.ai/blog/claude-code-sdk-command-list-latest-reference/"
fetched: 2026-08-13
status: 200
---
<figure>
<figure>
<img src="https://skywork-blog-image.oss-us-east-1.aliyuncs.com/wp-content/uploads/2025/10/image-4351-1024x575.png" />
</figure>
</figure>

[Claude Code commands](https://docs.claude.com/en/docs/claude-code/slash-commands), SDK reference — here’s the updated guide I wish I’d had last week. I’m Claire, and when I’m spelunking new tools I don’t memorize everything; I keep a lean cheatsheet, test the edges, and annotate what actually saves time. This is that cheatsheet, with examples and a few “don’t do this” notes from real usage.

------------------------------------------------------------------------

## Scope and recency

I’m focusing on:

- Built‑in slash commands you can call in interactive sessions
- How to trigger those commands from the Agent SDK (TypeScript/Python)

<figure>
<figure>
<img src="https://skywork-blog-image.oss-us-east-1.aliyuncs.com/wp-content/uploads/2025/10/image-4348-1024x553.png" />
</figure>
</figure>

- CLI commands/flags I actually use
- Custom commands (Markdown + frontmatter) and the SlashCommand tool
- A quick note on MCP slash commands

References were double‑checked on October 15, 2025 against Anthropic’s docs so you’re not chasing stale help text.

------------------------------------------------------------------------

## Built‑in slash commands I reach for

- /compact \[instructions\] — summarize history and keep the rails tight
- /clear — wipe the thread and start fresh
- /add-dir — add extra work dirs (great for monorepos)
- /model — pick a model or pin a specific version
- /permissions — inspect or tweak tool approvals
- /doctor — quick health check if things feel off
- /review, /pr_comments — pull in review context fast
- /usage, /cost — stay under plan/limits if you’re scripting long turns

<figure>
<figure>
<img src="https://skywork-blog-image.oss-us-east-1.aliyuncs.com/wp-content/uploads/2025/10/image-4349-1024x588.png" />
</figure>
</figure>

You’ll also see /agents, /memory, /init, /status, /terminal-setup, /vim, and /rewind in the menu. Use /help anytime to list what’s available.

### Practical tip

If compaction kicks in mid‑flow and you lose nuance, run /compact with a focus line like “focus on auth errors from the last two commits” so the summary preserves what matters.

------------------------------------------------------------------------

## Fire slash commands from the SDK

You don’t have to be in the CLI REPL to use these. In the Agent SDK, send the command as the prompt string. Also, on session init you can read which slash commands are available.

------------------------------------------------------------------------

## CLI: the few commands and flags that matter

- claude — start interactive mode
- claude -p “ask” — one‑off, non‑interactive (great for scripts)
- claude -c / –continue — pick up last session
- claude -r “” — resume a specific session
- claude mcp — manage MCP server connections
- claude update — keep current

Flags I actually pass:

- –model sonnet or full name (pin exact builds)
- –output-format json (pair with -p for automation)
- –max-turns N (keep agentic loops bounded)
- –add-dir ../shared (multi‑package repos)
- –dangerously-skip-permissions (only in locked CI sandboxes)

Full list lives in the CLI reference; the above are the ones I’d tape to the monitor.

<figure>
<figure>
<img src="https://docs.claude.com/en/docs/claude-code/mcp" />
</figure>
</figure>

------------------------------------------------------------------------

## Custom slash commands (Markdown + frontmatter)

Drop Markdown files into either:

- Project: .claude/commands/
- Personal: ~/.claude/commands/

A minimal command:

    # .claude/commands/refactor.md
    Refactor the selected code to improve readability. Follow our style guide.

Add frontmatter when you need tools or hints:

    ---
    allowed-tools: Read, Grep, Glob
    description: Security sweep
    ---
    Scan the repo for secrets, SQLi, and XSS risks.

Then call it as /refactor or /security-sweep in sessions or from the SDK. Namespacing is folder-based for organization, not the command name.

### The SlashCommand tool (important for automation)

Claude can invoke your custom slash commands proactively via the SlashCommand tool, but only if they’re user‑defined and have a description. There’s a character budget (15,000 by default) controlling how many command descriptions make it into context; exceed it and some won’t be visible. You can disable model invocation per command with disable-model-invocation: true or kill the tool via /permissions if needed. Version note: discoverability via –debug appears in Claude Code ≥ 1.0.124.

------------------------------------------------------------------------

## MCP slash commands in one glance

Connected [MCP servers](https://docs.claude.com/en/docs/claude-code/mcp) expose prompts as slash commands using this pattern:

/mcp\_\_\_\_ \[args\]

Use /mcp to see what’s wired up. Permissions don’t support wildcards like mcp\_\_github\_\_\*; grant either the whole server (mcp\_\_github) or specific tools.

<figure>
<figure>
<img src="https://skywork-blog-image.oss-us-east-1.aliyuncs.com/wp-content/uploads/2025/10/image-4350.png" />
</figure>
</figure>

------------------------------------------------------------------------

## How I apply this (and make it pay)

My workflow as Claire is simple:

- Codify repeat tasks as custom commands (review, test, commit).
- Pin models in CI with –model and parse JSON output (-p + –output-format json).
- Keep commands small, single‑purpose; long “kitchen‑sink” prompts bloat context and fail quietly.
- Audit permissions monthly; least privilege keeps surprises away.

If you’ve got sharper defaults or a cleaner folder strategy, I want to hear it. Drop tips in the comments and I’ll test them in the next pass. — Claire.

------------------------------------------------------------------------

References

<https://docs.claude.com/en/docs/claude-code/slash-commands>

<https://docs.claude.com/en/docs/claude-code/mcp>

Previous Recap:

<figure>
<blockquote>
<a href="https://skywork.ai/blog/claude-code-sdk-productivity-benchmark-vs-human-baseline/">Claude Code SDK productivity benchmark vs human baseline</a>
</blockquote>
</figure>

<figure>
<blockquote>
<a href="https://skywork.ai/blog/how-claude-code-handles-private-repos-and-security/">How Claude Code handles private repos and security</a>
</blockquote>
</figure>

<figure>
<blockquote>
<a href="https://skywork.ai/blog/claude-code-sdk-pricing-and-api-limits-explained/">Claude Code SDK pricing and API limits explained</a>
</blockquote>
</figure>

### About The Author

![](https://secure.gravatar.com/avatar/370d76bef7abf11ad8b202801518dadea53dd262ede22f70ad40c52411512568?s=100&d=mm&r=g) [](https://skywork.ai/blog/author/claire/)

#### claire

## Related Posts

[![MCP Server 與 splunk-mcp 是什麼？如何讓 LLM 與 Splunk 互動](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/08a71552da924fa4ab97d03f76468c86-1024x683.jpg)](https://skywork.ai/blog/mcp-server-splunk-mcp-llm-splunk-integration/)

[![在本機安裝與設定 Jira MCP Server，並串接 Claude Desktop／其他 MCP 客戶端操作 Jira](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/4e3aed7d183e49f2b6e9aba93dc48311-1024x683.jpg)](https://skywork.ai/blog/how-to-install-jira-mcp-server-connect-claude-desktop-guide/)

[![MCP‑SynoLink 是什麼？它與 MCP Server 的關係一次看懂](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/dc1a302cdc3e46bfbb723c4c16a0cc4f-1024x683.jpg)](https://skywork.ai/blog/mcp-synolink-definition-mcp-server-synology-nas/)

[![VisioMCP MCP 서버 제품 리뷰 (2025)](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/bf9cf5efbabe4928a04317f7d2364cc1-1024x683.jpg)](https://skywork.ai/blog/visiomcp-mcp-server-review-2025/)

[![MCP 服务器：MCP‑SynoLink 是什么？一文读懂把群晖 NAS 变成 AI 的标准化外设](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/6f4024e4b0c04585a869f5fd01d629cf-1024x683.jpg)](https://skywork.ai/blog/mcp-synolink-mcp-server-synology-nas-ai/)

[![Set up and use mcp-server-datadog with MCP clients (Claude Desktop) to query logs, metrics, monitors, incidents, and dashboards](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/99956b5eb9d84640b1b016343b03b3f5-1024x683.jpg)](https://skywork.ai/blog/how-to-set-up-mcp-server-datadog-guide/)

[![什么是 splunk-mcp（MCP 服务器）？](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/1cb0220ab38b48b181ad2fc8efd354da-1024x683.jpg)](https://skywork.ai/blog/splunk-mcp-mcp-server-definition/)

[![Review: VisioMCP (Microsoft Visio VSTO Add‑In MCP Server) — 2025](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/f34fe6e3386d4643a08676d36060c19e-1024x683.jpg)](https://skywork.ai/blog/visiomcp-mcp-server-review-visio-automation-2025/)

[![如何安装与配置 mcp-server-datadog，并连接到 Claude Desktop/CLI](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/ae4d3fc6100f4e91b5f39aff59e5790a-1024x683.jpg)](https://skywork.ai/blog/how-to-install-configure-mcp-server-datadog-guide/)

[![如何安裝、設定與使用 MCP 伺服器：mcp-server-datadog（連接 Datadog 與 Claude Desktop 等 MCP 客戶端）](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/c5fc890207cf4dd1b7c724ada3195554-1024x683.jpg)](https://skywork.ai/blog/how-to-mcp-server-datadog-install-claude-desktop-guide/)

[![MCP server: MCP‑SynoLink](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/d0352b1ff6734ac4af9c1f0bf258bf3a-1024x683.jpg)](https://skywork.ai/blog/mcp-synolink-synology-nas-ai-assistant-server/)

[![MCP 서버: MCP-SynoLink 정의와 활용](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/49e46c32fd034f08b2257b9393f511a1-1024x683.jpg)](https://skywork.ai/blog/mcp-server-mcp-synolink-synology/)

[![MCP 서버: MCP-SynoLink 정의와 활용](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/49e46c32fd034f08b2257b9393f511a1-1024x683.jpg)](https://skywork.ai/blog/mcp-server-mcp-synolink-synology-2/)

[![Diagram-style cover image illustrating AI host to MCP server to Framer plugin workflow with JSON-RPC and transports arrows.](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/a859746a369e4f639970d5a7c75f5196-1024x683.jpg)](https://skywork.ai/blog/mcp-server-framer-plugin-mcp-explained/)

[![Diagram of an MCP client connecting to an OCR server via prompts, resources, and tools](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/9e937950a9aa4ea3ba97706d746c00ef-1024x683.jpg)](https://skywork.ai/blog/mcp-server-mcp-ocr-ocr-ai-integration/)

[![Diagram-style cover: Home Assistant connecting to an MCP server and a Home Assistant MCP Agent over LAN with secure token and verification light.](https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/f5346c5fe40348a1bd783d2cf33c69b3-1024x683.jpg)](https://skywork.ai/blog/how-to-set-up-mcp-server-home-assistant-mcp-agent/)

### Leave a Comment <span class="small">[Cancel Reply](/blog/claude-code-sdk-command-list-latest-reference/#respond)</span>

您的邮箱地址不会被公开。 必填项已用 \* 标注

Type here..

Name\*

Email\*

Website

在此浏览器中保存我的显示名称、邮箱地址和网站地址，以便下次评论时使用。
