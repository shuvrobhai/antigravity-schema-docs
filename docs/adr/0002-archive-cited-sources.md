# 0002 — Archive cited sources as local Markdown snapshots

Status: accepted

The Works Cited section (§19) points at 70+ external URLs whose content can vanish, change, or drift from the claims that cite them. We decided to archive each cited page locally under `evidence/sources/<category>/NN-slug.md` — readable Markdown converted from the fetched HTML by `scripts/fetch_sources.py` — so every claim in the report has a retrievable point-in-time copy of its source.

**Considered options:**
- Raw HTML snapshots — byte-faithful but heavy, noisy, and not greppable; rejected because the report is Markdown and readers will search and diff text.
- URL-slug-only filenames — rejected in favor of citation-number prefixes (`NN-`), making the filename itself a pointer back to §19; slugs remain as the descriptive tail.
- Hand-maintained archive — rejected in favor of a generated one (mirrors `build.py`): `--check` guarantees the archive never drifts from §19, and `index.md` is regenerated after every run.

**Consequences:**
- Archives are point-in-time snapshots and will go stale; `--force` re-fetches.
- Duplicate citations (e.g. #62 = #2) are archived once under the lowest number and recorded as duplicates in the manifest.
- Adding a citation to §19 creates a new numbered file on the next run; renumbering §19 mid-list would orphan files and is to be avoided.
- Fetch failures (HTTP errors, dead links) surface in `index.md` as `missing` — a built-in link-rot detector for §19.
