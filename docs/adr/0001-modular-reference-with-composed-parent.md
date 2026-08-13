# 0001 — Modular reference with composed parent

Status: accepted

The reference document (2,600+ lines) is split into numbered modules under `reference/` (`00-preamble.md` + one file per TOC section 1–20), and `antigravity-reference.md` at the repo root is a generated artifact composed from those modules by `scripts/build.py`. We chose this over a single monolithic file because focused per-category editing is the primary workflow, and over a hand-maintained parent because a generated parent structurally guarantees the parent can never drift from its sources — `scripts/build.py --check` enforces sync and fails CI-style when stale. Composition order is filename order with contiguous numbering; the build joins modules with `\n\n---\n\n` separators and prepends a generated-file HTML comment so hand-editors are warned.

The parent, not the modules, feeds the preview (pandoc → `.freebuff/preview/antigravity-reference.html`). `scripts/build.py` runs in three modes: one-shot build, `--watch` (pure-stdlib mtime polling, no dependencies), and `--check`. The migration that split the original file lives at `scripts/migrations/split_reference.py` and is guarded so it cannot clobber an existing `reference/`.

**Consequences**: modules are the source of truth — edit them, never the parent. Adding a section requires a new module with the next number plus a TOC entry in `00-preamble.md`; renumbering requires contiguous 0..N. The original file's one-off missing separator before §19 and its missing trailing newline were normalized by the build.
