# Google Antigravity Patterns & Production Recipes

Concrete design patterns, extensibility recipes, security guards, and configuration implementations.

---

## 1. Skill Progressive Disclosure Pattern

### Goal
Prevent token exhaustion while providing comprehensive multi-chapter domain guidance.

### Implementation Structure
```
.agents/skills/my-domain-skill/
├── SKILL.md                 # Core instructions (< 4,000 tokens)
├── glossary.md              # Alphabetical domain terminology
├── patterns.md              # Concrete code recipes & anti-patterns
├── cheatsheet.md            # Quick reference tables & decision trees
└── chapters/                # On-demand deep study chapters (loaded only when referenced)
    ├── ch01-foundations.md
    └── ch02-advanced.md
```

### Frontmatter Example
```yaml
---
name: code-security-reviewer
description: "Audits codebase for OWASP Top 10 vulnerabilities, unescaped inputs, and secret leaks. Use when reviewing PRs or running security scans."
metadata:
  version: 1.0.0
  category: Security
---
```

---

## 2. Deterministic Pre-Execution Command Guard Hook

### Goal
Prevent dangerous shell commands (`git push --force`, `rm -rf /`, dropping production DBs) from executing during automated agent loops.

### Configuration (`.agents/hooks.json`)
```json
{
  "security-command-guard": {
    "enabled": true,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/guard-command.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Guard Script (`scripts/guard-command.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"CommandLine": *"[^"]*"' | cut -d'"' -f4 || true)

if [[ "$COMMAND" =~ (push.*--force|reset.*--hard|drop\ database|rm\ -rf\ /) ]]; then
  echo "Blocked dangerous command: $COMMAND" >&2
  exit 1
fi

exit 0
```

---

## 3. Delegated Subagent Persona Pattern

### Goal
Scope tool access and execution context for a focused child agent persona (e.g. Test Runner, Code Reviewer).

### Subagent Definition (`.agents/agents/unit-tester.md`)
```markdown
---
name: unit-tester
description: "Specialized subagent that executes test suites, analyzes stack traces, and iterates on unit test failures."
model: inherit
commandExecutionPolicy: sandbox
skills:
  - tdd
tools:
  - run_command
  - view_file
  - replace_file_content
---

# Unit Tester Persona

You are a dedicated TDD subagent. Your mandate:
1. Run the local test runner (`npm test` / `make test`).
2. If tests fail, view the failing assertions and diagnose the minimal code fix.
3. Apply the fix and verify that all test suites pass before completing the turn.
```

---

## 4. MCP Stdio & Remote Server Pattern

### Goal
Expose external tools, database inspectors, or remote APIs to the agent workspace.

### Configuration (`.agents/mcp_config.json`)
```json
{
  "$schema": "https://antigravity.google/schemas/v1/mcp_config.schema.json",
  "mcpServers": {
    "filesystem-provider": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "disabled": false
    },
    "internal-api-gateway": {
      "serverUrl": "https://mcp.internal.company.com/v1",
      "headers": {
        "Authorization": "Bearer ${INTERNAL_MCP_TOKEN}"
      },
      "timeout": 45
    }
  }
}
```

---

## 5. Directory Walk-Up Rule Precedence Pattern

### Goal
Enforce coding standards and behavioral boundaries specific to nested subdirectories.

### Hierarchy
```
/workspace/
├── GEMINI.md                        # Global project rules
├── backend/
│   ├── .agents/rules/db.md          # Active only when cursor/file is in /backend
│   └── src/
└── frontend/
    ├── .agents/rules/ui.md          # Active only when cursor/file is in /frontend
    └── src/
```

### Rule Definition with Glob Trigger (`.agents/rules/ui.md`)
```markdown
---
name: frontend-ui-standards
description: Enforces Tailwind v4 and React 18 component conventions
trigger:
  glob: "frontend/**/*.{ts,tsx}"
activation: always
---

# Frontend UI Standards
- Use Tailwind CSS utility classes; avoid inline style objects.
- Ensure all interactive buttons have descriptive `aria-label` tags.
```
