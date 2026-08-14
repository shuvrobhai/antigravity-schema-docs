# Chapter 06: 06-permissions-engine.md

## Core Idea
Comprehensive technical specification and architectural rules for 06-permissions-engine.md within Google Antigravity v8.10.

## Key Sections & Topics
- **6. Permissions Engine**

## Code & Specification Artifacts
```json
{
  "permissions": {
    "allow": ["command(git)", "read_file(/var/log/app)"],
    "deny": ["command(rm -rf)", "command(sudo)"],
    "ask": ["command(*)", "execute_url(aws.amazon.com)"]
  }
}
```

```text
Permissions — Global
Permissions — Shared with Antigravity
Permissions — Project
```

## Key Takeaways
1. Strictly adheres to Antigravity v8.10 Draft 2020-12 native schema definitions.
2. Grounded against empirical live evidence probes EV-001 through EV-020 and official technical documentation.
3. Enforces hierarchical configuration resolution across workspace and user boundaries.

## Connects To
- **Module Source**: `reference/06-permissions-engine.md`
- **Schemas**: Documented in §20 and `schemas/`
