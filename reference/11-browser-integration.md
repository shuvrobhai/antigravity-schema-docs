## 11. Browser Integration

`[DOCS]`

Google Antigravity includes a local Chrome browser integration operated via a specialized Browser Subagent to test websites, inspect documentation sources, capture visual screenshots, and automate web tasks `[DOCS]`.

### Core Browser Architecture & Profile Isolation

| Aspect | Technical Specification |
|---|---|
| **Engine** | Local Chrome browser operated via Browser Subagent `[DOCS]`. |
| **Profile Isolation** | Runs inside a completely separate Chrome profile (isolated application instance) `[DOCS]`. |
| **Data Privacy** | No cookie or sign-in credential sharing with personal browsing profiles `[DOCS]`. |
| **Sign-In Persistence** | Account sign-ins persist inside the isolated profile across future sessions `[DOCS]`. |
| **OS Windowing** | On macOS, appears as a separate dock icon if Chrome is already open `[DOCS]`. |
| **Profile Path** | Configurable via the **Browser Profile** setting in the Browser User Settings section `[DOCS]`. |
| **Toggle Control** | Completely disabled by toggling **Browser Tools** under User Settings → Browser `[DOCS]`. |

### Two-Layer URL Security Model

Browser navigation enforces a mandatory two-layer URL security system `[DOCS]`:

1. **Denylist (Server-Side Enforced)**:
   - Evaluated using Google Superroots' `BadUrlsChecker` service via RPC before navigation `[DOCS]`.
   - Denies access to malicious or dangerous URLs `[DOCS]`.
   - **Fail-Closed**: If the server is unreachable, access is denied by default `[DOCS]`.
   - **Absolute Precedence**: The denylist always overrides the allowlist; a denylisted URL cannot be allowlisted `[DOCS]`.

2. **Allowlist (Local User Control)**:
   - Stored in a local text file, initialized with `localhost` `[DOCS]`.
   - When navigating to an un-allowlisted URL, the UI displays an **"Always Allow"** confirmation prompt `[DOCS]`.
   - Clicking "Always Allow" appends the target host to the local allowlist `[DOCS]`.

### Invocation & Artifact Output

- **Invocation**: Triggered explicitly via the `/browser` command or spawned via subagent `[DOCS]`.
- **Design Rationale**: Kept as an explicit command/subagent invocation rather than auto-triggered because automated browser usage requires user steering `[DOCS]`.
- **Artifact Deliverables**: Tab actions generate visual screenshot artifacts and WebP action video recordings saved directly to the session artifact directory `[DOCS]`.
