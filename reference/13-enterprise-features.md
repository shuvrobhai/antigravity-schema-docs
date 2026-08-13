## 13. Enterprise Features

`[DOCS]`

**Editions:** Standard, Plus, Pay-as-you-go.

**Authentication:**

| Method | Details |
|---|---|
| Standard SSO | Google account |
| BYOID | Workforce Identity Federation (Okta, Ping, etc.) |
| ADC | `gcloud auth application-default login`. Credentials at `~/.config/gcloud/application_default_credentials.json` |
| API key | **CLI: NOT supported (2026-08-13)** — open feature request `google-antigravity/antigravity-cli#78`; Google staff: "not supported currently", use the SDK. **SDK: supported** — `GEMINI_API_KEY` env or `api_key=` config `[GOOGLE]`; community CI secrets commonly named `ANTIGRAVITY_API_KEY` `[COMMUNITY]` |

**Diagnostic Logs:**

| Product | Path |
|---|---|
| CLI | `~/.gemini/antigravity-cli/cli.log` |
| Desktop | `~/Library/Logs/Antigravity/language_server.log` |

**Regional Endpoints:** Global (full features), US, EU (no Image Generation).

**Projects:** Default `default-cli-project`. `--project=<id>`, `--new-project`. Cross-project `/fork`.

**Conversations:** Workspace-scoped. Prevents context pollution.

**Desktop Workflows:**
- **Project creation:** Multi-folder, cross-repository context support
- **Agent startup:** Local Mode (direct in folders) or New Worktree Mode (isolated git worktree)

**Official Projects documentation additions** `[DOCS]`:

| Command | Behavior |
|---|---|
| `agy --project=<project_id>` | Open session in specific project |
| `agy --new-project` | Create new project |
| `/fork <project_id>` | Fork conversation to a project |
| Resumed conversations | Automatically use their stored project |
