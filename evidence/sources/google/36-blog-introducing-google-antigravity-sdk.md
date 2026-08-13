---
source: 36
category: google
title: Antigravity SDK announcement blog
url: "https://antigravity.google/blog/introducing-google-antigravity-sdk"
final_url: "https://antigravity.google/blog/introducing-google-antigravity-sdk"
fetched: 2026-08-13
status: 200
---
close

ProductMay 19, 2026

# Google Antigravity SDK

The AI Platform Team, The Antigravity Team![Google Antigravity SDK](/assets/image/blog/AGY-SDK-Blog---Wide.png)

Today we are launching the Google Antigravity SDK in preview — a Python library that gives you programmatic access to Google’s premier Antigravity coding agent. With the Antigravity SDK, you can prototype, build, and iterate on sophisticated agentic applications. Build on top of the Antigravity Agent Runtime with minimal code and explore and prototype novel agentic patterns with state-of-the-art primitives. [GitHub repo](https://github.com/google-antigravity/antigravity-sdk-python)

### Powered by the Antigravity Runtime

The SDK gives you the same agent runtime that powers [Antigravity 2.0](/blog/introducing-google-antigravity-2) and the [Antigravity CLI](/blog/introducing-google-antigravity-cli). Your agent inherits a capable execution environment — a rich built-in toolset, a declarative safety-policy engine, lifecycle hooks for observing and steering every tool call, and stateful multi-turn sessions that persist across interactions. With the Antigravity SDK, you extend the same harness used for Google’s internal research with your own logic. As the Antigravity runtime improves — faster tool execution, smarter planning, better context management — those same improvements flow to your SDK agents automatically.

Most developers only need `Agent` — a single async `with` block that manages the full lifecycle in under 20 lines of idiomatic Python. A functional agent in under 15 lines:

content_copy

    pip install google-antigravity

content_copy

    import asyncio
    from google.antigravity import Agent, LocalAgentConfig

    async def main():
        config = LocalAgentConfig()
        async with Agent(config) as agent:
            response = await agent.chat("What files are in the current directory?")
            print(await response.text())

    if __name__ == "__main__":
        asyncio.run(main())

Your agent logic is decoupled from where it runs: and soon you’ll be able to swap the local agentic loop for a remotely-hosted one and the same agent will deploy to the cloud — no rewrite required. You focus on what the agent does. The SDK handles how and where it runs.

Every agent starts with a complete built-in toolset — file I/O, code editing, shell execution, directory search, image generation, and sub-agent delegation — ready at initialization. From there, layer in system instructions to set identity, add domain-specific guidance, or replace the defaults entirely.

### Built for AI-Native Development

The SDK is designed to be agent-friendly — for both the applications you build with it and how you build them. If you use Antigravity, you can ask the agent to write, test, and iterate on your SDK code directly within your development session. The API surface uses clean Python types (Pydantic V2 models, native Python collections), structured outputs, and clear naming conventions — all chosen so that AI agents can read, write, and maintain SDK code as fluently as human developers. The SDK is Antigravity’s own API: the agent building your code understands the framework from the inside out.

## Governed Extensibility

Customize your agent with your own Python functions, bind its output to your data types via structured output schemas, and control when and how tools are invoked.

### Tools and Integrations

The SDK supports four kinds of toolsets that all share one execution pipeline, one streaming infrastructure, and one set of safety policies:

1.  **Built-in tools** — file I/O, code editing, shell execution, directory search, image generation, sub-agent delegation, and more.
2.  **Custom Python functions** — register any Python callable as a tool the agent can invoke.
3.  **MCP servers** — connect any [Model Context Protocol](https://modelcontextprotocol.io/) server (stdio, SSE, or Streamable HTTP) and expose its tools to the agent.
4.  **Agent skills** — provide paths to reusable skill packages of instructions, tools, and context via `skills_paths` in the agent config.

Define a policy or hook once, and it governs every tool — regardless of its source.

### Safety Policies

Out of the box, `LocalAgentConfig` enables all builtin tools but applies a `confirm_run_command()` policy — most tools work without friction, but shell access is denied by default. To enable fully autonomous execution, pass `policies=[policy.allow_all()]`. When you’re ready for more control, the policy system lets you lock things down declaratively:

content_copy

    from google.antigravity.hooks.policy import deny, allow, ask_user

    policies = [
        deny("*"),                                  # Block everything by default
        allow("view_file"),                         # Except reading files
        ask_user("run_command", handler=my_handler),    # Human approval for shell
    ]

### Lifecycle Hooks

Beyond policies, the hook system gives you lifecycle-level control. Hooks are classified into three categories:

- **Inspect** — read-only, non-blocking. Observe events for logging, metrics, or audit trails.
- **Decide** — read-only, blocking. Approve or deny actions (policies are built on this).
- **Transform** — modifying, blocking. Reshape data in transit for sanitization or error recovery.

The SDK provides nine concrete hook points — from session start/end, through pre/post turn, to pre/post tool call, tool error recovery, user interaction handling, and context compaction — each with a decorator shortcut for quick wiring:

content_copy

    from google.antigravity.hooks import post_tool_call
    from google.antigravity.types import ToolResult

    @post_tool_call
    async def audit_log(result: ToolResult):
        print(f"Tool {result.name} completed")

## Capabilities

### I/O & Execution

- **Streaming**: Access live model reasoning alongside output. Iterate with `async for chunk in response` for content.
- **Multimodal input**: Pass images, PDFs, audio, and video alongside text prompts. Auto-detect from file paths with `from_file()` or construct from raw bytes.
- **Sub-agents**: Spawn child agents with independent tools, instructions, and contexts — the building blocks behind agent teams.
- **Thinking levels**: Control reasoning depth per request — `MINIMAL`, `LOW`, `MEDIUM`, or `HIGH` — via `GenerationConfig`.
- **Triggers**: Run background tasks that react to external events and push messages into the agent.

### State

- **Session persistence**: Resume conversations from saved session IDs by passing `conversation_id` back to the agent config.
- **Structured output**: Define a response schema (as a JSON schema, dict, or Pydantic model) and the agent returns validated, typed data via `response.structured_output()`.
- **Human-in-the-loop**: The agent pauses mid-task to ask structured questions with predefined options and branches on the response.

### Observability

- **Token usage**: Per-turn and cumulative usage — prompt, candidate, cached, and thinking tokens — available via `usage_metadata`.
- **Reasoning traces**: Access thinking traces alongside output to observe the model’s live reasoning process.

With [Gemini 3.5 Flash](/blog/gemini-3-5-flash-in-google-antigravity) as the default model, SDK agents get the performance that powers the rest of the platform. Hooks, sub-agents, and safety policies are consistent across the SDK, the [CLI](/blog/introducing-google-antigravity-cli), and [Antigravity 2.0](/blog/introducing-google-antigravity-2) — configured in code here instead of the UI.

## Looking Forward

We’re building this with the developers, researchers, and platform engineers who will push agents into domains we haven’t anticipated. As a Research Preview, the SDK is an evolving platform and we are seeking feedback to shape its future.

Here’s what’s on the roadmap:

- **Remote harness**: Deploy SDK agents to Google Cloud — persistent, scalable, accessible through the Interactions API. Build locally, deploy remotely.
- **TypeScript and Go**: Same runtime, additional language support.
- **Gemma integration**: We’re working on Gemma support — bringing the full agent runtime to open models you can run and fine-tune yourself.
- **Plugins**: Reusable packages of instructions, tools, and context that you can compose into agents programmatically or load from the community.
- **Deeper observability**: Background step tracing, trigger execution logs, and richer telemetry for debugging and optimizing agent behavior at scale.

## Get Started

The SDK is Apache 2.0 licensed. It ships with two tiers of examples: `getting_started/` for single-feature walkthroughs, and `deep_dives/` for more complex patterns. Full API documentation is available now.

content_copy

    pip install google-antigravity
