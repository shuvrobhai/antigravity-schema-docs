---
source: 45
category: community
title: Antigravity CLI
url: "https://learn.arm.com/install-guides/antigravity/"
final_url: "https://learn.arm.com/install-guides/antigravity/"
fetched: 2026-08-13
status: 200
---
Developer Hub Learning Paths Install Guides Antigravity CLI

# Antigravity CLI

###### Antigravity CLI

[](https://github.com/ArmDeveloperEcosystem/arm-learning-paths/issues/new?template=issue-report.md&title=Antigravity%20CLI)

  Log an issue

[](https://github.com/ArmDeveloperEcosystem/arm-learning-paths/edit/main/content/install-guides/antigravity.md)

  Fork and edit

[](https://discord.com/invite/armsoftwaredev)

  Discuss on Discord

## About this Install Guide

|               |              |
|---------------|--------------|
| Reading time: |   15 min     |
| Last updated: |   4 Aug 2026 |

|               |
|---------------|
| Reading time: |
|   15 min      |
| Last updated: |
|   4 Aug 2026  |

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr>
<td>Author:</td>
<td>Jason Andrews, Arm<br />
</td>
</tr>
<tr>
<td>Official docs:</td>
<td><a href="https://www.antigravity.google/docs/cli-overview">View</a></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td>Author:</td>
</tr>
<tr>
<td><ul>
<li>Jason Andrews, Arm</li>
</ul></td>
</tr>
<tr>
<td>Official docs:</td>
</tr>
<tr>
<td><a href="https://www.antigravity.google/docs/cli-overview">View</a></td>
</tr>
</tbody>
</table>

This guide shows you how to install and use the tool with the most common configuration. For advanced options and complete reference information, see the official documentation. Some install guides also include optional next steps to help you explore related workflows or integrations.

Antigravity CLI is Google’s terminal-based interface for interacting with the Antigravity 2.0 agent-first development platform. You can use it to ask questions, perform multi-file code editing, and invoke AI agents directly from your terminal.

Antigravity CLI supports multiple operating systems, including Arm Linux distributions and macOS. It provides AI assistance for developers working on Arm platforms.

In this guide, you’ll learn how to install Antigravity CLI on macOS and Arm Linux, then integrate it with the Arm MCP server for Arm architecture development.

## Before you begin

You need a Google account to use Antigravity CLI. If you don’t have one, visit [Google Account Creation](https://accounts.google.com/signup) to create an account.

After installation, running the tool (via the `agy` command) will initiate the authentication process:

- Local machine: It will automatically open your default browser for Google Sign-In.
- Remote/SSH sessions: It will detect the environment and print a secure authorization URL that you can copy and open in your local browser to complete the login.

## Install Antigravity CLI on macOS

You can install Antigravity CLI on macOS using either the official one-liner script or Homebrew.

### (Recommended) Install using the official installer script

To install using the official installer script, first verify that `curl` is available on your system. Then, run the installer:

` curl -fsSL https://antigravity.google/cli/install.sh | bash `

The installer detects your macOS environment and downloads the appropriate binary. By default, the binary is installed to `~/.local/bin`.

To run the command globally, ensure this directory is included in your system’s `PATH`. Add the following line to your shell configuration file (For example, `~/.zshrc` or `~/.bash_profile`):

` export PATH="$HOME/.local/bin:$PATH" `

Apply the changes to your current terminal session:

` source ~/.zshrc `

### Install using Homebrew

If you prefer using Homebrew for package management, you can install the CLI using the Homebrew cask:

` brew install --cask antigravity-cli `

## Install Antigravity CLI on Arm Linux

You can install Antigravity CLI on Arm Linux distributions using the official installer script. This method works on all major Arm Linux distributions including Ubuntu, Debian, and CentOS.

### Prerequisite packages

Before running the installer, make sure you have `curl` installed on your system.

Install `curl` on Ubuntu/Debian systems:

` sudo apt update && sudo apt install -y curl `

If you are not using Ubuntu/Debian, use your distribution’s package manager to install `curl`.

### Install using the installer script

With `curl` installed, run the installation script:

` curl -fsSL https://antigravity.google/cli/install.sh | bash `

The script automatically detects the CPU architecture (such as `aarch64` / `arm64`) and installs the compatible Arm Linux binary to `~/.local/bin`.

Ensure the installation directory is in your `PATH` by adding it to your shell configuration file (For example, `~/.bashrc` or `~/.zshrc`):

` export PATH="$HOME/.local/bin:$PATH" `

Apply the changes:

` source ~/.bashrc `

## Confirm Antigravity CLI is working

Verify the installation is successful by checking the version of the `agy` binary:

` agy --version `

The output is similar to:

` 1.1.10 `

Start an interactive session to authenticate and test basic functionality:

` agy `

The command launches the terminal user interface (TUI). On your first run, follow the prompt to authenticate with your Google account. After you’ve authenticated, you can start asking questions.

### View the available command-line options

To print the available commands and options, use the `--help` flag:

` agy --help `

Inside the interactive TUI session, you can type `?` to list all available slash commands (For example, `/settings`, `/clear`, `/fork`, `/logout`).

If you are migrating from the older Gemini CLI, you can use the built-in migration command to import your existing settings, skills, and configuration:

` agy plugin import gemini `

## Configure context for Arm development

You can use context configuration to provide the Antigravity agent with persistent information about your development environment, preferences, and project details. Context helps the agent generate relevant and tailored responses for Arm architecture development.

### Create a context file

Antigravity CLI respects both global and workspace-level context files to guide agent behavior:

- Global context: The CLI automatically loads and enforces user-wide rules located at `~/.gemini/GEMINI.md` across all workspaces.
- Workspace context: The CLI reads `.antigravity.md` (recommended for Antigravity CLI) or `GEMINI.md` (fully supported for backward compatibility), as well as `AGENTS.md` from your active project directory. If both `.antigravity.md` and `GEMINI.md` are present, `.antigravity.md` takes precedence.

Create the global configuration directory if it doesn’t already exist:

` mkdir -p ~/.gemini `

Create a global context file with your Arm development preferences. For example:

` cat > ~/.gemini/GEMINI.md << 'EOF' I am an Arm Linux developer. I prefer Ubuntu and other Debian based distributions. I don't use any x86 computers so please provide all information assuming I'm working on Arm Linux. Sometimes I use macOS and Windows on Arm, but please only provide information about these operating systems when I ask for it. EOF `

### Manage settings

Antigravity CLI settings are stored in `~/.gemini/antigravity-cli/settings.json`. You can manage settings in two ways:

- Interactive menu: Run `agy` and type `/settings` or `/config` to open a full-screen overlay menu to browse and modify settings.
- Manual editing: Open `~/.gemini/antigravity-cli/settings.json` in a text editor to update your preferences manually.

------------------------------------------------------------------------

## Integrate the Arm MCP Server with Antigravity CLI

The Arm Model Context Protocol (MCP) Server provides Antigravity CLI with specialized tools and knowledge for Arm architecture development, migration, and optimization. By integrating the Arm MCP Server, you gain access to Arm-specific documentation, code analysis tools, and optimization recommendations.

Unlike the older Gemini CLI which stored MCP settings inline inside `settings.json`, Antigravity CLI uses a dedicated configuration file for managing MCP servers.

### Set up the Arm MCP Server with Docker

The Arm MCP Server runs as a Docker container that Antigravity CLI connects to using the Model Context Protocol.

First, ensure Docker is installed and running on your system. If needed, follow the [Docker installation guide](/install-guides/docker/) to set up Docker.

After ensuring Docker is running, pull the Arm MCP server Docker image:

` docker pull armlimited/arm-mcp:latest `

### Configure Antigravity CLI to use the Arm MCP Server

Create or update the dedicated global MCP configuration file at `~/.gemini/antigravity-cli/mcp_config.json` (or `.agents/mcp_config.json` inside your active workspace to enable it only for a specific project).

Add the following JSON configuration to `~/.gemini/antigravity-cli/mcp_config.json`:

` { "mcpServers": { "arm_mcp_server": { "command": "docker", "args": [ "run", "--rm", "-i", "--pull=always", "-v", "/path/to/your/workspace:/workspace", "-v", "/path/to/your/ssh/private_key:/run/keys/ssh-key.pem:ro", "-v", "/path/to/your/ssh/known_hosts:/run/keys/known_hosts:ro", "armlimited/arm-mcp:latest" ], "env": {} } } } `

Replace `/path/to/your/workspace`, `/path/to/your/ssh/private_key`, and `/path/to/your/ssh/known_hosts` with your workspace directory, SSH private key, and `known_hosts` file to enable remote testing features on your target device.

### (Optional) Use alternative container tools

If you prefer not to use Docker, you can run the Arm MCP Server using other compatible container tools such as Podman, Finch, Colima, or Rancher Desktop.

Select your container tool from the following tabs to view setup instructions and configuration for `~/.gemini/antigravity-cli/mcp_config.json`:

Install [Podman](https://podman.io/docs/installation) .

Pull the Arm MCP Server image:

` podman pull armlimited/arm-mcp:latest `

Add the following configuration to `~/.gemini/antigravity-cli/mcp_config.json`:

` { "mcpServers": { "arm_mcp_server": { "command": "podman", "args": [ "run", "--rm", "-i", "--pull=always", "-v", "/path/to/your/workspace:/workspace", "-v", "/path/to/your/ssh/private_key:/run/keys/ssh-key.pem:ro", "-v", "/path/to/your/ssh/known_hosts:/run/keys/known_hosts:ro", "armlimited/arm-mcp:latest" ], "env": {} } } } `

Install [Finch](/install-guides/finch/) .

Pull the Arm MCP Server image:

` finch pull armlimited/arm-mcp:latest `

Add the following configuration to `~/.gemini/antigravity-cli/mcp_config.json`:

` { "mcpServers": { "arm_mcp_server": { "command": "finch", "args": [ "run", "--rm", "-i", "--pull=always", "-v", "/path/to/your/workspace:/workspace", "-v", "/path/to/your/ssh/private_key:/run/keys/ssh-key.pem:ro", "-v", "/path/to/your/ssh/known_hosts:/run/keys/known_hosts:ro", "armlimited/arm-mcp:latest" ], "env": {} } } } `

Install [Colima](https://github.com/abiosoft/colima#installation) .

Colima is a lightweight, open-source command-line alternative to Docker Desktop (primarily for macOS). It runs a minimal virtual machine in the background, allowing you to use your standard `docker` command-line tool without installing Docker Desktop.

Pull the Arm MCP Server image:

` docker pull armlimited/arm-mcp:latest `

Add the following configuration to `~/.gemini/antigravity-cli/mcp_config.json`:

` { "mcpServers": { "arm_mcp_server": { "command": "docker", "args": [ "run", "--rm", "-i", "--pull=always", "-v", "/path/to/your/workspace:/workspace", "-v", "/path/to/your/ssh/private_key:/run/keys/ssh-key.pem:ro", "-v", "/path/to/your/ssh/known_hosts:/run/keys/known_hosts:ro", "armlimited/arm-mcp:latest" ], "env": {} } } } `

Install [Rancher Desktop](https://docs.rancherdesktop.io/getting-started/installation/) .

Rancher Desktop uses Docker via Moby.

Pull the Arm MCP Server image:

` docker pull armlimited/arm-mcp:latest `

Add the following configuration to `~/.gemini/antigravity-cli/mcp_config.json`:

` { "mcpServers": { "arm_mcp_server": { "command": "docker", "args": [ "run", "--rm", "-i", "--pull=always", "-v", "/path/to/your/workspace:/workspace", "-v", "/path/to/your/ssh/private_key:/run/keys/ssh-key.pem:ro", "-v", "/path/to/your/ssh/known_hosts:/run/keys/known_hosts:ro", "armlimited/arm-mcp:latest" ], "env": {} } } } `

### Verify the Arm MCP Server is working

Start an interactive Antigravity CLI session:

` agy `

Use the `/mcp` command to list the active MCP servers and verify that `arm_mcp_server` is running and ready:

` /mcp `

The output lists the Arm MCP Server tools and is similar to:

` MCP Servers Plugins (~/.gemini/antigravity-cli/plugins) > ✓ arm_mcp_server Tools: knowledge_base_search, check_image, sysreport_instructions, migrate_ease_scan, apx_recipe_run, +2 more `

### Use Arm prompt files with the MCP server

To guide the agent in using MCP tools effectively across common Arm development tasks, pair the MCP server with Arm-specific prompt files.

Browse the [agent integrations directory](https://github.com/arm/mcp/tree/main/agent-integrations/gemini) to find prompt files for specific use cases, such as Arm migration ( [arm-migration.toml](https://github.com/arm/mcp/blob/main/agent-integrations/gemini/arm-migration.toml) ). The Arm migration prompt file helps the agent systematically migrate applications from x86 to Arm, including dependency analysis, compatibility checks, and optimization recommendations.

If you are facing issues or have questions, reach out to <mcpserver@arm.com> .

## Next steps

You’re now ready to use Antigravity CLI for Arm architecture development, migration, and optimization.

To test a workflow for migrating an application from x86 to Arm, see the Learning Path [Automate x86-to-Arm application migration using the Arm MCP server](/learning-paths/servers-and-cloud-computing/arm-mcp-server/) .

\

## Give Feedback

How would you rate this tool quick-install guide?

What is the primary reason for your feedback ?

Missing information\
Too complicated / unclear steps\
Code problems\
Out of date Easy to understand\
Solved my problem\
Excellent code snippets

   Please select a reason before submitting.

Thank you! We're grateful for your feedback.

- Have more feedback? [Log an issue on GitHub.](https://github.com/ArmDeveloperEcosystem/arm-learning-paths/issues/new?title=Feedback%20-%20Install%20Guides)
- Want to collaborate? [Join our Discord server.](https://discord.com/invite/armsoftwaredev)
