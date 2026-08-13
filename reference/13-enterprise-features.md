## 13. Enterprise Features

`[DOCS]`

Google Antigravity integrates directly with **Gemini Enterprise** and the **Gemini Enterprise Agent Platform**, enabling enterprise development teams to run sessions using models hosted within their organization's Google Cloud infrastructure under strict corporate governance and VPC Service Controls `[DOCS]`.

### Supported Products & Licensing Tiers

| Product | Enterprise Integration Status |
|---|---|
| **Antigravity 2.0** (Desktop) | Supported `[DOCS]`. |
| **Antigravity CLI** (`agy`) | Supported `[DOCS]`. |
| **Antigravity IDE** | Not supported for enterprise deployments `[DOCS]`. |

**Supported License Editions**:
- Gemini Enterprise Standard `[DOCS]`
- Gemini Enterprise Plus `[DOCS]`
- Gemini Enterprise Pay-as-you-go `[DOCS]`

### IAM Roles & Permissions Matrix

| Action / Setup Step | Required IAM Role | Permission ID |
|---|---|---|
| **Create GCP Project** | Project Creator (`roles/resourcemanager.projectCreator`) | `resourcemanager.projects.create` `[DOCS]` |
| **Enable Agent Platform API** | Service Usage Admin (`roles/serviceusage.serviceUsageAdmin`) | `serviceusage.services.enable` `[DOCS]` |
| **Use Antigravity Models** | Agent Platform User (`roles/aiplatform.user`) | `aiplatform.user` `[DOCS]` |

### Authentication & Single Sign-On (SSO)

1. **Standard Business SSO**: Sign in with corporate business account via Google Cloud SSO `[DOCS]`.
2. **Workforce Identity Federation (BYOID / WIF)**: Authenticate through external identity providers (e.g. Okta, Ping) via **Advanced WIF Configuration** string `[DOCS]`.
3. **Application Default Credentials (ADC)** *(CLI Only)*:
   - Authenticate headless workflows via `gcloud auth application-default login --project {PROJECT}` `[DOCS]`.
   - Credential path: `~/.config/gcloud/application_default_credentials.json` `[DOCS]`.
   - Enable via environment variable: `export AGY_ADC_AUTH=true` `[DOCS]`.
   - Limitation: Models older than Gemini 3 Flash are not supported under ADC `[DOCS]`.
4. **API Key Support**:
   - **CLI**: NOT supported currently (`google-antigravity/antigravity-cli#78`) `[DOCS]`.
   - **SDK**: Supported via `GEMINI_API_KEY` env or `api_key=` config `[DOCS]`.

### Regional Deployment Endpoints & Capability Matrix

| Endpoint Region | Base URI | Supported Capabilities |
|---|---|---|
| **Global** | `global` | Text Generation, Code Inference, Multimodal, Image Generation `[DOCS]`. |
| **US Multi-Region** | `us` | Text Generation, Code Inference, Multimodal `[DOCS]`. |
| **EU Multi-Region** | `eu` | Text Generation, Code Inference, Multimodal `[DOCS]`. |

*Note*: Image Generation is available exclusively on `global` deployment endpoints `[DOCS]`.

### Projects, Conversations & Worktree Workflows

- **Default Project**: `default-cli-project` `[DOCS]`.
- **Project Selection**: `agy --project=<project_id>` or `agy --new-project` `[DOCS]`.
- **Cross-Project Forking**: `/fork <project_id>` forks an active conversation to another project `[DOCS]`.
- **Desktop Execution Modes**: Local Mode (direct in workspace directory) or New Worktree Mode (isolated git worktree) `[DOCS]`.

### Diagnostic Log Paths

| Client Product | Diagnostic Log File Path |
|---|---|
| **Antigravity CLI** | `~/.gemini/antigravity-cli/cli.log` `[DOCS]` |
| **Antigravity 2.0** | `~/Library/Logs/Antigravity/language_server.log` `[DOCS]` |
