## 14. Workspace Governance Recommendations

These are engineering recommendations grounded in confirmed system behavior but not documented as official guidance.

### 14.1 Plugin-Based Governance

`[DOCS]` confirms native `disable`/`enable` for plugins. Package related skills into plugins for native toggle `[B]`.

### 14.2 Archive-Based Skill Indexing

Move non-essential skills to `./skills_archive/`. Use routing skill for on-demand loading. Reduces Phase 1 token overhead `[B]`.

### 14.3 Workspace Shadowing

Workspace skills override global skills with identical names. Create workspace skill to redirect global skill `[B]`.

### 14.4 Version-Controlled Settings

Commit workspace settings to enforce security policies across teams `[A]`.
