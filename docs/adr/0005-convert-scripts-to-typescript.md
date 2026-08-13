# 0005 — Convert build and validation automation from Python to TypeScript

Status: accepted

The repository currently maintains a dual-runtime architecture: the interactive documentation web viewer runs on Node.js / React / Vite / TypeScript, while repository maintenance automation (`scripts/build.py`, `scripts/validate.py`, `scripts/fetch_sources.py`, and supporting inspection libraries) runs on Python 3. We decided to convert all build and validation automation to TypeScript executed natively via Node.js / `tsx`.

**Considered options:**
- *Retain Python 3 for automation scripts (Status Quo)* — Maintaining separate Python tooling for CLI checks and TypeScript for the Web UI. Rejected because it forces developers and CI environments to configure two runtime ecosystems (`python3`, `pip`, `venv`, `Node.js`, `npm`), and prevents sharing core validation logic between the CLI and browser application.
- *Shell script / Bash automation* — Rewriting validation checks in Bash using `jq` and `grep`. Rejected because complex AST parsing, table extraction, and schema parity checks require robust data structures and type safety.
- *Unified TypeScript Automation Suite via Node.js & `tsx` (Chosen)* — Converting `scripts/*.py` and `scripts/lib/*.py` to TypeScript (`scripts/*.ts` and `scripts/lib/*.ts`) executed with `npx tsx` and integrated into `package.json` and `Makefile`.

**Consequences:**
- Single runtime environment: developers and CI workflows only need Node.js (`npm install`), eliminating Python dependencies (`beautifulsoup4`, `certifi`).
- 100% code sharing: the exact Markdown parsing, evidence querying, and 11-point validation logic can be imported directly into the React UI without duplication.
- Strong end-to-end type safety across both documentation models and build-time automation.
- `Makefile` targets (`make build`, `make validate`, `make test`) transition seamlessly to invoke `npx tsx scripts/*.ts`.
