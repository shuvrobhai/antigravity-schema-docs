## 2. Methodology and Source Classification

### Confidence Tiers

Every claim is classified:

| Tier | Label | Definition |
|---|---|---|
| **A** | **Confirmed by Sources** | Directly stated in a retrieved source. Safe to rely on for production decisions. |
| **B** | **Reasonable Inference** | Logically extrapolated from confirmed information. Validate before production reliance. |
| **C** | **Requires Independent Verification** | Not found in any retrieved source. Must be tested against a live installation. |

### Source Classification

Every claim is tagged with its source origin:

| Tag | Scope | Authority |
|---|---|---|
| `[DOCS]` / `[DOCS:NN]` | `antigravity.google/docs/*` (Source `#NN` in §19) | Official product documentation. Primary authority. |
| `[LIVE-1.1.12 · 2026-08-13]` | Direct observation of `agy 1.1.12` on user-configured macOS Darwin 25.4.0 / arm64 | Empirical evidence from a live install. Included when live behavior disagrees with docs/changelog or fills a gap. Cites `EV-###`. |
| `[GOOGLE]` / `[GOOGLE:NN]` | Other Google-owned sources (Codelabs, SDK repositories, announcement blogs; Sources `#40..44` in §19) | High reliability. May lag behind main docs or reflect legacy behavior. |
| `[PROTOCOL]` / `[PROTOCOL:NN]` | `modelcontextprotocol.io` (Source `#45` in §19) | Official MCP specification. Authoritative for MCP protocol details. |
| `[COMMUNITY]` / `[COMMUNITY:NN]` | Third-party sources (Sources `#46..52` in §19) | Variable reliability. Included only when official docs are silent. Explicitly called out. |
| `[INFERRED]` | Logical inference from confirmed data | Lowest authority. Always called out when used. |

Tag priority:

```text
[DOCS] > [LIVE-1.1.12 · 2026-08-13] > [GOOGLE] > [PROTOCOL] > [COMMUNITY] > [INFERRED]
```

Where `[DOCS]` and live observation disagree, the conflict is recorded explicitly.

### Evidence Model

This version introduces evidence IDs (`EV-###`) tied to live observations. Each major correction references its evidence ID, e.g. `EV-003`.

Raw evidence should be stored under:

```text
evidence/agy-1.1.12/
```

Recommended files:

```text
001-agy-version.txt
002-agy-h.txt
003-agy-agents.txt
004-agy-agents-json.txt
005-agy-plugin-h.txt
006-agy-plugin-list.json
007-settings.json
008-config.json
009-projects.json
010-trusted-hooks.json
011-state.json
012-history-head.jsonl
013-skills-json-excerpt.json
014-permissions-json.json
015-hooks-json.json
016-hook-probe-untrusted.txt
017-hook-probe-trusted.txt
```

Redaction policy:

- Replace `<HOME>` for user paths
- Remove OAuth tokens, API keys, `email`, private project IDs
- Remove authentication scopes unless necessary

### Evidence Quality Classification

Each evidence file is classified by rigor:

| Quality Tier | Evidence IDs | Description |
|---|---|---|
| **Strong** | EV-001–EV-005, EV-013, EV-019–EV-020 | Raw command + full unredacted terminal output; independently reproducible |
| **Moderate** | EV-006–EV-012, EV-014–EV-016 | Raw output with privacy redactions or structural summaries rather than verbatim copy |
| **Weak** | EV-017–EV-018 | Command summaries (not raw terminal sessions); results asserted rather than demonstrated via follow-up commands (superseded by EV-020 confound resolution) |

Claims based on Weak-tier evidence should be treated as **directional indicators** requiring independent reproduction, not as confirmed behavioral findings.

### How to Read This Report

- Claims tagged `[DOCS]` can be treated as authoritative product documentation.
- Claims tagged `[LIVE-1.1.12 · 2026-08-13]` reflect observed behavior from a specific user-configured install, not a clean install.
- Claims tagged `[GOOGLE]` are reliable but may reflect legacy (Gemini CLI) behavior that has changed in Antigravity CLI. Verify when possible.
- Claims tagged `[COMMUNITY]` represent third-party observations or recommendations. Treat as supplementary intelligence, not product specification.
- **Section 16** consolidates all information sourced outside official docs in one reference table.
- **Section 17** catalogs every behavioral question the official docs leave unanswered.
- **Section 17.1** catalogs live-observed high-priority conflicts.
