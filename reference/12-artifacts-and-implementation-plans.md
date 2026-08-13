## 12. Artifacts and Implementation Plans

`[DOCS]`

**Execution Modes:**

| Mode | Behavior | CLI |
|---|---|---|
| Planning | Agent plans, produces artifacts, task groups | `/planning` |
| Fast | Direct execution | `/fast` |

**Artifacts:** Implementation plans, code diffs, architecture diagrams, images, browser recordings.

**Controls:** `Ctrl+R` or `/artifact` for picker. `y`/`n`/`Shift+A`/`Shift+R` for approval. `p` for preview.

**Review Policy (Desktop):**

| Policy | Behavior |
|---|---|
| Request Review (Recommended) | Agent halts for approval |
| Always Proceed | Never halts |

**Implementation Plan Workflow:** Generate → Review (inline comments) → "Proceed" or "Review" → Agent iterates or implements.

**Multimodal Feedback:** Screenshots via browser subagent, saved as artifacts, support commenting.
