# AGENTS.md — Google Antigravity Schema & Technical Reference

Repository for the Google Antigravity (`agy`) technical reference: modular Markdown docs, 18 JSON schemas, an evidence-grounded validation suite, and a Vite/React web app that renders it all.

## Essential Commands

The **TypeScript toolchain is the source of truth** (ADR-0005). The repository is 100% TypeScript with zero Python dependencies.

```bash
make install                 # npm install (bun.lock also present in repo)
make build                   # compose reference/*.md → antigravity-reference.md
make build-check             # verify parent doc in sync (CI mode, no write)
make watch                   # live-rebuild on module changes
make validate                # full 12-check integrity suite (npx tsx scripts/validate.ts)
make validate-fix            # auto-repair drift (rebuild parent, sync evidence, prune orphans)
make test                    # schema fixture tests + auditor smoke test + EvidenceRegistry self-tests
make all                     # test + validate + build-check (full gate)
make fetch-sources           # snapshot missing §19 citations (npx tsx scripts/fetch_sources.ts)
make check-sources           # verify source archive in sync
```

Run a single validation check: `npx tsx scripts/validate.ts --only <modules|build|toc|headings|sources|orphans|links|evidence|schemas|parity|consistency|evidence-index>`

Run a single test:

```bash
npx tsx scripts/test_schemas.ts          # JSON fixture tests
npx tsx scripts/lib/evidenceRegistry.ts  # EvidenceRegistry unit tests
```

Web app (Vite + React 18 + Tailwind v4, port 3000):

```bash
npm run dev        # dev server (vite, port 3000)
npm run build      # vite build — builds the WEB APP
npm run lint       # tsc --noEmit — typechecks src/ only (scripts/*.ts are not covered)
npm run audit -- --dir <path> [--fix] [--json]   # CLI workspace auditor
```

⚠️ **`npm run build` builds the web app; `make build` / `npm run build:doc` compose the Markdown document.** These are different pipelines.

## Architecture

- `reference/NN-slug.md` — source-of-truth modules (`00-preamble.md` … `20-schema-toolkit-and-native-schemas.md`). `scripts/build.ts` composes them into the root **`antigravity-reference.md` build artifact**.
- `schemas/` — 18 standalone JSON Schema files (Draft 2020-12), cataloged in the §20.2 matrix table of `reference/20-schema-toolkit-and-native-schemas.md`.
- `evidence/` — grounding layer: `agy-1.1.12/evidence.md` (EV-001..EV-020 probes), `sources/` (fetched citation snapshots + generated `index.md` manifest), plus `probes/`, `reports/`, `artifacts/`, `templates/`.
- `scripts/` — TS toolchain: `build.ts`, `validate.ts` (12 checks), `generate_evidence.ts`, `audit_workspace.ts`, `fetch_sources.ts`, `lib/docInspector.ts` (Markdown AST/table parser), `lib/evidenceRegistry.ts` (citation/probe catalog). Each `scripts/lib/*.ts` doubles as a self-testing executable (assert-and-throw harness invoked by `make test`).
- `src/` — the web app. `src/data/repository.ts` loads all Markdown/schemas at build time via `import.meta.glob(..., { query: '?raw', eager: true })` (new reference modules are picked up automatically). `src/data/validationEngine.ts` is an in-browser reimplementation of the 12 checks (Validation Console tab). `src/schema/{auditor,validator}.ts` (AJV-based) is shared between the WorkspaceAuditor UI and the `npm run audit` CLI. `src/components/*.tsx` map 1:1 to app tabs; tab keys are `TabType` in `src/types.ts`.
- `docs/adr/` — Architecture Decision Records; ADR-0005 documents the Python→TS port.

## Conventions

- **Never hand-edit `antigravity-reference.md`** or **`evidence/sources/index.md`** — both are generated. Edit `reference/NN-slug.md` and rebuild.
- `reference/` numbering must stay **contiguous `00..20`**; gaps fail validation.
- Every claim tagged `[LIVE-1.1.12 · 2026-08-13]` must cite an existing `EV-###` from `evidence/agy-1.1.12/evidence.md`. Source-tag precedence: `[DOCS] > [LIVE] > [GOOGLE] > [PROTOCOL] > [COMMUNITY] > [INFERRED]` — don't downgrade a tag without reason. `[RESOLVED]` probes must not retain "confound unresolved" phrasing.
- **Adding a schema file requires registering it in the §20.2 matrix table** (`reference/20-schema-toolkit-and-native-schemas.md`), or `validate --only schemas` fails. Doc tables §5.5 / §5.6 / §18.1 must stay in parity with `settings`/`status_line`/`transcript_step` schemas.
- Schema test fixtures live in `test/fixtures/<schema-key>/`; files whose names start with `invalid` must FAIL validation (see `scripts/test_schemas.ts`). `test/fixtures/workspaces/valid-agent-workspace/` is the auditor smoke fixture used by `make test`.
- Citation snapshots: `evidence/sources/<category>/<NN>-<slug>.md` with YAML frontmatter (`source`, `category`, `title`, `url`, `fetched`, `status`). Adding a citation means updating `reference/19-works-cited.md` first, then running `make fetch-sources`; adding an EV probe means updating `evidence/agy-1.1.12/evidence.md` and the `EV-001 through EV-0NN` summary line in §19.
- ADRs in `docs/adr/` are historical decision records and still reference the old Python toolchain and 11-point suite — they document past state, not current behavior. The live truth is the TS toolchain and the 12 `CHECKS` in `scripts/validate.ts`.
