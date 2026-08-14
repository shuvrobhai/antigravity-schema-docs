---
source: 40
category: community
title: "Google Antigravity SDK: The developer guide (K. Weinmeister)"
url: "https://www.linkedin.com/pulse/google-antigravity-sdk-developer-guide-karl-weinmeister-nymsc"
final_url: "https://www.linkedin.com/pulse/google-antigravity-sdk-developer-guide-karl-weinmeister-nymsc"
fetched: 2026-08-14
status: 200
---
<figure>
<img src="https://media.licdn.com/dms/image/v2/D5612AQHCCSHa-zNp3g/article-cover_image-shrink_720_1280/B56Z6oIrmkI8AQ-/0/1780937313094?e=2147483647&amp;v=beta&amp;t=1-jgEI-PJVmqeHuWYQaBgbX-OZGhYHwlhvskgtjOgJM" alt="Google Antigravity SDK: The developer guide" />
<figcaption>The Antigravity SDK supports tools, APIs, and hooks to build your AI agent</figcaption>
</figure>

The [Google Antigravity SDK](https://antigravity.google/docs/sdk-overview?utm_campaign=CDR_0x2b6f3004_default_b521271009&utm_medium=external&utm_source=blog&trk=article-ssr-frontend-pulse_little-text-block) is a Python framework for building and running autonomous agents. It decouples your agent’s logic from where it runs, letting you focus on what the agent does while the SDK manages execution and state.

The Python SDK interfaces with a bundled Go harness over WebSockets. The local Go harness runs the core agentic loop and manages sandboxed tool execution. Python acts as the control plane where you configure tools, safety policies, and lifecycle hooks.

This guide outlines the SDK’s architecture one layer at a time, referencing the official [source repository](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity?trk=article-ssr-frontend-pulse_little-text-block). Note that the SDK is currently pre-v1.0 and subject to change.

### Where Antigravity fits in Google’s AI stack

Google’s AI stack offers multiple levels of abstraction for building with Gemini. Choosing the right one depends on how much control you need over the execution loop.

- The [Gemini API](https://ai.google.dev/gemini-api/docs?trk=article-ssr-frontend-pulse_little-text-block) is stateless. You make an API call and get a response. You manage the entire loop.
- The [Agent Development Kit](https://google.github.io/adk-docs/?trk=article-ssr-frontend-pulse_little-text-block) sits one level up. With the ADK, you design the event loops, pick the foundation models, and control how agents route messages to each other.
- The [Antigravity SDK](https://antigravity.google/product/antigravity-sdk?trk=article-ssr-frontend-pulse_little-text-block) is a pre-packaged runtime tightly integrated with [Gemini](https://ai.google.dev/?utm_campaign=CDR_0x2b6f3004_default_b521271009&utm_medium=external&utm_source=blog&trk=article-ssr-frontend-pulse_little-text-block). You don’t build the agentic loop; you’re given one. Your role is to govern it.

### Getting started

Install the package with pip install google-antigravity, ensuring that GEMINI_API_KEY is set in your environment. Then you’re ready to build your first agent!

import asyncio from google.antigravity import Agent, LocalAgentConfig \# 1. Define a tool function with a descriptive docstring async def get_weather(location: str) -\> str: """Gets the current weather for a location.""" return f"The weather in {location} is sunny, 72°F." async def main(): \# 2. Register the tool in the agent configuration config = LocalAgentConfig( system_instructions="You are a helpful weather assistant.", tools=\[get_weather\] ) \# 3. Initialize the agent and query it async with Agent(config) as agent: response = await agent.chat("How's the weather in San Diego?") async for token in response: print(token, end="", flush=True) asyncio.run(main())

What’s happening here? The Agent context manager starts the Go harness, establishes a WebSocket connection, and registers the get_weather function as an available tool. The model automatically decides when to invoke it based on the user’s prompt. When the async with block exits, the harness shuts down and all connections are closed.

### The three-layer architecture

The SDK separates concerns into three layers, each with a distinct responsibility.

<figure>

<figcaption>How the SDK decouples agent configuration, session state, and transport protocols</figcaption>
</figure>

Layer 1: [Agent](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/agent.py?trk=article-ssr-frontend-pulse_little-text-block) and [LocalAgentConfig](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/types.py?trk=article-ssr-frontend-pulse_little-text-block). The high-level entry point. Manages configuration, session lifecycle, tool wiring, hooks, and triggers. This is where you spend most of your time.

Layer 2: [Conversation](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/conversation?trk=article-ssr-frontend-pulse_little-text-block). The stateful session manager. Wraps the connection and handles message history accumulation, context window compaction, and token usage tracking (including Gemini’s “thinking tokens”).

Layer 3: [Connection](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/connections?trk=article-ssr-frontend-pulse_little-text-block) and [ConnectionStrategy](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/connections?trk=article-ssr-frontend-pulse_little-text-block). The transport abstraction. For local development, LocalConnection communicates via WebSockets with the Go harness. This layer is what makes it possible to eventually swap in remote backends without changing your application code.

Now let’s look at what you can build on top of those three layers.

### Tools and MCP

<figure>

<figcaption>Execution pathways for built-in, custom Python, and MCP-integrated tools</figcaption>
</figure>

### Built-in tools

The Go harness ships with optimized native tools for standard OS interactions: view_file, edit_file, create_file, list_directory, search_directory, run_command, and generate_image. These run inside the harness process, not in Python, so they’re fast and sandboxed.

### Custom Python tools

If you need the agent to call your business logic, you write a standard Python function. The SDK’s ToolRunner uses reflection to inspect type hints and parse docstrings, generating the Gemini FunctionDeclaration automatically.

async def lookup_customer_tier(email: str) -\> str: """Looks up a customer's subscription tier. Args: email: The customer's registered email address. """ tier = await db.query(email) return f"The customer is on the {tier} plan." config = LocalAgentConfig(tools=\[lookup_customer_tier\])

### ToolContext for stateful tools

Sometimes a tool needs to remember things across invocations in the same conversation, like a pagination cursor or a running counter. Passing that state through the LLM wastes tokens and bloats the context window.

The SDK provides ToolContext, a conversation-scoped key-value store. Add ctx: ToolContext to your function signature and the SDK injects it automatically. The model never sees the parameter.

from google.antigravity.tools.tool_context import ToolContext def process_logs(batch_size: int, ctx: ToolContext) -\> str: """Processes the next batch of server logs.""" cursor = ctx.get_state("log_cursor", 0) logs = fetch_logs(offset=cursor, limit=batch_size) ctx.set_state("log_cursor", cursor + batch_size) return logs

### MCP integration

The SDK has native support for the [Model Context Protocol](https://modelcontextprotocol.io/?trk=article-ssr-frontend-pulse_little-text-block) using both Stdio transport and Streamable HTTP. Point your agent at an MCP server and it for access to its exposed tools.

Because MCP tools are integrated at the ToolRunner level, they’re governed by the exact same safety policies as built-in and custom tools.

### Lifecycle hooks

The SDK treats agent lifecycles through composable middleware using [hooks](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/hooks?trk=article-ssr-frontend-pulse_little-text-block).

<figure>

<figcaption>Agent loop showing success and error paths</figcaption>
</figure>

A common security flaw in custom agent frameworks is the [Time-Of-Check to Time-Of-Use](https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use?trk=article-ssr-frontend-pulse_little-text-block), or TOCTOU, vulnerability. A security hook approves a tool call’s arguments, then a subsequent middleware mutates those arguments before execution. Antigravity prevents this by categorizing hooks into three archetypes, enforced by the type system.

Decide hooks are read-only and blocking. They inspect incoming data (like a pending tool call) and return HookResult(allow=True/False). They can’t modify the payload. If any Decide hook denies, execution short-circuits. Example: PreToolCallDecideHook.

Inspect hooks are read-only and non-blocking. They receive data after an event and run concurrently. They can’t block the main flow. Example: PostToolCallHook (writing tool outputs to external systems).

Transform hooks are modifying and blocking. They receive data, mutate it, and pass the transformed payload back. Example: OnToolErrorHook.

The OnToolErrorHook is particularly useful. When a tool throws an exception, instead of crashing the entire loop or dumping a raw Python traceback into the model’s context, you intercept the error and feed strategic recovery guidance:

## Recommended by LinkedIn

🎶 AllegroAgent : A Lightweight Python Framework for… Ajith Raghavan 4 months ago

Build AI-Powered Applications with Python and GitHub… Amit Kumar Tiwari 7 months ago

Polymorphism Hidden in Plain Sight? Abdullah I. 1 year ago

from typing import Optional from google.antigravity.hooks import hooks class FallbackHook(hooks.OnToolErrorHook): """Intercepts tool errors and returns recovery guidance.""" async def run(self, context: hooks.HookContext, data: Exception) -\> Optional\[str\]: if isinstance(data, ValueError): return ( "\[System: Invalid parameters. " "Try 'search_directory' to find the correct ID.\]" ) return None config = LocalAgentConfig(hooks=\[FallbackHook()\])

You can stack these hook types together to build a middleware pipeline. For example, you could include rate-limiting via Decide hooks, audit logging via Inspect hooks, and crash recovery via Transform hooks.

### Safety policies

Giving an autonomous agent access to your system requires guardrails. The SDK employs a declarative, priority-based [policy engine](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/hooks?trk=article-ssr-frontend-pulse_little-text-block) that evaluates every single action at the runtime hook level.

<figure>

<figcaption>Priority-based policy engine allowing or denying prompts</figcaption>
</figure>

Out of the box, the SDK takes a strict security stance. If you spin up an agent with zero configuration, it defaults to confirm_run_command(): the agent can read and write files, but shell execution requires explicit approval.

Policies evaluate top-down using a priority model. You configure rules with policy.allow(), policy.deny(), and policy.ask_user().

from google.antigravity import Agent, LocalAgentConfig from google.antigravity.hooks import policy policies = \[ \# Block dangerous arguments instantly policy.deny( "run_command", when=lambda args: "rm " in args.get("CommandLine", "") ), \# Ask the human for any other shell command policy.ask_user("run_command", handler=my_cli_prompt_function), \# Allow safe tools silently policy.allow("view_file"), \# Deny everything else policy.deny("\*") \] config = LocalAgentConfig(policies=policies)

### Human-in-the-loop

The policy.ask_user() builder pauses the execution loop, invokes your custom handler, and waits for approval before continuing.

### Disabling vs. denying

There’s an important distinction between disabling vs denying tools. CapabilitiesConfig.disabled_tools physically removes a tool’s JSON Schema from the context window before sending the prompt to Gemini. The model doesn’t know the tool exists, and you save input tokens. policy.deny() keeps the tool visible but blocks it at runtime. The model attempts to use it, gets an error message, and learns why it was blocked. It costs tokens for the failed attempt, but enables dynamic, argument-based restrictions and lets the model adapt.

### Background triggers

True autonomous systems monitor their environment and alert you proactively. The SDK’s [triggers](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity/triggers?trk=article-ssr-frontend-pulse_little-text-block) are long-lived async tasks that run alongside the agent session, reacting to external events.

<figure>

<figcaption>State change interfacing with TriggerRunner</figcaption>
</figure>

When you start an Agent context, the TriggerRunner spawns a separate asyncio task for each registered trigger. A crashing trigger won’t take down the agent. A busy agent won’t block the triggers.

Each trigger receives a TriggerContext. When it notices something in the outside world, it calls ctx.send(“Message”) to inject a notification into the agent’s conversation history. The agent reacts as if the user had typed it.

from google.antigravity import Agent, LocalAgentConfig from google.antigravity.triggers import every, TriggerContext async def monitor_queue(ctx: TriggerContext): tickets = await fetch_pagerduty_alerts() if tickets: await ctx.send(f"\[System Alert\]: {len(tickets)} new P0 alerts detected.") config = LocalAgentConfig(triggers=\[every(60, monitor_queue)\])

The SDK also ships triggers.on_file_change() for OS-level file watching (great for local coding assistants) and @triggers.trigger for custom async listeners like GitHub webhook receivers.

### Streaming and thoughts

When an agent is executing a multi-step task, waiting for a final output can make the application feel frozen.

The SDK addresses this by streaming execution events in real time. Instead of blocking, await agent.chat() immediately returns a ChatResponse object. This object acts as a shared, memory-cached buffer.

<figure>

<figcaption>ChatResponse serving multiple consumer streams</figcaption>
</figure>

Unlike standard Python generators, which are exhausted once read, ChatResponse lets you attach multiple independent cursors to the same stream. This allows you to route different aspects of the same agent turn concurrently:

- Main text stream (e.g., rendering markdown chunks to your frontend UI)
- Chain-of-thought stream (e.g., logging the agent’s internal reasoning to a developer console)
- Tool-call stream (e.g., displaying a live status widget as the agent invokes tools)

response = await agent.chat("Write a short story.") \# Stream raw text tokens async for token in response: print(token, end="", flush=True)

The response.thoughts stream exposes the model’s Chain-of-Thought reasoning in real-time. Token costs are tracked with response.usage_metadata.thoughts_token_count.

The response.tool_calls stream yields strongly-typed ToolCall objects as soon as the agent dispatches them, so your UI can render updates instantly.

### Subagents

One of the most common pitfalls in autonomous agents is context window bloat. The SDK solves this through hierarchical delegation.

<figure>

<figcaption>Subagent orchestration showing cascading safety policies and summarized context returns</figcaption>
</figure>

Instead of doing all the work in a single thread, the main agent invokes the built-in start_subagent tool. This prompts the harness to spin up a fresh agent session with a clean context window to handle the subtask in isolation. The subagent works through the problem using its own tools and MCP servers, then shuts down. It returns only a synthesized summary of its findings, keeping the main agent’s context window clean and focused on high-level orchestration.

from google.antigravity import Agent, LocalAgentConfig config = LocalAgentConfig( system_instructions="You are a lead developer. Delegate heavy research to subagents." ) async with Agent(config) as agent: prompt = ( "Use a subagent to research the /docs directory and " "write a synthesized lesson plan based on what it finds." ) response = await agent.chat(prompt) print(await response.text())

To prevent privilege escalation, safety policies and hooks cascade hierarchically. If the main agent is restricted from running terminal commands, those same restrictions automatically apply to any subagents it spawns. You can also intercept and inspect subagent lifecycles using the same hook middleware (PreToolCallDecideHook and PostToolCallHook) that governs regular tool calls.

### What will you build?

Building an agent loop is relatively straightforward, but securing and monitoring it in production is where challenges typically begin. The Antigravity SDK bridges this gap by decoupling your agent’s logic from its execution environment.

To get started, review the [SDK overview docs](https://antigravity.google/docs/sdk-overview?utm_campaign=CDR_0x2b6f3004_default_b521271009&utm_medium=external&utm_source=blog&trk=article-ssr-frontend-pulse_little-text-block) and clone the [source repository](https://github.com/google-antigravity/antigravity-sdk-python?trk=article-ssr-frontend-pulse_little-text-block). Then try out one of the [examples](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/examples?trk=article-ssr-frontend-pulse_little-text-block).

Stay tuned for the next agent I’ll build with the Antigravity SDK! Share with me what you’re building on [X](https://x.com/kweinmeister?trk=article-ssr-frontend-pulse_little-text-block), [LinkedIn](https://www.linkedin.com/in/karlweinmeister/?trk=article-ssr-frontend-pulse_little-text-block), or [Bluesky](https://bsky.app/profile/kweinmeister.bsky.social?trk=article-ssr-frontend-pulse_little-text-block).

\

[Cloud with Karl](https://www.linkedin.com/newsletters/cloud-with-karl-7470117625700810754)

### Cloud with Karl

#### 1,996 follower

[+ Subscribe](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc) [Like](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_like-toggle_like-cta)

Like

Celebrate

Support

Love

Insightful

Funny [Comment](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_comment-cta)

- Copy
- LinkedIn
- Facebook
- X

Share

232 [6 Comments](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_likes-count_social-actions-comments)

[Paolo Perrone](https://www.linkedin.com/in/paoloperrone?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_actor-name) 1mo

- [Report this comment](/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_ellipsis-menu-semaphore-sign-in-redirect&guestReportContentType=COMMENT&_f=guest-reporting)

embedding agent capabilities directly in the codebase is the right move, the SDK-not-just-IDE approach is what lets teams put agents in CI and backend jobs, not only the editor.

[Like](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_like) [Reply](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reply) 1 Reaction

[The IT Ink Poet](https://www.linkedin.com/company/the-it-ink-poet?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_actor-name) 1mo

- [Report this comment](/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_ellipsis-menu-semaphore-sign-in-redirect&guestReportContentType=COMMENT&_f=guest-reporting)

The model-agnostic architecture in Antigravity's Python framework is what makes it actually useful for teams that arent fully committed to a single cloud stack. Being able to swap Gemini for a local model without rebuilding the orchestration layer is the kind of flexibility that matters in 6months when newer models drop. Most agent frameworks still make that swap more painful than it should be..

[Like](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_like) [Reply](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reply) [1 Reaction](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reactions) 2 Reactions

[Stéphane Giron](https://fr.linkedin.com/in/stephane-giron-fr?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_actor-name) 1mo

- [Report this comment](/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_ellipsis-menu-semaphore-sign-in-redirect&guestReportContentType=COMMENT&_f=guest-reporting)

Nice article, thanks.

[Like](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_like) [Reply](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reply) [1 Reaction](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reactions) 2 Reactions

[Manish Sainani 🤫](https://www.linkedin.com/in/manishsainani?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_actor-name) 2mo

- [Report this comment](/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_ellipsis-menu-semaphore-sign-in-redirect&guestReportContentType=COMMENT&_f=guest-reporting)

Very very cool. [Kushal Trivedi](https://www.linkedin.com/in/kushal-trivedi-5a2681202?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment-text) [Abdul Zalil](https://www.linkedin.com/in/abdulzalil?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment-text) Ptal. Nice work antigravity sdk team. Miss you all 💗

[Like](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_like) [Reply](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reply) [3 Reactions](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reactions) 4 Reactions

[Prashant Kulkarni](https://www.linkedin.com/in/prashantkulkarni2?trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_actor-name) 2mo

- [Report this comment](/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_ellipsis-menu-semaphore-sign-in-redirect&guestReportContentType=COMMENT&_f=guest-reporting)

I'm so looking forward to trying this out. Sky is the limit with this SDK!

[Like](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_like) [Reply](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reply) [2 Reactions](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments-action_comment_reactions) 3 Reactions [See more comments](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_comments_comment-see-more)

To view or add a comment, [sign in](https://www.linkedin.com/signup/cold-join?session_redirect=%2Fpulse%2Fgoogle-antigravity-sdk-developer-guide-karl-weinmeister-nymsc&trk=article-ssr-frontend-pulse_x-social-details_feed-cta-banner-cta)

## More articles by Karl Weinmeister

- [Local AI Agent Sandboxing Explained: Antigravity and Sandbox Runtime](https://www.linkedin.com/pulse/local-ai-agent-sandboxing-explained-antigravity-karl-weinmeister-mwige)

  Jul 30, 2026

  ### Local AI Agent Sandboxing Explained: Antigravity and Sandbox Runtime

  When an AI agent runs a shell command on your laptop, what stops a script from reading your SSH key? A secure agent…

  54 7 Comments

- [Why I write skills instead of agents for knowledge work](https://www.linkedin.com/pulse/why-i-write-skills-instead-agents-knowledge-work-karl-weinmeister-nkvte)

  Jul 27, 2026

  ### Why I write skills instead of agents for knowledge work

  Are there tasks you find yourself doing repeatedly, wondering if there is a better way? For me, one of those is writing…

  172 28 Comments

- [Four math concepts to improve your vibe coding](https://www.linkedin.com/pulse/four-math-concepts-improve-your-vibe-coding-karl-weinmeister-c9jye)

  Jul 15, 2026

  ### Four math concepts to improve your vibe coding

  The power of vibe coding is undeniable. Describe what you want in Google AI Studio, Antigravity, or your favorite…

  131 27 Comments

- [The future of autonomous software maintenance: a dependency update agent](https://www.linkedin.com/pulse/future-autonomous-software-maintenance-dependency-karl-weinmeister-dmuge)

  Jul 9, 2026

  ### The future of autonomous software maintenance: a dependency update agent

  Most AI tools focus on writing new code, but up to 80% of the cost of software comes from maintenance. What if an…

  36 2 Comments

- [Your AI agent reads files. It should use OKF to read systems.](https://www.linkedin.com/pulse/your-ai-agent-reads-files-should-use-okf-read-systems-weinmeister-6ypjc)

  Jun 16, 2026

  ### Your AI agent reads files. It should use OKF to read systems.

  Today's AI coding agents don't hallucinate the way they used to; we're generally past the "inventing fake APIs" stage…

  173 16 Comments

- [How to turn a 180% commit boost into shipped software](https://www.linkedin.com/pulse/how-turn-180-commit-boost-shipped-software-karl-weinmeister-lgodc)

  Jun 12, 2026

  ### How to turn a 180% commit boost into shipped software

  What impact are AI developer tools actually having on productivity? A new study of more than 100,000 GitHub developers…

  40 13 Comments

Show more

[See all articles](https://www.linkedin.com/in/karlweinmeister/recent-activity/articles/)

## Others also viewed

- ### Node.js vs Python for Agentic AI Applications: Choosing the Best Language

  Ashish Kumar 9mo

- ### gRPC Communication Between Go and Python

  Richard Taujenis 1y

- ### I Stopped Using Conda and Pip. Here’s Why UV Changed Everything.

  Zheng Yu Tan 9mo

- ### What No One Tells You About Using Gemini AI with Python — Part 1

  Deepika P. 1y

- ### Python Environments: You Cannot Survive Without Them

  Abhinav Girotra 2y

- ### FFMPEG with Docker for Python AWS lambda - based applications

  Denis Smyslov 1y

- ### LangChain vs LangGraph vs Custom Python Agents

  Garvit Sharma 7mo

- ### Saving costs with Headroom and Codegraph

  Samuel Howell 2mo

- ### Rapidly prototyping a domain specific language using Python

  Wai Ming Ho 6y

- ### Recursive Functions in Python

  Sonali Shintre 4y

Show more

Show less

## Similar topics

- [](https://www.linkedin.com/top-content/artificial-intelligence/developing-ai-agents/how-to-build-agent-frameworks/)

  ### How to Build Agent Frameworks

  10 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 3,448

- [](https://www.linkedin.com/top-content/artificial-intelligence/gemini-api-features/gemini-1-5-pro-developer-insights/)

  ### Gemini 1.5 Pro Developer Insights

  5 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 221

- [](https://www.linkedin.com/top-content/artificial-intelligence/developing-ai-agents/how-to-build-production-ready-ai-agents/)

  ### How to Build Production-Ready AI Agents

  10 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 5,585

- [](https://www.linkedin.com/top-content/artificial-intelligence/gemini-api-features/benefits-of-gemini-s-context-window/)

  ### Benefits of Gemini's Context Window

  3 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 67

- [](https://www.linkedin.com/top-content/artificial-intelligence/gemini-api-features/understanding-gemini-1-5-pro-s-1m-token-context-window/)

  ### Understanding Gemini 1.5 Pro's 1M Token Context Window

  5 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 1,348

- [](https://www.linkedin.com/top-content/artificial-intelligence/developing-ai-agents/how-to-build-custom-ai-assistants/)

  ### How to Build Custom AI Assistants

  10 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 3,762

- [](https://www.linkedin.com/top-content/artificial-intelligence/ai-tools-applications-guide/how-to-use-context-aware-ai-agents-with-enterprise-tools/)

  ### How to Use Context-Aware AI Agents with Enterprise Tools

  10 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 3,606

- [](https://www.linkedin.com/top-content/artificial-intelligence/ai-safety-and-risk-management/how-to-build-responsible-ai-with-foundation-models/)

  ### How to Build Responsible AI With Foundation Models

  9 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/22jsinltnceyldvi5xawxv0i3) 2,023

- [](https://www.linkedin.com/top-content/artificial-intelligence/gemini-api-features/understanding-gemini-s-multimodal-capabilities/)

  ### Understanding Gemini's Multimodal Capabilities

  8 Posts ![](https://static.licdn.com/aero-v1/sc/h/boyt1asaw0mo9h90rug758dg4) ![](https://static.licdn.com/aero-v1/sc/h/3vmi4b4t3wssvheyd48p19jpm) ![](https://static.licdn.com/aero-v1/sc/h/7vbtj740jdyn3wqajpyat685) 1,139

Show more

Show less

## Explore content categories

- [Career](https://www.linkedin.com/top-content/career/)
- [Productivity](https://www.linkedin.com/top-content/productivity/)
- [Finance](https://www.linkedin.com/top-content/finance/)
- [Soft Skills & Emotional Intelligence](https://www.linkedin.com/top-content/soft-skills-emotional-intelligence/)
- [Project Management](https://www.linkedin.com/top-content/project-management/)
- [Education](https://www.linkedin.com/top-content/education/)
- [Technology](https://www.linkedin.com/top-content/technology/)
- [Leadership](https://www.linkedin.com/top-content/leadership/)
- [Ecommerce](https://www.linkedin.com/top-content/ecommerce/)
- [User Experience](https://www.linkedin.com/top-content/user-experience/)
- [Recruitment & HR](https://www.linkedin.com/top-content/recruitment-hr/)
- [Customer Experience](https://www.linkedin.com/top-content/customer-experience/)
- [Real Estate](https://www.linkedin.com/top-content/real-estate/)
- [Marketing](https://www.linkedin.com/top-content/marketing/)
- [Sales](https://www.linkedin.com/top-content/sales/)
- [Retail & Merchandising](https://www.linkedin.com/top-content/retail-merchandising/)
- [Science](https://www.linkedin.com/top-content/science/)
- [Supply Chain Management](https://www.linkedin.com/top-content/supply-chain-management/)
- [Future Of Work](https://www.linkedin.com/top-content/future-of-work/)
- [Consulting](https://www.linkedin.com/top-content/consulting/)
- [Writing](https://www.linkedin.com/top-content/writing/)
- [Economics](https://www.linkedin.com/top-content/economics/)
- [Artificial Intelligence](https://www.linkedin.com/top-content/artificial-intelligence/)
- [Employee Experience](https://www.linkedin.com/top-content/employee-experience/)
- [Workplace Trends](https://www.linkedin.com/top-content/workplace-trends/)
- [Fundraising](https://www.linkedin.com/top-content/fundraising/)
- [Networking](https://www.linkedin.com/top-content/networking/)
- [Corporate Social Responsibility](https://www.linkedin.com/top-content/corporate-social-responsibility/)
- [Negotiation](https://www.linkedin.com/top-content/negotiation/)
- [Communication](https://www.linkedin.com/top-content/communication/)
- [Engineering](https://www.linkedin.com/top-content/engineering/)
- [Hospitality & Tourism](https://www.linkedin.com/top-content/hospitality-tourism/)
- [Business Strategy](https://www.linkedin.com/top-content/business-strategy/)
- [Change Management](https://www.linkedin.com/top-content/change-management/)
- [Organizational Culture](https://www.linkedin.com/top-content/organizational-culture/)
- [Design](https://www.linkedin.com/top-content/design/)
- [Innovation](https://www.linkedin.com/top-content/innovation/)
- [Event Planning](https://www.linkedin.com/top-content/event-planning/)
- [Training & Development](https://www.linkedin.com/top-content/training-development/)

Show more

Show less
