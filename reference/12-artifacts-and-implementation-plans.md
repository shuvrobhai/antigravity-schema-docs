## 12. Artifacts and Implementation Plans
[DOCS:13]

Artifacts are structured deliverables created by agents to communicate progress, outline technical plans, present code diffs, render architecture diagrams, and capture visual media `[DOCS:13]`. As agents execute with high autonomy over long sessions, artifacts serve as the primary asynchronous co-steering mechanism.

### Execution Modes `[DOCS:13]`

| Mode | Command | Execution & Planning Behavior |
|---|---|---|
| **Planning Mode** | `/planning` | Agent generates structured implementation plans, task groups, and architecture artifacts before executing filesystem changes. |
| **Fast Mode** | `/fast` | Direct execution mode without intermediate planning halts. |

### TUI Interactive Review Interface `[DOCS:22]`

When an agent produces or modifies artifacts, the TUI status bar displays an active notification (`/artifact to review`). Pressing `Ctrl+R` opens the interactive review interface:

1. **Artifact Picker Panel Overlay**:
   - A high-level checklist menu featuring status markers (`✓ approved`, `open`), quick preview toggles, and folder structures.
2. **Artifact Detail Viewer**:
   - A full-screen audit interface supporting syntax highlighting, inline line-level commenting, and diagram scaling.

#### Panel Keybindings `[DOCS:22]`

| Key | TUI Command | Action Behavior |
|---|---|---|
| `↑` / `↓` | `nav.scroll_line` | Navigate through list of artifact entries. |
| `h` / `l` | `nav.switch_button` | Toggle row action buttons (**open**, **approve**, **reject**). |
| `p` | `confirm.preview` | Toggle 12-line inline code preview under selected row. |
| `y` | `confirm.approve` | Instantly approve selected artifact. |
| `n` | `confirm.reject` | Instantly reject selected artifact. |
| `Shift+A` | `confirm.approve_all` | Approve all pending artifacts simultaneously. |
| `Esc` | `nav.close` | Close picker overlay. |

### Artifact Review Policy Settings `[DOCS:22]`

The Desktop Hub and CLI support configurable review policies:

| Policy | Behavior |
|---|---|
| **Request Review** *(Recommended)* | Agent halts at intermediate milestones for user inspection before writing changes to disk. |
| **Always Proceed** | Agent proceeds continuously without halting for deliverable approvals. |

### Implementation Plan Co-Steering Workflow `[DOCS:28]`

1. **Generate**: Agent creates an `implementation_plan.md` artifact in the session artifact directory.
2. **Review & Comment**: User inspects proposed architecture, adding line-level feedback comments.
3. **Co-Steer**: User selects **"Proceed"** (approves implementation) or **"Review"** (requests revision based on feedback).
4. **Multimodal Feedback**: Screenshots captured by browser subagents are attached as visual artifacts supporting direct region-based feedback.
