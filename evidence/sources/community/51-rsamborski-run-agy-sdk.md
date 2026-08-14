---
source: 51
category: community
title: Antigravity SDK API key in CI (GitHub Action)
url: "https://github.com/rsamborski/run-agy-sdk"
final_url: "https://github.com/rsamborski/run-agy-sdk"
fetched: 2026-08-14
status: 200
---
[rsamborski](/rsamborski) / **[run-agy-sdk](/rsamborski/run-agy-sdk)** Public

- [Notifications](/login?return_to=%2Frsamborski%2Frun-agy-sdk) You must be signed in to change notification settings
- [Fork 1](/login?return_to=%2Frsamborski%2Frun-agy-sdk)
- [Star 9](/login?return_to=%2Frsamborski%2Frun-agy-sdk)

main

[Branches](/rsamborski/run-agy-sdk/branches)[Tags](/rsamborski/run-agy-sdk/tags)

Go to file

Code

Open more actions menu

## Folders and files

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Name</th>
<th>Last commit message</th>
<th>Last commit date</th>
</tr>
</thead>
<tbody>
<tr>
<td><h2 id="latest-commit">Latest commit</h2>
 &#10;<h2 id="history">History</h2>
<a href="/rsamborski/run-agy-sdk/commits/main/">17 Commits</a>17 Commits</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/rsamborski/run-agy-sdk/tree/main/.github">.github</a></td>
<td><a href="/rsamborski/run-agy-sdk/tree/main/.github">.github</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/rsamborski/run-agy-sdk/blob/main/.gitignore">.gitignore</a></td>
<td><a href="/rsamborski/run-agy-sdk/blob/main/.gitignore">.gitignore</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/rsamborski/run-agy-sdk/blob/main/LICENSE">LICENSE</a></td>
<td><a href="/rsamborski/run-agy-sdk/blob/main/LICENSE">LICENSE</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/rsamborski/run-agy-sdk/blob/main/README.md">README.md</a></td>
<td><a href="/rsamborski/run-agy-sdk/blob/main/README.md">README.md</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/rsamborski/run-agy-sdk/blob/main/action.yml">action.yml</a></td>
<td><a href="/rsamborski/run-agy-sdk/blob/main/action.yml">action.yml</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td><a href="/rsamborski/run-agy-sdk/blob/main/run_agent.py">run_agent.py</a></td>
<td><a href="/rsamborski/run-agy-sdk/blob/main/run_agent.py">run_agent.py</a></td>
<td></td>
<td></td>
</tr>
<tr>
<td>View all files</td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

## Repository files navigation

# AGY SDK GitHub Action

`run-agy-sdk` is a composite GitHub Action demonstrating how to run the Antigravity Python SDK (`google-antigravity`) for automated code reviews and task execution. Because it is a composite action running directly on the host, it allows the SDK to spawn Docker-based MCP servers (such as `github-mcp-server`) directly on the host runner.

## ⚙️ Workflow Installation & Setup

To use `run-agy-sdk` in another repository, you need to configure a GitHub Actions workflow that references this action. Follow the instructions below to set up automated reviews or comment-based on-demand reviews.

### 1. Provision API Key Secrets

The Antigravity action requires a Google Gemini or Antigravity API key to authenticate language model interactions.

1.  Generate your API key.
2.  In your target repository, go to **Settings** \> **Secrets and variables** \> **Actions**.
3.  Create a new Repository Secret named `ANTIGRAVITY_API_KEY` and paste your API key as the value.

### 2. Configure the GitHub Actions Workflow

Create a new file in your repository at `.github/workflows/antigravity-review.yml` and copy the following configuration:

name: '🔎 Antigravity PR Review' on: pull_request: types: \[opened, reopened\] workflow_dispatch: \# Allows manual trigger from the Actions tab concurrency: group: '\${{ github.workflow }}-\${{ github.event.pull_request.number \|\| github.ref_name }}' cancel-in-progress: true jobs: antigravity-review: runs-on: 'ubuntu-latest' timeout-minutes: 20 \# Required permissions for the action to read contents and post PR comments/feedback permissions: contents: 'read' pull-requests: 'write' issues: 'write' steps: - name: 'Checkout Repository' uses: 'actions/checkout@v6' with: persist-credentials: false - name: 'Run Antigravity PR Review' \# Reference this action remotely from its repository uses: 'rsamborski/run-agy-sdk@main' id: 'agy_pr_review' with: api-key: '\${{ secrets.ANTIGRAVITY_API_KEY }}' github-token: '\${{ secrets.GITHUB_TOKEN \|\| github.token }}' mode: 'review' prompt: '/antigravity-review' trust-workspace: 'true' sandbox-profile: 'true'

Tip

For production environments, it is recommended to lock the action version to a specific commit SHA (e.g., `rsamborski/run-agy-sdk@<commit-sha>`) rather than `@main` to prevent unexpected breaks from upstream updates.

For a complete workflow template that supports both **Automated PR Auditing** (runs automatically on code updates) and **Comment-Triggered Reviews** (triggered via PR comments), please refer to the reference workflow in [.github/workflows/antigravity-autonomous-review.yml](/rsamborski/run-agy-sdk/blob/main/.github/workflows/antigravity-autonomous-review.yml).

## 🤝 Acknowledgments

This project is inspired by [run-gemini-cli](https://github.com/google-github-actions/run-gemini-cli).

## 📄 License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](/rsamborski/run-agy-sdk/blob/main/LICENSE) file for the full license text.

## 📝 NOTE

This is not an officially supported Google product.

## About

GitHub Action demonstrating how to run the Antigravity Python SDK (\`google-antigravity\`) for automated code reviews and task execution.

### Resources

[Readme](#readme-ov-file)[Apache-2.0 license](#Apache-2.0-1-ov-file)[Activity](/rsamborski/run-agy-sdk/activity)

### Stars

**9** stars

### Watchers

**0** watching

### Forks

[**1** fork](/rsamborski/run-agy-sdk/forks)[Report repository](/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Frsamborski%2Frun-agy-sdk&report=rsamborski+%28user%29)

## Releases

## Packages

## Contributors

## Languages
