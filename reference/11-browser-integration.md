## 11. Browser Integration
[DOCS:23]

Google Antigravity includes a local Chrome browser integration operated via a specialized Browser Subagent to test websites, inspect documentation sources, capture visual screenshots, and automate web tasks `[DOCS:23]`.

### Core Browser Architecture & Profile Isolation `[DOCS:23,26]`

| Aspect | Technical Specification |
|---|---|
| **Engine** | Local Chrome browser operated via Browser Subagent. |
| **Profile Isolation** | Runs inside a completely separate Chrome profile (isolated application instance). |
| **Data Privacy** | No cookie or sign-in credential sharing with personal browsing profiles. |
| **Sign-In Persistence** | Account sign-ins persist inside the isolated profile across future sessions. |
| **OS Windowing** | On macOS, appears as a separate dock icon if Chrome is already open. |
| **Profile Path** | Configurable via the **Browser Profile** setting in the Browser User Settings section. |
| **Toggle Control** | Completely disabled by toggling **Browser Tools** under User Settings → Browser. |

### Two-Layer URL Security Model `[DOCS:24]`

Browser navigation enforces a mandatory two-layer URL security system:

1. **Denylist (Server-Side Enforced)**:
   - Evaluated using Google Superroots' `BadUrlsChecker` service via RPC before navigation.
   - Denies access to malicious or dangerous URLs.
   - **Fail-Closed**: If the server is unreachable, access is denied by default.
   - **Absolute Precedence**: The denylist always overrides the allowlist; a denylisted URL cannot be allowlisted.

2. **Allowlist (Local User Control)**:
   - Stored in a local text file, initialized with `localhost`.
   - When navigating to an un-allowlisted URL, the UI displays an **"Always Allow"** confirmation prompt.
   - Clicking "Always Allow" appends the target host to the local allowlist.

### Invocation & Artifact Output `[DOCS:23,27]`

- **Invocation**: Triggered explicitly via the `/browser` command or spawned via subagent.
- **Design Rationale**: Kept as an explicit command/subagent invocation rather than auto-triggered because automated browser usage requires user steering.
- **Artifact Deliverables**: Tab actions generate visual screenshot artifacts and WebP action video recordings saved directly to the session artifact directory.
