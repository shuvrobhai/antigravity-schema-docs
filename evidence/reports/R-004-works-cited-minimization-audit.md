---
report_id: R-004
title: "Works Cited Minimization: every non-official source re-verified against the official docs (46 → 43 entries)"
status: Complete
date: 2026-08-14
scope:
  - Works Cited (§19)
  - Source Classification (§2)
  - Source Archive & Manifest Sync
source_refs:
  - "§2"
  - "§19"
  - "§3.4"
  - "§16"
evidence_refs:
  - S-031
  - S-043
---

# R-004 — Works Cited Minimization: official-docs-first verification of every Google/community source

**Date:** 2026-08-14

**Question:** `reference/19-works-cited.md` lists 46 sources, 16 of them Google-owned non-docs or third-party. Which of those can be dropped or re-sourced to the official documentation — i.e., which claims do the official docs now answer?

**Method:** every non-official entry was mapped to the claim(s) it backs in the reference modules, then checked against the official docs inventory (`https://antigravity.google/llms.txt`, fresh 2026-08-14) and live fetches of the relevant pages. Entries with zero module citations were dropped outright; entries whose claims the official docs answer were re-sourced `[DOCS]`; everything else was kept.

## TL;DR

- **Dropped (3):** the never-cited codelabs `getting-started-google-antigravity`, `sdd-agy-cli`, `antigravity-cli-hands-on` (zero badge or name references in any module).
- **Kept (13):** every remaining Google/community entry backs a claim the official docs do **not** cover (verified page-by-page below).
- **Result:** 46 → 43 entries; sources 35-46 renumbered 32-43; snapshots, manifest, badge indices, and §2 ranges updated in lockstep.
- **Found along the way:** official pages that exist but are not yet snapshotted/cited (`cli/install`, `cli/gcli-migration`, `ide/rules`, `ide/workflows`, `sdk/mcp`, `cli/modes`, `faq`, …), an official-docs self-conflict on the global skills path, and two sandbox claims in §09 whose cited sources do not actually contain them (see §6 — new open items).

## 1. Per-entry verification matrix

| # (new) | Source | Claim(s) it backs | Official-doc check (2026-08-14) | Verdict |
|---|---|---|---|---|
| 31 | Agent Skills 101 (Codelab) | Skill token costs (~100 Phase 1 / <5000 Phase 2); Codelab subdirectory names | `docs/skills` (live): describes progressive disclosure, **no token numbers**; uses `scripts/`/`examples/`/`resources/` | **Keep** — numbers only exist in the Codelab |
| 32 | Configuration (geminicli.com, relocated) | §16 gap rows: 7-level precedence, env-var interpolation, `preferredEditor`, `vimMode`, `policyPaths`, `adminPolicyPaths`; §09 fail-closed/symlink badges | `docs/cli/settings` (live): documents `toolPermission`, `artifactReviewPolicy`, `altScreenMode`, … — **none of the legacy keys** | **Keep** — legacy config surface not in official docs |
| 33 | SDK announcement blog | "Remote harness" roadmap (deploy SDK agents to Google Cloud) | `docs/sdk/overview` (live): **no roadmap/remote-harness statement** | **Keep** |
| 34 | antigravity-sdk-python (repo) | Bundled runtime binary in PyPI wheels; ADC/`GEMINI_API_KEY` auth; three-layer architecture | `docs/sdk/overview` (live): **none of these details** | **Keep** |
| 35 | CLI API-key auth issue (#78) | "API-key auth NOT supported by the CLI"; open feature request; staff comment | `docs/cli/install` (live): documents keyring sign-in + SSH OAuth only, **no API-key auth** and no "not supported" statement | **Keep** — the explicit statement/issue is primary evidence |
| 36 | MCP Specification | Protocol-level details (transport, lifecycle) | `docs/mcp` covers usage; the spec is the authoritative protocol source | **Keep** — official protocol spec |
| 37 | Claude-Mem setup docs | `AfterAgent`/`AfterTool` hook event names (discrepancy evidence) | Official hooks docs list `PreInvocation`/`PostInvocation` only | **Keep** — discrepancy evidence |
| 38 | Scary Agent Skills (Embrace The Red) | Hidden-Unicode security concern; `disable-model-invocation` | Official docs don't address the security concern | **Keep** |
| 39 | claude-faces-expert | Skills portable across Claude Code/Cursor/Codex CLI | Official docs don't state cross-tool portability | **Keep** |
| 40 | Weinmeister SDK guide (LinkedIn) | SDK Go harness over WebSockets (transport detail) | `docs/sdk/overview` (live): **no transport description** | **Keep** |
| 41 | vscode-dotnettools#2557 | C# Dev Kit absent from Open VSX | `docs/ide/getting-started` (live): download/platform only, **no extension-marketplace list** | **Keep** |
| 42 | run-agy-sdk (GitHub Action) | Concrete SDK-in-CI workflow example | Env var `GEMINI_API_KEY` is official (repo README / §4.10); the workflow example itself is community | **Keep** — cited example |
| 43 | 15-Minute Migration (harshrastogi) | `agy` + `gemini` binary coexistence | `docs/cli/gcli-migration` (live): covers conversion/import/skills paths/MCP — **never mentions running both binaries side by side** | **Keep** |
| — | ~~getting-started-google-antigravity~~ (old 32) | — | — | **Dropped** (never cited) |
| — | ~~Spec-Driven Development~~ (old 33) | — | — | **Dropped** (never cited) |
| — | ~~Hands-on with Antigravity CLI~~ (old 34) | — | — | **Dropped** (never cited) |

Badge indices updated in lockstep: `[GOOGLE:35]`→`[GOOGLE:32]` (`09-sandbox.md` ×2), `[GOOGLE:38]`→`[GOOGLE:35]` (`13-enterprise-features.md`); §2 ranges `#31..38`→`#31..35`, `#39`→`#36`, `#40..46`→`#37..43`.

## 2. Claims where the official docs DO now answer (citation upgrades worth doing)

The official `docs/cli/gcli-migration` page (live, 2026-08-14) now documents parts of the migration mapping that §3.4 / §16 currently attribute to `[GOOGLE]`/`[COMMUNITY]`:

- `agy plugin import gemini` extension→plugin conversion; MCP config moving to standalone `mcp_config.json` (`url`/`httpUrl` → `serverUrl`).
- Skills paths: workspace `.gemini/skills/` → `.agents/skills/`; settings at `~/.gemini/antigravity-cli/settings.json` (also `docs/cli/settings`).
- **Conflict:** `gcli-migration` says global skills migrate to `~/.gemini/antigravity-cli/skills/`, while `docs/skills` says the global location is `~/.gemini/config/skills/`. Both directories exist on this install (2026-08-14). Not resolved here; the §3.4/§16 rows were left as-is pending that resolution (open item §6.2).

## 3. New official pages surfaced by the `llms.txt` inventory (not yet snapshotted)

`cli/install` (auth flows), `cli/gcli-migration`, `cli/modes`, `cli/vim-editor-mode`, `cli/credits`, `cli/commands/*`, `ide/rules`, `ide/workflows`, `ide/hooks`, `ide/settings`, `ide/plugins`, `ide/mcp`, `sdk/mcp`, `sidecars`, `task-groups`, `tools`, `faq`, `plans`. These are candidates for future snapshotting and for closing §16/§17 gaps.

## 4. Archive & sync changes

- Deleted `evidence/sources/google/{32-getting-started-google-antigravity,33-sdd-agy-cli,34-antigravity-cli-hands-on}.md`.
- Renamed 12 snapshots to their new numeric prefixes and rewrote their `source:` frontmatter (35→32 … 46→43).
- Regenerated `evidence/sources/index.md` manifest; updated `EvidenceRegistry` self-test (46→43), the `generate:evidence` source-tree diagram, and the SearchModal UI counts (19 schemas / 43 sources).

## 5. Verification

Lint, Integrity Gate (incl. citation-model parity + byte-for-byte manifest), `check:sources`, `check:evidence`, `validate` (12/12), auditor smoke, and Vite build all pass with 43 citations.

## 6. New open items

1. **§09 fail-closed / symlink-escape claims lack a backing source.** The claims at `09-sandbox.md` ("fails closed with a hard error", "symlinks … outside the workspace root are blocked") are tagged `[DOCS:06]`/`[GOOGLE:32]`, but none of the live official sandbox doc, the archived `cli-sandbox` snapshot, the geminicli configuration reference, or the geminicli sandbox page contains that language (verified 2026-08-14). Either find the true source or downgrade the claims.
2. **Official-docs conflict on global skills path** (`~/.gemini/antigravity-cli/skills/` vs `~/.gemini/config/skills/`; both real). Resolve before re-sourcing §3.4/§16 migration rows to `[DOCS]`.
3. **§16 bare-tag community sources have no works-cited entries** (OrangeBot, mslinn.com, BleepingComputer, aibuilderclub, how2shout, Google Cloud Medium tutorial, LinkedIn, community round-up). Either add entries (grows the list) or accept bare tags as audit-table-only citations (keeps §19 minimal).
4. **Live settings doc lists keys not yet in `schemas/settings.schema.json`** (`allowNonWorkspaceAccess`, `altScreenMode`, `runningLightSpeed`, `verbosity`, `useG1Credits`, `showTips`, `showFeedbackSurvey`, `notifications`, `editorMode`) — re-check schema coverage against the 2026-08-14 live page.
