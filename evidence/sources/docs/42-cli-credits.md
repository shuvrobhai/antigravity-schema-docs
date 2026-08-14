---
source: 42
category: docs
title: AI Credits
url: "https://antigravity.google/docs/cli/credits"
final_url: "https://antigravity.google/docs/cli/credits"
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
- Antigravity CLI
  <span class="breadcrumb-separator" data-astro-cid-zfittpdt="">\></span>
- AI Credits

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Managing AI Credits & Quotas<a href="#managing-ai-credits--quotas" class="deep-link-anchor" aria-label="Link to section">link</a>

The Antigravity CLI integrates with your subscription to monitor and manage your AI Premium credits and usage quotas.

For a detailed explanation of baseline quotas, how credits are consumed, and plan eligibility, please refer to the main **[Plans](/docs/plans)** page.

## Quota Tracking<a href="#quota-tracking" class="deep-link-anchor" aria-label="Link to section">link</a>

You can monitor your active quota and credit consumption directly inside the CLI:

- **Statusline Indicator**: The right side of the CLI statusline displays your remaining credit count (e.g., `AI Credits: 42`).
- **Low Quota Alert**: When your remaining AI credits drop below the warning threshold, the statusline indicator highlights to warn you that your limits are near.

## Slash Commands & Managing Balance<a href="#slash-commands--managing-balance" class="deep-link-anchor" aria-label="Link to section">link</a>

You can query your credits or buy additional quota directly from the CLI:

- **Query Balance**: Run the **[AI Credits Command](/docs/cli/commands/credits)** to open the dedicated credits panel. This panel displays your detailed credit usage statistics.
- **Managing Credits**: You can easily purchase AI credits or upgrade your subscription, which opens a panel containing direct pricing and subscription portal links.

## Settings Configuration<a href="#settings-configuration" class="deep-link-anchor" aria-label="Link to section">link</a>

To control when and how your AI credits are used, you can toggle credit settings in your `settings.json` file:

<div class="code-container" data-code-container="" data-clean-code="{
    &quot;useG1Credits&quot;: true
}" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">json</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` json
{
  "useG1Credits": true
}
```

</div>

</div>

- **Use AI Credits Option**: Run `/config` or `/settings` to open the CLI settings panel. Set the **Use G1 Credits** field to **on** to allow the CLI to use your personal credits when plan quotas are exhausted, or set it to **off** to restrict fallback billing. (To learn more, see the **[Plans](/docs/plans#overages)** overages section).

## See also<a href="#see-also" class="deep-link-anchor" aria-label="Link to section">link</a>

- **[AI Credits Command](/docs/cli/commands/credits)**: View and manage your credits interactively in the TUI.
- **[Model Quotas Command](/docs/cli/commands/usage)**: Monitor your model-specific API quotas.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
