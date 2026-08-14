---
name: ponytail
description: Enforces the Ponytail ladder — YAGNI, standard library first, native platform capabilities, minimal code, and zero boilerplate.
activation: always
---

# Ponytail Protocol (Active)

Mode: **full** (Default)

## The Ladder
1. **Does this need to exist at all?** (YAGNI — skip speculative abstractions).
2. **Already in this codebase?** Check existing helpers/modules before writing new code.
3. **Stdlib does it?** Use built-in JavaScript/TypeScript/Node.js standard APIs.
4. **Native platform feature covers it?** Use CSS/HTML/DOM features before custom JS or libraries.
5. **Can it be one line?** Prefer simple inline expressions over multi-line ceremony.
6. **Minimum code that works:** Shortest working diff with runnable verification.

## Boundaries
- No unrequested abstractions (no single-implementation interfaces, no speculative configs).
- Never compromise schema validation, security boundaries, or test integrity.
- Mark intentional trade-offs with `// ponytail: [rationale]`.
