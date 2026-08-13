---
source: 52
category: community
title: Sessions & conversation history (neurals.ca)
url: "https://neurals.ca/tech/gemini/antigravity/conversation-history/"
final_url: "https://neurals.ca/tech/gemini/antigravity/conversation-history/"
fetched: 2026-08-13
status: 200
---
[home](/)/[technology specific](/tech/)/[gemini](/tech/gemini/)/[antigravity](/tech/gemini/antigravity/)/conversation history

**Use case:** you come back to a half-finished migration the next morning. Watch `/resume` pull a saved session back into the live transcript, then the other verbs, **fork · rename · clear · export**, each act on that conversation in turn.

Step 0 · history persists Every conversation you have with `agy` is saved to the session store, not just the messages, but the agent’s working state for that task. Step 1 · resume `/resume` (alias `/switch`) opens a picker over your saved sessions. You choose *auth-refresh-bug*; its full history loads back into the live transcript. Step 2 · fork `/fork` copies the current conversation into a *new workspace* so you can try a different approach without disturbing the original thread. Step 3 · rename `/rename` gives the session a human label so the picker is readable later. A wall of *untitled* sessions helps no one. Step 4 · clear `/clear` starts a fresh session with an empty context, the right move once a thread has drifted off-topic or grown too long. Step 5 · export Finally, the whole conversation can be *exported to the Antigravity GUI*, where the same agent engine continues the work in a richer surface. session loaded (resume) branch / export (fork, GUI) fresh start (clear) the session store

## What it is

A **session** in `agy` is one continuous conversation with the agent, the messages you exchanged, the files it read, the tools it ran, and the reasoning state it built up while working toward your goal. When you quit the terminal, that session is not thrown away. Antigravity persists each conversation as part of its **history**, so the work you did this morning is still there this afternoon, on your next login, or next week.

That persistence is what makes the CLI feel less like a chat box and more like a workspace you return to. A bug investigation that took forty turns yesterday does not have to be re-explained from scratch today: you reopen the same session and the agent already holds the context it built. Because `agy` shares the same underlying agent engine as the Antigravity 2.0 GUI, that history is portable, per the project’s shared facts, sessions can be **exported to the GUI** and settings sync in both directions, so a thread started in the terminal can be continued in the graphical surface.

The history is only useful if you can navigate it, and that is where the session verbs come in. `/resume` (also spelled `/switch`) is the front door: it opens a picker over your saved conversations and drops you back into the one you choose. `/fork` branches a conversation into another workspace so you can explore an alternative without losing the original. `/rename` labels a session so the picker stays readable, and `/clear` starts a brand-new, empty session when the current one has outlived its usefulness. Together they let you treat conversations as durable, named, branchable artifacts rather than disposable scrollback.

**Key insight:** a long conversation is the agent’s memory, and memory that only ever grows eventually rots. The session verbs exist because *knowing when to start fresh, branch, or come back* is part of using an agent well. `/resume` recovers useful state; `/fork` isolates an experiment; `/clear` sheds a thread that has gone stale. Curating history is steering the agent.

## How it works

From the terminal, the whole system is a handful of slash commands. None of them require arguments, `/resume` opens an interactive picker, and the others act on whatever session is currently live. Here is the everyday set:

The session commands in `agy`

    # Start agy in your project — this begins (or continues) a session
    cd your-project
    agy

    # Reopen a past conversation: /resume opens a picker over saved sessions.
    # /switch is the same command under a different name.
    /resume
    /switch

    # Branch the current conversation into a fresh workspace so you can
    # try a different approach without touching the original thread.
    /fork

    # Give the current session a readable name (so the picker is legible later)
    /rename auth-refresh-bug

    # Start a brand-new, empty session — drop the current context entirely
    /clear

The mental model: `/resume` moves you *between* existing sessions, `/fork` *multiplies* a session, `/rename` *labels* one, and `/clear` *discards* the current context to begin again. Quitting and relaunching `agy` later still finds your history; `/resume` is how you re-enter it deliberately rather than landing in whatever was open last.

### What each verb does, precisely

/resume · /switch  
Opens a picker of your saved conversations (name, turn count, last-active time) and reloads the chosen one into the live terminal, full history and the agent’s accumulated working state, not just the visible text. `/switch` is an alias for the same action.

/fork  
Copies the current conversation into another workspace as an independent branch. The original keeps running untouched; the fork is a separate session you can take in a different direction. Useful for “what if I tried X instead” without burning the thread that already works.

/rename  
Sets a human-readable label on the current session so it is identifiable in the `/resume` picker. Naming is cheap and pays off the moment you have more than a few saved threads.

/clear  
Begins a fresh session with an empty context window. The right move when the current conversation has drifted, ballooned, or finished, a clean slate keeps the agent sharp rather than dragging stale context forward.

export to GUI  
Hands the conversation to the Antigravity 2.0 graphical app, which runs the same agent engine. The thread continues in a richer surface; settings sync both ways between CLI and GUI.

### Where the verbs sit in the loop

These commands surround the agent loop rather than living inside it. The loop, plan, act with a tool, observe, repeat, runs *within* a session; the session verbs decide which loop you are in, whether you spawn a copy of it, and when you start a new one. Antigravity keeps implementation plans in an internal `.gemini` scratch directory rather than your project folder, so resuming a session also restores the agent’s plan state, not just the chat.

## The fork timeline

Because `/fork` is the least obvious of the verbs, it helps to see it as a timeline. A session is a trunk of turns; forking it copies the history up to *now* into a new workspace, after which the two lines evolve independently.

1 · one trunk You work a problem turn by turn in a single session. Everything is one linear conversation the agent can reason over. 2 · fork point At some turn you run `/fork`. The history *up to here* is copied into a new workspace, both sides share everything before this point. 3 · two lines The forked workspace is now independent. You can chase a risky refactor there while the original trunk keeps the known-good thread alive. 4 · keep the winner Whichever branch produced the better result is the one you keep. The other you simply leave in history or `/clear` away. original trunk forked workspace shared history before the fork

## In the real world

### A migration that spans two days

You are moving a service off a deprecated config loader. On day one you start `agy`, describe the goal, and let the agent survey the call sites and patch the first three packages; its plan lands in the `.gemini` scratch directory and the conversation accumulates the context of what is done and what remains. Before you stop for the evening you run `/rename config-loader-migration` so the session is easy to find. The next morning you launch `agy`, type `/resume`, and pick that session out of the list. The agent comes back with the full history, it already knows which packages are finished and which patterns are left, so you continue from turn forty-three rather than turn one.

Midway through, you wonder whether a more aggressive refactor would be cleaner. Rather than gamble the thread that is already working, you run `/fork`. Now you have two workspaces sharing all the history up to the fork: the original, conservative migration, and an experimental copy where you let the agent try the bigger change. You push the fork until it either proves itself or falls apart. If it works, you keep it; if not, the untouched trunk is still exactly where you left it, and the dead experiment just stays in history.

### When a thread has gone stale

Later, the experimental fork has wandered, the agent chased a wrong lead, the context filled with dead ends, and its answers are getting muddier. This is the moment for `/clear`. You start a fresh session with a clean context, re-state the goal in one tight sentence, and the agent works from a sharp slate instead of dragging the confusion forward. When the whole job is finally done and you want to write it up with diagrams and screenshots, you export the surviving session to the Antigravity GUI and continue there, the same engine carrying the thread across surfaces.

**Pitfall:** resuming a very old or very long session is not free. The restored history reloads the agent’s accumulated context, which can be exactly the stale or contradictory material that was degrading its answers in the first place, the same context-rot failure modes that afflict any long-running agent. If a resumed session feels “stuck” or keeps repeating old mistakes, the fix is often *not* to push it harder but to `/clear` and start clean with a crisp restatement of the goal. Persistence is a tool, not an obligation: keep the threads that still carry useful state, and shed the ones that don’t.

## Compared to Claude Code

Both tools treat a conversation as durable, resumable state rather than throwaway scrollback, and the two even share vocabulary: Antigravity’s `/resume` picker is the direct analogue of Claude Code’s `claude --resume` (pick from a list) and `claude --continue` (reopen the most recent session in this directory). Where they diverge is in how each manages the *cost* of a long history. Claude Code’s headline mechanism is **compaction**: as a session approaches the context-window limit, auto-compaction (or an explicit `/compact`) sends the transcript to a summariser and replaces older turns with a structured summary, intent, key files, fixes, pending work, so the same thread can keep running past what the raw window would allow. Antigravity’s emphasis is different: rather than centring an in-place summarisation step, it leans on **branching and isolation**, `/fork` to split a thread, dynamic subagents that each get their own isolated context window so wide exploration never bloats the main session, and a `.gemini` scratch directory that keeps plan state out of the live transcript. The two products are solving the same underlying problem, a context budget that only fills, from opposite ends: Claude Code compresses one timeline; Antigravity multiplies and isolates timelines. One genuine gap worth naming fairly: Antigravity exposes a true `/fork` as a first-class verb that Claude Code does not, while Claude Code’s in-session `/compact` and the precise compaction-summary behaviour are more explicitly documented than agy’s history-pruning internals. If you want the full picture of how a transcript is kept useful as it grows, context rot, the summariser call, what survives a compaction event, read the matched Claude Code page.

[Compare on Claude Code The context window & compaction → how Claude Code keeps a long transcript useful](/tech/claude/context-window/)

## How it composes

Sessions are the container; the rest of the Antigravity surface acts inside or upon them. Each of these is a neighbouring concept worth reading next to this one:

- [Rewind & checkpoints](/tech/gemini/antigravity/rewind-checkpoints/), where `/resume` moves you between sessions, `/rewind` (alias `/undo`) moves you *within* one, back to an earlier checkpoint so you can experiment safely and step back when an action goes wrong.
- [AGENTS.md & .agents/skills](/tech/gemini/antigravity/agents-md/), the standing project rules and skills that load into *every* session, the durable counterpart to the per-session history this page is about.
- [Dynamic subagents](/tech/gemini/antigravity/dynamic-subagents/), the isolation move: an orchestrator spawns specialists with their own context windows so a single session can explore widely without its history bloating.
- [How agy manages context](/tech/gemini/antigravity/context-strategy/), what actually enters the model’s context each turn, and why keeping a session lean matters for answer quality.

## References

1.  Google. *Antigravity CLI overview*, official documentation for the `agy` CLI, the agentic terminal surface of Google Antigravity. [antigravity.google/docs/cli-overview](https://antigravity.google/docs/cli-overview).
2.  DataCamp. *Google Antigravity CLI: a hands-on walkthrough*, covers installation, the slash-command surface, and session management including `/resume` and `/fork`. [datacamp.com/tutorial/antigravity-cli](https://www.datacamp.com/tutorial/antigravity-cli).
3.  DeepWiki. *google-antigravity/antigravity-cli*, community reference documenting the command set, session store behaviour, and the shared agent engine. [deepwiki.com/google-antigravity/antigravity-cli](https://deepwiki.com/google-antigravity/antigravity-cli).
4.  antigravitylab.net. *Antigravity CLI field notes*, practitioner notes on conversation history, forking workflows, and exporting sessions to the Antigravity GUI. [antigravitylab.net](https://antigravitylab.net/).
5.  DEV.to. *Getting started with the Antigravity agy CLI*, introductory writeup on first-run auth, sessions, and the GUI handoff. [dev.to](https://dev.to/) (Antigravity CLI series).
6.  neurals.ca. *The context window & compaction (Claude Code)*, the matched concept on the Claude Code side, on how a long transcript is kept useful via compaction and `--resume` / `--continue`. [/tech/claude/context-window/](/tech/claude/context-window/).

Note: the official Antigravity docs page is sparse and JS-rendered, so command-level specifics here are corroborated against the secondary writeups above. Performance and capability claims are attributed to their sources; no version numbers, benchmarks, or flags beyond those reported by Google or the cited writeups are asserted.

[Next up /rewind & checkpoints → move within a session, not just between them](/tech/gemini/antigravity/rewind-checkpoints/)
