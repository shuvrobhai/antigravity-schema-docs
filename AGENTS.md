# AGENTS.md — antigtavity-schema

Repository for the Google Antigravity (`agy`) technical reference: modular Markdown docs, 18 JSON schemas, and an evidence-grounded validation suite.

## Commands

All automation goes through `make` targets. Direct script invocation works too.

| Target | What it does |
|---|---|
| `make build` | Compose `reference/*.md` → `antigravity-reference.md` |
| `make build-check` | Verify parent doc is in sync (CI mode, no write) |
| `make watch` | Live-rebuild on module changes |
| `make validate` | Run all 11 repository integrity checks |
| `make validate-verbose` | Same, with per-check detail |
| `make validate-fix` | Auto-repair drift (rebuild parent, prune orphan snapshots) |
| `make test` | Run library self-tests (`doc_inspector.py`, `evidence_registry.py`) |
| `make fetch-sources` | Snapshot missing §19 citations into `evidence/sources/` |
| `make check-sources` | Verify archive is in sync with §19 |
| `make force-fetch-sources` | Re-fetch all §19 citations |
| `make all` | `test` + `validate` + `build-check` (full verification gate) |

## Critical Conventions

- **`antigravity-reference.md` is a build artifact.** Never edit it. Edit `reference/NN-slug.md` and run `make build`.
- **`evidence/sources/index.md` is generated.** Never hand-edit. Run `make fetch-sources` or `make check-sources`.
- **Module numbering in `reference/` must be contiguous `00..NN`.** Gaps cause `build.py` and `validate.py` to fail.
- **`[LIVE-1.1.12 · 2026-08-13]` claims must map to an `EV-###` entry** in `evidence/agy-1.1.12/evidence.md`. See `scripts/lib/evidence_registry.py` for the probe catalog.
- **Source precedence (highest → lowest):** `[DOCS]` > `[LIVE]` > `[GOOGLE]` > `[PROTOCOL]` > `[COMMUNITY]` > `[INFERRED]`. Do not downgrade a claim's tag without reason.
- **`[RESOLVED]` evidence probes must not retain stale "confound unresolved" phrasing** anywhere in `reference/`. `validate.py --only consistency` checks this.

## Dependencies

```bash
make install   # installs Python deps (beautifulsoup4, certifi)
```

`pandoc` is a **system-level dependency** (not in `requirements.txt`). Required for HTML→Markdown conversion in `scripts/fetch_sources.py`. Install via `brew install pandoc`.

## Validation Details

`make validate` runs 11 checks (see `scripts/validate.py`):

1. Module Contiguity
2. Composition Build Sync
3. Table of Contents Sync (matches `00-preamble.md` TOC to module H2 headings)
4. Heading Hierarchy (subsection numbers like `18.1` must use H3+, not H2)
5. Source Archive Sync
6. Orphan Snapshots
7. Relative Markdown Links (scans parent doc, README, all modules)
8. Live Evidence Grounding (EV IDs cited in modules exist in `evidence.md`)
9. Native Schema Integrity (18 schemas in `schemas/` match §20 catalog)
10. Schema-to-Doc Property Parity (`settings.schema.json` vs §5.5, `status_line.schema.json` vs §5.6, `transcript_step.schema.json` vs §18.1)
11. Cross-Module Evidence Consistency

Run a single check: `python3 scripts/validate.py --only <modules|build|toc|headings|sources|orphans|links|evidence|schemas|parity|consistency>`

## Repo Structure

```
reference/            # Source modules (00..20 contiguous, source of truth)
schemas/              # 18 standalone JSON Schema files
evidence/
  agy-1.1.12/         # Live observation logs (EV-001..EV-020)
  sources/            # Archived citation snapshots (generated index.md)
docs/adr/             # Architecture Decision Records
scripts/
  build.py            # Compose modules → parent
  fetch_sources.py    # Archive web citations
  validate.py         # 11-check integrity suite
  lib/
    doc_inspector.py  # Markdown AST/table parser (stdlib-only)
    evidence_registry.py  # Evidence/citation query interface
```

## What NOT to do

- Do not edit `antigravity-reference.md` or `evidence/sources/index.md` by hand.
- Do not add non-contiguous module numbers in `reference/`.
- Do not tag a claim `[LIVE]` without a corresponding `EV-###` in `evidence.md`.
- Do not add a new schema file without adding it to the §20.2 matrix table first.
