# 0003 — Standalone JSON Schema catalog with automated drift validation

Status: accepted

The technical reference defines 17 core native configuration, extensibility, and runtime state manifests across the Google Antigravity ecosystem (§20). We decided to extract and maintain all 17 models as first-class, standalone standard JSON Schema files under `schemas/*.schema.json` (adhering to JSON Schema Draft 2020-12 / Draft-07), backed by an automated catalog synchronization check in `scripts/validate.py`.

**Considered options:**
- *Embedded Markdown only* — Keeping schemas solely as markdown tables and text blocks inside `reference/20-schema-toolkit-and-native-schemas.md`. Rejected because external tools, IDEs (VS Code/Cursor/Antigravity), and automated linters cannot consume embedded markdown without custom extractors.
- *Single monolithic schema.json* — Bundling all definitions into a single JSON schema. Rejected because the 17 manifests belong to distinct operational domains (Core Config, Plugin System, Agent System, Integration, Lifecycle, Runtime State, System Config, Ecosystem App) and must be independently referenced by `$schema` URLs.
- *Standalone modular JSON schemas with catalog validation (Chosen)* — Each manifest has an independent `.schema.json` in `schemas/`, paired with automated catalog synchronization in `scripts/validate.py` (Check 9).

**Consequences:**
- Standalone schema files in `schemas/` can be referenced directly by configuration files and tools via `$schema: "https://antigravity.google/schemas/v1/<name>.schema.json"`.
- Modifying a schema requires updating both its documentation in `reference/` (especially §20) and the corresponding file in `schemas/`.
- `scripts/validate.py` (and `make validate`) automatically validates all 17 schema files for valid JSON syntax, required schema descriptors, catalog alignment, and absence of orphaned schema files.
