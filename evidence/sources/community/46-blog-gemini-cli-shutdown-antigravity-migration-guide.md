---
source: 46
category: community
title: 15-Minute Migration to Antigravity CLI
url: "https://harshrastogi.tech/blog/gemini-cli-shutdown-antigravity-migration-guide"
final_url: "https://www.harshrastogi.tech/blog/gemini-cli-shutdown-antigravity-migration-guide"
fetched: 2026-08-14
status: 200
---
[Back to Blog](/blog)![Gemini CLI to Antigravity CLI migration — June 18 2026 deadline timeline](https://placehold.co/1200x630/0a0a0a/10b981.png?text=Gemini+CLI+%E2%86%92+Antigravity+CLI%0AJune+18%2C+2026+Deadline&font=raleway)

**TL;DR —** Google is sunsetting **Gemini CLI** on **June 18, 2026**. After that date, `gemini` commands return HTTP 410 and your CI breaks. The replacement is **Antigravity CLI** (`av`), which keeps most of the same surface but moves auth, configuration, and a handful of commands. This guide is the 15-minute migration path for engineers who use Gemini CLI in scripts, agents, or CI pipelines today.

## Why Gemini CLI Is Being Shut Down

Google announced the Gemini CLI deprecation on **May 8, 2026**, with a hard cutover on **June 18, 2026**. The replacement, **Antigravity CLI**, consolidates Google's developer-side AI tooling — Gemini models, Vertex AI agents, and the new Antigravity multi-agent runtime — under one binary. Existing Gemini CLI installs will receive a deprecation warning on every invocation until the deadline; after that, the auth endpoint returns 410 Gone and every command fails.

If you have ever scripted `gemini chat`, `gemini generate`, or `gemini agents run` into a CI job, a Makefile, or a Claude Code / Cursor hook, this affects you. The good news: most of the migration is automatic.

<figure>
<img src="https://placehold.co/1200x500/0a0a0a/10b981.png?text=Gemini+CLI+%E2%86%92+Antigravity+CLI%0ADeprecation+Timeline+2026&amp;font=raleway" alt="Gemini CLI deprecation timeline — May 8 announcement, June 18 shutdown, Antigravity CLI replacement" />
<figcaption aria-hidden="true">Gemini CLI deprecation timeline — May 8 announcement, June 18 shutdown, Antigravity CLI replacement</figcaption>
</figure>

## The Migration in 4 Steps

### Step 1: Install Antigravity CLI

bash

    # macOS / Linux
    curl -fsSL https://antigravity.dev/install.sh | sh

    # Windows (PowerShell)
    iwr -useb https://antigravity.dev/install.ps1 | iex

    # Verify
    av --version

The new binary is `av` (short for "antigravity"). It coexists with `gemini` during the deprecation window, so you can migrate gradually.

### Step 2: Authenticate

Antigravity CLI uses the same Google account but a new OAuth scope. Re-auth once:

bash

    av auth login

For CI / service accounts, swap the environment variable:

| Old (Gemini CLI)      | New (Antigravity CLI)                       |
|-----------------------|---------------------------------------------|
| \`GEMINI_API_KEY\`    | \`AV_API_KEY\`                              |
| \`GEMINI_PROJECT_ID\` | \`AV_PROJECT_ID\`                           |
| \`GEMINI_REGION\`     | \`AV_REGION\` (defaults to \`us-central1\`) |

Old keys are honored until June 18, but Antigravity will warn on every invocation. Rotate now.

### Step 3: Rewrite Your Commands

Most subcommands map 1:1 with one rename. Here is the side-by-side:

| Old (Gemini CLI)       | New (Antigravity CLI) |
|------------------------|-----------------------|
| \`gemini chat\`        | \`av chat\`           |
| \`gemini generate\`    | \`av gen\`            |
| \`gemini agents run\`  | \`av agent run\`      |
| \`gemini agents list\` | \`av agent ls\`       |
| \`gemini eval\`        | \`av eval\`           |
| \`gemini tune\`        | \`av tune\`           |
| \`gemini export\`      | \`av export\`         |
| \`gemini logs\`        | \`av logs\`           |

The big rename to watch: **`agents` is now `agent`** (singular). That breaks scripted invocations. Grep your repo before pushing.

bash

    # Find lingering Gemini CLI references in your repo
    grep -rn "gemini " --include="*.sh" --include="*.yml" --include="*.yaml" --include="Makefile"

### Step 4: Update CI Pipelines

GitHub Actions, GitLab CI, and CircleCI all need a workflow tweak. The most common Gemini CLI step:

yaml

    # Old — Gemini CLI in GitHub Actions
    - name: Run Gemini agent
      run: gemini agents run code-review --diff "${{ github.event.pull_request.diff_url }}"
      env:
        GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

Migrates to:

yaml

    # New — Antigravity CLI in GitHub Actions
    - name: Install Antigravity CLI
      run: curl -fsSL https://antigravity.dev/install.sh | sh

    - name: Run Antigravity agent
      run: av agent run code-review --diff "${{ github.event.pull_request.diff_url }}"
      env:
        AV_API_KEY: ${{ secrets.AV_API_KEY }}

If you templatized the binary name with a CI variable (`$AI_CLI gemini`), this is a one-line change.

## Breaking Changes to Watch

Most of the migration is mechanical, but four behaviors actually changed:

- ›**Default model.** Gemini CLI defaulted to `gemini-1.5-pro`. Antigravity defaults to `gemini-3-pro` (the model Google announced alongside Antigravity). If your prompts were tuned against 1.5, pin the model explicitly with `--model gemini-1.5-pro`.
- ›**Streaming output format.** Gemini CLI's `--stream` emitted plain text deltas. Antigravity emits **SSE-formatted** events by default. If you piped `gemini chat --stream` into another tool, add `--stream-format=plain` to keep the old behavior.
- ›**Agent state directory.** Was `~/.gemini/agents/`. Now `~/.antigravity/agents/`. The first `av agent run` migrates state automatically, but `--state-dir` overrides break.
- ›**Exit codes.** Gemini CLI exited 0 on tool-use failures. Antigravity exits non-zero. If your CI swallowed errors silently, this will catch them — and your green builds may suddenly turn red. That is intended.

## Migration Verification Script

Save this as `verify-av-migration.sh` and run it before the June 18 deadline. It exits non-zero if any Gemini CLI reference remains:

bash

    #!/usr/bin/env bash
    set -euo pipefail

    # Check binary
    if ! command -v av >/dev/null; then
      echo "✗ Antigravity CLI not installed" && exit 1
    fi

    # Check auth
    av auth status >/dev/null || { echo "✗ Not authenticated"; exit 1; }

    # Check repo for stale references
    LEFTOVERS=$(grep -rn "gemini " --include="*.sh" --include="*.yml" --include="*.yaml" --include="Makefile" . || true)
    if [[ -n "$LEFTOVERS" ]]; then
      echo "✗ Found stale Gemini CLI references:"
      echo "$LEFTOVERS"
      exit 1
    fi

    # Check env vars
    [[ -n "${AV_API_KEY:-}" ]] || { echo "✗ AV_API_KEY not set"; exit 1; }

    echo "✓ Antigravity migration verified"

Wire this into your CI as a job that runs daily through June 17. It catches the migration debt before the shutdown does.

## Common Migration Gotchas

- ›**MCP servers that wrapped `gemini` will fail silently.** If you wired Gemini CLI as a tool inside a Model Context Protocol server, the spawn command must be rewritten. For background on MCP tool servers in general, see my [Model Context Protocol production guide](/blog/model-context-protocol-mcp-developer-guide-production).
- ›**Pinned versions.** `gemini@2.x` was the LTS line. Antigravity starts at 1.0 — there is no `av@2.x`. Update version pins.
- ›**Brew formula moved.** `brew install gemini-cli` is gone. Use `brew install antigravity-cli`. The old formula will be marked `disabled` after May 30.
- ›**Vertex AI auth tokens.** If you used `gemini auth print-token` to mint Vertex tokens, the equivalent is `av auth token --vertex`.

## Why This Migration Matters Beyond One CLI Tool

The Gemini → Antigravity rename is more than a binary swap. It signals Google consolidating its developer-AI surface into a single multi-agent runtime, the same direction Anthropic took with [Claude Opus 4.7](/blog/claude-opus-4-7-release-developer-guide) and OpenAI took with Agents SDK. Single-purpose CLIs are losing ground to unified agent runtimes that ship models, tools, eval harnesses, and observability under one binary.

If you maintain dev tooling that wraps an AI vendor's CLI, expect this same migration pattern from every major provider over the next 18 months. The lesson: keep your AI CLI invocation behind a thin wrapper in your codebase. The next rename will hurt less.

## Bottom Line

Gemini CLI shuts down **June 18, 2026**. Antigravity CLI is a near-drop-in replacement, but four breaking behaviors (default model, streaming format, state dir, exit codes) catch teams who run the rename mechanically. Migrate this week. Wire the verification script into CI. Pin your model. Done.

## Frequently Asked Questions

### When does Gemini CLI shut down?

Google's Gemini CLI shuts down on June 18, 2026. After that date the auth endpoint returns HTTP 410 Gone and every gemini command fails. The deprecation was announced on May 8, 2026.

### What replaces Gemini CLI?

Antigravity CLI, invoked as 'av', replaces Gemini CLI. It consolidates Google's developer-side AI tooling — Gemini models, Vertex AI agents, and the Antigravity multi-agent runtime — under one binary.

### Is the migration from Gemini CLI to Antigravity CLI difficult?

No. Most of the migration is a binary rename and an environment variable swap (GEMINI_API_KEY → AV_API_KEY). Watch for four breaking changes: the default model is now gemini-3-pro, --stream emits SSE by default, the agent state directory moved to ~/.antigravity/, and exit codes are non-zero on tool-use failures.

### Can I install Antigravity CLI alongside Gemini CLI?

Yes. The two binaries coexist during the deprecation window so you can migrate scripts incrementally. After June 18, 2026, only the 'av' binary works.

### What is the new env var for Antigravity CLI authentication?

Use AV_API_KEY (replaces GEMINI_API_KEY), AV_PROJECT_ID (replaces GEMINI_PROJECT_ID), and AV_REGION (replaces GEMINI_REGION, default us-central1). Old vars work until June 18 but emit warnings.

### What is the default model on Antigravity CLI?

Antigravity CLI defaults to gemini-3-pro. Gemini CLI defaulted to gemini-1.5-pro. If your prompts were tuned against 1.5, pin the model explicitly with --model gemini-1.5-pro to preserve behavior.

### Does Antigravity CLI work with Model Context Protocol (MCP)?

Yes. Antigravity exposes the same tool-server interface as Gemini CLI did, plus a native MCP client. If you wrapped Gemini CLI inside an MCP server's spawn command, rewrite the spawn to use 'av' before the cutover.

Written by [Harsh Rastogi](https://www.linkedin.com/in/harsh2003) — AI Product Engineer leading AI product direction at [Modelia](https://www.modelia.ai). Connect with me on [LinkedIn](https://www.linkedin.com/in/harsh2003) for more on Shopify, Generative AI, agentic systems, and production engineering.

Share this article

[Share on LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fharshrastogi.tech%2Fblog%2Fgemini-cli-shutdown-antigravity-migration-guide)[Post on X](https://twitter.com/intent/tweet?text=Gemini%20CLI%20Is%20Dead%3A%2015-Minute%20Migration%20to%20Antigravity%20CLI%20Before%20June%2018&url=https%3A%2F%2Fharshrastogi.tech%2Fblog%2Fgemini-cli-shutdown-antigravity-migration-guide&via=harshrastogi)

Copy Link

![Harsh Rastogi - AI Product Engineer](/harsh-rastogi-avatar.jpg)

### Harsh Rastogi

AI Product Engineer

AI Product Engineer leading AI product direction at [Modelia](https://www.modelia.ai). Previously at [Asynq](https://www.asynq.ai) and [Bharat Electronics Limited](https://www.bel-india.in). Published researcher.

[GitHub](https://github.com/Harsh-Rastogi-03)[LinkedIn](https://www.linkedin.com/in/harsh2003)[Email](mailto:harshrastogi0603@gmail.com)

### Connect on LinkedIn

Follow me for more insights on software engineering, system design, and career growth.

[View Profile](https://www.linkedin.com/in/harsh2003)

## Related Articles

[All Articles](/blog)[](/blog/shopify-ai-self-review-app-store-submissions)

Developer Tools

### Shopify's AI Self-Review Tool: How to Pass App Store Review on the First Try

Shopify just shipped an AI agent that reviews your app for App Store compliance before submission. How the new self-review tool, Partner Dashboard tracking, and automated pre-submission checks change Shopify app review in 2026.

Read article

[](/blog/claude-fable-5-back-export-controls-lifted)

AI & Machine Learning

### Claude Fable 5 Is Back: Export Controls Lifted and Global Access Restored July 1

On June 30, 2026 the US lifted the export controls it placed on Claude Fable 5 and Mythos 5, and Fable 5 came back online globally on July 1. Here's the full timeline, what changed under the hood — a 99%+ bypass classifier, refusals, and fallback billing — and what developers need to do to ship on claude-fable-5.

Read article

[](/blog/claude-opus-4-8-release-features-benchmarks-pricing)

AI & Machine Learning

### Claude Opus 4.8 Is Here: Honesty Gains, Dynamic Workflows, and a 2.5× Faster Fast Mode

Anthropic shipped Claude Opus 4.8 on May 28, 2026. SWE-Bench Pro jumps from 64.3% to 69.2%, Fast Mode runs 2.5× faster at 3× lower cost, and Dynamic Workflows lets Claude Code orchestrate hundreds of subagents. Here's the full developer breakdown.

Read article
