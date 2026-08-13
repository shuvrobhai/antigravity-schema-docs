# 0004 — AST-driven table and schema linter for automated drift prevention

Status: accepted

Manual QA inspection revealed subtle drift: schema properties documented in Markdown tables (e.g. `commandExecutionPolicy` in §5.5, transcript enums and `created_at` in §18.1) were missing from standalone JSON schemas in `schemas/`, while resolved evidence confounds (EV-020) left stale wording in older reference modules. We decided to extend `scripts/validate.py` with AST-driven Markdown table parsing and cross-module evidence consistency checks to automatically prevent and detect these gaps in CI.

**Considered options:**
- *Full Pydantic code generation* — Treating Python classes in a new `src/` package as the sole source of truth and generating both JSON schemas and Markdown tables from code. Rejected for now because it introduces heavy external dependencies and reverses the project workflow from editing human-readable modular Markdown to writing Python model code.
- *Strict manual checklist review* — Relying on human QA passes. Rejected because manual checking does not scale across 21 reference modules and 17 schemas, allowing schema drift to go unnoticed.
- *AST-Driven Table & Schema Linter in `scripts/validate.py` (Chosen)* — Enhancing the stdlib-only validation suite with deep table property extractors, evidence range checkers, and backticked repo path verifiers.

**Consequences:**
- `scripts/validate.py` validates that 100% of documented properties and enums in reference configuration tables exist in their corresponding `schemas/*.schema.json` files.
- `scripts/validate.py` verifies evidence summary tables match the highest defined EV ID in `evidence/agy-1.1.12/evidence.md` and flags stale "unresolved confound" claims when an EV is resolved.
- Developers receive immediate, actionable CI error diagnostics whenever documentation tables and JSON schemas diverge.
