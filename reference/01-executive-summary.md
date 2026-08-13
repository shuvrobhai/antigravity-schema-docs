## 1. Executive Summary

Google Antigravity CLI (`agy`) is a lightweight, terminal-first interface for directing autonomous coding agents, executing shell commands, and managing background subagents entirely from the keyboard. It is the terminal component of the broader Google Antigravity ecosystem, which also includes Antigravity 2.0 (standalone desktop application), Antigravity IDE, and the Antigravity SDK.

The platform's extensibility architecture is built on open, portable standards: Markdown files with YAML frontmatter for Skills, Agents, Rules, and Workflows; the Model Context Protocol (MCP) for tool integrations; and JSON configuration files for hooks and settings. This design ensures customizations are portable across Claude Code, Cursor, Codex CLI, and any other tool adopting the same standards.

This report documents every confirmed configuration key, path, schema, command, and behavioral specification available from official documentation (`antigravity.google/docs/*`), while clearly identifying information sourced from other channels and cataloging behavioral questions the official docs leave unanswered.

As of live `agy 1.1.12` grounding, the report also distinguishes between what the changelog/official docs claim and what the CLI actually does in a user-configured macOS environment.
