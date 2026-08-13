# 🚀 User Guide: Google Antigravity Schema & Workspace Diagnostic Toolkit

Welcome to the **Google Antigravity (`agy`) Schema & Technical Reference Toolkit**. This project provides a complete suite of developer tools, 18 native JSON schemas, an empirical evidence registry, and a dual-engine (UI & CLI) Workspace Auditor to design, validate, and self-heal AI agent workspaces.

---

## 🎯 What You Can Do With This Project

1. **Audit & Self-Heal Workspaces**: Detect configuration errors, deprecated legacy keys, and broken links across agents, skills, hooks, and MCP servers with instant one-click auto-repair.
2. **Explore 18 Native JSON Schemas**: Test payloads in real-time against Draft 2020-12 schemas for `settings.json`, `mcp_config.json`, `hooks.json`, `skill.schema.json`, and more.
3. **Extensibility Studio**: Generate and scaffold production-ready Agent Skills, MCP server configurations, lifecycle hooks, and `.agents/agents/*.md` definitions.
4. **Interactive Technical Reference**: Read the 21-module authoritative specification with source authority badges (`[DOCS]`, `[LIVE]`, `[GOOGLE]`, `[PROTOCOL]`).
5. **Inspect Live Evidence & Audit Logs**: Review empirical probes (`EV-001` to `EV-020`) and system verification logs.

---

## 💻 1. Using the Web Application

Open the live web preview to access all interactive tabs:

### 🛡️ Workspace Auditor Tab
- **Preset Selector**: Click **"Production-Ready Agent"** (to see a 100% compliant workspace) or **"Drifted / Legacy Workspace"** (to inspect common errors like deprecated `geminiModel` keys or uppercase skill names).
- **Workspace File Tree & Editor**: Add, edit, or delete files (e.g. `settings.json`, `.agents/skills/security-audit/SKILL.md`). The editor validates JSON syntax and YAML frontmatter as you type.
- **Health Score & Diagnoses**: Review the 0–100% health score, broken cross-artifact links, and warnings.
- **One-Click Auto-Fix**: Click **"Apply Fix"** next to any fixable issue or **"Fix All"** to automatically repair the workspace.
- **Copy AI Remediation Prompt**: Copy a structured markdown prompt containing all diagnoses, ready to paste into Gemini or Antigravity to let an AI agent fix the files for you.

### 🛠️ Extensibility Studio Tab
- Interactive visual visualizers for Agent Skills, MCP configuration, and lifecycle hooks with copyable YAML/JSON snippets.

### 📦 JSON Schemas Tab
- Live schema explorer and JSON validator with pre-loaded valid and invalid test fixtures.

### 📖 Reference & CLI Cheat Sheet Tabs
- Modular chapter navigation and terminal command reference.

---

## 🖥️ 2. Using the Command-Line Interface (CLI)

Run audit checks and repository verification directly from your terminal.

### 🔍 Running Workspace Audits

```bash
# Audit a specific directory or workspace
npm run audit -- --dir ./my-agent-workspace
# or
npx tsx scripts/audit_workspace.ts --dir ./test/fixtures/workspaces/valid-agent-workspace

# Automatically repair fixable errors on disk
npm run audit -- --dir ./my-agent-workspace --fix

# Output machine-readable JSON (ideal for AI Agent self-healing or CI pipelines)
npm run audit -- --dir ./my-agent-workspace --json
```

### 🧪 Running Schema Tests & Repository Checks

```bash
# Run schema test fixtures (19 valid/invalid tests)
npm run test:schemas

# Run the full 12-point repository integrity suite
npm run validate

# Verbose verification output
npm run validate -- --verbose

# Auto-repair documentation drift or orphan snapshots
npm run validate -- --fix
```

### 🏗️ Building Documentation & Monolithic Parent

```bash
# Compile modular reference/ -> antigravity-reference.md
npm run build:doc

# Check build synchronization in CI mode without modifying files
npm run build:check

# Watch mode for live rebuilds on module edits
npm run watch:doc
```

---

## 📁 3. Antigravity Workspace File Conventions

When configuring your own workspace for Google Antigravity, use the following structure:

```
my-workspace/
├── AGENTS.md                              # Persistent agent instructions and rules
├── settings.json                          # Tool permissions & sandbox execution policies
├── mcp_config.json                        # Model Context Protocol servers
├── hooks.json                             # Lifecycle safety and pre/post-tool hooks
└── .agents/
    ├── agents/
    │   └── code-reviewer.md               # Agent definition with YAML frontmatter
    └── skills/
        └── security-audit/
            └── SKILL.md                   # Skill instructions with kebab-case YAML frontmatter
```

---

## ❓ Frequently Asked Questions (FAQ)

- **Q: Why does my skill show an error about its name?**  
  *A:* Skill names must be in lowercase kebab-case (e.g. `security-audit`, not `Security Audit` or `Security_Audit`). The auditor's **Auto-Fix** button can automatically rename this for you.

- **Q: What are cross-artifact findings?**  
  *A:* These occur when one file refers to another that doesn't exist (e.g., an agent lists a skill in `skills: ["deploy-skill"]`, but `.agents/skills/deploy-skill/SKILL.md` is missing).

- **Q: How do I run everything in one go?**  
  *A:* Run `make all` or `npm run lint && npm run test:schemas && npm run audit && npm run validate`.
