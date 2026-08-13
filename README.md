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
├── schemas/                       # 18 Standalone JSON Schemas (Section 20 catalog)
│   ├── settings.schema.json       # CLI configuration schema
│   ├── plugin.schema.json         # Plugin manifest schema
│   ├── agent.schema.json          # Agent frontmatter schema
│   ├── skill.schema.json          # Skill frontmatter schema
│   ├── mcp_config.schema.json     # MCP server configuration schema
│   ├── hooks.schema.json          # Lifecycle hooks schema
│   └── ... (18 total schemas)
│
├── reference/                     # Source modules (Source of truth)
│   ├── 00-preamble.md             # Title, changelog, report methodology, and TOC
│   ├── 01-executive-summary.md    # Architecture overview and product taxonomy
│   ├── ...                        # Numbered section modules 02 through 19
│   └── 20-schema-toolkit-and-native-schemas.md # JSON schemas & tool configurations
│
├── evidence/                      # Empirical grounding & web snapshots
│   ├── index.md                   # Master Evidence Registry & Grounding Catalog
│   ├── agy-1.1.12/                # Empirical test logs (EV-001 through EV-020)
│   │   └── evidence.md            # Live system observations & verification runs
│   ├── reports/                   # Technical research reports & synthesis whitepapers
│   │   ├── R-001-behavioral-contracts.md
│   │   └── index.md               # Reports catalog index
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
│       ├── 0003-standalone-json-schema-catalog.md
│       ├── 0004-ast-table-and-schema-linter.md
│       ├── 0005-convert-scripts-to-typescript.md
│       ├── 0006-indexed-citation-badges-and-deduplication.md
│       └── 0007-evidence-hierarchy-and-reports-reorganization.md
│
└── scripts/                       # Maintenance & quality toolchain
    ├── build.ts                   # Modular composition engine (compiles reference/ -> parent)
    ├── validate.ts                # 12-check repository integrity validator
    ├── generate_evidence.ts       # Regenerates probe, report, and master evidence indexes
    ├── audit_workspace.ts         # CLI workspace auditor (AJV + the 18 native schemas)
    ├── test_schemas.ts            # JSON Schema fixture test runner (test/fixtures/)
    ├── fetch_sources.ts           # Citation snapshot archiver & dead-link detector
    └── lib/
        ├── docInspector.ts        # Stdlib-only Markdown AST / table parser
        └── evidenceRegistry.ts    # Evidence & citation query interface
```

---

## 🚀 Quickstart & Commands

You can use standard `make` targets or invoke TypeScript scripts directly:

### 1. Installation
Install the required dependencies:
```bash
make install
# or
npm install
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

### 3. Workspace Diagnostic & Schema Auditor
Audit your project's agent workspace files against all 18 Antigravity JSON schemas, YAML frontmatters, and cross-artifact links:
```bash
# Run workspace audit on a directory
npm run audit -- --dir ./my-agent-workspace

# Automatically repair fixable errors on disk
npm run audit -- --dir ./my-agent-workspace --fix

# Output structured JSON for AI Agent self-healing
npm run audit -- --dir ./my-agent-workspace --json
```

### 4. Repository Validation
Run the full 12-point integrity suite (verifies module contiguity, composition sync, TOC alignment, heading hierarchy, source archives, snapshot orphans, relative links, live EV evidence grounding, native JSON schema integrity, schema-to-doc parity, cross-module evidence consistency, and evidence index synchronization):
```bash
# Run all checks
make validate

# Detailed item breakdown
make validate-verbose

# Auto-repair drift
make validate-fix
```

### 5. Source Archival & Web Snapshots
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

## 📖 Complete Documentation & Guides

For full instructions, preset guides, schema specifications, and AI self-healing workflows, read the [**User Guide (`docs/USER_GUIDE.md`)**](docs/USER_GUIDE.md).

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
- [ADR-0004: AST-Driven Table and Schema Linter for Automated Drift Prevention](docs/adr/0004-ast-table-and-schema-linter.md)
- [ADR-0005: TypeScript Port of Build and Validation Toolchain](docs/adr/0005-convert-scripts-to-typescript.md)
- [ADR-0006: OKF Indexed Citation Badges and Source Tag Deduplication](docs/adr/0006-indexed-citation-badges-and-deduplication.md)
- [ADR-0007: Evidence Hierarchy and Reports Reorganization](docs/adr/0007-evidence-hierarchy-and-reports-reorganization.md)
