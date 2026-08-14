## 1. Executive Summary

The **Google Antigravity Ecosystem** is an advanced, agent-first development platform designed to orchestrate autonomous subagents, schedule background tasks, manage workspace permissions, and execute interactive local code verification. By bringing foundation-model intelligence directly into the local development environment, the platform moves beyond simple code completion into autonomous codebase refactoring and browser-in-the-loop verification.

### 1.1 Core Subsystems
The ecosystem consists of four major user-facing product surfaces:
1. **Antigravity 2.0 (Desktop):** A standalone desktop command center for orchestrating multiple parallel agents, organizing folders into structured Projects, and managing scheduled background tasks.
2. **Antigravity IDE:** A VS Code-forked development environment with tightly integrated agent side panels, tab autocomplete, and visual artifact review. (Note: Enterprise licenses are excluded from the IDE).
3. **Antigravity CLI (`agy`):** A fast, lightweight terminal surface supporting natural-language prompts, interactive slash commands, multi-threaded subagent monitoring, and headless pipeline automation.
4. **Antigravity SDK:** A programmatic Python framework (`google-antigravity`) for building custom agents, registering custom functions as tools, and defining declarative security policies.

### 1.2 Open Extensibility Principles
To prevent vendor lock-in and minimize token overhead, the extensibility layers are built entirely on open, portable standards:
* **Markdown Frontmatter:** Custom skills, persona definitions (Agents), modular Rules, and step playbooks (Workflows) are declared as Markdown files with YAML frontmatter. This format is fully portable to alternative agent tools such as Claude Code, Cursor, and Codex CLI.
* **Model Context Protocol (MCP):** Connects AI agents securely to local files, databases, search APIs, and external remote tools via SSE or Stdio.
* **JSON Schemas:** Runtime state, hooks, preferences, and prompt histories are mapped to structured, machine-readable JSON schemas supporting offline auditing and validation.

This report documents every confirmed configuration key, path, schema, command, and behavioral specification available from official documentation (`antigravity.google/docs/*`), while clearly identifying information sourced from other channels and cataloging behavioral questions the official docs leave unanswered.

As of live `agy 1.1.12` grounding, the report also distinguishes between what the changelog/official docs claim and what the CLI actually does in a user-configured macOS environment.
