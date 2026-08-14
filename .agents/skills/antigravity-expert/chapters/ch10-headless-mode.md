# Chapter 10: 10-headless-mode.md

## Core Idea
Comprehensive technical specification and architectural rules for 10-headless-mode.md within Google Antigravity v8.10.

## Key Sections & Topics
- **10. Headless Mode**

## Code & Specification Artifacts
```text
/skills
/permissions
/hooks
```

```json
{
  "conversation_id": "",
  "status": "SUCCESS",
  "response": "...",
  "duration_seconds": 0,
  "num_turns": 0,
  "usage": {
    "input_tokens": 0,
    "output_tokens": 0,
    "thinking_tokens": 0,
    "cache_read_tokens": 0,
    "total_tokens": 0
  },
  "command": {
    "name": "skills",
    "data": {}
  }
}
```

## Key Takeaways
1. Strictly adheres to Antigravity v8.10 Draft 2020-12 native schema definitions.
2. Grounded against empirical live evidence probes EV-001 through EV-020 and official technical documentation.
3. Enforces hierarchical configuration resolution across workspace and user boundaries.

## Connects To
- **Module Source**: `reference/10-headless-mode.md`
- **Schemas**: Documented in §20 and `schemas/`
