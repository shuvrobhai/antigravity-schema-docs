---
source: 22
category: docs
title: Artifact Review
url: "https://antigravity.google/docs/artifact-review"
final_url: "https://antigravity.google/docs/artifact-review"
fetched: 2026-08-13
status: 200
---
# Artifact Review

When starting a new Agent conversation, you can choose between two primary execution modes that determine how changes are proposed and reviewed:

- **Planning Mode**: The agent plans thoroughly before executing tasks. In this mode, the agent organizes its work in [task groups](/docs/ide/agent-side-panel), produces structured implementation plans called [Artifacts](/docs/artifacts), and thoroughly researches the codebase for optimal quality.
- **Fast Mode**: The agent executes tasks directly without a dedicated planning phase. Use this for simple, highly localized tasks that can be completed quickly, such as variable renaming, running a specific bash command, or small refactors.

When working in **Planning Mode**, the Artifact Review Policy controls how you interact with and approve these plans before changes are made to your codebase.

## Artifact Review Policy

You can customize the review workflow in the **Agent** tab of the Settings pane. Choose between two policies:

### 1. Request Review (Recommended)

The agent always halts and requests your explicit approval before proceeding with proposed changes.

- When the agent generates an implementation plan or code diff, it will pause execution and notify you.
- This allows you to thoroughly review the proposed changes, add inline comments, and verify the plan in your workspace.
- Once you are satisfied, you can approve the plan to let the agent proceed.

![Settings Review Policy Manual](/assets/image/docs/agent/settings-review-policy-manual.png)

### 2. Always Proceed

The agent never halts for manual review and immediately proceeds with executing its plans.

- When the agent decides to request a review, it will immediately bypass the pause and continue with the implementation.
- Use this if you want a fully autonomous workflow and do not need to manually verify plans before code is modified.

![Settings Review Policy Proceed](/assets/image/docs/agent/settings-review-policy-proceed.png)
