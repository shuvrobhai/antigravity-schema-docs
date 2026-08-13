# Google Antigravity Evidence Registry & Grounding Hub

<!-- Generated from evidence/probes/ and evidence/reports/ — do not edit by hand. -->

This directory contains the complete empirical grounding suite, archived web citations, and technical research whitepapers backing all claims in the Google Antigravity Technical Reference (`antigravity-reference.md`).

---

## 1. Evidence Directory Organization

```text
evidence/
├── index.md                          # Master Grounding Registry & Cross-Matrix
│
├── probes/                           # Atomic Empirical Probe Runs
│   └── agy-1.1.12/
│       ├── index.md                  # Probe status summary for this version
│       ├── EV-001.md                 # Atomic probe specification
│       └── ...
│
├── sources/                          # Point-in-time Web Citations (S-001 .. S-046)
│   ├── index.md                      # Snapshot manifest & hash table
│   ├── docs/                         # Official developer docs (01..30)
│   ├── google/                       # Google Cloud & SDK repos (31..38)
│   ├── protocol/                     # Protocol specifications (39)
│   └── community/                    # Third-party reverse engineering (40..46)
│
├── reports/                          # Synthesized Architectural Research Whitepapers
│   ├── index.md                      # Reports manifest
│   └── R-001-behavioral-contracts.md # Synthesis whitepaper
│
├── artifacts/                        # Raw Terminal Logs & Transcripts
│   └── agy-1.1.12/
│       ├── outputs/                  # Raw stdout/stderr dumps
│       └── transcripts/              # Full session logs
│
├── templates/                        # Authoring Blueprints
│   ├── probe-template.md
│   ├── source-template.md
│   └── report-template.md
│
└── agy-1.1.12/                       # Generated aggregate (backward-compatible)
    └── evidence.md                   # Compiled from probes/agy-1.1.12/EV-*.md
```

---

## 2. Source Authority Precedence Hierarchy

| Tier | Tag | Category | Description |
|---|---|---|---|
| **Rank 1** | `[DOCS]` | Official Documentation | First-party technical reference & developer manuals (highest authority). |
| **Rank 2** | `[LIVE]` | Empirical Observation | Live CLI/TUI instrumentation probe logged under `evidence/probes/agy-1.1.12/`. |
| **Rank 3** | `[GOOGLE]` | Google Corporate / Cloud | Official Google blog announcements, architecture whitepapers & SDK repos. |
| **Rank 4** | `[PROTOCOL]` | Protocol Specification | Standardized protocol specifications (Model Context Protocol, LSP, SSE RFC). |
| **Rank 5** | `[COMMUNITY]` | Community / Third-Party | Verified reverse-engineering findings, developer articles & issue trackers. |
| **Rank 6** | `[INFERRED]` | Inferred Hypothesis | Synthetic deduction pending live instrumentation or vendor confirmation. |

---

## 3. Empirical Probe Grounding Matrix (agy-1.1.12)

| Probe ID | Title | Status | Category | Executed At | Source Refs |
|---|---|---|---|---|---|
| [EV-001](EV-001.md) | CLI Version Verification | RESOLVED | CLI & Agent Internals | 2026-08-13 | §1.2, §4.1 |
| [EV-002](EV-002.md) | agy agents --output-format json | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.2, §7.1 |
| [EV-003](EV-003.md) | agy models --output-format json | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.2, §7.2 |
| [EV-004](EV-004.md) | agy agents Workspace Discovery Scope | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.3, §7.1 |
| [EV-005](EV-005.md) | agy plugin CLI Subcommand Surface | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.4, §7.3 |
| [EV-006](EV-006.md) | agy plugin list JSON Schema & Components | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.4, §20.2 |
| [EV-007](EV-007.md) | Plugin Component Detection vs Rules Subdirectory | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.4, §5.2 |
| [EV-008](EV-008.md) | Dual Plugin Installation Roots | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.4, §15.1 |
| [EV-009](EV-009.md) | config.json vs agy plugin list State Discrepancy | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.4, §5.1 |
| [EV-010](EV-010.md) | plugin.json Manifest Variations | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.4, §20.2 |
| [EV-011](EV-011.md) | Agent Frontmatter Capabilities and Model Inheritance | RESOLVED | Subagents & Sandbox | 2026-08-13 | §4.3, §5.3 |
| [EV-012](EV-012.md) | Structured /skills Output in Headless Mode | RESOLVED | CLI & Agent Internals | 2026-08-13 | §4.5, §7.4 |
| [EV-013](EV-013.md) | Live settings.json Configuration Schema | RESOLVED | CLI & Agent Internals | 2026-08-13 | §5.5, §5.6, §20.2 |
| [EV-014](EV-014.md) | config.json userSettings Enum Values | RESOLVED | CLI & Agent Internals | 2026-08-13 | §5.1, §20.2 |
| [EV-015](EV-015.md) | Three Discrete Permission Scopes | RESOLVED | CLI & Agent Internals | 2026-08-13 | §6.1, §6.2 |
| [EV-016](EV-016.md) | Headless /hooks Enumeration Behavior | RESOLVED | Subagents & Sandbox | 2026-08-13 | §10.1, §13.2 |
| [EV-017](EV-017.md) | Untrusted Workspace Hook Probe under Dangerously Skip Permissions | RESOLVED | Subagents & Sandbox | 2026-08-13 | §6.2, §13.2 |
| [EV-018](EV-018.md) | Trusted Workspace Hook Probe under Dangerously Skip Permissions | RESOLVED | Subagents & Sandbox | 2026-08-13 | §6.2, §13.2 |
| [EV-019](EV-019.md) | Default State of keybindings.json | RESOLVED | CLI & Agent Internals | 2026-08-13 | §5.7, §20.2 |
| [EV-020](EV-020.md) | Headless Hook Probe without Permission Skip | RESOLVED | Subagents & Sandbox | 2026-08-13 | §10.1, §13.2, §18.2 |

---

## 4. Synthesized Technical Research Reports

| ID | Title | Status | Date | Scope | Source Refs | Evidence Refs |
|---|---|---|---|---|---|---|
| [R-001](R-001-behavioral-contracts.md) | Antigravity Technical Research Report: Unified Behavioral Contracts & Specifications | Complete | 2026-08-14 | Configuration Contracts, Subagent Lifecycles, OS Containment Rings, CLI/TUI Parity | §4, §5, §7, §13, §14, §18 | EV-001, EV-002, EV-003, EV-004, EV-009, EV-015, EV-016, EV-017, EV-019, EV-020 |
