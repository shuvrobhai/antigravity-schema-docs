---
source: 16
category: docs
title: Troubleshooting
url: "https://antigravity.google/docs/cli/troubleshooting"
final_url: "https://antigravity.google/docs/cli/troubleshooting"
fetched: 2026-08-13
status: 200
---
# Troubleshooting

Diagnose and resolve common anomalies with installation PATHs, local self-updating locks, keyring access permissions, and SSH clipboard forwarding.

## Quick reference

Scan the lookup table below to identify symptoms and access immediate solutions:

| Error Symptom | Potential Cause | Target Resolution |
|----|----|----|
| **`agy: command not found`** | Binary directory missing from shell environments. | [Configure your shell PATH](#configure-your-shell-path) |
| **`keyring: secure lock out`** | Missing system service permissions or active lockouts. | [Authorize keyring permissions](#authorize-keyring-permissions) |
| **`SSH Clipboard paste failures`** | Protocol streams blocked or missing forward configurations. | [Enable emulator clipboard forwarding](#enable-emulator-clipboard-forwarding) |
| **`Advisory lock / update failures`** | Locked self-updater thread or read-only directory paths. | [Resolve self-updater locks and failures](#resolve-self-updater-locks-and-failures) |

------------------------------------------------------------------------

## Configure your shell PATH

### Symptom

Executing `agy` returns a shell terminal error:

content_copy

    bash: agy: command not found

### Cause

The installation utility downloads the binary to `~/.local/bin` (or `C:\Users\<Username>\AppData\Local\agy\bin`), but your shell’s active `$PATH` environment does not index this directory.

### Resolution

Ensure your terminal session loads the binary path.

**macOS & Linux**:

1.  Open your shell configuration file (`~/.bashrc` or `~/.zshrc`).

2.  Verify or append the following line at the end of the file:

    content_copy

        export PATH="~/.local/bin:$PATH"

3.  Reload your profile configurations:

    content_copy

        source ~/.zshrc

**Windows (PowerShell)**:

1.  Open a PowerShell terminal as an Administrator and execute:

    content_copy

        [System.Environment]::SetEnvironmentVariable("Path", [System.Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\Google\antigravity-cli", "User")

2.  Restart your terminal emulator for the system registry environment to refresh.

------------------------------------------------------------------------

## Authorize keyring permissions

### Symptom

When launching, the CLI hangs, prints DBUS warnings, or throws keyring access exceptions:

content_copy

    Error: failed to retrieve token: secret keyring is locked

### Cause

Antigravity CLI utilizes secure keychain libraries (Apple Keychain, Linux secret-service via dbus, or Windows Credential Manager) to encrypt your session tokens. If the background daemon is locked or headless, the CLI cannot read credentials.

### Resolution

**macOS**:

1.  Open **Keychain Access** app.

2.  Search for the `Antigravity CLI` security item.

3.  Right-click, select **Get Info**, choose the **Access Control** tab, and verify that `agy` is on the allowed applications list.

4.  If running inside a headless SSH session on Mac, run the following unlock sequence:

    content_copy

        security unlock-keychain -p "your_keychain_password" login.keychain

**Linux**:

Ensure your system keyring (such as GNOME Keyring or KWallet) is unlocked and accessible.

If you are running in a headless environment or over SSH, ensure that a D-Bus session is active and that your keyring daemon is running. You can typically initialize a D-Bus session by running:

content_copy

    export $(dbus-launch)

If you still experience access issues, ensure your user account has the necessary permissions to access the keyring service or reach out to support.

------------------------------------------------------------------------

## Enable emulator clipboard forwarding

### Symptom

Pasting screenshots or media files via `Ctrl+V` within an SSH terminal returns a failure notification:

content_copy

    Error: local pasteboard is empty or unreachable over SSH connection

### Cause

Standard SSH streams do not forward graphical clipboards. Graphic uploads require specific terminal multiplexer protocols.

### Resolution

Verify that you are utilizing supported terminal emulators and configurations.

1.  **Use iTerm2 or Ghostty**: These emulators support advanced clip channels.

2.  **Configure iTerm2 Forwarding**:
    - Open iTerm2 Preferences (`Cmd+,`).
    - Go to the **General** tab, select **Selection** submenu.
    - Check **Applications in terminal may access clipboard** (enabling OSC 52 write channels).

3.  **Bypass Multiplexers**: If running inside `tmux`, ensure your active configuration maps standard paste clips correctly:

    content_copy

        set -s set-clipboard on

------------------------------------------------------------------------

## Resolve self-updater locks and failures

### Symptom

Launching `agy` hangs, fails to apply upgrades, or returns an advisory lock warning:

content_copy

    Warning: another background updater process is already active (update.lock)

### Cause

Antigravity CLI contains a native, statically linked self-updater that runs in the background. It uses a 15-minute Time-To-Live (TTL) debounce marker (`last_check.timestamp`) and an advisory lock (`update.lock`) inside `~/.gemini/antigravity-cli/updater/` to prevent concurrent process collisions. If a background updater process hangs, crashes without releasing the lock, or has insufficient user filesystem permissions inside the executable directory, subsequent updates are blocked.

### Resolution

- **Release the advisory lock**: Purge the background lock file manually:

  content_copy

      rm -f ~/.gemini/antigravity-cli/updater/update.lock

- **Opt-out/Disable auto-updates**: Set the `AGY_CLI_DISABLE_AUTO_UPDATE` environment variable to `true` inside your shell profile (`~/.bashrc` or `~/.zshrc`):

  content_copy

      export AGY_CLI_DISABLE_AUTO_UPDATE=true

- **Verify directory write permissions**: Ensure your user profile owns and has write permissions inside the target installation directory (`~/.local/bin/` on Unix, or `%LOCALAPPDATA%\agy\bin` on Windows).

------------------------------------------------------------------------

## Next steps

Access our quick reference sheets or configure advanced permissions:

- **[CLI Reference](/docs/cli/reference)**: Dense tables listing all slash commands and visual settings keys.
- **[Permissions](/docs/cli/permissions)**: Configure fine-grained allowed and denied action policies.
- **[Sandbox](/docs/cli/sandbox)**: Enforce OS-level container isolation boundaries.
- **[Plugins & Skills](/docs/cli/plugins)**: Create your own custom skills.
