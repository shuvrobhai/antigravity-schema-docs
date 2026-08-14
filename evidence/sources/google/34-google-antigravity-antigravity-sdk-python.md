---
source: 34
category: google
title: antigravity-sdk-python (official repo)
url: "https://github.com/google-antigravity/antigravity-sdk-python"
final_url: "https://github.com/google-antigravity/antigravity-sdk-python"
fetched: 2026-08-13
status: 200
---
### Uh oh!

There was an error while loading. [Please reload this page]().

[google-antigravity](/google-antigravity) / **[antigravity-sdk-python](/google-antigravity/antigravity-sdk-python)** Public

- [Notifications](/login?return_to=%2Fgoogle-antigravity%2Fantigravity-sdk-python) You must be signed in to change notification settings
- [Fork 1.2k](/login?return_to=%2Fgoogle-antigravity%2Fantigravity-sdk-python)
- [Star 3k](/login?return_to=%2Fgoogle-antigravity%2Fantigravity-sdk-python)

main

[Branches](/google-antigravity/antigravity-sdk-python/branches)[Tags](/google-antigravity/antigravity-sdk-python/tags)

Go to file

Code

Open more actions menu

## Folders and files

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Name</th>
<th>Last commit message</th>
<th>Last commit date</th>
</tr>
</thead>
<tbody>
<tr>
<td><h2 id="latest-commit">Latest commit</h2>
 &#10;<h2 id="history">History</h2>
<a href="/google-antigravity/antigravity-sdk-python/commits/main/">471 Commits</a>471 Commits</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/.github">.github</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/.github">.github</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/.kokoro">.kokoro</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/.kokoro">.kokoro</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/examples">examples</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/examples">examples</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity">google/antigravity</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/google/antigravity">google/antigravity</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/skills">skills</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/tree/main/skills">skills</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/.gitignore">.gitignore</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/.gitignore">.gitignore</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/CODE_OF_CONDUCT.md">CODE_OF_CONDUCT.md</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/CODE_OF_CONDUCT.md">CODE_OF_CONDUCT.md</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/LICENSE">LICENSE</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/LICENSE">LICENSE</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/README.md">README.md</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/README.md">README.md</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/SECURITY.md">SECURITY.md</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/SECURITY.md">SECURITY.md</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/pyproject.toml">pyproject.toml</a></td>
<td><a href="/google-antigravity/antigravity-sdk-python/blob/main/pyproject.toml">pyproject.toml</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td>View all files</td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

## Repository files navigation

# Google Antigravity SDK

The Google Antigravity SDK is a Python SDK for building AI agents powered by Antigravity and Gemini. It provides a secure, scalable, and stateful infrastructure layer that abstracts the agentic loop, letting you focus on what your agent *does* rather than how it runs.

## Installation

pip install google-antigravity

Important

The Google Antigravity SDK relies on a compiled runtime binary that is included in the platform-specific wheels published to [PyPI](https://pypi.org/project/google-antigravity/). **Cloning this repository alone is not sufficient to run the SDK.** Always install from PyPI with `pip install google-antigravity` to obtain the binary.

## Quickstart

Get started by running one of the [`examples/`](/google-antigravity/antigravity-sdk-python/blob/main/examples), such as the `hello_world` example with:

export GEMINI_API_KEY="your_api_key_here" python ./examples/getting_started/hello_world.py

## Gemini Enterprise Agent Platform (formerly Vertex AI)

To use the SDK with Gemini Enterprise Agent Platform (formerly Vertex AI), configure `LocalAgentConfig` with `vertex=True` and specify your GCP `project` and `location`.

By default, the SDK uses Application Default Credentials (ADC) for authentication.

from google.antigravity import Agent, LocalAgentConfig config = LocalAgentConfig( vertex=True, project="your-gcp-project", location="us-central1", ) async with Agent(config) as agent: response = await agent.chat("Hello!") print(await response.text())

Alternatively, you can leave these fields unset in `LocalAgentConfig` and export the environment variables instead:

\# Either GOOGLE_GENAI_USE_VERTEXAI or GOOGLE_GENAI_USE_ENTERPRISE enable Vertex. export GOOGLE_GENAI_USE_VERTEXAI=True export GOOGLE_CLOUD_PROJECT="your-gcp-project" export GOOGLE_CLOUD_LOCATION="us-central1"

Explicit kwargs always take precedence over env vars.

Ensure you have authenticated locally before running the agent:

gcloud auth application-default login

## Concepts

### Simple Agent

The `Agent` class is the easiest way to get started. It manages the full lifecycle — binary discovery, tool wiring, hook registration, and policy defaults — behind a single async context manager.

The `system_instructions` parameter is optional.

import asyncio from google.antigravity import Agent, LocalAgentConfig async def main(): config = LocalAgentConfig( system_instructions="You are an expert assistant for codebase navigation.", \# api_key="your_api_key_here", ) async with Agent(config) as agent: response = await agent.chat("What files are in the current directory?") print(await response.text()) async def run(): await main() if \_\_name\_\_ == "\_\_main\_\_": asyncio.run(run())

### Streaming Responses

To stream agent output in real-time (e.g., for fluid UI or console applications), simply iterate over the `ChatResponse` object using an `async for` loop. The stream wrapper natively yields conversational `str` text tokens as they arrive, with zero network overhead:

import asyncio import sys from google.antigravity import Agent, LocalAgentConfig async def main(): config = LocalAgentConfig() async with Agent(config) as agent: \# Returns instantly — does not block response = await agent.chat("Write a short poem about space.") async for token in response: sys.stdout.write(token) sys.stdout.flush() print() asyncio.run(main())

### Sugared Thoughts & Tool Call Streams (Advanced)

For more complex use cases, you can also stream internal model reasoning/thinking or intercept tool call dispatches in real-time using dedicated async stream properties:

\# 1. Stream reasoning/thinking deltas async for thought in response.thoughts: show_thinking_bubble(thought) \# 2. Stream strongly-typed ToolCall events async for call in response.tool_calls: show_executing_spinner(call.name)

By default, `Agent` runs in **read-only mode** for safety. Pass `capabilities=CapabilitiesConfig()` to enable all tools (including writes).

### Interactive Loop

from google.antigravity import LocalAgentConfig, CapabilitiesConfig from google.antigravity.utils.interactive import run_interactive_loop config = LocalAgentConfig( \# api_key="your_api_key_here", capabilities=CapabilitiesConfig(), ) await run_interactive_loop(config)

### Advanced Usage with Conversation

For full control over the connection lifecycle, use `Conversation` with a `ConnectionStrategy` directly. `Conversation` is a stateful session that accumulates step history, provides a `chat()` convenience method, and exposes state introspection:

import asyncio from google.antigravity.connections.local import LocalConnectionStrategy from google.antigravity.conversation.conversation import Conversation from google.antigravity.tools.tool_runner import ToolRunner async def main(): tool_runner = ToolRunner() strategy = LocalConnectionStrategy( tool_runner=tool_runner, ) async with Conversation.create(strategy) as conversation: \# High-level: one-call send + collect response = await conversation.chat("What files are here?") print(await response.text()) \# Step history accumulates automatically print(f"Total steps: {len(conversation.history)}") print(f"Turns: {conversation.turn_count}") print(f"Last response: {conversation.last_response}") \# Low-level: streaming steps await conversation.send("Tell me more.") async for step in conversation.receive_steps(): if step.is_complete_response: print(step.content) asyncio.run(main())

## Features

### Multimodal Ingestion

Pass rich multimedia file attachments (images, videos, audio, and documents) to the agent alongside textual instruction prompt lists.

You can attach assets **directly using content classes** (perfect for in-memory bytes) or **conveniently from a filesystem path** (which automatically resolves types and guesses MIME formats):

from google.antigravity import Agent, LocalAgentConfig from google.antigravity.types import Image, from_file config = LocalAgentConfig(system_instructions="You are an expert software architect.") async with Agent(config) as agent: \# 1. Flat filesystem shortcut (automatically resolves as types.Document) pdf_spec = from_file("spec.pdf") \# 2. Direct constructor instantiation (perfect for in-memory raw bytes) chart_image = Image( data=b"raw_png_bytes_here", mime_type="image/png", description="Architecture blueprint" ) \# Send a mixed list of text instructions and content classes prompt = \[ "Analyze this chart against the specification and list three security vulnerabilities:", chart_image, pdf_spec \] response = await agent.chat(prompt) print(await response.text())

### Custom Tools

Register Python functions as tools that the agent can call:

def get_weather(city: str) -\> str: """Returns the current weather for a city.""" return f"It's sunny in {city}." config = LocalAgentConfig( tools=\[get_weather\], ) async with Agent(config) as agent: response = await agent.chat("What's the weather in Tokyo?")

### MCP Integration

Connect to external [MCP](https://modelcontextprotocol.io/) servers and expose their tools to the agent:

from google.antigravity import Agent, LocalAgentConfig from google.antigravity.types import McpStdioServer config = LocalAgentConfig( mcp_servers=\[McpStdioServer(name="my_server", command="npx", args=\["my-mcp-server"\])\], ) async with Agent(config) as agent: response = await agent.chat("Use the MCP tools to help me.")

### Hooks and Policies

Control agent behavior with a declarative policy system:

from google.antigravity import LocalAgentConfig, CapabilitiesConfig from google.antigravity.hooks.policy import deny, allow, ask_user, enforce from google.antigravity.utils.interactive import run_interactive_loop policies = \[ deny("\*"), \# Block all tools by default allow("view_file"), \# Allow reading files ask_user("run_command", handler=my_handler), \# Ask before running commands \] config = LocalAgentConfig( capabilities=CapabilitiesConfig(), policies=policies, ) await run_interactive_loop(config)

### Triggers

Run background tasks that react to external events and push messages into the agent:

from google.antigravity import LocalAgentConfig from google.antigravity.triggers import every from google.antigravity.utils.interactive import run_interactive_loop async def check_status(ctx): await ctx.send("Check the deployment status.") config = LocalAgentConfig( triggers=\[every(60, check_status)\], ) await run_interactive_loop(config)

## Architecture

The SDK follows a three-layer architecture:

| Layer | Purpose | Key Classes |
|----|----|----|
| **Layer 1** — Simplified | High-level, batteries-included entry point | `Agent` |
| **Layer 2** — Session | Stateful session with history and convenience methods | `Conversation`, `ChatResponse`, `Step`, `ToolCall`, `AgentConfig`, `HookRunner`, `ToolRunner`, `TriggerRunner` |
| **Layer 3** — Adapter | Transport and backend abstraction | `Connection`, `ConnectionStrategy`, `LocalConnection` |

## Component Documentation

For more detailed documentation on specific components, see:

- [Agent](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/agent.py) — High-level, batteries-included entry point.
- [Connections](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/connections/README.md) — Transport and backend abstraction.
- [Conversation](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/conversation/README.md) — Stateful session management.
- [Hooks](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/hooks/README.md) — Agent lifecycle interception and policies.
- [MCP](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/mcp/README.md) — Model Context Protocol integration.
- [Tools](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/tools/README.md) — In-process tool execution.
- [Triggers](/google-antigravity/antigravity-sdk-python/blob/main/google/antigravity/triggers/README.md) — Background tasks and external events.

## License

[Apache License 2.0](/google-antigravity/antigravity-sdk-python/blob/main/LICENSE)

## About

A Python library for building AI agents that leverage the full power of Google Antigravity.

[antigravity.google/product/antigravity-sdk](https://antigravity.google/product/antigravity-sdk)

### Topics

[ai-agents](/topics/ai-agents)[antigravity](/topics/antigravity)[gemini](/topics/gemini)[gemini-api](/topics/gemini-api)[google](/topics/google)[llm-agents](/topics/llm-agents)[mcp](/topics/mcp)[python-sdk](/topics/python-sdk)[skills](/topics/skills)

### Resources

[Readme](#readme-ov-file)[Apache-2.0 license](#Apache-2.0-1-ov-file)

### Code of conduct

[Code of conduct](/google-antigravity/antigravity-sdk-python#coc-ov-file)

### Contributing

[Contributing](#contributing-ov-file)

### Security policy

[Security policy](#security-ov-file)[Activity](/google-antigravity/antigravity-sdk-python/activity)[Custom properties](/google-antigravity/antigravity-sdk-python/custom-properties)

### Stars

**3.0k** stars

### Watchers

**130** watching

### Forks

[**1.2k** forks](/google-antigravity/antigravity-sdk-python/forks)[Report repository](/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fgoogle-antigravity%2Fantigravity-sdk-python&report=google-antigravity+%28user%29)

## Releases

## Packages

## Used by

## Contributors

## Languages
