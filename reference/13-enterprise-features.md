## 13. Enterprise Features
[DOCS:18]

Google Antigravity integrates directly with **Gemini Enterprise** and the **Gemini Enterprise Agent Platform**, enabling enterprise development teams to run sessions using models hosted within their organization's Google Cloud infrastructure under strict corporate governance and VPC Service Controls `[DOCS:18]`.

### Supported Products & Licensing Tiers `[DOCS:18]`

| Product | Enterprise Integration Status |
|---|---|
| **Antigravity 2.0** (Desktop) | Supported. |
| **Antigravity CLI** (`agy`) | Supported. |
| **Antigravity IDE** | Not supported for enterprise deployments. |

**Supported License Editions**:
- Gemini Enterprise Standard
- Gemini Enterprise Plus
- Gemini Enterprise Pay-as-you-go

### IAM Roles & Permissions Matrix `[DOCS:18]`

| Action / Setup Step | Required IAM Role | Permission ID |
|---|---|---|
| **Create GCP Project** | Project Creator (`roles/resourcemanager.projectCreator`) | `resourcemanager.projects.create` |
| **Enable Agent Platform API** | Service Usage Admin (`roles/serviceusage.serviceUsageAdmin`) | `serviceusage.services.enable` |
| **Use Antigravity Models** | Agent Platform User (`roles/aiplatform.user`) | `aiplatform.user` |

### Authentication & Single Sign-On (SSO) `[DOCS:18]`

1. **Standard Business SSO**: Sign in with corporate business account via Google Cloud SSO.
2. **Workforce Identity Federation (BYOID / WIF)**: Authenticate through external identity providers (e.g. Okta, Ping) via **Advanced WIF Configuration** string.
3. **Application Default Credentials (ADC)** *(CLI Only)*:
   - Authenticate headless workflows via `gcloud auth application-default login --project {PROJECT}`.
   - Credential path: `~/.config/gcloud/application_default_credentials.json`.
   - Enable via environment variable: `export AGY_ADC_AUTH=true`.
   - Limitation: Models older than Gemini 3 Flash are not supported under ADC.
4. **API Key Support**:
   - **CLI**: NOT supported currently (`google-antigravity/antigravity-cli#78` `[GOOGLE:38]`).
   - **SDK**: Supported via `GEMINI_API_KEY` env or `api_key=` config `[DOCS:30]`.

### Regional Deployment Endpoints & Capability Matrix `[DOCS:18]`

| Endpoint Region | Base URI | Supported Capabilities |
|---|---|---|
| **Global** | `global` | Text Generation, Code Inference, Multimodal, Image Generation. |
| **US Multi-Region** | `us` | Text Generation, Code Inference, Multimodal. |
| **EU Multi-Region** | `eu` | Text Generation, Code Inference, Multimodal. |

*Note*: Image Generation is available exclusively on `global` deployment endpoints.

### Projects, Conversations & Worktree Workflows `[DOCS:11,12]`

- **Default Project**: `default-cli-project`.
- **Project Selection**: `agy --project=<project_id>` or `agy --new-project`.
- **Cross-Project Forking**: `/fork <project_id>` forks an active conversation to another project.
- **Desktop Execution Modes**: Local Mode (direct in workspace directory) or New Worktree Mode (isolated git worktree).

### Diagnostic Log Paths `[DOCS:16]`

| Client Product | Diagnostic Log File Path |
|---|---|
| **Antigravity CLI** | `~/.gemini/antigravity-cli/cli.log` |
| **Antigravity 2.0** | `~/Library/Logs/Antigravity/language_server.log` |
