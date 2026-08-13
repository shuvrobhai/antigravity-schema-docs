---
source: 24
category: docs
title: Allowlist / Denylist
url: "https://antigravity.google/docs/ide/allowlist-denylist"
final_url: "https://antigravity.google/docs/ide/allowlist-denylist"
fetched: 2026-08-13
status: 200
---
# Allowlist / Denylist

The browser uses a two-layer security system to control which URLs can be accessed:

- **Denylist** - Deny dangerous/malicious URLs
- **Allowlist** - Explicitly allow trusted URLs

## How It Works

### Denylist

The denylist is maintained and enforced using the Google Superroots’s BadUrlsChecker service (See documentation). When the browser attempts to navigate to a URL, the hostname is checked against the server-side denylist via RPC.

**NOTE:** If the server is unavailable, access is denied by default.

### Allowlist

The allowlist is a local text file that you can edit to explicitly trust specific URLs.

![Allowlist](/assets/image/docs/browser-allowlist.png)

The allowlist is initialized with just localhost, and can be edited at anytime.

When the browser attempts to navigate to a non-allowlisted URL, it will prompt you with an “always allow” button, which if clicked will add the URL to the allowlist and enable the browser to open and interact with the web page. An example situation is shown below:

![Always Allow](/assets/image/docs/always-allow-url.png)

You can also add/remove URLS from the allowlist manually. However, the denylist always takes precedence: you cannot allowlist a URL that appears on the denylist.
