---
source: 42
category: community
title: SKILL.md, explained
url: "https://hiddedesmet.com/skills-md-github-copilot"
final_url: "https://hiddedesmet.com/skills-md-github-copilot"
fetched: 2026-08-13
status: 200
---
[github-copilot](/tags#github-copilot) [skills](/tags#skills) [skill-md](/tags#skill-md) [ai-assisted-development](/tags#ai-assisted-development) [azure](/tags#azure) [azure-monitor](/tags#azure-monitor) [application-insights](/tags#application-insights) [agent-customization](/tags#agent-customization) • Apr 22, 2026 • 15 min read

# SKILL.md, explained: the file is singular, the folder is plural

Why GitHub Copilot skills live in plural folders but singular SKILL.md files, how they load, and when supporting files are pulled in on demand.

Written by [Hidde de Smet](/hidde)

On Tuesday April 22 at the Xebia XKE we spent a session on `SKILL.md` files: what they are, whether anyone is actually using them yet, and where they fit in the broader Copilot customization story. The room was split. A few people had never seen the format, a few were already shipping skills inside client repos, and a handful brought examples that were genuinely sharp, one for a Bicep module library, one for a domain-specific testing pattern, and one that wrapped the Azure DevOps CLI (`az pipelines run`, variable overrides, branch targeting, waiting on the run) so you never have to switch to the browser just to kick off a build. You stay focused in VS Code and trigger pipelines right where you are.

The one that got the loudest reaction was [`grill-me`](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md), Matt Pocock’s now-[viral](https://www.aihero.dev/my-grill-me-skill-has-gone-viral) skill. The whole thing is barely ten lines: it tells the agent to interview you relentlessly about a plan or design, walk down each branch of the decision tree resolving dependencies one by one, ask one question at a time, and recommend its own answer for each. A colleague had been using it to prep for a Microsoft Advanced Specialization assessment, pointing it at the artifacts they planned to submit and letting Copilot play assessor for an hour. The discussion was good enough that I wanted to write the longer version down.

One more thing that came up: you do not have to write every skill yourself. Around the format, an npx ecosystem of installers and catalogs is forming: [`skills`](https://www.npmjs.com/package/skills) (the one Matt’s `grill-me` ships through, install via `npx skills@latest add mattpocock/skills/grill-me`), [`openskills`](https://www.npmjs.com/package/openskills), [`skillfish`](https://www.npmjs.com/package/skillfish), and collections like [`antigravity-awesome-skills`](https://www.npmjs.com/package/antigravity-awesome-skills) that ship 1,000+ ready-made skills. They are not Copilot itself, and they do not define the spec, but they are becoming a practical way to discover, install, and adapt skills without starting from a blank file.

So this post is the writeup. What a skill is, how the loading loop works, and a working Azure example you can drop into a repo today.

A `SKILL.md` file is a small markdown document that teaches an AI agent how to do one thing well. Not a prompt you paste in. Not a system message you tweak per session. A file that lives next to your code, gets discovered automatically, and loads when the task matches or when you invoke it directly.

GitHub Copilot now documents this pattern clearly as part of its broader customization story (`AGENTS.md`, `.instructions.md`, prompt files, and repository instructions). Skills are still underused, and they are the piece that scales best across a team.

This post covers what a skill actually is, how the discovery loop works, and an Azure Monitor skill you can copy into a repo and use today.

------------------------------------------------------------------------

## What a skill is, concretely

A skill is a folder. The folder contains a `SKILL.md` with YAML frontmatter and a body. Optionally, it ships supporting files: scripts, prompt templates, reference docs, examples.

That naming is easy to misread the first time. The collection is usually a plural folder like `.github/skills/`, but each individual skill still uses a singular, uppercase `SKILL.md` file, not `skills.md`.

Minimal shape:

    .github/
      skills/
        azure-monitor-kql/
          SKILL.md
          reference/
            common-queries.kql

For Copilot, the directory name must match the skill `name` in the frontmatter. If the folder is `azure-monitor-kql`, the skill name must be `azure-monitor-kql` too. A mismatch silently prevents the skill from loading.

The frontmatter is the contract, or at least the minimal one:

    ---
    name: azure-monitor-kql
    description: |
      Write, debug, and optimize KQL queries against Azure Monitor Logs and
      Application Insights. USE FOR: KQL syntax, App Insights traces/requests/
      exceptions, Log Analytics workspace queries, alert query authoring,
      workbook query tuning. DO NOT USE FOR: Kusto/ADX cluster queries (different
      table schemas), cost analysis, infra deploy.
    ---

At minimum, the frontmatter needs `name` and `description`. In Copilot, it also supports extra metadata for things like slash-command hints and invocation behavior (`argument-hint`, `user-invocable`, `disable-model-invocation`).

During discovery, Copilot uses the skill’s `name` and `description` to decide whether the skill is relevant. Everything else, the body of the file, instructions, code snippets, examples, only loads if the agent decides the skill applies. Supporting files in the same folder, scripts, references, templates, load only when the skill uses or references them. That distinction is the entire point.

------------------------------------------------------------------------

## How the loading loop actually works

Three stages. Each one matters.

| Stage | What the agent sees | Context impact |
|----|----|----|
| **Index** | A list of skill names + descriptions | Light, because only metadata is in play |
| **Match** | The user’s request compared to each description | Still light; the body is not loaded yet |
| **Load** | Full `SKILL.md` body of any matched skill, and referenced resources when needed | Heavier, but only on demand |

This is why the description field is doing most of the work. A vague description like “helps with Azure” will either fire on every Azure question (context waste) or never fire when you actually need it (skill never invoked). The good ones usually follow a pattern:

- one sentence on what the skill does
- a `USE FOR:` list of trigger phrases
- a `DO NOT USE FOR:` list to prevent collisions with neighbouring skills

You see this shape a lot in Anthropic-era skill libraries, and it maps cleanly onto how Copilot works too: scan descriptions, match the request, load the body, then do the work.

------------------------------------------------------------------------

## Why this beats stuffing everything into `copilot-instructions.md`

The temptation is to dump every convention, every Azure best practice, every test pattern into one giant `copilot-instructions.md` and call it done. That file then loads on every single request, including the ones where you ask Copilot to rename a variable.

Skills invert that. The default state is empty. Context shows up only when relevant.

This is also where skills differ from MCP. MCP is about giving the agent live tools and external systems, which is powerful, but many MCP servers bring extra tool schemas, server instructions, and result payloads into the working set. Skills are lighter-weight: mostly static expertise that stays out of the way until the task actually matches.

And since this came up during the session: skills are not the same as prompt files or custom agents either. A prompt file (`.prompt.md`) is a single-task template you invoke manually, like “scaffold a React component” or “prepare a PR summary”. It runs once, produces output, done. A custom agent (`.agent.md`) is a persistent persona with its own tool restrictions, model preferences, and handoffs, think “security reviewer” or “planner” that you switch to for a whole session. A skill is neither. It is a folder of portable expertise, scripts and references included, that loads automatically when the task matches and stays silent when it does not. Prompt files and custom agents are about *how the agent behaves*. Skills are about *what the agent knows*.

A practical comparison from a real repo:

| Approach | Tokens loaded per request | Coverage | Conflicts |
|----|----|----|----|
| One big `copilot-instructions.md` | 4,000+ every time | Everything, always | Frequent (rules contradict per language) |
| A handful of focused skills | 200 index + 0–800 on match | Only what fits the task | Rare (skills are scoped) |

In practice, a handful of focused skills usually produces cleaner context than one giant `copilot-instructions.md`, especially in mixed-language repos. It also stops the classic failure mode where your Bicep file gets React advice because the global instructions were trying to do too much.

------------------------------------------------------------------------

## Using skills with GitHub Copilot

Copilot looks for skills in a small set of locations. For GitHub Copilot, a clean project location is `.github/skills/<name>/SKILL.md` at the repo root. Copilot also supports `.claude/skills/` and `.agents/skills/` for project skills, plus `~/.copilot/skills/`, `~/.claude/skills/`, and `~/.agents/skills/` for personal skills.

The full setup loop:

1.  Create the folder and `SKILL.md`.
2.  Write a sharp description with `USE FOR` / `DO NOT USE FOR`.
3.  Open a fresh chat or refresh the session if it does not appear immediately.
4.  Ask a question that should trigger it, or invoke the skill directly. Watch the response: a well-matched skill usually starts echoing the terminology, steps, and examples you encoded in the body.
5.  If it does not fire, the description is wrong. Tighten it.

Two things worth knowing:

- Once a skill is loaded in a chat session, its instructions are available in that session’s context.
- Skills compose. A request can match more than one. Two small skills usually beat one big one.

You also do not have to write the `SKILL.md` by hand. In Copilot, type `/create-skill` in chat, describe what you need, and it generates the frontmatter, directory structure, and body for you. It can even extract a skill from an ongoing conversation: after a multi-turn debugging session, ask “create a skill from how we just debugged that” and it captures the workflow. Claude Code follows the same Agent Skills standard and works the same way: ask it to turn a procedure into a skill and it writes the file into `.claude/skills/`.

------------------------------------------------------------------------

## A real Azure skill: KQL for Application Insights

Here is the skill I actually use. Save this as `.github/skills/azure-monitor-kql/SKILL.md`:

    ---
    name: azure-monitor-kql
    description: |
      Write, debug, and optimize KQL queries against Azure Monitor Logs and
      Application Insights. USE FOR: KQL syntax, App Insights tables (requests,
      dependencies, exceptions, traces, customEvents / AppRequests,
      AppDependencies, AppExceptions, AppTraces, AppEvents), Log Analytics
      workspace queries, alert query authoring, workbook query performance
      tuning, joining across resources. DO NOT USE FOR: Kusto/ADX cluster queries (different
      schemas, use azure-kusto), instrumenting apps with the App Insights SDK,
      cost analysis, infrastructure deployment.
    ---

    # Azure Monitor KQL

    ## Core rules

    1. Filter by time first. Always start with `| where timestamp > ago(...)`
      right after the table reference so Kusto can skip irrelevant shards early.
    2. Project before summarize. Drop columns you do not need before aggregating.
    3. Prefer `has` and `has_cs` over `contains` when you are matching full terms.
      `contains` scans for substrings and is usually slower.
    4. Use `materialize()` only when a subquery is reused multiple times in the
       same query. Otherwise it wastes memory.
    5. Never use `*` in production queries. Be explicit.

    ## App Insights table cheat sheet

    Application Insights supports both the legacy Application Insights names and the
    Log Analytics workspace names. Same telemetry, different table names.

    | App Insights view | Workspace-based view | What lives there | Common joins |
    |-------------------|----------------------|------------------|--------------|
    | `requests` | `AppRequests` | Incoming HTTP requests | `dependencies` / `AppDependencies` on `operation_Id` / `OperationId` |
    | `dependencies` | `AppDependencies` | Outgoing calls (HTTP, SQL, Azure SDK) | `requests` / `AppRequests` on `operation_Id` / `OperationId` |
    | `exceptions` | `AppExceptions` | Thrown exceptions with stack traces | `requests` / `AppRequests` on `operation_Id` / `OperationId` |
    | `traces` | `AppTraces` | ILogger / log statements | `requests` / `AppRequests` on `operation_Id` / `OperationId` |
    | `customEvents` | `AppEvents` | TrackEvent calls | `customMetrics` / `AppMetrics` on `operation_Id` / `OperationId` |

    ## Patterns

    ### Slowest endpoints, last hour, p95

    ​```kusto
    requests
    | where timestamp > ago(1h)
    | where success == true
    | summarize p95 = percentile(duration, 95), count() by name
    | top 10 by p95 desc
    ​```

    ### Failures correlated with a downstream dependency

    ​```kusto
    let failed = requests
        | where timestamp > ago(30m) and success == false
        | project operation_Id, name, resultCode;
    dependencies
    | where timestamp > ago(30m) and success == false
    | join kind=inner failed on operation_Id
    | project timestamp, requestName = name1, dependencyTarget = target,
              dependencyResult = resultCode, requestResult = resultCode1
    | order by timestamp desc
    ​```

    ### Exception clusters by type, not by message

    ​```kusto
    exceptions
    | where timestamp > ago(24h)
    | summarize count(), any(outerMessage) by type, problemId
    | order by count_ desc
    ​```

    ## Anti-patterns to flag

    - `| where message contains "error"` on `traces`: scans every row. Prefer
      `severityLevel` filters when your logging pipeline populates them consistently,
      or at least scope the search to specific columns and full terms.
    - `union *`: pulls every table in the workspace. Always name the tables.
    - Joins without a time filter on both sides. The optimizer cannot prune.
    - Pulling raw rows when a `summarize` would do. Workbook tiles especially
      should aggregate at query time, not in the renderer.

    ## When the user asks for an alert query

    Log search alert queries run on a schedule and have a few constraints:

    - Put the relative time filter directly in the query with `ago(<timespan>)`.
    - Avoid unsupported operators such as `bag_unpack()`, `pivot()`, and `narrow()`.
    - If the rule runs every minute, avoid patterns that often break one-minute
      alerts (`search`, `union`, `take`, `ingestion_time()`, `adx()`).
    - Shape the result for the alert type you want: either rows to count or a
      summarized numeric column the rule can measure.

That is the whole file. About 100 lines, ships in a repo, costs nothing until someone asks Copilot a KQL question.

### What it looks like in use

Drop the skill into a repo, open a fresh Copilot chat, then ask:

> Write me an App Insights query that finds the top 5 endpoints by p99 latency in the last 6 hours, but only for successful requests.

Without the skill, Copilot tends to produce something syntactically valid but inefficient: a `summarize` without an upfront time filter, `*` projections, sometimes the wrong table naming scheme. With the skill loaded, the response leads with `| where timestamp > ago(6h)`, projects only `name` and `duration`, uses `percentile(duration, 99)`, and follows the cheat-sheet structure. Same model, same prompt, different starting context.

The interesting case is the negative one. Ask the same Copilot session:

> Help me write a Kusto query against my ADX cluster for IoT telemetry.

The skill should *not* fire, because the description explicitly excludes ADX. If you wrote a sloppy description like “helps with KQL queries”, it would fire and give bad advice (App Insights schema does not match an ADX telemetry cluster). The `DO NOT USE FOR` line is what prevents that.

------------------------------------------------------------------------

## When a skill earns its place

Not every convention needs to be a skill. The bar I use:

- The knowledge is **non-obvious**. Anyone Googling for ten minutes would not arrive at the same answer.
- It applies to **a specific class of task**, not every request.
- It is **stable enough** to maintain. Skills you never update rot fast.
- The body is **worth the tokens** when it does load.

Things that should be skills: KQL conventions, Bicep module patterns, Azure SDK retry policies, your team’s Aspire layout, your testing strategy for Azure Functions.

Things that should not: “use 4-space indentation”. That belongs in `.editorconfig`. “Always run the linter before commit”. That belongs in a pre-commit hook. Skills are for expertise, not for rules a tool already enforces.

------------------------------------------------------------------------

## Takeaways

- A `SKILL.md` is a discoverable, on-demand chunk of expertise. The frontmatter `description` decides whether it loads.
- Copilot’s skill loop is index → match → load. Most of the engineering effort goes into the description.
- Many small, scoped skills beat one giant `copilot-instructions.md`. Cheaper per request, fewer collisions.
- The Azure Monitor KQL skill above is a working starting point. Drop it in `.github/skills/azure-monitor-kql/`, restart the session, ask a KQL question.
- Write the `DO NOT USE FOR` line. It is the difference between a skill that helps and a skill that derails.

If you want to go further, the same pattern works for Bicep best practices, Azure Functions cold-start tuning, Service Bus messaging patterns, and pretty much any Azure surface where the official docs are too broad and your team’s conventions are too tribal. Pick one piece of expertise that lives only in the heads of two people on your team. Make it a skill. See if Copilot stops asking the dumb questions.

Written by

### [Hidde de Smet](/hidde)

As a certified Azure Solution Architect, I specialize in designing, implementing, and managing cloud-based solutions using Scrum and DevOps methodologies.

### Start the conversation

Show Comments

## Related

[See all github-copilot](/tags#github-copilot)

[github-copilot](/tags#github-copilot) [claude-code](/tags#claude-code) [skill-md](/tags#skill-md) [agent-customization](/tags#agent-customization) [ai-assisted-development](/tags#ai-assisted-development) [developer-tools](/tags#developer-tools) [maintenance](/tags#maintenance) •Jul 17, 2026 •11 min read

## [98 skill folders, three coding setups, seven that don't exist: auditing your own SKILL.md library](/auditing-copilot-skills-stocktake)

I counted the skill folders across Claude Code, a shared agents catalog, and Copilot on my own machine. 98 total, including seven Google ADK Agents CLI folders pointing at nothing. Here's what a real audit finds and the checklist to run it yourself.

Written by [Hidde de Smet](/hidde)

[spec-driven-development](/tags#spec-driven-development) [ai-assisted-development](/tags#ai-assisted-development) [spec-kit](/tags#spec-kit) [engineering-metrics](/tags#engineering-metrics) [productivity](/tags#productivity) [governance](/tags#governance) •Jul 10, 2026 •11 min read

## [The hidden costs of spec-driven development: when structure helps and when it slows you down](/the-hidden-costs-of-spec-driven-development)

Spec-driven development fixes the 70% problem, but it also adds planning tax, review bottlenecks, and process overhead. Here is how to know when full specs are worth it and when to use a lighter path.

Written by [Hidde de Smet](/hidde)

[mcp](/tags#mcp) [enterprise](/tags#enterprise) [authorization](/tags#authorization) [identity](/tags#identity) [agents](/tags#agents) [okta](/tags#okta) [anthropic](/tags#anthropic) [microsoft](/tags#microsoft) [github-copilot](/tags#github-copilot) [vscode](/tags#vscode) [governance](/tags#governance) [entra](/tags#entra) •Jun 25, 2026 •11 min read

## [MCP finally got enterprise authorization: here's what changed](/mcp-enterprise-authorization)

MCP's Enterprise-Managed Authorization extension just went stable. VS Code 1.123 shipped it in Preview with Entra ID support. One OAuth prompt per server is now a policy problem, not a user problem.

Written by [Hidde de Smet](/hidde)
