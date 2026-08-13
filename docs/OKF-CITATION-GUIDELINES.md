# Open Knowledge Foundation (OKF) Research & Citation Guidelines

This document specifies the standard metadata schema and directory referencing convention for adding new research references, academic citations, web sources, and evidence probes into the **Google Antigravity (`agy`)** specification repository.

These patterns conform to the [Open Knowledge Foundation (OKF) Frictionless Data & Resource Specifications](https://frictionlessdata.io/specs/data-resource/), ensuring uniform provenance, POSIX-safe relative file addressing, deterministic schema validations, and reproducible research archives.

---

## 1. OKF Core Referencing Principles

1. **POSIX-Safe Relative Referencing (`path`)**:
   - All referenced files use `/` separators and are scoped strictly relative to the repository root or parent resource directory.
   - **Parent traversal (`../`) and absolute paths (`/var/...`, `C:\...`) are strictly prohibited.**
2. **Provenance & Source Metadata (`sources`)**:
   - Every reference artifact must record its authoritative upstream URL, retrieval timestamp (`fetched`), HTTP response state (`status`), content license, and organizational/community affiliation (`category`).
3. **Immutable Snapshots**:
   - External web sources are archived into Markdown snapshot files under `evidence/sources/<category>/` to prevent bit rot or dead-link drift.
4. **Deterministic Catalog Sync**:
   - Every citation in `reference/19-works-cited.md` maps 1:1 to a localized resource snapshot and is verified by `npm run validate`.

---

## 2. Research Reference Data Resource Schema (JSON)

When referencing datasets, external documentation trees, or structured citations programmatically, follow the OKF `DataResource` descriptor structure:

```json
{
  "$schema": "https://frictionlessdata.io/schemas/data-resource.json",
  "name": "agy-runtime-specifications",
  "title": "Antigravity Agent Runtime Specifications",
  "description": "Authoritative Google Cloud documentation for the Antigravity headless agent execution loop.",
  "path": "evidence/sources/docs/47-runtime-specifications.md",
  "format": "md",
  "mediatype": "text/markdown",
  "encoding": "utf-8",
  "sources": [
    {
      "title": "Google AI Studio Developer Documentation",
      "path": "https://ai.google.dev/docs/antigravity/runtime",
      "version": "1.1.12",
      "retrieved": "2026-08-13"
    }
  ],
  "licenses": [
    {
      "name": "CC-BY-4.0",
      "path": "https://creativecommons.org/licenses/by/4.0/",
      "title": "Creative Commons Attribution 4.0 International"
    }
  ],
  "custom": {
    "citation_number": 47,
    "category": "docs",
    "status": 200
  }
}
```

---

## 3. Standardized Markdown Frontmatter Template (OKF Compliant)

Every research snapshot stored in `evidence/sources/<category>/<NN>-<slug>.md` must use the following standard YAML header:

```markdown
---
# OKF Resource Descriptor Metadata
source: 47
category: docs            # Allowed: docs | google | protocol | community
title: "Antigravity Agent Runtime Specifications"
url: "https://ai.google.dev/docs/antigravity/runtime"
final_url: "https://ai.google.dev/docs/antigravity/runtime"
fetched: "2026-08-13"
status: 200
license: "CC-BY-4.0"
format: "markdown"
encoding: "utf-8"
checksum: "sha256-abc123..."  # Optional cryptographic snapshot hash
---

# Antigravity Agent Runtime Specifications

Snapshot markdown body content...
```

### Frontmatter Field Specifications

| Field | Type | Description | OKF Mapping |
|---|---|---|---|
| `source` | `integer` | Unique sequential citation identifier (`1..N`). | `resource.name` |
| `category` | `string` | Classification: `docs`, `google`, `protocol`, or `community`. | `resource.group` |
| `title` | `string` | Full canonical document or article title. | `resource.title` |
| `url` | `string` | Initial target URI. | `sources[0].path` |
| `final_url` | `string` | Resolved URI after redirects. | `sources[0].resolved` |
| `fetched` | `string (YYYY-MM-DD)` | Snapshot retrieval date. | `sources[0].retrieved` |
| `status` | `integer / string` | HTTP status code (e.g. `200`, `404`) or capture note. | `resource.status` |
| `license` | `string` | Content distribution license (e.g., `CC-BY-4.0`, `Apache-2.0`). | `licenses[0].name` |

---

## 4. Ingestion Workflow & Step-by-Step Guide

### Step 1: Register in `reference/19-works-cited.md`

Add the entry under its corresponding category section:

```markdown
### Official Docs `[DOCS]`

47. Antigravity Agent Runtime Specifications — https://ai.google.dev/docs/antigravity/runtime
```

### Step 2: Create the Localized Snapshot

Place the markdown file in `evidence/sources/<category>/<NN>-<slug>.md`:
- File naming convention: `<NN>-<kebab-case-title>.md` (e.g. `47-runtime-specifications.md`).
- Ensure the relative path does not escape the repository boundary.

### Step 3: Synchronize Archive Index & Parent Document

Run the automated build and validation tasks:

```bash
# Auto-sync the generated evidence/sources/index.md manifest
npm run validate:fix

# Recompile the parent documentation file
npm run build:doc

# Run the 12-point validation suite
npm run validate
```

### Step 4: Cross-Reference in Technical Reference Modules

Cite the source in technical documentation using standard footnote references or tags:
- Footnote: `[^47]`
- Category Tag: `[DOCS-47]`
- Evidence Association: `[LIVE-1.1.12 · 2026-08-13] (EV-021, Source #47)`
