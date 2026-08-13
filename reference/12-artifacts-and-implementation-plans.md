## 12. Artifacts and Implementation Plans

`[DOCS]`

Artifacts are structured deliverables created by agents to communicate progress, outline technical plans, present code diffs, render architecture diagrams, and capture visual media `[DOCS]`. As agents execute with high autonomy over long sessions, artifacts serve as the primary asynchronous co-steering mechanism `[DOCS]`.

### Execution Modes

| Mode | Command | Execution & Planning Behavior |
|---|---|---|
| **Planning Mode** | `/planning` | Agent generates structured implementation plans, task groups, and architecture artifacts before executing filesystem changes `[DOCS]`. |
| **Fast Mode** | `/fast` | Direct execution mode without intermediate planning halts `[DOCS]`. |

### TUI Interactive Review Interface

When an agent produces or modifies artifacts, the TUI status bar displays an active notification (`/artifact to review`). Pressing `Ctrl+R` opens the interactive review interface `[DOCS]`:

1. **Artifact Picker Panel Overlay**:
   - A high-level checklist menu featuring status markers (`✓ approved`, `open`), quick preview toggles, and folder structures `[DOCS]`.
2. **Artifact Detail Viewer**:
   - A full-screen audit interface supporting syntax highlighting, inline line-level commenting, and diagram scaling `[DOCS]`.

#### Panel Keybindings

| Key | TUI Command | Action Behavior |
|---|---|---|
| `↑` / `↓` | `nav.scroll_line` | Navigate through list of artifact entries `[DOCS]`. |
| `h` / `l` | `nav.switch_button` | Toggle row action buttons (**open**, **approve**, **reject**) `[DOCS]`. |
| `p` | `confirm.preview` | Toggle 12-line inline code preview under selected row `[DOCS]`. |
| `y` | `confirm.approve` | Instantly approve selected artifact `[DOCS]`. |
| `n` | `confirm.reject` | Instantly reject selected artifact `[DOCS]`. |
| `Shift+A` | `confirm.approve_all` | Approve all pending artifacts simultaneously `[DOCS]`. |
| `Esc` | `nav.close` | Close picker overlay `[DOCS]`. |

### Artifact Review Policy Settings

The Desktop Hub and CLI support configurable review policies `[DOCS]`:

| Policy | Behavior |
|---|---|
| **Request Review** *(Recommended)* | Agent halts at intermediate milestones for user inspection before writing changes to disk `[DOCS]`. |
| **Always Proceed** | Agent proceeds continuously without halting for deliverable approvals `[DOCS]`. |

### Implementation Plan Co-Steering Workflow

1. **Generate**: Agent creates an `implementation_plan.md` artifact in the session artifact directory `[DOCS]`.
2. **Review & Comment**: User inspects proposed architecture, adding line-level feedback comments `[DOCS]`.
3. **Co-Steer**: User selects **"Proceed"** (approves implementation) or **"Review"** (requests revision based on feedback) `[DOCS]`.
4. **Multimodal Feedback**: Screenshots captured by browser subagents are attached as visual artifacts supporting direct region-based feedback `[DOCS]`.
