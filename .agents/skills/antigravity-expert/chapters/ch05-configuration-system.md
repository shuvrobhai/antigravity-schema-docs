# Chapter 05: 05-configuration-system.md

## Core Idea
Comprehensive technical specification and architectural rules for 05-configuration-system.md within Google Antigravity v8.10.

## Key Sections & Topics
- **5. Configuration System**

## Code & Specification Artifacts
```text
<HOME>/.gemini/antigravity-cli/settings.json
```

```json
{
  "allowNonWorkspaceAccess": true,
  "altScreenMode": "always",
  "editor": "code",
  "model": "Gemini 3.6 Flash (Medium)",
  "notifications": true,
  "permissions": {
    "allow": [],
    "deny": []
  },
  "statusLine": {
    "type": "command",
    "command": "node <HOME>/.gemini/antigravity-cli/hooks/statusline-quota.mjs",
    "enabled": true
  },
  "title": {
    "type": "command",
    "command": "<HOME>/.gemini/antigravity-cli/scratch/title.sh"
  },
  "toolPermission": "always-proceed",
  "trustedWorkspaces": []
}
```

## Key Takeaways
1. Strictly adheres to Antigravity v8.10 Draft 2020-12 native schema definitions.
2. Grounded against empirical live evidence probes EV-001 through EV-020 and official technical documentation.
3. Enforces hierarchical configuration resolution across workspace and user boundaries.

## Connects To
- **Module Source**: `reference/05-configuration-system.md`
- **Schemas**: Documented in §20 and `schemas/`
