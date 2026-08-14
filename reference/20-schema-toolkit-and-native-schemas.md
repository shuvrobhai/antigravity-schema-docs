## 20. Automated Schema Toolkit & 20 Native Schemas Reference Architecture

### 20.1 Toolkit Architecture & Design Seams

The `antigravity-schemas` toolkit provides automated schema extraction, validation, and auditing for all 20 native configuration and runtime artifacts across the Google Antigravity Ecosystem.

#### Architecture Decision Records (ADRs)
The evolution of the schema engine and reference repository is governed by formal ADRs:
- [ADR-0001: Modular Reference with Composed Parent](../docs/adr/0001-modular-reference-with-composed-parent.md)
- [ADR-0002: Archive Cited Sources as Local Markdown Snapshots](../docs/adr/0002-archive-cited-sources.md)
- [ADR-0003: Standalone JSON Schema Catalog with Automated Drift Validation](../docs/adr/0003-standalone-json-schema-catalog.md)
- [ADR-0004: AST-Driven Table and Schema Linter for Automated Drift Prevention](../docs/adr/0004-ast-table-and-schema-linter.md)
- [ADR-0005: TypeScript Port of Build and Validation Toolchain](../docs/adr/0005-convert-scripts-to-typescript.md)
- [ADR-0006: OKF Indexed Citation Badges and Source Tag Deduplication](../docs/adr/0006-indexed-citation-badges-and-deduplication.md)
- [ADR-0007: Evidence Hierarchy and Reports Reorganization](../docs/adr/0007-evidence-hierarchy-and-reports-reorganization.md)

#### Core Architectural Patterns
1. **Unified Schema Registry Seam (`SchemaRegistry`)**: Single source of truth (`src/antigravity_schemas/registry.py`) encapsulating `SchemaDescriptor` metadata for all 20 models. Eliminates ad-hoc string replacement routines across exporters, auditors, and CLI handlers.
2. **Audit Domain Locality (`AuditReport`)**: `SystemAuditor` returns strongly-typed `AuditReport` objects and `CategoryAuditResult` items (`src/antigravity_schemas/auditor.py`). Presentation logic (Rich table formatting) lives inside domain models rather than CLI handlers.
3. **Contextual Spec Synchronization (`DocSyncInspector`)**: `DocSyncInspector` (`src/antigravity_schemas/doc_inspector.py`) parses Markdown files into section blocks, ensuring field documentation coverage is validated strictly within each schema's dedicated section rather than globally.

### 20.2 Complete 20 Native Schemas Inventory Matrix

| # | Key | Schema Name | Pydantic Model Class | Exported JSON Schema File | Category | Target File / Location |
|---|---|---|---|---|---|---|
| 1 | `settings` | **Settings** | `SettingsSchema` | `schemas/settings.schema.json` | Core Config | `~/.gemini/antigravity-cli/settings.json` |
| 2 | `plugin` | **Plugin Manifest** | `PluginManifestSchema` | `schemas/plugin.schema.json` | Plugin System | `plugins/<name>/plugin.json`, `.agents/plugins/<name>/plugin.json`, `~/.gemini/config/plugins/<name>/plugin.json` |
| 3 | `agent` | **Agent Frontmatter** | `AgentFrontmatterSchema` | `schemas/agent.schema.json` | Agent System | `.agents/agents/<name>.md`, `.agents/agents/<name>/agent.md`, `~/.gemini/config/agents/`, `plugins/<name>/agents/*.md` |
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
| 18 | `import_manifest` | **Import History Manifest** | `ImportManifestSchema` | `schemas/import_manifest.schema.json` | Ecosystem Migration | `~/.gemini/config/import_manifest.json` |
| 19 | `workflow` | **Workflow Frontmatter** | `WorkflowFrontmatterSchema` | `schemas/workflow.schema.json` | Agent System | `.agents/workflows/<name>.md`, `.agent/workflows/`, `~/.gemini/antigravity/global_workflows/` |
| 20 | `hook_payload` | **Hook Runtime Payload** | `HookPayloadSchema` | `schemas/hook_payload.schema.json` | Runtime State | Custom hook stdin/stdout IPC payload |

> [!NOTE]
> **Schema `$id` Namespace Identifiers:** The `$id` URLs declared across schemas (`https://antigravity.google/schemas/v1/*.schema.json`) represent canonical JSON Schema (Draft 2020-12) URI namespace identifiers rather than resolvable HTTP endpoints. They ensure unambiguous schema identification and cross-referencing across runtime validators and offline tooling.

### 20.3 Programmatic Toolkit Usage Examples

#### 1. TypeScript / Node.js Engine (`src/schema/validator.ts`)
```typescript
import { validateAntigravityPayload, schemaRegistry } from './schema/validator';

// Lookup schema metadata descriptor
const settingsDescriptor = schemaRegistry.get('settings');
console.log(settingsDescriptor?.filename); // "settings.schema.json"

// Validate live configuration payload using compiled Ajv validator
const result = validateAntigravityPayload('settings', {
  commandExecutionPolicy: 'ALWAYS_ALLOW',
  geminiModel: 'gemini-3.7-flash',
  theme: 'system'
});

if (!result.valid) {
  console.error(`Validation failed for ${result.schemaName}:`, result.errors);
} else {
  console.log(`✓ Configuration valid for ${result.schemaName}`);
}
```

#### 2. Python Architecture Specification & Exporter
```python
from antigravity_schemas import registry

# Lookup schema descriptor by CLI alias
settings_desc = registry.get("settings")
print(settings_desc.model_cls)  # <class 'antigravity_schemas.models.settings.SettingsSchema'>
print(settings_desc.filename)   # "settings.schema.json"

# Export all 20 JSON schemas to disk
exported_paths = registry.export_all(output_dir=Path("schemas"))
```

#### 3. Live System Audit Engine
```python
from pathlib import Path
from antigravity_schemas.auditor import SystemAuditor

auditor = SystemAuditor(gemini_root=Path.home() / ".gemini")
report = auditor.run_full_audit()

print(f"Audited {report.total_audited} targets: {report.total_valid} valid, {report.total_invalid} invalid")
for row in report.to_table_rows():
    print(row)
```

#### 4. Contextual Document Synchronization Check
```python
from pathlib import Path
from antigravity_schemas.doc_inspector import DocSyncInspector

inspector = DocSyncInspector(
    doc_path=Path("reference/05-configuration-system.md"),
    schemas_dir=Path("schemas")
)
results = inspector.inspect()

for r in results:
    print(f"{r.descriptor.key}: {r.coverage_pct:.0f}% fields documented in context (Synced: {r.is_synced})")
```

---

*End of Report — Version 8.10 (Empirical Grounding of Rules, Glob Syntax, and Workflow Files Edition)*

