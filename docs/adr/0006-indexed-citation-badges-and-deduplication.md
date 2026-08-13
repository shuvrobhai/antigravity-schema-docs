# 0006 — OKF Indexed Citation Badges and Source Tag Deduplication

Status: accepted

## Context and Problem Statement

The `reference/` modules contained over 300 generic source tags (`[DOCS]`, `[GOOGLE]`, `[COMMUNITY]`, `[PROTOCOL]`, `[INFERRED]`). While these indicated source tiers, they suffered from two primary defects:
1. **Tag Bloat & Repetition**: In several modules (e.g. §11 Browser Integration, §12 Artifacts, §14 Governance), `[DOCS]` was repeated on virtually every bullet point and table row, producing visual stutter.
2. **Missing Granular Provenance**: Generic tags like `[DOCS]` did not reference *which* specific document or snapshot in `evidence/sources/` (numbered 1..46) provided the claim.

## Decision

We adopt **Option B: OKF Indexed Citation Badges (`[CATEGORY:NN]`) with Structural Deduplication**:

1. **Indexed Badges**:
   - Generic category tags are refined into indexed resource references matching the citation numbers in `reference/19-works-cited.md`:
     - `[DOCS:NN]` (e.g. `[DOCS:01]`, `[DOCS:08]`)
     - `[GOOGLE:NN]` (e.g. `[GOOGLE:24]`)
     - `[PROTOCOL:NN]` (e.g. `[PROTOCOL:15]`)
     - `[COMMUNITY:NN]` (e.g. `[COMMUNITY:32]`)
   - Category-wide claims or general tier labels retain `[DOCS]` / `[GOOGLE]` when referencing the taxonomy itself.

2. **Structural Deduplication**:
   - In uniform markdown tables where an entire column or table originates from the same source, the citation badge is declared once in the table header or introductory lead paragraph rather than repeated in every cell/row.
   - Paragraph-level deduplication: multiple sequential sentences within a single paragraph inherit the terminal citation badge of that paragraph.

3. **Validation & Tooling**:
   - The validation engine (`scripts/validate.ts` / `scripts/validate.py`) will recognize indexed tags and ensure cited numbers match valid entries in `reference/19-works-cited.md`.

## Consequences

- **Positive**: Eliminates visual clutter across tables and list items.
- **Positive**: Directly links technical specifications to archived, local markdown snapshots in `evidence/sources/`.
- **Positive**: Conforms with Open Knowledge Foundation (OKF) Data Resource provenance standards.
- **Migration**: Update `reference/` modules incrementally, rebuild `antigravity-reference.md`, and verify via the 11-point validation suite.
