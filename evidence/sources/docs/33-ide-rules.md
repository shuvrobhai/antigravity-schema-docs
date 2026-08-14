---
source: 33
category: docs
title: IDE Rules
url: "https://antigravity.google/docs/ide/rules"
final_url: "https://antigravity.google/docs/ide/rules"
fetched: 2026-08-14
status: 200
---
<div class="page-nav-overlay" data-overlay="" data-astro-cid-zfittpdt="">

</div>

<div class="docs-page" data-docs-page="" data-astro-cid-zfittpdt="">

<div class="docs-main-container" data-astro-cid-zfittpdt="">

<div class="docs-nav docs-page-nav" data-sidebar="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

</div>

</div>

<div class="docs-main-content" data-astro-cid-zfittpdt="">

- side_navigation
- Antigravity IDE
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Customizations
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- Rules

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Rules<a href="#rules" class="deep-link-anchor" aria-label="Link to section">link</a>

Rules are manually defined constraints for the Agent to follow, at both the local and global levels. Rules allow users to guide the agent to follow behaviors particular to their own use cases and style.

To get started with Rules:

1.  Open the Customizations panel via the “…” dropdown at the top of the editor’s agent panel.
2.  Navigate to the Rules panel.
3.  Click **+ Global** to create new Global Rules, or **+ Workspace** to create new Workspace-specific rules.

A Rule itself is simply a Markdown file, where you can input the constraints to guide the Agent to your tasks, stack, and style.

Rules files are limited to 12,000 characters each.

## Global Rules<a href="#global-rules" class="deep-link-anchor" aria-label="Link to section">link</a>

Global rules live in ~/.gemini/GEMINI.md and are applied across all workspaces.

## Workspace Rules<a href="#workspace-rules" class="deep-link-anchor" aria-label="Link to section">link</a>

Workspace rules live in the .agents/rules folder of your workspace or git root.

At the rule level you can define how a rule should be activated:

- Manual: The rule is manually activated via at mention in Agent’s input box.
- Always On: The rule is always applied.
- Model Decision: Based on a natural language description of the rule, the model decides whether to apply the rule.
- Glob: Based on the glob pattern you define (e.g., *.js, src/\*\*/*.ts), the rule will be applied to all files that match the pattern.

Note: Antigravity now defaults to .agents/rules, but still maintains backward support for .agent/rules.

## @ Mentions<a href="#-mentions" class="deep-link-anchor" aria-label="Link to section">link</a>

You can reference other files using @filename in a Rules file. If filename is a relative path, it will be interpreted relative to the location of the Rules file. If filename is an absolute path, it will be resolved as a true absolute path, otherwise it will be resolved relative to the repository. For example, @/path/to/file.md will first attempt to be resolved to /path/to/file.md, and if that file does not exist, it will be resolved to workspace/path/to/file.md.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
