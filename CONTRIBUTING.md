# Contributing to Google Antigravity Schema & Reference

This repository maintains the technical specification, JSON schemas, live observation catalog, and web citation archive for the Google Antigravity (`agy`) runtime.

All contributions must pass the **12-point integrity suite** via `npm run validate`.

---

## Quick Verification Workflow

```bash
# Install dependencies
npm install

# Rebuild composed parent document (antigravity-reference.md)
npm run build:doc

# Run the 12-point validation suite
npm run validate

# Auto-repair drift (regenerate parent doc & archive manifest)
npm run validate:fix
```

---

## Ingestion Templates

### 1. Adding a Live Evidence Probe (`EV-###`)

Document runtime experiments or CLI findings in `evidence/agy-1.1.12/evidence.md`:

```markdown
### EV-021: Probe Title

- **Target Binary / Tool**: `agy` v1.1.12 (e.g. CLI, IPC bus, settings)
- **Status**: `CONFIRMED` | `RECORDED` | `INFERRED`
- **Methodology**: Command execution, trace capture, or memory inspection
- **Observation**:
  Specific output, exit codes, or behavior observed.
- **Transcript Reference**: `transcripts/session-2026-08-13-probe21.log`
- **Impacted Sections**: §5.5, §18.2

\`\`\`bash
# Reproduction command
agy command --example-flag
\`\`\`
```

**Required Checklist:**
1. Cite in modules using `[LIVE-1.1.12 · 2026-08-13]` and reference `(EV-021)`.
2. Update the range in `reference/19-works-cited.md`: `Evidence probes range from EV-001 through EV-021.`
3. Run `npm run build:doc && npm run validate`.

---

### 2. Adding a Web Source / Citation (OKF Format)

All external citations follow the [Open Knowledge Foundation (OKF) Data Resource specification](docs/OKF-CITATION-GUIDELINES.md) with self-contained POSIX-safe relative file references.

1. Add the entry to `reference/19-works-cited.md` under the appropriate category (`[DOCS]`, `[GOOGLE]`, `[PROTOCOL]`, `[COMMUNITY]`):
   ```markdown
   47. Antigravity Agent Runtime Specifications — https://ai.google.dev/docs/antigravity/runtime
   ```

2. Create the snapshot markdown file in `evidence/sources/<category>/<NN>-<slug>.md`:
   ```markdown
   ---
   source: 47
   category: docs
   title: "Antigravity Agent Runtime Specifications"
   url: "https://ai.google.dev/docs/antigravity/runtime"
   final_url: "https://ai.google.dev/docs/antigravity/runtime"
   fetched: "2026-08-13"
   status: 200
   license: "CC-BY-4.0"
   ---

   # Antigravity Agent Runtime Specifications

   Document body content...
   ```

3. Run `npm run validate:fix` to auto-regenerate `evidence/sources/index.md`.

---

### 3. Adding a JSON Schema

1. Add schema file to `schemas/<schema_name>.schema.json`.
2. Register in the Section 20 matrix table (`reference/20-schema-toolkit-and-native-schemas.md` §20.2):
   ```markdown
   | 19 | `subagent_profile` | Subagent Profile Config | `SubagentProfileConfig` | runtime | `schemas/subagent_profile.schema.json` | `~/.config/agy/subagents/*.json` |
   ```
3. Run `npm run build:doc && npm run validate`.

---

### 4. Adding an Architecture Decision Record (ADR)

Create `docs/adr/000N-<kebab-case-title>.md`:

```markdown
# 0006 — Short Imperative Decision Title

Status: proposed | accepted | rejected | superseded

Context and problem statement.

**Considered options:**
- *Option A* — Description and trade-offs.
- *Option B (Chosen)* — Proposed solution.

**Consequences:**
- Positive outcome 1
- Positive outcome 2
- Trade-off / migration impact
```
