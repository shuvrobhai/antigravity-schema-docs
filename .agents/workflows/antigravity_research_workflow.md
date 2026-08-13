---
description: Executes a multi-stage empirical research, verification, and documentation workflow for Google Antigravity using dedicated subagents with strict source precedence grounding.
---

# Google Antigravity Technical Documentation & Verification Workflow

This workflow orchestrates a team of dedicated background subagents to research, empirically test, draft, audit, and integrate technical documentation and JSON schemas for Google Antigravity while strictly enforcing source precedence rules.

### Mandatory Execution Rules

1. **Dedicated Subagents & Session Isolation**:
   - Every stage MUST be executed by a separate background subagent.
   - All intermediate artifacts (`source_hierarchy_map.md`, `empirical_test_notes.md`, `technical_draft_v1.md`, `audit_report.md`, `agent_prompts.md`) MUST be written to the session artifact directory (`<appDataDir>/brain/<conversation-id>/`) to keep the repository clean while enabling interactive review.
2. **Prompt Logging**:
   - Before dispatching each background subagent, the orchestrator MUST record the exact prompt sent to that subagent in `agent_prompts.md` under the appropriate stage header.
3. **Strict Source Precedence**:
   - All technical claims and schema properties must be tagged using the hierarchy: `[DOCS] > [LIVE] > [GOOGLE] > [PROTOCOL] > [COMMUNITY] > [INFERRED]`.
   - Higher precedence strictly overrides lower precedence in case of conflicts.
4. **Divergence & Empirical Conflict Resolution**:
   - When live empirical observation (`[LIVE]`) reveals runtime behavior differing from official documentation (`[DOCS]`), the workflow requires **dual-tagging with explicit divergence callouts**.
   - State the official documented contract (`[DOCS]`) alongside the empirical reality (`[LIVE]`), record an `EV-###` empirical proof in `evidence/agy-1.1.12/evidence.md`, and document the gap in Section 17/18.
5. **Transparent Failure Recovery**:
   - When a subagent fails or encounters an audit rejection, explain what was attempted and the failure cause, log the revised prompt in `agent_prompts.md`, and re-dispatch with a refined empirical strategy.
6. **Full Toolchain Quality Gates**:
   - Stage 5 MUST execute and pass `make all` (all 9 repository validation stages + composition build sync) before completing.

---

## Pipeline Stages

### Stage 1: Source Discovery & Hierarchy Mapping
**Subagent**: `Source Architect`
- **Role**: `Technical Source Architect & Hierarchy Auditor`
- **Action**: Analyze the target feature, CLI command, config key, tool API, or internal behavior. Gather all raw documentation sources, announcements, and code traces. Categorize every claim under its exact source hierarchy level (`[DOCS]`, `[LIVE]`, `[GOOGLE]`, `[PROTOCOL]`, `[COMMUNITY]`, `[INFERRED]`). Highlight conflicting claims across sources.
- **Output Artifact**: `source_hierarchy_map.md`
- **Log Prompt**: Record prompt in `agent_prompts.md` under `## Stage 1: Source Architect Prompt`.

### Stage 2: Empirical Verification & Web Archiving
**Subagent**: `Empirical Researcher`
- **Role**: `Empirical Tester & Web Archivist`
- **Action**: Read `source_hierarchy_map.md`. Conduct live empirical observation tests (CLI probes, runtime sandbox execution, permission checks, statusline inspection). Record structured `EV-###` observation entries into `evidence/agy-1.1.12/evidence.md`. Archive point-in-time web source snapshots into `evidence/sources/` using `python3 scripts/fetch_sources.py`.
- **Output Artifact**: `empirical_test_notes.md`
- **Log Prompt**: Record prompt in `agent_prompts.md` under `## Stage 2: Empirical Researcher Prompt`.

### Stage 3: Technical & Schema Drafting
**Subagent**: `Technical Writer`
- **Role**: `Modular Schema & Docs Engineer`
- **Action**: Read `source_hierarchy_map.md` and `empirical_test_notes.md`. Draft modular technical documentation, CLI command specifications, and standalone Draft 2020-12 JSON schemas. Append explicit source tags (e.g., `[LIVE-1.1.12 · 2026-08-13]`, `[DOCS]`) to every claim and schema property.
- **Output Artifact**: `technical_draft_v1.md`
- **Log Prompt**: Record prompt in `agent_prompts.md` under `## Stage 3: Technical Writer Prompt`.

### Stage 4: Grounding & Compliance Audit
**Subagent**: `Grounding Auditor`
- **Role**: `Adversarial Compliance & Precedence Auditor`
- **Action**: Read `technical_draft_v1.md` critically against `source_hierarchy_map.md` and `empirical_test_notes.md`. Verify that no lower-precedence source overrides a higher-precedence source without dual-tagging. Verify JSON schema validation syntax. Flag any ungrounded assertions, orphaned snapshots, or missing citations.
- **Output Artifact**: `audit_report.md`
- **Log Prompt**: Record prompt in `agent_prompts.md` under `## Stage 4: Grounding Auditor Prompt`.

### Stage 5: Final Refactoring & Toolchain Integration
**Subagent**: `Core Maintainer`
- **Role**: `Master Technical Editor & Integration Engineer`
- **Action**: Read `technical_draft_v1.md` alongside `audit_report.md`. Resolve all audit findings. Merge content into target `reference/NN-slug.md` module(s), update standalone schemas under `schemas/*.schema.json`, synchronize Section 20 matrix table, and run `make all` (`scripts/validate.ts` + `scripts/build.ts --check`).
- **Output Artifact**: `final_doc_spec.md`
- **Log Prompt**: Record prompt in `agent_prompts.md` under `## Stage 5: Core Maintainer Prompt`.
