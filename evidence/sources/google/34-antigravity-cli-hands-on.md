---
source: 34
category: google
title: Hands-on with Antigravity CLI
url: "https://codelabs.developers.google.com/antigravity-cli-hands-on"
final_url: "https://codelabs.developers.google.com/antigravity-cli-hands-on"
fetched: 2026-08-13
status: 200
---
# Hands-on with Antigravity CLI

## 1. Introduction

In this codelab, you will learn about [Antigravity CLI](https://antigravity.google/product/antigravity-cli), a lightweight Terminal User Interface (TUI) surface of Antigravity. It brings the same core agentic capabilities as [Antigravity](https://antigravity.google/product/antigravity-2) (such as multi-step reasoning, multi-file editing, tool calling, and conversation history) directly to your terminal.

**What you'll learn**

1.  Installing and configuring Antigravity CLI
2.  Understanding basic usage of Antigravity CLI
3.  Exploring a few use cases with Antigravity CLI

### **What you'll need**

You would need the following:

- Chrome web browser
- A personal Gmail account

This codelab, designed for users and developers of all levels (including beginners). The use cases in the codelab have been categorized into developer and non-developer tasks. The developer use cases demonstrate how to vibe code with Antigravity CLI and work with a GitHub repository to perform common development tasks like code explanation/understanding, generating documentation, fixing issues and more. It is recommended that you complete these use cases in the codelab. There is an optional section at the end that covers several every day tasks that are non-developer focused.

## 2. Installation

Before you do the setup and run Antigravity CLI, let us create a folder that we will be using as our home folder for all the projects that we create inside of it. This is a starting point for the Antigravity CLI to work with, though it will also reference some other folders on your system and which you will come to later, as needed.

Go ahead and create a sample folder (**`agy-cli-projects`**) and navigate to that via the commands shown below. If you prefer to use some other folder name, please do so.

    mkdir agy-cli-projects

Let's navigate to that folder:

    cd agy-cli-projects

The installation is straightforward and binaries are available across major Operating Systems. I have taken the commands to run in the terminal directly from the installation document:

**macOS \| Linux**

    curl -fsSL https://antigravity.google/cli/install.sh | bash

**Windows PowerShell**

    irm https://antigravity.google/cli/install.ps1 | iex

**Windows CMD**

    curl -fsSL https://antigravity.google/cli/install.cmd -o install.cmd && install.cmd && del install.cmd

This should ideally setup and install the Antigravity CLI (`agy`) in your system and in the Path.

In some cases, if the installer is not able to add the binary ( `agy` to the PATH), it will say so. For e.g. here is a sample output on a machine, where the installer was not able to add the binary to the PATH and it suggested what to do.

    % curl -fsSL https://antigravity.google/cli/install.sh | bash
    ⠋ Detecting system environment...
    ✓ Platform detected: darwin_arm64
    ⠋ Querying release repository...
    ✓ Latest available version: 1.0.1
    ⠋ Downloading release package...
    ✓ Download complete and checksum verified.
    ⠋ Extracting binary from archive...
    ⠋ Configuring shell environment...
    I0523 11:44:14.012088 76528 installer.go:27] Running Antigravity CLI setup...
    Warning: /Users/neilirani/.local/bin is not present in your active PATH.
    To use the 'agy' CLI globally, please manually add it to your shell profile:
     echo 'export PATH="/Users/yourusername/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
    ✅ Antigravity CLI binary placed successfully at /Users/yourusername/.local/bin/agy
    Note: The binary is installed, but it is not in your active PATH. Please follow the instructions above to add it, then restart your terminal session.

Just check out the version of Antigravity CLI via the following command (the version shown is the one at the time of writing this codelab):

    $ agy --version
    1.0.7

When we launch Antigravity CLI for the first time, it will ask you to login. Launch `agy` and it should show something similar to this:

        ▄▀▀▄
       ▀▀▀▀▀▀
      ▀▀▀▀▀▀▀▀
     ▄▀▀    ▀▀▄
    ▄▀▀      ▀▀▄

    Welcome to the Antigravity CLI. You are currently not signed in.

    Select login method:
    > 1. Google OAuth
      2. Use a Google Cloud project

    [Use arrow keys to navigate, Enter to select]

Use your personal account for now. Choose **1. Google OAuth** and press **Enter**. This will launch a browser and you can login with your Google Account. On successful authentication and authorization, you are asked to copy a code. Please come back into the Antigravity CLI terminal and paste the code.

Once the login is successful, a few things happen:

1.  First up, it asks you about the color theme that you wish to choose for Antigravity CLI, as shown below. Pick the one that you like.
2.  Next up, you need to accept a few terms of service. Accept those.

Finally, the most important thing is to give your permission that you trust the folder, as shown below:

    Accessing workspace:

    /Users/yourusername/agy-cli-projects

    Do you trust the contents of this project?

    Antigravity CLI requires permission to read, edit, and execute files here.

    > Yes, I trust this folder
     No, exit

     ↑/↓ Navigate · enter Confirm

You will see this typically in any new folder that you launch the Antigravity CLI on. We will come to more on this later in the series but for now, go ahead and say **Yes, I trust this folder**.

Congratulations! You are all set now and Antigravity CLI is waiting for your prompt.

## 3. Our first interaction with Antigravity CLI

Let's get started with Antigravity CLI and type your first query as shown below:

    Give me a famous quote on Artificial Intelligence and who said that?

We get a sample response as shown below:

      Here is a famous quote on Artificial Intelligence:                                                                           
                                                                                                                                   
      │ "Artificial intelligence is the new electricity."                                                                          
      │ — Andrew Ng                                                                                                                

Apart from giving prompts here, what are the various commands that Antigravity CLI supports? You can find that by typing **`/help`** (forward slash). It will show you 3 tabs : **general**, **commands** and **shortcuts**. By default, you will arrive on the **general** tab and you can use the tab key to navigate to **commands**, where you will see a variety of commands. You can navigate to keyboard **shortcuts** too.

The list of **commands** at the time of writing are shown below:

![18e1b7ada382cd8f.png](/static/antigravity-cli-hands-on/img/18e1b7ada382cd8f.png)

**Note**: You can quit Antigravity CLI anytime via the **`/quit`** command or you can do **`ctrl+d`** twice in the interactive Antigravity CLI terminal session.

## 4. Antigravity CLI - a few housekeeping commands

Make sure that Antigravity CLI has been running and it is waiting for your command. If you have tried the **`/quit`** command at the end of the previous section, please launch Antigravity CLI again via the **`agy`** command.

Notice the model that it is using, the name of which, will be shown in the bottom right. The first thing ideally is to understand that most of the customization and settings that you need to do are available via the `/config` or `/settings` command.

## Configuration / Settings

Go ahead and invoke the `/config` command. This will bring up various areas of Antigravity that you can customize based on your preferences. This includes the Color Scheme, Tool permission, telemetry settings and more.

    Settings
      Search:  
              ────────────────────
    > Animation Speed      medium
      Artifact Review      asks for review
      Color Scheme         dark
      Editor               auto ($EDITOR)
      Enable Telemetry     on
      Non-Workspace Access off
      Notifications        off
      Rendering Mode       native terminal (inline)
      Sandbox Mode         off
      Show Feedback Survey on
      Show Tips            on
      Tool Permission      request-review
      Use AI Credits       off
      Verbosity            high

For example, the Color Scheme brings up the following options, from which I can choose my preferred color scheme:

![6e447a36ed0039cc.png](/static/antigravity-cli-hands-on/img/6e447a36ed0039cc.png)

### settings.json

The configuration settings need to be stored somewhere right? All of them get stored in `~/.gemini/antigravity-cli/settings.json` file. A sample is shown below:

    {
          "colorScheme": "dark",
          "model": "Gemini 3.5 Flash (High)",
          "statusLine": {
            "type": "",
            "command": "",
            "enabled": true
          },
          "trustedWorkspaces": [
            "/Users/romin/antigravity-cli-projects",
            "/Users/romin/agy-cli-projects"
          ]
        }

You can notice the `colorScheme` that I have selected, the model and also various folders from where I have started Antigravity CLI and said yes to trusting the folders.

**Note**: You can modify the `settings.json` directly too and restart Antigravity CLI as a best practice to see the changes. But be sure of the settings, else it will display an error at startup. If not comfortable with directly modifying the file, it is suggested to use the `/settings` or `/config` command in the Antigravity CLI to work with this file.

### Tool Permission

An important setting to understand is the Tool Permission. This controls whether terminal commands require your approval before running. You can get to this via the `/config` command.

     Tool Permission
      > request-review (current)
        proceed-in-sandbox
        always-proceed
        strict

By default, it is set to `request-review`. Let's understand this in more detail. In Antigravity, Tool Permission settings control the balance between security (guarding your host system against unintended changes) and velocity (how autonomously the agent can work without pausing for your input). Let's review the options:

**request-review (Current Default)**

In this mode, the agent is treated as a collaborative partner that checks in before performing any action that could affect your system or project files outside of pre-approved bounds. Whenever the agent attempts to run a terminal command, perform a file operation (like writing/deleting), or call an external service where permission hasn't been pre-approved, the execution pauses. The user is prompted to approve or reject the specific action.

**proceed-in-sandbox**

This mode allows the agent to execute terminal commands automatically, but within a secure, isolated container. The agent can run commands without prompting you, but those commands are executed in a virtualized sandbox (e.g., a lightweight container). They cannot modify your actual host machine's filesystem or access your local network.

**always-proceed**

This is the fully autonomous mode, giving the agent maximum speed and capability. The agent is granted full permission to run commands and write files directly on your host machine. It will never prompt you for confirmation.

**strict**

This is a zero-trust, high-security mode. The agent's capabilities are restricted to executing read tools. All non-read tools will require the user to be prompted for action.

## 5. Antigravity CLI - Command Parameters

There are a few command line parameters that one can provide when you start Antigravity CLI. To get a full list of options, you can use the **`--help`** as shown below.

    agy --help

This should show the full range of options available. A sample listing is shown below:

![3745cfdddb4bf83f.png](/static/antigravity-cli-hands-on/img/3745cfdddb4bf83f.png)

Let us take a look at a few of them.

## Non-interactive mode (autonomous)

An interesting option is to run Antigravity CLI in a non-interactive mode. This means that you directly provide it the prompt and it will go ahead and respond to it, without the Antigravity CLI interactive terminal opening up. This is very useful if you plan to use Antigravity CLI in an automated fashion as part of the script or any other automation process.

You use the **`-p`** parameter to provide the prompt to Antigravity CLI as shown below:

    agy -p "What is the gcloud command to deploy to Cloud Run"

This might be a good way to get some quick answers but do keep in mind that there is no scope to continue the conversation with follow up questions.

## Choose a specific model

The first one is to ask Antigravity CLI to use a specific Gemini mode. You can use the `--model` parameter to tell Antigravity CLI to use a specific model during its session only. This is very useful for the non-interactive mode that we mentioned in the previous section, where you would like to launch several `agy` sessions and use specific models for specific tasks.

But first, you need to know which models are available for Antigravity CLI. You can do that via the `models` subcommand as shown below:

    agy models

This will list the models that are available for Antigravity CLI. A sample list is shown below:

- Gemini 3.5 Flash (Medium)
- Gemini 3.5 Flash (High)
- Gemini 3.5 Flash (Low)
- Gemini 3.1 Pro (Low)
- Gemini 3.1 Pro (High)
- Claude Sonnet 4.6 (Thinking)
- Claude Opus 4.6 (Thinking)
- GPT-OSS 120B (Medium)

You can use any of these model names to specify the model to be used for the session. You can do that via the `--model` command shown below:

    agy --model "Gemini 3.5 Flash (Low)"

Once Antigravity CLI launches, you can check either via the `/model` command about the specific model that you asked it to use or look at the bottom right that shows the model used for the session.

## Living dangerously

If you like to live dangerously, then you can look for a very aptly named parameter called `--dangerously-skip-permissions`. This will auto approve all tool permissions. There will be no prompt asking you for permissions. So use it with care.

Launch Antigravity CLI via the following command:

    agy --dangerously-skip-permissions

Then give the following prompt. Check that it did not ask me for any write file permissions.

    > get the latest news and write it in a file called news.txt. Then create another file that contains the summary of that file.

    ● ListDir(/Users/romin/agy-cli-projects)
    ● WebSearch(latest world news May 24 2026 news headlines) (ctrl+o to expand)

    ▸ Thought for 2s, 95 tokens
     Processing News Information

    ● Create(/Users/romin/agy-cli-projects/news.txt)
    ● Create(/Users/romin/agy-cli-projects/summary.txt) (ctrl+o to expand)

     I have fetched the latest world news headlines and created the requested files in your workspace:                                                                  
                                                                                                                                                                        
     1. news.txt: Contains the detailed news headlines for today (May 24, 2026), including topics on geopolitics (U.S.-Iran negotiations, Ukraine conflict), U.S. 
     security incidents, the Ebola outbreak in Central Africa, and the passing of NASCAR champion Kyle Busch.                                                           
     2. summary.txt: Contains a concise, structured summary of the major categories covered in the news file.                                                        

This mode can be useful in scenarios where things are local and in your control but still be prepared for surprises and hence use it with care.

## 6. Antigravity CLI - Shell mode

This is a good time to learn how to directly work with the Shell from within Antigravity CLI. You can go into shell mode by pressing **`!`** in the message box. This will toggle to a Shell mode. You can get back by pressing **`!`** again or by hitting the **`ESC`** key.

When in shell mode, you will see the **`!`** at the start of the prompt as shown below:

![8019057be515e68f.png](/static/antigravity-cli-hands-on/img/8019057be515e68f.png)

You can directly check using standard commands like **`pwd`** and **`ls`**. Please note that the commands assume a Linux type OS. If you are on another operating system (Windows), please use equivalent commands like (**`cd`**, **`dir`** and **`type`**).

## 7. Use cases to try out

Antigravity CLI can be applied to a wide range of use cases that apply to both developers and non-developers alike. Presented here are a few scenarios and depending on your area of interest, you can try any or all of them out.

In each of these cases, the prompt is provided. You are free to try this out in the Antigravity CLI interactive mode to understand better how Antigravity CLI goes about its task.

## Vibe coding with Antigravity CLI

Let's use Antigravity CLI to vibe code an application. In this task, you will ask Antigravity CLI to generate an application and then push the initial version to a GitHub repository.

**Prerequisite**

To perform the tasks in this section, there are a few prerequisites:

- Git
- Antigravity CLI
- Python 3 environment
- Setup **`gh`** ( [GitHub CLI tool](https://github.com/cli/cli)).
- Familiarity with Git basics and a bit of programming knowledge

We will assume that you have launched Antigravity CLI in a **specific folder of your choice**. In our case, we have launched Antigravity CLI from the initial home folder : **`agy-cli-projects`** and another folder **`bq-releases-notes`** inside of that.

Start with an initial prompt. Think of it as a specification for your application. Feel free to modify it as you see fit. Keep in mind that throughout the session with Antigravity CLI, it will ask you for permissions to create the files, etc. Do give the required permissions.

    Please build a web application for me using Python Flask and plain vanilla HTML, JavaScript and CSS that fetches the BigQuery Release notes from (https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) and shows them to me. 

    A simple refresh button with a spinner is good enough, anytime I'd like to refresh the details. 

    I would also like the ability to take any specific update, select it and then Tweet about it.

The next few prompts and responses are a sample flow that was observed. Antigravity CLI will come up with a plan and ask you for any confirmations / clarifications or go ahead. Please follow the instructions. As a sample, this is my sample conversational thread:

    I will start by exploring the workspace to see if there is an existing structure or if this is a brand new project.                                                                   

    ● ListDir(/Users/romin/agy-cli-projects/bq-release-notes) (ctrl+o to expand)

     I will read the BigQuery release notes XML feed to understand its structure (Atom/RSS elements, entry/item elements, namespaces, dates, titles, content) so that we can parse it      
     correctly in the Python Flask backend.                                                                                                                                                

    ● ReadURL(https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) (ctrl+o to expand)

     I will view the fetched feed content saved locally to understand its format and structure.                                                                                            

    ● Read(/Users/romin/.gemini/antigravity-cli/brain/116191af-e6ea-4ba5-aa23-62f995bd068a/.system_generated/steps/6/content.md) (ctrl+o to expand)

    ▸ Thought for 2s, 2.3k tokens
     Analyzing XML Feed Structure
     I will write the implementation plan detailing the architecture, design aesthetic, components, and verification steps for the BigQuery Release Notes Web Application. This plan will be
     written to the artifacts directory.                                                                                                                                                   

    ● Create(/Users/romin/.gemini/antigravity-cli/brain/116191af-e6ea-4ba5-aa23-62f995bd068a/implementation_plan.md) (ctrl+o to expand)

     I have created the implementation_plan.md to outline the design and architecture of the BigQuery Release Notes Web Application.
                                                                                                                                                                                           
     Please review the plan, especially the approach for the Twitter Composer & Preview Card, and let me know if you approve or if there are any adjustments you'd like to make!           

                                                                                                                                                               1 artifact · /artifact to review

It's time to understand what Artifacts are in Antigravity. Artifacts are how the Antigravity CLI keeps us in the loop with an implementation plan, list of tasks that it is working on, verifiable outputs and more. These files are generated and are a record of the work that Antigravity is doing, its plan, task list and more.

Once it does that, it says " I have created the `implementation_plan.md` to outline the design and architecture of the BigQuery Release Notes Web Application. Please review the plan, especially the approach for the Twitter Composer & Preview Card, and let me know if you approve or if there are any adjustments you'd like to make!"

You can see that it also mentions in the bottom right, that there is **1 Artifact to review** and in this case, it is the `implementation_plan.md`.

Give the command `/artifact`. This will display the artifact that it generated `implementation_plan.md` and you can use the arrow keys to open, approve, reject and so on. Just Escape and come back to the prompt, here you can approve it , if you'd like.

In our case, we are going to go with what it has generated and will be approving it. This kicks off the next set of steps, where it will start the implementation i.e. creating files, running a few commands, etc. You will be prompted to approve and give permission to execute, as required.

In our case, we gave it the approval to create the Python virtual environment, install the dependencies via `requirements.txt` and so on.

In the background, it has also created a `task.md` file as part of the tasks that it has to do based on the implementation plan and it ticks off the individual tasks, as it completes them. Once it is complete, it will let you know and you can check the application in the browser. Here is what it generated for us:

![366a66b7a4249b18.png](/static/antigravity-cli-hands-on/img/366a66b7a4249b18.png)

We can stop for now. The idea was to demonstrate and check out what it can do with simple requirements.

### (Optional) Push changes to a Github repository

If you do not want to push the event website that we created to Github, you can ignore this section and move on to the next one.

First up, let's create a `.gitignore` file and you can take the help of Antigravity CLI.

    Create a .gitignore file for this project.

The next step for you is to give instructions to Antigravity CLI to push this repository under our GitHub account and this should use the Github helper (gh) that is expected to be available and configured / setup on your machine.

Give a prompt similar to the one below:

    Great! I would now like to push all of this to a new repository in my GitHub account. I would like to name this repository <Your-Name>-event-talks-app

It will go through a number of commands here:

1.  Create the repository.
2.  It will use multiple Git commands : init, add, commit to manage the local Git repository.
3.  It will then setup the Git remote and do a push

If all goes well, you should have a GitHub repository in place. You can visit the Github repository page. A sample screenshot is shown below:

![b393c67b13ddf19a.png](/static/antigravity-cli-hands-on/img/b393c67b13ddf19a.png)

Note that you have not generated a **`README.md`** for this project and that is a good exercise for the next section, where we shall now work with this repository that you just created.

## Using Antigravity CLI to work with a code repository

In this use case, you shall use Antigravity CLI to work with a code repository. You will perform multiple tasks that include:

- Understanding the code base
- Generating documentation
- Implementing a new feature

This should give you a good foundation to then work with your repositories and use Antigravity CLI as an assistant vis-a-vis these developer specific tasks.

**Prerequisite**

To perform the tasks in this section, you will need to the following:

- Antigravity CLI
- **You should have completed the previous section and have the code that has been generated handy, where we created a BigQuery Release Notes reader.**

Let's continue to use Antigravity CLI from the folder/directory that you used to generate the BigQuery Release Notes application.

Try out the following prompts as listed below:

### Understanding the code base

- I would like to understand this project in detail. Help me understand the main features and then break it down into Server and Client side. Take a sample flow and show me how the request and response works. **Note that it will create a new file (artifact) and you can view all the artifacts or specific artifacts via the** ﻿\*\*`/artifact`\*\*﻿ **command.**
- Explain `@app.py`

### Generating a README file

- Generate a **`README`** file for this project.

### Implementing a new feature

- Please implement two simple utility features: a "Copy to Clipboard" button on each card and an "Export to CSV" button.
- Please implement a simple toggle switch in the header that swaps the page's color scheme from dark to light mode by overriding the CSS root variables.

It should provide you with a plan, which you can approve. On approval, Antigravity CLI will go ahead and make those changes. Do test out your changes and if there are bugs (likely), do ask Antigravity CLI to fix it.

### Generate Issues based on suggested features

Let's try something interesting here. You are going to ask Antigravity CLI about how it can improve the user experience of this application.

Try the following prompt:

- I would like you to assess the application from a user experience point of view. Ease of use, responsiveness, helpful messages and more. Please come up with a list of improvements and I would like you to provide them as a list to me.

As a follow up, you can now take one of the issues that was generated earlier and ask Antigravity CLI to work and implement it.

## (Optional) Everyday Tasks

The use cases given below are tasks that you might end up doing regularly. These include arranging files into folders, fetching and summarizing content from the web, processing image files and extracting content from them, working with databases and more.

Feel free to explore any of the use cases that you like.

### Organizing Files/Folders

You can use Antigravity CLI to organize the files depending on types in various folders as needed. Go to a folder on your machine that has several files .txt, .png, .jpg, .pdf, .mp4 and others. This is likely to be your Desktop or your Downloads folder.

Navigate to that folder and start Antigravity CLI. You are going to ask Antigravity CLI to create some folders first: Images, Documents, Videos and then you will ask Antigravity CLI to organize the files in the folders.

The Antigravity CLI will often prompt you for permission before executing commands, especially those that modify your file system (like writing, moving, or deleting files). **Always review these prompts carefully before granting permission.** This is your safety net.

    Create the following folders "Images","Documents","Videos"

Then give the following prompt:

    Go through all the files in this folder and then organize them by moving all the files ending with .jpg, .jpeg, .gif into the "Images" folder. Move all ".txt" files into the "Documents" folder. Move all the ".mp4" files in the "Videos" folder.

An example run on our machine is shown below:

    I have completed organizing your files into their respective folders. Here is a summary of the files moved:                                          
                                                                                                                                                           
      • Images: Moved 95 files ending in  .jpg  or  .jpeg  (no  .gif  files were present).                                                         
      • Documents: Moved 1 file ending in  .txt  ( 12March_Live_chat_transcript.txt ).                                                                
      • Videos: Moved 26 files ending in  .mp4 .

A few other organizing scenarios (the prompts are given next to each scenario):

1.  **Summarization:** For each document in the ‘Documents' folder, create a txt file in the same folder named ‘summary_ORIGINAL_FILENAME.txt' that contains a 3-sentence summary of the document's main points.
2.  **Categorizing by Type:** Scan all PDF and DOCX files in this directory. Move all files with "invoice" in their name or content into the ‘Financial/Invoices' folder. Move files with "receipt" into ‘Financial/Receipts'. Any other .docx files go into ‘Reports'.
3.  **Extracting Key Information (and "tagging"):** For each PDF file in the ‘Financial/Invoices' folder, read its content. If you find a date, rename the file to include that date in YYYY-MM-DD format, e.g., ‘invoice_2025-07-26_original_name.pdf'.

### Summarizing Articles (Local Files or Web)

For each of the scenarios below, feel free to change the url, topic of interest and the local file names as applicable. The filenames provided are sample file names, you can replace them with filenames of files that you have on your system.

Try out any of the following scenarios (the prompts are given next to each scenario):

- **Summarize a web article (single URL):** Go to <https://medium.com/google-cloud/antigravity-cli-tutorial-series-12b46cfe3bf2> and summarize the top 3 key takeaways from this news article.
- **Summarize multiple web articles (e.g., from a search):** Find the latest news articles about "Antigravity CLI" using Google Search. For the top 5 relevant articles, summarize each in 2-3 sentences and list their URLs.
- **Summarize a local text file:** Summarize the main points of the article in ‘my_research_paper.txt'. Focus on the methodology and conclusions.
- **Summarize a local PDF:** Read ‘financial_report_Q2_2025.pdf'. Provide a summary of the financial performance and key challenges mentioned.

### Extracting Specific Information (Local Files or Web)

For each of the scenarios below, feel free to change the url, topic of interest and the local file names as applicable. The filenames provided are sample file names, you can replace them with filenames of files that you have on your system.

Try out any of the following scenarios (the prompts are given next to each scenario):

- **Extract entities from a local article:** From ‘biography.txt', list all named individuals and the significant dates associated with them.
- **Extract data from a table in a PDF:** In ‘quarterly_sales.pdf', extract the data from the table on page 3 that shows "Product Sales by Region" and present it in a Markdown table format.
- **Extract news headlines and sources from a news website:** Go to ‘https://news.google.com/' (or a similar news site). Extract the main headlines from the front page and their corresponding news sources. Present them as a bulleted list.
- **Find product specifications from an e-commerce page:** Browse to ‘https://www.amazon.in/Google-Cloud-Certified-Associate-Engineer/dp/1119871441' (example for a book). Extract the book title, author and other details. Present this in a structured JSON format.
- Extract **duration** from a **video**, in a certain format (eg "2h37m42s").

### Answering Questions based on Content (RAG-like behavior)

For each of the scenarios below, feel free to change the url, topic of interest and the local file names as applicable. The filenames provided are sample file names, you can replace them with filenames of files that you have on your system.

Try out any of the following scenarios (the prompts are given next to each scenario):

- **Q&A on a local document:** I'm attaching ‘user_manual.pdf'. What are the steps to troubleshoot network connectivity issues?
- **Q&A on a web page:** Using the content from ‘https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health', what are the primary health risks associated with climate change according to WHO?
- **Compare information across multiple sources:** I have two news articles: ‘article1.txt' and ‘article2.txt', both discussing the recent economic policy changes. Compare and contrast their views on the potential impact on small businesses.

### Content Generation based on Extracted Information

For each of the scenarios below, feel free to change the url, topic of interest and the local file names as applicable.

Try out any of the following scenarios (the prompts are given next to each scenario):

- **Generate a news brief from an article:** Read @tech_innovation_article.txt. Write a short, engaging news brief (around 150 words) suitable for a company newsletter, highlighting the new technology and its potential.
- **Draft an email summarizing a meeting transcript:** Here is a meeting transcript file: @meeting_transcript.txt. Draft an email to the team summarizing the key decisions made and action items assigned, including who is responsible for each.

### Antigravity CLI multi-modal support

Antigravity CLI has multi-model support via Gemini and you can ask it to process files of different content formats as per your requirements.

You are going to process a bunch of invoice images with Antigravity CLI and extract key information from them. Follow the steps given below:

- Create a folder on your machine and download some invoices from the following GitHub [repository](https://github.com/rominirani/gemini-cli-codelab-projects/tree/main/invoice-processing).
- Launch Antigravity CLI from that folder

Give the following prompt to extract out information from the invoices in the form of a table.

    The current folder contains a list of invoice files in Image format. Go through all the files in this folder and extract the following invoice information in the form of a table: Invoice No, Invoice Date, Invoice Sent By, Due Date, Due Amount.

You should ideally get an output that looks like this:

![7203d699d875a91f.png](/static/antigravity-cli-hands-on/img/7203d699d875a91f.png)

Here is another scenario, where you can ask for additional derived columns. Let's say that you want to show a red cross emoji for all the invoice due dates that are in the past. You can give a prompt as follows:

    list all files with .png extension in this folder. Extract the invoice information from it by reading them locally and display it in a table format containing the following column headers: : Invoice No, Invoice Date, Invoice Sent By, Due Date, Due Amount. Add a column at the end of the table that shows a red cross emoji in case the due date is in the past.

This produces the following output:

![e11fcde0400f5a0b.png](/static/antigravity-cli-hands-on/img/e11fcde0400f5a0b.png)

Apply this to any of your own files that are in formats other than text.

### Using Antigravity CLI to generate data

You can prompt Antigravity CLI to produce data in various data formats. This could range from content pieces to JSON data, that you might need to mock. Let's focus here on scenarios applicable to developers/testers.

Here are some prompts to try out:

**Generate JSON data of sample customer reviews**

    Generate a JSON array of 3 synthetic customer reviews for a new smartphone. Each review should have 'reviewId' (string, UUID-like), 'productId' (string, e.g., 'SMARTPHONE_X'), 'rating' (integer, 1-5), 'reviewText' (string, 20-50 words), and 'reviewDate' (string, YYYY-MM-DD format).

**Generating Mock API Responses (JSON)**

    Generate a JSON array representing 7 daily sales records for a mock API endpoint. Each record should include 'date' (YYYY-MM-DD, chronologically increasing), 'revenue' (float, between 5000.00 and 20000.00), 'unitsSold' (integer, between 100 and 500), and 'region' (string, either 'North', 'South', 'East', 'West').

**Generating Sample Database Insert Statements (SQL)**

    Generate 5 SQL INSERT statements for a table named 'users' with columns: 'id' (INTEGER, primary key), 'username' (VARCHAR(50), unique), 'email' (VARCHAR(100)), 'password_hash' (VARCHAR(255)), 'created_at' (DATETIME, current timestamp). Ensure the password_hash is a placeholder string like 'hashed_password_X'.

**Generating CSV Data for Data Loading/Analysis**

    Generate 10 lines of CSV data, including a header row, for customer transactions. Columns should be: 'TransactionID' (unique string), 'CustomerID' (integer), 'ItemPurchased' (string, e.g., 'Laptop', 'Monitor', 'Keyboard'), 'Quantity' (integer, 1-3), 'UnitPrice' (float, between 100.00 and 1500.00), 'TransactionDate' (YYYY-MM-DD).

**Generate a Configuration file (YAML)**

    Generate a sample YAML configuration for a 'user_service'. Include sections for 'database' with 'host', 'port', 'username', 'password', 'database_name'. Also include a 'api_keys' section with 'payment_gateway' and 'email_service' placeholders. Use realistic default values.

**Generating Test Data for Edge Cases/Validation**

    Generate a JSON array of 8 email addresses for testing purposes. Include a mix of: 2 valid standard emails, 2 with missing '@', 2 with invalid domains (e.g., '.com1'), and 2 with special characters in the local part that are usually invalid (e.g., spaces or multiple dots).

## 8. Congratulations

Congratulations, you've successfully explored Antigravity CLI, its capabilities and applied it to a few use cases.

## Earn your Kaggle 5-Day AI Agents badge

Completed this lab as part of Kaggle's **5-Day AI Agents: Intensive Vibe Coding Course with Google**? Claim your completion badge: Get the [5-Day AI Agents badge](https://developers.google.com/profile/badges/events/cloud/five-day-ai-agents/award).

## **Reference docs**

- [Antigravity CLI Project Home page](https://antigravity.google/product/antigravity-cli)
- [Antigravity CLI documentation](https://antigravity.google/docs/cli-overview)

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

\[\[\["Easy to understand","easyToUnderstand","thumb-up"\],\["Solved my problem","solvedMyProblem","thumb-up"\],\["Other","otherUp","thumb-up"\]\],\[\["Missing the information I need","missingTheInformationINeed","thumb-down"\],\["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"\],\["Out of date","outOfDate","thumb-down"\],\["Samples / code issue","samplesCodeIssue","thumb-down"\],\["Other","otherDown","thumb-down"\]\],\[\],\[\],\[\]\]
