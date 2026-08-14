# Chapter 04: My Skill

## Core Idea
Comprehensive technical specification and architectural rules for My Skill within Google Antigravity v8.10.

## Key Sections & Topics
- **4. Extensibility Architecture**
- **When to use this skill**
- **How to use it**

## Code & Specification Artifacts
```text
                ┌──────────────────────────────────┐
                │      Shared Ecosystem Core       │
                └────────────────/─────────────────┘
                                /
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  Custom Skills          Custom Agents          Native Plugins
 (SKILL.md + YAML)       (.md + Frontmatter)    (plugin.json manifest)
        │                      │                      │
        ▼                      ▼                      ▼
 ~/.gemini/.../skills/  .agents/agents/        ~/.gemini/config/plugins/
```

```text
<HOME>/.gemini/config/skills/
<HOME>/.gemini/antigravity-cli/skills/
<HOME>/.gemini/config/plugins/<plugin>/skills/
<HOME>/.gemini/antigravity-cli/plugins/<plugin>/skills/
```

## Key Takeaways
1. Strictly adheres to Antigravity v8.10 Draft 2020-12 native schema definitions.
2. Grounded against empirical live evidence probes EV-001 through EV-020 and official technical documentation.
3. Enforces hierarchical configuration resolution across workspace and user boundaries.

## Connects To
- **Module Source**: `reference/04-extensibility-architecture.md`
- **Schemas**: Documented in §20 and `schemas/`
