---
source: 31
category: docs
title: Installation & Auth
url: "https://antigravity.google/docs/cli/install"
final_url: "https://antigravity.google/docs/cli/install"
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
- Installation & Auth

<div class="markdown-content" data-astro-cid-zfittpdt="">

# Installation & auth<a href="#installation--auth" class="deep-link-anchor" aria-label="Link to section">link</a>

Install Antigravity CLI, configure enterprise requirements, and establish secure authenticated sessions.

## Installation<a href="#installation" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI runs natively on macOS, Linux, and Windows. Use the platform-specific scripts below to install or upgrade the binary on your system.

### macOS and Linux<a href="#macos-and-linux" class="deep-link-anchor" aria-label="Link to section">link</a>

Execute the native installer script to download and install the executable to `~/.local/bin/agy`:

<div class="code-container" data-code-container="" data-clean-code="curl -fsSL https://antigravity.google/cli/install.sh | bash" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">bash</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` bash
curl -fsSL https://antigravity.google/cli/install.sh | bash
```

</div>

</div>

### Windows<a href="#windows" class="deep-link-anchor" aria-label="Link to section">link</a>

The installation script registers the `agy` binary to your local user directory: `C:\Users\<Username>\AppData\Local\agy\bin` (where `<Username>` represents your active Windows user profile).

**PowerShell**: Open PowerShell and execute the following installation script:

<div class="code-container" data-code-container="" data-clean-code="irm https://antigravity.google/cli/install.ps1 | iex" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">powershell</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` powershell
irm https://antigravity.google/cli/install.ps1 | iex
```

</div>

</div>

**CMD**: Open a standard Command Prompt and execute:

<div class="code-container" data-code-container="" data-clean-code="curl -fsSL https://antigravity.google/cli/install.cmd -o install.cmd &amp;&amp; install.cmd &amp;&amp; del install.cmd" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">cmd</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

``` cmd
curl -fsSL https://antigravity.google/cli/install.cmd -o install.cmd && install.cmd && del install.cmd
```

</div>

</div>

### Installation flags<a href="#installation-flags" class="deep-link-anchor" aria-label="Link to section">link</a>

When executing the installation scripts, you can append the following customization flags:

- `--skip-aliases`: Bypasses shell profile alias purging (prevents the script from purging or updating legacy `agy` or `antigravity` shell aliases).
- `--skip-path`: Bypasses shell profile `PATH` appending (prevents the script from modifying your shell profile’s dynamic environment variables).

## Authentication workflows<a href="#authentication-workflows" class="deep-link-anchor" aria-label="Link to section">link</a>

Antigravity CLI uses secure credentials and token profiles to communicate with the shared agent harness.

### Local silent keyring sign-in<a href="#local-silent-keyring-sign-in" class="deep-link-anchor" aria-label="Link to section">link</a>

When launching `agy` on your local machine, the CLI attempts to access your operating system’s native secure keyring (such as Apple Keychain, Linux Secret Service/dbus, or Windows Credential Manager). If a valid token profile is found, the CLI authenticates your session silently without opening a browser.

If no saved session is found:

1.  The CLI automatically launches your local default web browser.
2.  Sign in using your approved account credentials.

### Remote SSH OAuth flow<a href="#remote-ssh-oauth-flow" class="deep-link-anchor" aria-label="Link to section">link</a>

When running over SSH, the CLI detects the remote connection environment. Because it cannot launch a local web browser, the CLI initiates a manual URL loop:

1.  Launch `agy` in your remote terminal session.
2.  The CLI detects the SSH environment and prints a unique, secure authorization URL.
3.  Copy this URL and paste it into a web browser on your local machine.
4.  Sign in with your approved credentials and complete the authentication.
5.  The browser displays a unique alphanumeric authorization code.
6.  Copy this code, return to your remote SSH terminal, and paste it into the prompt.

## Managing your session<a href="#managing-your-session" class="deep-link-anchor" aria-label="Link to section">link</a>

Terminating your session clears active credentials and local cache directories.

### Logging out<a href="#logging-out" class="deep-link-anchor" aria-label="Link to section">link</a>

To disconnect your account and purge saved authentication profiles from your operating system’s keyring, run the following command in the CLI prompt box:

<div class="code-container" data-code-container="" data-clean-code="/logout" data-astro-cid-4g3kud3p="">

<div class="header" data-astro-cid-4g3kud3p="">

<span class="title caption" data-astro-cid-4g3kud3p="">text</span>

</div>

content_copy

<div class="snippet-area" data-astro-cid-4g3kud3p="">

```
/logout
```

</div>

</div>

## Next steps<a href="#next-steps" class="deep-link-anchor" aria-label="Link to section">link</a>

Once you complete installation and authentication, start interacting with your local agent:

- **[Tutorial](/docs/cli/tutorial)**: Create and run a basic Python project with an agent.
- **[Prompting & Interaction](/docs/cli/prompting)**: Explore multiline text editing, interrupt commands, and terminal media pasting.
- **[Permissions & Sandbox](/docs/cli/sandbox)**: Configure secure filesystem directories and command limits.

</div>

</div>

<div class="docs-nav docs-section-nav" data-toc="" data-astro-cid-zfittpdt="">

<div class="docs-nav-scroll" data-astro-cid-zfittpdt="">

<span class="page-container-header" data-astro-cid-zfittpdt="">On this Page</span>

</div>

</div>

</div>

</div>
