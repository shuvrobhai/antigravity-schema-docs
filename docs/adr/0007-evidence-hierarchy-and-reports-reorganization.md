# ADR 0007: Structured Evidence Hierarchy and Research Reports Reorganization

**Status:** Accepted  
**Date:** 2026-08-14  

---

## Context

As the Google Antigravity Technical Reference expanded with empirical validation logs, web snapshots, and analytical research reports, the `evidence/` directory accumulated multiple disparate artifact types at its top level (`agy-1.1.12/`, `sources/`, `research-report.md`).

To improve clarity, maintainability, and auditability across validation pipelines and user-facing explorer interfaces, we required a structured hierarchical organization that separates:
1. Version-pinned empirical runtime execution logs (`evidence/agy-1.1.12/`).
2. Archived web citation snapshots (`evidence/sources/`).
3. Synthesized technical research whitepapers (`evidence/reports/`).
4. High-level evidence registry and grounding hubs (`evidence/index.md`).

---

## Decision

1. **Establish `evidence/reports/` Subdirectory**:
   - Transferred thematic research whitepapers into `evidence/reports/` (e.g. `01-behavioral-contracts-research-report.md`).
   - Created `evidence/reports/index.md` listing research papers and numbering conventions.

2. **Establish `evidence/index.md` as Master Grounding Catalog**:
   - Created `evidence/index.md` summarizing the evidence architecture, the 6-tier authority precedence model (`[DOCS]` > `[LIVE]` > `[GOOGLE]` > `[PROTOCOL]` > `[COMMUNITY]` > `[INFERRED]`), and the full catalog of 20 live observation probes (`EV-001` .. `EV-020`).

3. **Retain Backward Compatibility in CI / Validation Suite**:
   - Pinned snapshot archives under `evidence/sources/` and empirical logs under `evidence/agy-1.1.12/evidence.md` so that existing Make targets (`make validate`, `make test`, `make check-sources`) and TypeScript validation scripts run with zero regressions.

---

## Consequences

- **Cleaner Root Structure**: The `evidence/` directory now clearly isolates raw empirical test logs, immutable web snapshots, and synthesis whitepapers into dedicated folders.
- **Improved Discoverability**: Developers and researchers can navigate to `evidence/index.md` or `evidence/reports/index.md` to quickly locate probes and research whitepapers.
- **Deterministic Validation**: Automated integrity checks maintain 100% pass rates across all 11 integrity tests.
