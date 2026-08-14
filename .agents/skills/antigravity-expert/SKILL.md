---
name: antigravity-expert
description: >-
  Comprehensive technical reference, architecture guide, and operational expert for Google Antigravity (agy). Use when designing Antigravity skills, plugins, subagents, MCP servers, lifecycle hooks, workspace schemas, CLI commands, sandbox security policies, or migrating from Cursor, Claude Code, and legacy Gemini CLI.
metadata:
  author: "Rayhan Islam Shuvro"
  github: "https://github.com/shuvrobhai"
  version: "1.1.12"
---

<!-- argument-hint: [topic, schema name, chapter, or question] -->

# Google Antigravity Technical Reference & Expert Guide
**Author**: Rayhan Islam Shuvro ([@shuvrobhai](https://github.com/shuvrobhai)) | **Specification Version**: v8.10 (Antigravity 1.1.12) | **Chapters**: 21 | **Native Schemas**: 20

## How to Use This Skill

- **Without arguments** — loads core architectural frameworks, mental models, and essential conventions.
- **With a topic** — query any concept like `hooks`, `skills`, `mcp`, `sandbox`, `routing`, `schemas`, or `keybindings` to pinpoint the exact specification and implementation rules.
- **With a chapter** — query `ch04` or `ch07` to load detailed chapter-specific reference documentation.
- **With a question** — ask how to construct configurations, debug validation failures, or migrate third-party setups.

When queried about topics beyond the core frameworks below, load the relevant on-demand chapter file from `chapters/`.

---

## Core Frameworks & Mental Models

### 1. The 3-Tier Configuration Precedence Model
Antigravity resolves configuration hierarchically across three distinct root boundaries:
$$\text{Project-Local } (.agents/) > \text{CLI-Specific } (~/.gemini/antigravity-cli/) > \text{Global } (~/.gemini/config/ \text{ or } ~/.gemini/)$$
- **Settings**: Merged shallowly across tiers. Local `.agents/settings.json` overrides global `~/.gemini/config/settings.json`.
- **Rules (`GEMINI.md` / `AGENTS.md` / `.agents/rules/*.md`)**: Evaluated via directory walk-up from current working directory to filesystem root, then merged with global rules. Max 12,000 chars per file.
- **Skills**: Discovered across project `.agents/skills/` and global dual-roots (`~/.gemini/config/skills/` and `~/.gemini/antigravity-cli/skills/`).

### 2. Progressive Disclosure Skill Architecture
Agent skills avoid context window bloat via a strict 3-phase loading lifecycle:
1. **Phase 1: Metadata (~100 tokens)** — Frontmatter (`name`, `description`) parsed at startup; stored in memory for routing decisions.
2. **Phase 2: Instructions (<5,000 tokens)** — `SKILL.md` body loaded only when explicitly invoked by user or matched by model intent.
3. **Phase 3: Resources (On-Demand)** — Supporting documents (`chapters/`, `glossary.md`, `patterns.md`, `references/`) read dynamically via `view_file` only when needed.

### 3. Native Deterministic Hook Lifecycle
Hooks execute arbitrary shell commands at five discrete agent loop lifecycle points:
- `PreToolUse` — Runs before tool execution; can block dangerous commands or inject parameters. Matcher: tool name (e.g. `run_command`).
- `PostToolUse` — Runs after tool execution; validates output against expected constraints. Matcher: tool name.
- `PreInvocation` — Runs before the model processes a prompt; enriches prompt or validates tokens.
- `PostInvocation` — Runs after model response generation; audits generated artifacts.
- `Stop` — Runs when a task finishes or user cancels; cleans temporary resources.

### 4. Sandbox Security & Execution Policy
Execution safety is enforced through policy tiers (`sandbox`, `auto`, `eager`, `off`):
- In `sandbox` mode, filesystem operations and terminal commands run inside isolated OS-level containers (gVisor/chroot) restricting unauthorized network or host filesystem mutations.
- Unsandboxed operations outside trusted workspace paths require explicit user approval.

### 5. Multi-Tier Model Routing
Antigravity implements dynamic model orchestration:
- **Thinking / Architecture**: Gemini 2.5 / 3.0 Pro with extended reasoning budgets for complex planning.
- **Execution / Tool Calling**: Gemini Flash models for rapid subagent task execution, file searches, and linting passes.

---

## Chapter Index

| Chapter | Title | Primary Specifications & Schemas |
|---|---|---|
| [ch00](chapters/ch00-preamble.md) | Preamble & Document Topology | Topology, versioning, document layout |
| [ch01](chapters/ch01-executive-summary.md) | Executive Summary | Core value proposition, high-level architecture |
| [ch02](chapters/ch02-methodology-and-source-classification.md) | Methodology & Source Classification | Evidence grounding, source taxonomy |
| [ch03](chapters/ch03-product-ecosystem-and-identity.md) | Product Ecosystem & Identity | IDE, CLI (`agy`), SDK, and protocol interplay |
| [ch04](chapters/ch04-extensibility-architecture.md) | Extensibility Architecture | Skills, plugins, MCP, hooks, custom agents, rules |
| [ch05](chapters/ch05-configuration-system.md) | Configuration System | `settings.json`, precedence order, keybindings |
| [ch06](chapters/ch06-permissions-engine.md) | Permissions Engine | Permission policies, approval modes, trust boundaries |
| [ch07](chapters/ch07-cli-command-reference.md) | CLI Command Reference | Interactive modes, arguments, command flags |
| [ch08](chapters/ch08-built-in-agent-tool-api.md) | Built-In Agent Tool API | Native tools, MCP integration, async tasks |
| [ch09](chapters/ch09-sandbox.md) | Sandbox Architecture | OS containers, network boundaries, policy enforcement |
| [ch10](chapters/ch10-headless-mode.md) | Headless Mode | Non-interactive execution, automation pipelines |
| [ch11](chapters/ch11-browser-integration.md) | Browser Integration | Browser subagent, DOM interactions, recordings |
| [ch12](chapters/ch12-artifacts-and-implementation-plans.md) | Artifacts & Implementation Plans | Markdown artifacts, plan review workflows |
| [ch13](chapters/ch13-enterprise-features.md) | Enterprise Features | Multi-account profiles, auth providers, telemetry |
| [ch14](chapters/ch14-workspace-governance-recommendations.md) | Workspace Governance | Repository standards, sandbox rules, team guidelines |
| [ch15](chapters/ch15-complete-path-inventory.md) | Complete Path Inventory | All configuration files, log locations, caches |
| [ch16](chapters/ch16-information-sourced-outside-official-docs.md) | Information Sourced Outside Docs | Community discoveries, reverse engineering findings |
| [ch17](chapters/ch17-undocumented-behavioral-contracts.md) | Undocumented Behavioral Contracts | Implicit behaviors, token limits, fallback heuristics |
| [ch18](chapters/ch18-remaining-hard-gaps.md) | Remaining Hard Gaps | Protocol roadmaps, open questions, future milestones |
| [ch19](chapters/ch19-works-cited.md) | Works Cited | Grounded primary citations, snapshot mappings |
| [ch20](chapters/ch20-schema-toolkit-and-native-schemas.md) | Schema Toolkit & Native Schemas | 20 JSON Schemas catalog, matrix definitions |

---

## Topic Index

- **Activation Modes (Rules)** → [ch04](chapters/ch04-extensibility-architecture.md), [ch05](chapters/ch05-configuration-system.md)
- **Agent Lifecycle** → [ch10](chapters/ch10-headless-mode.md), [ch17](chapters/ch17-undocumented-behavioral-contracts.md)
- **Approval Modes (`defaultApprovalMode`)** → [ch05](chapters/ch05-configuration-system.md), [ch06](chapters/ch06-permissions-engine.md)
- **Browser Subagent** → [ch11](chapters/ch11-browser-integration.md)
- **CLI Commands & Flags (`agy`)** → [ch07](chapters/ch07-cli-command-reference.md)
- **Custom Subagents** → [ch04](chapters/ch04-extensibility-architecture.md), [ch10](chapters/ch10-headless-mode.md)
- **Execution Policies (`sandbox`, `auto`, `eager`, `off`)** → [ch06](chapters/ch06-permissions-engine.md), [ch09](chapters/ch09-sandbox.md)
- **Hooks (`hooks.json`)** → [ch04](chapters/ch04-extensibility-architecture.md), [ch20](chapters/ch20-schema-toolkit-and-native-schemas.md)
- **Keybindings (`keybindings.json`)** → [ch05](chapters/ch05-configuration-system.md), [ch07](chapters/ch07-cli-command-reference.md)
- **MCP Servers (`mcp_config.json`)** → [ch04](chapters/ch04-extensibility-architecture.md), [ch08](chapters/ch08-built-in-agent-tool-api.md)
- **Migration from Claude Code / Cursor** → [ch16](chapters/ch16-information-sourced-outside-official-docs.md), [ch17](chapters/ch17-undocumented-behavioral-contracts.md)
- **Path Inventory** → [ch15](chapters/ch15-complete-path-inventory.md)
- **Plugins (`plugin.json`)** → [ch04](chapters/ch04-extensibility-architecture.md), [ch20](chapters/ch20-schema-toolkit-and-native-schemas.md)
- **Rules (`GEMINI.md`, `AGENTS.md`, `.agents/rules/`)** → [ch04](chapters/ch04-extensibility-architecture.md), [ch05](chapters/ch05-configuration-system.md)
- **Schemas (20 Native JSON Schemas)** → [ch20](chapters/ch20-schema-toolkit-and-native-schemas.md)
- **Skills (`SKILL.md`)** → [ch04](chapters/ch04-extensibility-architecture.md)
- **Statusline Configuration** → [ch05](chapters/ch05-configuration-system.md), [ch07](chapters/ch07-cli-command-reference.md)
- **Workspace Governance** → [ch14](chapters/ch14-workspace-governance-recommendations.md)

---

## Supporting Reference Files

- [glossary.md](glossary.md) — Comprehensive alphabetical glossary of Antigravity domain terminology.
- [patterns.md](patterns.md) — Production design patterns, configuration recipes, and hook implementations.
- [cheatsheet.md](cheatsheet.md) — Quick reference tables, command flags, schema checklist, and decision matrices.

---

## Scope & Limits

This skill covers the complete technical architecture and schema reference for Google Antigravity. For specific workspace file edits, combine with project tools (`replace_file_content`, `run_command`, `view_file`).
