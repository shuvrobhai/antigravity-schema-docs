---
source: 32
category: google
title: Getting Started with Google Antigravity
url: "https://codelabs.developers.google.com/getting-started-google-antigravity"
final_url: "https://codelabs.developers.google.com/getting-started-google-antigravity"
fetched: 2026-08-13
status: 200
---
# Getting Started with Google Antigravity

## 1. Introduction

In this codelab, you will learn about [Google Antigravity](https://antigravity.google/), an agentic development platform that is designed to help you develop in this era of agents. Antigravity 2.0 serves as your AI agents' central command center, providing a unified platform to launch, monitor, and orchestrate their activities.

With the 2.0 launch, Antigravity is no longer just an Agent Manager integrated with an IDE. It is now a complete ecosystem of products designed for the agent-first era:

- Antigravity: The flagship standalone application for macOS, Linux, and Windows. This is your command center to manage multiple local agents in parallel, run scheduled tasks and more. Unlike its predecessor, the Agent Manager, Antigravity 2.0 is a standalone application that functions independently of an IDE.
- Antigravity IDE: The original fully-featured, agentic IDE remains available (and recommended for developers!). It comes with the agent manager, artifacts, and a deep understanding of your codebase.
- Antigravity CLI: A command-line interface for terminal-based agent interactions. This will not be covered in this tutorial.
- Antigravity SDK: Tools for developers to programmatically integrate Antigravity into their own systems. This will not be covered in this tutorial.

In this codelab, we will heavily focus on Antigravity and touch briefly upon the Antigravity IDE. The other two components, Antigravity CLI and Antigravity SDK, are not covered.

If you are interested in a codelab on Antigravity CLI, which is a terminal-based application, refer to the codelab: [Getting Started with Antigravity CLI](https://codelabs.developers.google.com/antigravity-cli-hands-on).

### **What you'll learn**

- Installing and configuring Antigravity.
- Exploring key concepts of Antigravity like working with Agents, Workspaces and more.
- Customizing Antigravity via various settings and as per your preferences.

### **What you'll need**

Antigravity needs to be locally installed on your system. The product is available on Mac, Windows and specific Linux distributions. In addition to your own machine, you will need the following:

- Chrome web browser.
- A Gmail account (Personal Gmail account).

This codelab is designed for users and developers of all levels.

### **Reporting issues**

As you work through the codelab and with Antigravity, you might encounter problems.

For codelab related issues (typos, wrong instructions), please open a bug with the `Report a mistake` button in the bottom-left corner of this codelab:

![e7d8a6055a16a773.png](/static/getting-started-google-antigravity/img/e7d8a6055a16a773.png)

For bugs or feature requests related to Antigravity, please report the issue within Antigravity. You can report product feedback by clicking on Settings, available in the bottom left corner of the Antigravity product. And then choosing the option `Provide Feedback`.

## 2. Installation

## Installing Antigravity

Go to the [Google Antigravity download page](https://antigravity.google/download) page. Download the Antigravity application for your operating system (macOS, Linux, or Windows).

![31e6370c1744fe73.png](/static/getting-started-google-antigravity/img/31e6370c1744fe73.png)

Run the installer. It shows the following screen:

![4783c8ff21fbc6e7.png](/static/getting-started-google-antigravity/img/4783c8ff21fbc6e7.png)

Login with your Google account. Complete the authentication and it should show the following:

![12fa8752446a0458.png](/static/getting-started-google-antigravity/img/12fa8752446a0458.png)

Click on **Open Antigravity**. It will show a Security and Data Use policy. Click on **Next**.

![8f2fe904767c34b.png](/static/getting-started-google-antigravity/img/8f2fe904767c34b.png)

Select a Theme that you like:

![cc2466b518c241c9.png](/static/getting-started-google-antigravity/img/cc2466b518c241c9.png)

Antigravity comes with a set of plugins that work with various Google Developer Tools. These plugins install a set of skills that helps Antigravity to work with various developer tools of Google. Here is a list of plugins that you can optionally choose to install. We won't be covering these plugins in the codelab. Click on **Finish**.

![3919ac5f462a5dfc.png](/static/getting-started-google-antigravity/img/3919ac5f462a5dfc.png)

You should see the Antigravity interface as follows:

![319cf98d41231a82.png](/static/getting-started-google-antigravity/img/319cf98d41231a82.png)

## Install Antigravity IDE

You can optionally choose to install the Antigravity IDE. Navigate to the [Google Antigravity download page](https://antigravity.google/download). Go to the Antigravity IDE downloads section.

![6d05924ef8098ae.png](/static/getting-started-google-antigravity/img/6d05924ef8098ae.png)

On successful installation of both Antigravity and Antigravity IDE, you will see two icons in your dock: **Antigravity** (white background) and **Antigravity IDE** (black grid background).

![97b7906262ed8246.png](/static/getting-started-google-antigravity/img/97b7906262ed8246.png)

## 3. Antigravity Interface

We are ready to get started! Let's focus first on using Antigravity. The initial Antigravity screen is similar to this one:

![4b2ebaf5bbaa6a27.png](/static/getting-started-google-antigravity/img/4b2ebaf5bbaa6a27.png)

We will get to the **Settings** option in the lower left corner, as we go along this tutorial, as we need.

## Projects

Let's understand the concept of **Projects** first in Antigravity. This is key because if you notice the interface in the right pane, it clearly says **Select Project** and Antigravity uses a project-centric approach to ensure the agents have access to the right files, tools, permissions and more.

A project is a combination of folders defining the environment and the scope of your agent. Instead of forcing an agent to operate within a single folder, a project can work with one or multiple folders (e.g., a frontend and a backend repo), providing your agents with all of the context required for your codebase. All projects have their own isolated agent settings, allowing you to customize different projects' security settings independently.

Let's create our first project. In your home folder on your local machine, create a folder named `$HOME/agy2-projects/my-first-project` . Note that it does not have to be an empty folder.

We are now going to create our first project in Antigravity by defining what folders constitute the project. In our initial case, it will be one folder.

Click on **Select Project → New Project** as shown below:

![8fb15004219d1d6d.png](/static/getting-started-google-antigravity/img/8fb15004219d1d6d.png)

As expected, it asks you to **Select folder(s)** as shown below:

![3b194f9234cbf9ca.png](/static/getting-started-google-antigravity/img/3b194f9234cbf9ca.png)

Click on **Add Folder** and navigate to select the specific folder i.e. `$HOME/agy2-projects/my-first-project`

![f907f3b64cf0d6a0.png](/static/getting-started-google-antigravity/img/f907f3b64cf0d6a0.png)

You can still add more folders to the project, as you can notice (via **Add Folder**), but for now, we can click on the **Next** button.

This brings up a dialog as shown below. All projects have their own isolated agent settings, allowing you to customize different project security settings independently.

![45a29e5c40bf3ae7.png](/static/getting-started-google-antigravity/img/45a29e5c40bf3ae7.png)

Each project inherits permissions around reviewing artifacts, tools allowed, Model Context Protocol (MCP) Server configuration from a global configuration that is available via **Settings** in the main interface. However, you can set individually these permissions and more per project, thereby getting a lot more flexibility and keeping the context and tools lean and mean for your specific project.

For now, choose the **Default** option.

You can also name your project in the next dialog and click **Create**:

![529d6c23ef880f5.png](/static/getting-started-google-antigravity/img/529d6c23ef880f5.png)

You will now see the following screen. The project shows up on the projects list and also in the chat interface as shown. Notice that you can select the model, pass additional context via the + sign or @ or / actions and more.

![f2bfdb27bc878643.png](/static/getting-started-google-antigravity/img/f2bfdb27bc878643.png)

Once you greet the agent with a message, it responds accordingly.

![7e4027bd7a9505e3.png](/static/getting-started-google-antigravity/img/7e4027bd7a9505e3.png)

We have another request to get the news and it does a good job.

![a5b751531e25f2d3.png](/static/getting-started-google-antigravity/img/a5b751531e25f2d3.png)

## Conversations

In our project (**my-first-project**), we started a conversation thread and currently there is a series of messages (user message and agent responses) that are present in the thread.

You will see that this conversation thread on the left side grouped under the project.

![e650cbd24d8b66ca.png](/static/getting-started-google-antigravity/img/e650cbd24d8b66ca.png)

Now, let's do something interesting and give a name to this conversation thread. Let's call it **conv-introduction**.

To do that Click on the **three vertical dots**, next to the conversation. It will show you 3 options. Choose the **Rename** action.

![244d0bd0fce7a213.png](/static/getting-started-google-antigravity/img/244d0bd0fce7a213.png)

Give the value **conv-introduction** or any name that makes sense to you.

Now, if you'd like to have a completely new conversation in the project, click the **+** (New Conversation in Project) sign next to the project as shown below.

![7b834450020d8c03.png](/static/getting-started-google-antigravity/img/7b834450020d8c03.png)

You are now into a totally new conversation.

Let's ask some sports news from across the world. Note that we are still in the **my-first-project.**

![4b3208b40a03b6d1.png](/static/getting-started-google-antigravity/img/4b3208b40a03b6d1.png)

This gives me some news around the sports world and you can notice that now we have two conversation threads in the same project.

![aaf65af4b2791423.png](/static/getting-started-google-antigravity/img/aaf65af4b2791423.png)

Let's rename this conversation to **conv-sportsnews**. If you'd like to see all the conversations that have happened so far, you can visit the **Conversation History** in the top left as shown below:

![3ed91bba75d70871.png](/static/getting-started-google-antigravity/img/3ed91bba75d70871.png)

At any point in time, you have the option of having a new conversation either in the current project or a new project via the **New Conversation** option at the top.

## Project Settings

Now let's get back to the **Project Settings** that we earlier talked about. When you create a project in Antigravity, it inherits default permissions, which you can override specifically if you'd like.

To get to the project settings for a specific project, click on the settings gear icon next to each project in the left navigation bar.

![7f7158d07780eba9.png](/static/getting-started-google-antigravity/img/7f7158d07780eba9.png)

This will lead you to the specific Project (i.e. **my-first-project**) settings as shown below:

![d73f96c9f4f8f61b.png](/static/getting-started-google-antigravity/img/d73f96c9f4f8f61b.png)

Notice on the left side under projects, the **my-first-project** is selected. If there were more projects, these would be visible under this list and you can easily select any of the projects and tweak their settings as needed.

Now, let's focus on the right side, the project settings shown for **my-first-project.** You will notice that it has the single folder that we had added to this project. You can add more folders from here too.

I suggest that you first go through the entire list and see the flexibility now provided to help you change a ton of settings as per your project customization requirements.

These include:

- **Security Preset**: Determines if all terminal commands and file accesses to be reviewed by you before the agent can perform actions.
- **Agent Behaviour**: Determines whether the agent executes the implementation plan with or without your review.
- **Various Local Permissions** File paths, URLs, etc. allowed or blocked for the agent.
- You can even configure which specific MCP Tools are allowed for this project. This is quite useful to prevent all globally configured MCP Servers to be made available to the agent in this project.

**Note**: At any point in time, you can go to the settings for Antigravity or even projects settings via the main settings option in the Antigravity interface.

![9632f5815b5f00c5.png](/static/getting-started-google-antigravity/img/9632f5815b5f00c5.png)

## 4. Slash Commands

There are some interesting slash **`/`** commands available in Antigravity. In your conversation chat interface, if you type **`/`** , you should see the commands as shown below:

![a6b3198f2b693d8d.png](/static/getting-started-google-antigravity/img/a6b3198f2b693d8d.png)

Consider the **/browser** command. It is an explicit command to launch the browser and ask it to do something.

Try browsing to a website as shown below:

![1a23771f8cc1f7d2.png](/static/getting-started-google-antigravity/img/1a23771f8cc1f7d2.png)

This spawns up a browser sub-agent that attempts to launch a debugging session with Chrome and asks your permission first:

![1380710b74477b94.png](/static/getting-started-google-antigravity/img/1380710b74477b94.png)

Once you allow it, it asks for permissions as needed and gets the details.

![8620b739bc192f7.png](/static/getting-started-google-antigravity/img/8620b739bc192f7.png)![6d592e977d54337b.png](/static/getting-started-google-antigravity/img/6d592e977d54337b.png)

The **/schedule** command is useful if you'd like to set up recurring or one-off tasks for the agent to execute at fixed intervals or on a schedule (e.g. 9:00 AM on Monday, Wednesday).

At the same time, you are provided the same facility to do this via the user interface and that is covered in the **Scheduling Commands** section in the next step.

## 5. Scheduling Commands

You can use the **Schedule** option in the main interface to automate recurring tasks or set one-time reminders in your specific projects.

![4749901a164cd1ad.png](/static/getting-started-google-antigravity/img/4749901a164cd1ad.png)

Let's create a daily task that reminds us of our daily 6 PM meeting. Click on **New** and fill out the details as shown below:

![41865ad9a5242407.png](/static/getting-started-google-antigravity/img/41865ad9a5242407.png)

Click on **Add Scheduled Task** and then will add the task to the list of scheduled tasks as shown below:

![a4cecc4896c59893.png](/static/getting-started-google-antigravity/img/a4cecc4896c59893.png)

Let's add another one that reminds us to take a break every 20 mins:

![e3b75ee01010eb9.png](/static/getting-started-google-antigravity/img/e3b75ee01010eb9.png)

We have two scheduled tasks now, as shown below:

![6d122472143e48f3.png](/static/getting-started-google-antigravity/img/6d122472143e48f3.png)

You can disable or delete any of the tasks. Remember that we have used basic prompts but your prompts could be detailed, could be invoking tools (talking to external systems) and doing a lot more work behind the scenes on a regular interval, based on your requirements.

## 6. Model Context Protocol (MCP) Servers

The Model Context Protocol (MCP) has emerged as the standard to help connect agents to external systems. They play a key role in ensuring that the agent remains grounded in terms of your data and integration.

Antigravity supports MCP servers, both local and remote. It also ships with integrations to several MCP servers that work with Google Cloud services and they are simply one-click installs with a few configuration data.

First, let's see the list of pre-configured MCP server options. Go to **Settings → Customizations** and then **Add MCP+** button to add a new server. This brings up a dialog, where you can see the full list of servers:

![dbde58f6f5f99df9.png](/static/getting-started-google-antigravity/img/dbde58f6f5f99df9.png)

Click on **+Add** button to add any MCP Server. There would be a few pieces of information that you will need to provide like project id, database details, depending on the MCP server.

### Adding existing MCP servers

Behind the scenes, the MCP servers are configured in the `$HOME/.gemini/config/mcp_config.json` file. If you have been working with existing remote MCP servers, you can simply add the details into this file. Check out the section on configuring custom MCP Servers over [here](https://antigravity.google/docs/mcp#connecting-custom-mcp-servers).

Once you have added your remote MCP servers and saved the file, you can go to the MCP servers section in Antigravity as follows:

1.  From the main Antigravity interface, click on **Settings**.
2.  Go to **Customizations**. Click on **Refresh** if you still don't see the MCP servers.

![7d004eba523578fd.png](/static/getting-started-google-antigravity/img/7d004eba523578fd.png)

1.  You can disable any of the MCP servers if you'd like via the **Toggle** button. Alternatively, you can click on any of the MCP servers and see the tools exposed by the server.

To use the configured MCP servers, you can ask Antigravity something that requires an MCP server. For example, you can have the `cloudrun-mcp` server enabled and ask Antigravity the following: `Build and deploy a Cloud Run service`. This should prompt Antigravity to look for and use the `cloudrun-mcp` server to configure and deploy a Cloud Run service.

## 7. Artifacts

Antigravity creates **Artifacts** as it plans and gets its work done as a way to communicate its work and get feedback from the human user. These are rich markdown files, architecture diagrams, images, browser recordings, code diffs, and so on.

Artifacts solve the trust gap. When an agent claims to fix a bug, the developer previously had to read the code to verify. In Antigravity, the agent produces an artifact to prove it.

These are the main artifacts produced by Antigravity:

- `Task Lists`: Before writing code, the agent generates a structured plan. You don't typically need to edit this plan but you can review it and in some cases, add a comment to change it, if needed.
- `Implementation Plan`: This is used to architect changes within your codebase to accomplish a task. These plans contain technical details on what revisions are necessary and are meant to be reviewed by the user, unless you have your artifact review policy set to **Always Proceed**.
- `Walkthrough`: This is created once the agent has completed task implementation, as a summary of the changes and how to test them.
- `Code diffs`: While technically not an artifact, Antigravity also produces code diffs that you can review and comment on.
- `Screenshots`: The agent captures the state of the UI before and after a change.

To understand artifacts better, go ahead and create a conversation with a new or existing project with the following prompt:

`Design a Node application that I can run from the command line to get me the latest news from Google.`

The Agent takes off and comes back with our first artifact: Implementation Plan.

![884916b26ead9728.png](/static/getting-started-google-antigravity/img/884916b26ead9728.png)

You can look at any of the artifacts produced by Antigravity by toggling the **Auxiliary Pane** shown in the top right corner.

![94738a4b59d84fd7.png](/static/getting-started-google-antigravity/img/94738a4b59d84fd7.png)

If you toggle the **Auxiliary Pane**, you see the following output, which mentions that there is 1 Artifact generated (Implementation Plan).

![3ad614ce81650142.png](/static/getting-started-google-antigravity/img/3ad614ce81650142.png)

Click on the **Implementation Plan** to see the details, as shown below:

![90e8ccae66dba76b.png](/static/getting-started-google-antigravity/img/90e8ccae66dba76b.png)

For now, we are ok with the plan and simply click on the **Proceed** button to move forward.

Now, as it goes to work, it creates another artifact, **Task Plan,** and other files. You can see all of that in the Auxiliary Pane as shown below:

![5e7c8edfff5390ee.png](/static/getting-started-google-antigravity/img/5e7c8edfff5390ee.png)

If you click on the **Task** artifact, you will see a step by step task list to achieve the goal that you identified, along with which steps have been completed and which are yet to be completed.

![a18a60fc2a5c136f.png](/static/getting-started-google-antigravity/img/a18a60fc2a5c136f.png)

Finally, when everything is completed, tested and verified by the Agent, you will get a message saying that the task has been completed. Another artifact called the **Walkthrough** is now ready. You can see the final list as shown below:

![125f41b0a983f57a.png](/static/getting-started-google-antigravity/img/125f41b0a983f57a.png)

A few things to note, there are not just **Artifacts** (Task, Walkthrough and Implementation Plan) but also **Source Files (package.json** , **index.js**)**.**

You may not need a full-fledged Editor / IDE to view the files generated. You can click on the **package.json** or **index.js** files and you will be able to see the content, comment on it.

## 8. Antigravity IDE

You can opt to use the Antigravity IDE that we installed earlier in this codelab, if you prefer an IDE. You will notice that when you go to toggle the Auxiliary Panel in the main Antigravity interface, there is an **Open IDE** option.

![94738a4b59d84fd7.png](/static/getting-started-google-antigravity/img/94738a4b59d84fd7.png)

Click on that to open the Antigravity IDE. You might see a warning at the launch of the Antigravity IDE, that looks like this:

![d5919244c996af7f.png](/static/getting-started-google-antigravity/img/d5919244c996af7f.png)

This is normal. Go ahead and click on **Yes**. This will bring up the Antigravity IDE, which should be familiar to anyone who has used an IDE before. It has all the folders/files generated, an editor and an **Agent Panel**, where you can chat with the Agent about the code (explain, generate, fix, etc).

![f6af75f8e99cbbc6.png](/static/getting-started-google-antigravity/img/f6af75f8e99cbbc6.png)

## 9. Skills

While Antigravity's underlying models are powerful generalists, they don't know your specific project context or team standards. Loading every single rule or tool into the agent's context window leads to tool bloat, higher costs, latency, and confusion.

Skills solve this through progressive disclosure. A **skill** is a specialized package of knowledge that sits dormant until needed. It is only loaded into the agent's context when your specific request matches the skill's description .

## Structure and Scope

Skills are directory-based packages. You can define them in two scopes depending on your needs:

- Global Scope (`~/.gemini/config/skills/`): Available across all Antigravity products (Antigravity, Antigravity IDE, Antigravity CLI) and projects.
- Project/Workspace Scope (`<project-root>/.agents/skills/`): This would make the skill available only within a specific project.

## The Anatomy of a Skill

A typical skill directory looks like this :

    my-skill/
    ├── SKILL.md    #(Required) metadata & instructions.
    ├── scripts/    # (Optional) Python or Bash scripts for execution.
    ├── references/ # (Optional) text, documentation, or templates.
    └── assets/     # (Optional) Images or logos.

Let's add some skills now.

## Code Review Skill

This is an instruction-only skill i.e. we only need to create the `SKILL.md` file, that will contain the metadata and the skills instructions. Let's create a skill that provides details to the agent to review code changes for bugs, style issues and best practices.

Assuming that you are in a specific project folder (e.g. `$HOME/agy2-projects/my-skills-project)` the first step is to create a directory in the project folder that will contain the skill.

    mkdir -p .agents/skills/code-review

Create a `SKILL.md` file in the project folder e.g. `.agents/skills/code-review` that we just created, with the content shown below:

    ---
    name: code-review
    description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
    ---

    # Code Review Skill

    When reviewing code, follow these steps:

    ## Review checklist

    1. **Correctness**: Does the code do what it's supposed to?
    2. **Edge cases**: Are error conditions handled?
    3. **Style**: Does it follow project conventions?
    4. **Performance**: Are there obvious inefficiencies?

    ## How to provide feedback

    - Be specific about what needs to change
    - Explain why, not just what
    - Suggest alternatives when possible

Notice that the `SKILL.md` file above contains the metadata (name and description) at the top and then the instructions. When the agent loads, it will only read the metadata of the skills and it will only load the full skills instructions, only when needed.

Let us validate the **Code Review skill**. Open up a conversation in Antigravity in a specific project of your choice and provide the following prompt.

![732820afe6db3ce0.png](/static/getting-started-google-antigravity/img/732820afe6db3ce0.png)

It should show the **code-review** skill.

### Try it out

Create a new file named `demo_bad_code.py` in the `$HOME/agy2-projects/my-skills-project` with the contents shown below:

    import time

    def get_user_data(users, id):
       # Find user by ID
       for u in users:
           if u['id'] == id:
                return u
       return None

    def process_payments(items):
       total = 0
       for i in items:
           # Calculate tax
           tax = i['price'] * 0.1
           total = total + i['price'] + tax
           time.sleep(0.1) # Simulate slow network call
      
       return total

    def run_batch():
       users = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]
       items = [{'price': 10}, {'price': 20}, {'price': 100}]
      
       u = get_user_data(users, 3)
       print("User found: " + u['name']) # Will crash if None
      
       print("Total: " + str(process_payments(items)))

    if __name__ == "__main__":
       run_batch()

Open a new conversation in a specific project in Antigravity and give the following prompt: `review the @demo_bad_code.py file`.

The Agent should identify the `code-review` skill, load the details and then perform the action as per the instructions given in the `code-review/SKILL.md` file.

A sample output is shown below:

![a6e2b1b775feda28.png](/static/getting-started-google-antigravity/img/a6e2b1b775feda28.png)

## 10. Conclusion

Congratulations! You have now successfully installed Antigravity, configured your environment, and learned how to control your agents.

## Earn your Kaggle 5-Day AI Agents badge

Completed this lab as part of Kaggle's **5-Day AI Agents: Intensive Vibe Coding Course with Google**? Claim your completion badge: Get the [5-Day AI Agents badge](https://developers.google.com/profile/badges/events/cloud/five-day-ai-agents/award).

**What's Next?** To see Antigravity in action building real-world applications, you can look at the following codelab:

- [Build and Deploy to Google Cloud with Antigravity](https://codelabs.developers.google.com/build-and-deploy-gcp-with-antigravity): This codelab shows how to design, build, and deploy a serverless application to Google Cloud.

## **Reference docs**

- Official Site : <https://antigravity.google/>
- Documentation: <https://antigravity.google/docs/home>
- Use cases : <https://antigravity.google/use-cases>
- Download : <https://antigravity.google/download>
- Youtube Channel for Google Antigravity : <https://www.youtube.com/@googleantigravity>

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

\[\[\["Easy to understand","easyToUnderstand","thumb-up"\],\["Solved my problem","solvedMyProblem","thumb-up"\],\["Other","otherUp","thumb-up"\]\],\[\["Missing the information I need","missingTheInformationINeed","thumb-down"\],\["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"\],\["Out of date","outOfDate","thumb-down"\],\["Samples / code issue","samplesCodeIssue","thumb-down"\],\["Other","otherDown","thumb-down"\]\],\[\],\[\],\[\]\]
