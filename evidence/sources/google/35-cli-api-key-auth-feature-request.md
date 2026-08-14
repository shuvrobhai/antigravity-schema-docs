---
source: 35
category: google
title: CLI API-key auth feature request
url: "https://github.com/google-antigravity/antigravity-cli/issues/78"
final_url: "https://github.com/google-antigravity/antigravity-cli/issues/78"
fetched: 2026-08-13
status: 200
---
### Uh oh!

There was an error while loading. [Please reload this page]().

[google-antigravity](/google-antigravity) / **[antigravity-cli](/google-antigravity/antigravity-cli)** Public

- [Notifications](/login?return_to=%2Fgoogle-antigravity%2Fantigravity-cli) You must be signed in to change notification settings
- [Fork 174](/login?return_to=%2Fgoogle-antigravity%2Fantigravity-cli)
- [Star 1.9k](/login?return_to=%2Fgoogle-antigravity%2Fantigravity-cli)

# Feature Request: Support Gemini API Key (Google AI Studio) Authentication for Headless Environments #78

New issue

Copy link

New issue

Copy linkOpenOpen[Feature Request: Support Gemini API Key (Google AI Studio) Authentication for Headless Environments](#top)\#78Copy link

## Description

[![@agung2001](https://avatars.githubusercontent.com/u/4479106?u=88cbf6de345441e6de38cab625919bf76785b41e&v=4&size=48)](https://github.com/agung2001)[agung2001](https://github.com/agung2001)opened [on May 21, 2026](https://github.com/google-antigravity/antigravity-cli/issues/78#issue-4491696380)Issue body actions

Currently, `antigravity-cli` (`agy`) relies primarily on OAuth for user authentication. While this is seamless for interactive desktop use, it presents a significant bottleneck for automated, headless, or server-side workflows.

Specifically, in headless environments (e.g., cron jobs, CI/CD pipelines, remote staging servers). Standard OAuth-based consumer access is subject to strict daily request limits, which is highly inconvenient for power users or servers generating high-volume AI requests.

Supporting API key authentication from Google AI Studio would resolve these issues, enabling developers to run the CLI programmatically with their own API keys and custom quotas.

------------------------------------------------------------------------

## Proposed Solution

I propose adding support for Gemini API key authentication via:

1.  **Environment Variable Configuration**:\
    The CLI should automatically detect and use a Gemini API key if present in the environment:

    export GEMINI_API_KEY="your_ai_studio_api_key_here"

    Or optionally a specific namespace:

    export ANTIGRAVITY_API_KEY="your_api_key_here"

2.  **CLI Option**:\
    Add a CLI flag to explicitly pass the API key, overriding any stored OAuth credentials:

    agy --api-key "your_api_key_here" ...

3.  **Fallback Mechanism**:\
    When invoking commands, the CLI should check for authentication in the following order of priority:

    1.  Explicit `--api-key` flag.
    2.  Environment variables (`GEMINI_API_KEY` / `ANTIGRAVITY_API_KEY`).
    3.  Existing OAuth credentials stored locally.

------------------------------------------------------------------------

## Additional Context

- This is particularly impactful for workflows like running daily or weekly automated codebase review scripts using `agy --dangerously-skip-permissions` under system crontabs.
- Using a direct Gemini API key allows the CLI to run immediately without interactive prompt steps, which is perfect for non-interactive scripts.

Reactions are currently unavailablePinned by [rodydavis](/rodydavis)Pinned comment options[![@rodydavis](https://avatars.githubusercontent.com/u/31253215?u=8a2a98ae2e3e5afb05cf29f32d75b12453717881&v=4&size=50)rodydavis](https://github.com/rodydavis)[on Jun 29, 2026](#issuecomment-4835844909)

> Why does Antigravity CLI not support the ***highest*** paying tier of customers?

The current pay as you go option is supported by adding a GCP project id to Antigravity 2.0 or the CLI.

<https://antigravity.google/docs/enterprise>

Gemini API Key is not supported currently. We are reviewing the feedback from the community but do not have any updates at this time.

For using an API key in Antigravity you can use the SDK.\
<https://antigravity.google/docs/sdk/overview>

The SDK should fit a lot of the use cases that you need for CI workflows.

[View full comment](#issuecomment-4835844909)

## Metadata

## Metadata

### Assignees

No one assigned

### Labels

No labelsNo labels

### Type

No type

### Projects

No projects

### Milestone

No milestone

### Relationships

None yet

### Development

No branches or pull requests

## Issue actions

- ![](https://github.githubassets.com/assets/github-copilot-app-light-7138e992c731a2bb.png)Open in GitHub Copilot app
