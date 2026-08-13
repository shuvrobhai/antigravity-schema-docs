## 20. Automated Schema Toolkit & 17 Native Schemas Reference Architecture

### 20.1 Toolkit Architecture & Design Seams

The `antigravity-schemas` toolkit provides automated schema extraction, validation, and auditing for all 17 original native configuration and runtime artifacts across the Google Antigravity Ecosystem.

#### Core Architectural Patterns
1. **Unified Schema Registry Seam (`SchemaRegistry`)**: Single source of truth (`src/antigravity_schemas/registry.py`) encapsulating `SchemaDescriptor` metadata for all 17 models. Eliminates ad-hoc string replacement routines across exporters, auditors, and CLI handlers.
2. **Audit Domain Locality (`AuditReport`)**: `SystemAuditor` returns strongly-typed `AuditReport` objects and `CategoryAuditResult` items (`src/antigravity_schemas/auditor.py`). Presentation logic (Rich table formatting) lives inside domain models rather than CLI handlers.
3. **Contextual Spec Synchronization (`DocSyncInspector`)**: `DocSyncInspector` (`src/antigravity_schemas/doc_inspector.py`) parses Markdown files into section blocks, ensuring field documentation coverage is validated strictly within each schema's dedicated section rather than globally.

### 20.2 Complete 17 Native Schemas Inventory Matrix

| # | Key | Schema Name | Pydantic Model Class | Exported JSON Schema File | Category | Target File / Location |
|---|---|---|---|---|---|---|
| 1 | `settings` | **Settings** | `SettingsSchema` | `schemas/settings.schema.json` | Core Config | `~/.gemini/antigravity-cli/settings.json` |
| 2 | `plugin` | **Plugin Manifest** | `PluginManifestSchema` | `schemas/plugin.schema.json` | Plugin System | `plugins/<name>/plugin.json` |
| 3 | `agent` | **Agent Frontmatter** | `AgentFrontmatterSchema` | `schemas/agent.schema.json` | Agent System | `.agents/agents/<name>.md` |
| 4 | `skill` | **Skill Frontmatter** | `SkillFrontmatterSchema` | `schemas/skill.schema.json` | Agent System | `.agents/skills/<name>/SKILL.md` |
| 5 | `mcp` | **MCP Server Config** | `MCPConfigSchema` | `schemas/mcp_config.schema.json` | Integration | `~/.gemini/config/mcp_config.json` |
| 6 | `hooks` | **Lifecycle Hooks** | `HooksConfigSchema` | `schemas/hooks.schema.json` | Lifecycle | `~/.gemini/config/hooks.json` |
| 7 | `transcript` | **Transcript Step** | `TranscriptStepSchema` | `schemas/transcript_step.schema.json` | Runtime State | `brain/<id>/.system_generated/logs/transcript.jsonl` |
| 8 | `keybindings` | **Keybindings** | `KeybindingsSchema` | `schemas/keybindings.schema.json` | Core Config | `~/.gemini/antigravity-cli/keybindings.json` |
| 9 | `status_line` | **Status Line Payload** | `StatusLinePayloadSchema` | `schemas/status_line.schema.json` | Runtime State | Custom statusline stdin IPC payload |
| 10 | `master_config` | **Master Config** | `MasterConfigSchema` | `schemas/master_config.schema.json` | System Config | `~/.gemini/config/config.json` |
| 11 | `projects` | **Projects Index** | `ProjectsIndexSchema` | `schemas/projects.schema.json` | System Config | `~/.gemini/projects.json` |
| 12 | `desktop_state` | **Desktop App State** | `DesktopStateSchema` | `schemas/desktop_state.schema.json` | Ecosystem App | `~/.gemini/antigravity/antigravity_state.pbtxt` |
| 13 | `ide_state` | **IDE State** | `IDEStateSchema` | `schemas/ide_state.schema.json` | Ecosystem App | `~/.gemini/antigravity-ide/` |
| 14 | `rule` | **Rule File Manifest** | `RuleFileSchema` | `schemas/rule.schema.json` | Agent System | `AGENTS.md`, `GEMINI.md`, `.agents/rules/*.md` |
| 15 | `cli_state` | **CLI Installation State** | `CLIStateSchema` | `schemas/cli_state.schema.json` | Runtime State | `~/.gemini/antigravity-cli/state.json` |
| 16 | `history` | **CLI Prompt History Entry** | `CLIHistoryEntrySchema` | `schemas/history_entry.schema.json` | Runtime State | `~/.gemini/antigravity-cli/history.jsonl` |
| 17 | `trusted_hooks` | **Trusted Security Hooks** | `TrustedHooksSchema` | `schemas/trusted_hooks.schema.json` | Lifecycle | `~/.gemini/trusted_hooks.json` |

### 20.3 Programmatic Python Usage Examples

#### 1. Querying Schema Registry
```python
from antigravity_schemas import registry

# Lookup schema descriptor by CLI alias
settings_desc = registry.get("settings")
print(settings_desc.model_cls)  # <class 'antigravity_schemas.models.settings.SettingsSchema'>
print(settings_desc.filename)   # "settings.schema.json"

# Export all 17 JSON schemas to disk
exported_paths = registry.export_all(output_dir=Path("schemas"))
```

#### 2. Running Live System Audit
```python
from pathlib import Path
from antigravity_schemas.auditor import SystemAuditor

auditor = SystemAuditor(gemini_root=Path.home() / ".gemini")
report = auditor.run_full_audit()

print(f"Audited {report.total_audited} targets: {report.total_valid} valid, {report.total_invalid} invalid")
for row in report.to_table_rows():
    print(row)
```

#### 3. Contextual Document Synchronization Check
```python
from pathlib import Path
from antigravity_schemas.doc_inspector import DocSyncInspector

inspector = DocSyncInspector(
    doc_path=Path("SCHEMA_REFERENCE.md"),
    schemas_dir=Path("schemas")
)
results = inspector.inspect()

for r in results:
    print(f"{r.descriptor.key}: {r.coverage_pct:.0f}% fields documented in context (Synced: {r.is_synced})")
```

---

*End of Report — Version 8.1 (Live-Grounded Revision Edition)*
