## 3. Product Ecosystem and Identity

### 3.1 Product Family

Google Antigravity comprises four products `[DOCS]`:

| Product | Description | Interface |
|---|---|---|
| **Antigravity 2.0** | Standalone desktop application. Command center for managing multiple local agents, grouped projects, workspaces, and scheduled tasks. | GUI application |
| **Antigravity IDE** | Fully-featured agentic IDE with agent manager, artifacts, and deep codebase understanding. VS Code fork. | IDE |
| **Antigravity CLI** | Lightweight, fast, terminal-first surface for autonomous coding agents, shell execution, and background subagent management. | Terminal (`agy`) |
| **Antigravity SDK** | Python SDK for programmatic integration, custom agent prototyping, and automated evaluations. | Python API |

**IDE extension marketplace (2026-08-13):** Antigravity IDE does **not** use the official VS Code Marketplace; it sources extensions from the **Open VSX Registry** (Eclipse Foundation) `[DOCS]`. Compatibility is partial: extensions mirrored on Open VSX install and work (including some with the `ms-` publisher prefix, e.g. `ms-python`), but Microsoft-owned extensions absent from Open VSX (e.g. **C# Dev Kit** — confirmed unavailable via `microsoft/vscode-dotnettools#2557`) do not. First-hand reports describe manual VSIX installs from the official Marketplace as unreliable `[COMMUNITY]`. Evaluate extension availability on Open VSX before treating the IDE as a drop-in VS Code replacement.

### 3.2 CLI Technical Characteristics

- **Language:** Written in Go `[DOCS]`
- **Optimized model:** Gemini 3.5 Flash, optimized for the Antigravity harness `[GOOGLE]`
- **Architecture:** Asynchronous-first — subagents run in the background, allowing parallel parent/subagent execution `[DOCS]`; commands execute asynchronously `[GOOGLE]`
- **Binary:** `agy` for CLI `[DOCS]`; `antigravity` for desktop IDE `[GOOGLE]`
- **Config tree:** Uses `~/.gemini/` directory `[DOCS]`; reuse for backward compatibility is `[GOOGLE]`
- **Live grounding:** `agy --version` reports `1.1.12` `[LIVE-1.1.12 · 2026-08-13]`, platform `Darwin ... RELEASE_ARM64_T8103 arm64` `EV-001`.

### 3.3 System Requirements

| Platform | Requirement |
|---|---|
| **macOS** | macOS 12 (Monterey) minimum. Apple Silicon only (x86 NOT supported). Current + two previous versions with Apple security update support. |
| **Windows** | Windows 10 (64-bit) |
| **Linux** | glibc >= 2.28, glibcxx >= 3.4.25 (Ubuntu 20, Debian 10, Fedora 36, RHEL 8) |

**Source:** `[DOCS]`

### 3.4 Migration from Gemini CLI
`[DOCS:32]`

Starting June 18, 2026, Gemini Code Assist IDE extensions and Gemini CLI stopped serving requests for consumer tiers `[GOOGLE:48]`. Enterprise subscriptions remain unaffected.

**Configuration migration mapping:** `[DOCS:08,32]` / `[LIVE-1.1.12 · 2026-08-13]` `EV-012`

| Configuration | Gemini CLI (Legacy) | Antigravity CLI (Current) | Authority & Notes |
|---|---|---|---|
| User settings | `~/.gemini/settings.json` | `~/.gemini/antigravity-cli/settings.json` | `[DOCS:32]` (`cli/gcli-migration`) |
| Global shared skills | `~/.gemini/skills/` | `~/.gemini/config/skills/` AND `~/.gemini/antigravity-cli/skills/` | `docs/skills` `[DOCS:08]` documents `~/.gemini/config/skills/`; `cli/gcli-migration` `[DOCS:32]` documents `~/.gemini/antigravity-cli/skills/`. Both exist and load dynamically (`EV-012`). |
| Workspace project skills | `.gemini/skills/` | `.agents/skills/` | `[DOCS:08,32]` |

**Binary coexistence:** Both `agy` and the legacy `gemini` binary can be installed and run side by side on the same machine — different binary names, separate configuration trees, no interference `[COMMUNITY]`. Verified by multiple independent migration guides during the June 18, 2026 deprecation window (aibuilderclub, harshrastogi.tech, how2shout). Useful for incremental script migration.


### 3.5 Model Ecosystem

`[DOCS]`

| Model Slug | Free & AI Plus | AI Pro | AI Ultra | Enterprise | Description |
|---|---|---|---|---|---|
| `gemini-3.7-flash-high` | Yes | Yes | Yes | Yes | Gemini 3.7 Flash (High Effort) |
| `gemini-3.7-flash-medium` | Yes | Yes | Yes | Yes | Gemini 3.7 Flash (Medium Effort) |
| `gemini-3.6-flash-high` | Yes | Yes | Yes | Yes | Gemini 3.6 Flash (High Effort) |
| `gemini-3.6-flash-medium` | Yes | Yes | Yes | Yes | Gemini 3.6 Flash (Medium Effort) |
| `gemini-3.5-flash-medium` | Yes | Yes | Yes | Yes | Gemini 3.5 Flash (Medium Effort) |
| `gemini-3.1-pro-high` | Yes | Yes | Yes | Yes | Gemini 3.1 Pro (High Effort) |
| `claude-sonnet-4-6` | Yes | Yes | Yes | **No** | Claude Sonnet 4.6 (Thinking enabled) |
| `claude-opus-4-6` | Yes | Yes | Yes | **No** | Claude Opus 4.6 (Thinking enabled) |
| `gpt-oss-120b` | Yes | Yes | Yes | **No** | GPT-OSS-120b |

* **Nano Banana 2:** An internal, non-customizable vision-generative model used natively by the `generate_image` tool to render UI mockups, page assets, and architectural diagrams `[DOCS]`.
* **Model Stickiness:** Model selections are strictly "sticky" within a conversation `[DOCS]`. If the reasoning model is modified mid-execution, the agent continues to use the original model until the active turn finishes or is explicitly canceled.

### 3.6 Terms of Service and API Gaps

* **Third-Party Tool Blocks:** Utilizing third-party software, terminal emulators, or alternative client wrappers with your Antigravity OAuth session is a direct violation of the Terms of Service `[DOCS]`. Violations severely degrade the service and are grounds for account suspension.
* **CLI Authentication Limitation:** The Antigravity CLI does not support local API-key authentication (open issue `google-antigravity/antigravity-cli#78`) `[COMMUNITY]`. Developers must use Application Default Credentials (ADC) or OAuth. In contrast, the SDK fully supports `api_key` configuration or `GEMINI_API_KEY` environment variables `[DOCS]`.


### 3.7 Open Standards Foundation

The entire extensibility architecture is built on portable, open standards:

| Component | Format | Cross-Tool Portability | Source |
|---|---|---|---|
| **MCP** | Open protocol | Claude, ChatGPT, VS Code, Cursor, MCPJam | `[DOCS]` + `[PROTOCOL]` |
| **Skills** | `SKILL.md` with YAML frontmatter | Claude Code, Cursor, Codex CLI | `[DOCS]` confirms format; `[COMMUNITY]` confirms cross-tool portability |
| **Agents** | `.md` with YAML frontmatter | Same format pattern | `[DOCS]` |
| **Rules** | `.md` constraint files | Markdown — inherently portable | `[DOCS]` |
| **Workflows** | `.md` step sequences | Markdown — inherently portable | `[DOCS]` |

MCP is described as "an open-source standard" using a USB-C analogy for AI apps `[DOCS]`.
