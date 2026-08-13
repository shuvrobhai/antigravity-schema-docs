---
source: 43
category: community
title: Build Custom Commands
url: "https://dev.to/volodymyr_nehir/how-to-build-custom-commands-for-gemini-cli-and-antigravity-49mb"
final_url: "https://dev.to/volodymyr_nehir/how-to-build-custom-commands-for-gemini-cli-and-antigravity-49mb"
fetched: 2026-08-13
status: 200
---
In the rapidly evolving world of AI CLI tools like Gemini CLI and Antigravity, the way we interact with autonomous agents is changing. Instead of writing complex, platform-specific plugins, custom commands are now officially merged with and built as Agent Skills.

This means that to create a custom command (which you can trigger via a slash command like `/my-command`), you simply need to create a skill using the open Agent Skills standard. Because tools like Gemini CLI and Antigravity share this open standard, you can build your command once in a global directory, and all compatible agents will be able to discover and use it.

Here is a step-by-step guide on how to build a custom command using this modern approach.

1.  Create the Directory Structure Commands are defined by a directory containing a `SKILL.md` file. You can create this folder either locally for a specific project or globally for cross-agent compatibility.

For a project-specific command:\

    mkdir -p .gemini/skills/my-command/

For a global command (available to all compatible agents on your machine):\

    mkdir -p ~/.agents/skills/my-command/

For a antigravity:\

    mkdir -p ~/.gemini/antigravity/skills/my-command/

1.  Create the SKILL.md Definition File Inside your new directory, create a `SKILL.md` file. To define how the command is invoked, you must start the file with a YAML frontmatter block.

The name field in this block is what dictates your slash command. For example, setting name: `my-command` creates the `/my-command` console command.

Here is the exact boilerplate you need:\

    ---
    name: my-command
    description: "A brief description of what this command does."
    argument-hint: [optional-arguments]
    disable-model-invocation: true
    ---

    # Instructions
    You are helping to execute my custom command.
    User input: $ARGUMENTS

    Step 1. Do the following tasks...

- Pro Tip: Setting `disable-model-invocation: true`is highly recommended for custom commands. This prevents the AI agent from triggering the workflow on its own and ensures the script only runs when you explicitly type the command. You can also use the `$ARGUMENTS` variable to automatically pass anything you type after the slash command directly into the agent's prompt.

1.  Add Execution Logic (Optional) If your command requires the agent to execute specific code (like an audit script, a database migration, or a deployment script), you can bundle those scripts inside a `scripts/` subfolder within your command's directory.

For instance, you could create `.gemini/skills/my-command/scripts/action.js.` You can then instruct the agent in your `SKILL.md` file to execute that specific file using built-in agent tools like `run_shell_command.`

1.  Verify and Use Your Command AI CLI tools like Gemini CLI automatically scan your directories to discover new skills and commands on the fly.

To verify that your new command was registered successfully, simply type the following in your terminal:\

    /skills list

To run your custom command, just type `/my-command` (or whatever name you defined in the YAML block) directly in the chat session.

Have you started building custom Agent Skills for your CLI workflows yet? Let me know what commands you are creating in the comments below!

![pic](https://media2.dev.to/dynamic/image/width=256,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png) [Create template](/settings/response-templates)

Templates let you quickly answer FAQs or store snippets for re-use.

Submit

Preview

[Dismiss](/404.html)

Are you sure you want to hide this comment? It will become hidden in your post, but will still be visible via the comment's [permalink](#).

Hide child comments as well

Confirm

For further actions, you may consider blocking this person and/or [reporting abuse](/report-abuse)
