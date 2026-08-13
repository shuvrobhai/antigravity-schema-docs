---
source: 12
category: docs
title: Conversations
url: "https://antigravity.google/docs/cli/conversations"
final_url: "https://antigravity.google/docs/cli/conversations"
fetched: 2026-08-13
status: 200
---
# Managing conversations

Resume prior development threads, scope active histories to local workspaces, and fork conversations to experiment with alternate architectures.

## Workspace scoping

To maintain context hygiene, Antigravity CLI scopes conversation histories directly to your current working directory. When you launch `agy` from a specific directory, the agent only displays and resume sessions associated with that specific local repository or subdirectory.

This prevents context pollution, ensuring that the agent’s semantic memory and token limits remain focused solely on the relevant codebase.

## Resuming sessions

You can return to a prior conversation at any time to continue an implementation, refine a solution, or recover from an interrupted session.

Antigravity CLI supports both an interactive **Session Picker** TUI overlay and direct command-line flags (`agy -c` / `agy --continue`) to resume threads instantly based on your active workspace.

For a complete walkthrough of the interactive picker, keyboard shortcuts, and details on how the directory-scoped session cache works, see the dedicated **[Resume Command Guide](/docs/cli/commands/resume)**.

## Branching with `/fork`

When engineering a complex feature, you may want to explore multiple design alternatives without losing your progress. The `/fork` command enables safe, parallel experimentation.

content_copy

    /fork

*(Alias: `/branch`)*

The `/fork` command clones your entire conversation history up to the current turn into a new, independent session.

### Forking workflow

1.  Type `/fork` inside the prompt panel and press `Enter`.
2.  The CLI allocates a new unique session ID and duplicates your existing workspace state and agent thread.
3.  Your active terminal switches immediately to the new branch.
4.  If the experiment fails, run `/resume` to restore your original, stable conversation branch.

lightbulbBranching Filesystems: Forking clones the conversation thread, not your local git checkout. To fully isolate files during parallel forks, use git branches or stash local changes before testing contrasting approaches.

## Next steps

Explore how the agent handles complex, asynchronous operations and parallel tasks:

- **[Background Tasks & Subagents](/docs/cli/subagents)**: Monitor subagents and handle fast-path approvals.
- **[Settings, Rendering & Keybindings](/docs/cli/settings)**: Configure rendering buffers and override JSON preferences.
- **[Permissions & Sandbox](/docs/cli/sandbox)**: Manage security profiles and system command lists.
