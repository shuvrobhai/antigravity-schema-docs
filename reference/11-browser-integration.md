## 11. Browser Integration

`[DOCS]`

| Aspect | Detail |
|---|---|
| Engine | Local Chrome, separate profile |
| Isolation | No cookie/sign-in sharing with personal browsing |
| Sign-in persistence | Persists within isolated profile |
| macOS | Separate dock icon if Chrome is open |
| Disable | "Browser Tools" in User Settings |
| Security | Denylist (Google BadUrlsChecker, server-side) + Allowlist (local file, starts with localhost) |
| Precedence | Denylist always wins |
| Invocation | `/browser` command |

**Design rationale:** `/browser` is a separate command rather than auto-invoked because user feedback indicated the agent was not capable enough to determine when to use the browser `[DOCS]`.
