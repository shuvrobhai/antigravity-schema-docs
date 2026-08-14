# Chapter 20: Lookup schema descriptor by CLI alias

## Core Idea
Comprehensive technical specification and architectural rules for Lookup schema descriptor by CLI alias within Google Antigravity v8.10.

## Key Sections & Topics
- **20. Automated Schema Toolkit & 20 Native Schemas Reference Architecture**

## Code & Specification Artifacts
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

```python
from antigravity_schemas import registry

# Lookup schema descriptor by CLI alias
settings_desc = registry.get("settings")
print(settings_desc.model_cls)  # <class 'antigravity_schemas.models.settings.SettingsSchema'>
print(settings_desc.filename)   # "settings.schema.json"

# Export all 20 JSON schemas to disk
exported_paths = registry.export_all(output_dir=Path("schemas"))
```

## Key Takeaways
1. Strictly adheres to Antigravity v8.10 Draft 2020-12 native schema definitions.
2. Grounded against empirical live evidence probes EV-001 through EV-020 and official technical documentation.
3. Enforces hierarchical configuration resolution across workspace and user boundaries.

## Connects To
- **Module Source**: `reference/20-schema-toolkit-and-native-schemas.md`
- **Schemas**: Documented in §20 and `schemas/`
