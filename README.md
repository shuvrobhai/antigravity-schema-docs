# Google Antigravity Schema & Technical Reference

> Comprehensive, modular technical specification, schema toolkit, and evidence-grounded reference for **Google Antigravity** (`agy`).

---

## 📖 Overview

This repository maintains the authoritative, modular technical documentation and schema specifications for Google Antigravity. It features a complete inventory of configuration options, CLI commands, permissions engines, headless automation protocols, sandbox internals, and JSON schema definitions.

All documentation claims are strictly grounded according to an explicit source precedence hierarchy ([DOCS] > [LIVE] > [GOOGLE] > [PROTOCOL] > [COMMUNITY] > [INFERRED]) and backed by point-in-time web source archives and live empirical observation tests.

---

## 🏗️ Architecture

```
antigtavity-schema/
├── README.md                      # Repository overview and developer guide
├── CONTEXT.md                     # Domain vocabulary & canonical terms
├── Makefile                       # Standard task automation interface
├── requirements.txt               # Toolchain dependencies
├── antigravity-reference.md       # Composed monolithic parent document (Build artifact)
│
├── schemas/                       # 17 Standalone JSON Schemas (Section 20 catalog)
│   ├── settings.schema.json       # CLI configuration schema
│   ├── plugin.schema.json         # Plugin manifest schema
│   ├── agent.schema.json          # Agent frontmatter schema
│   ├── skill.schema.json          # Skill frontmatter schema
│   ├── mcp_config.schema.json     # MCP server configuration schema
│   ├── hooks.schema.json          # Lifecycle hooks schema
│   └── ... (17 total schemas)
│
├── reference/                     # Source modules (Source of truth)
│   ├── 00-preamble.md             # Title, changelog, report methodology, and TOC
│   ├── 01-executive-summary.md    # Architecture overview and product taxonomy
│   ├── ...                        # Numbered section modules 02 through 19
│   └── 20-schema-toolkit-and-native-schemas.md # JSON schemas & tool configurations
│
├── evidence/                      # Empirical grounding & web snapshots
│   ├── agy-1.1.12/                # Empirical test logs (EV-001 through EV-019)
│   │   └── evidence.md            # Live system observations & verification runs
│   └── sources/                   # 46 point-in-time Markdown snapshots of cited URLs
│       ├── index.md               # Generated snapshot manifest & citation map
│       ├── community/             # Community discussions and third-party reports
│       ├── docs/                  # Official documentation archives
│       ├── google/                # Google blog posts, docs, and announcements
│       └── protocol/              # MCP, Language Server, and Agent protocol specs
│
├── docs/                          # Architecture Decision Records
│   └── adr/
│       ├── 0001-modular-reference-with-composed-parent.md
│       ├── 0002-archive-cited-sources.md
│       └── 0003-standalone-json-schema-catalog.md
│
└── scripts/                       # Maintenance & quality toolchain
    ├── build.py                   # Modular composition engine (compiles reference/ -> parent)
    ├── fetch_sources.py           # Snapshot archiver & dead-link detector
    ├── validate.py                # 9-check repository integrity validator
    └── migrations/                # Historical migration scripts
        └── split_reference.py     # One-time reference modularization migration
```

---

## 🚀 Quickstart & Commands

You can use standard `make` targets or invoke Python scripts directly:

### 1. Installation
Install the required scraping and validation dependencies:
```bash
make install
# or
python3 -m pip install -r requirements.txt
```

### 2. Building Documentation
Edit source modules in [`reference/`](reference/) and compile the monolithic parent document [`antigravity-reference.md`](antigravity-reference.md):
```bash
# Build once
make build

# Verify parent document is in sync (CI mode)
make build-check

# Live auto-rebuild on module file edits
make watch
```

### 3. Repository Validation
Run the full 9-point integrity suite (verifies module contiguity, composition sync, TOC alignment, heading hierarchy, source archives, snapshot orphans, relative links, live EV evidence grounding, and native JSON schema integrity):
```bash
# Run all checks
make validate

# Detailed item breakdown
make validate-verbose

# Auto-repair drift
make validate-fix
```

### 4. Source Archival & Web Snapshots
Fetch, convert, and index cited URLs from Section 19 ([`reference/19-works-cited.md`](reference/19-works-cited.md)):
```bash
# Fetch missing citations into evidence/sources/
make fetch-sources

# Verify archive is in sync with §19 citations
make check-sources

# Force re-fetch and update all snapshots
make force-fetch-sources
```

---

## 🛠️ Workflows & Rules

1. **Modules Are the Source of Truth**: Never edit [`antigravity-reference.md`](antigravity-reference.md) directly. Always edit the relevant module in [`reference/`](reference/) and run `make build`.
2. **Contiguous Numbering**: Modules in [`reference/`](reference/) must follow the format `NN-slug.md` with contiguous 00..20 numbering.
3. **Evidence Grounding**: Any claim tagged with `[LIVE-1.1.12 · 2026-08-13]` must correspond to an active `EV-###` entry in [`evidence/agy-1.1.12/evidence.md`](evidence/agy-1.1.12/evidence.md).
4. **Source Precedence**: Follow the strict source authority tiers outlined in [`CONTEXT.md`](CONTEXT.md): `[DOCS]` > `[LIVE]` > `[GOOGLE]` > `[PROTOCOL]` > `[COMMUNITY]` > `[INFERRED]`.

---

## 📚 Architectural Decisions

- [ADR-0001: Modular Reference with Composed Parent](docs/adr/0001-modular-reference-with-composed-parent.md)
- [ADR-0002: Archive Cited Sources as Local Markdown Snapshots](docs/adr/0002-archive-cited-sources.md)
- [ADR-0003: Standalone JSON Schema Catalog with Automated Drift Validation](docs/adr/0003-standalone-json-schema-catalog.md)
