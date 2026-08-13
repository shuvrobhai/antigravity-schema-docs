---
source: 19
category: docs
title: Models
url: "https://antigravity.google/docs/models"
final_url: "https://antigravity.google/docs/models"
fetched: 2026-08-13
status: 200
---
# Models

## Reasoning Model

For the core reasoning model, Antigravity offers leading frontier models. Availability depends on your plan:

| Model | Free & Google AI Plus | Google AI Pro | Google AI Ultra | Enterprise |
|----|----|----|----|----|
| Gemini 3.7 Flash | ✅ | ✅ | ✅ | ✅ |
| Gemini 3.6 Flash | ✅ | ✅ | ✅ | ✅ |
| Gemini 3.5 Flash | ✅ | ✅ | ✅ | ✅ |
| Gemini 3.1 Pro | ✅ | ✅ | ✅ | ✅ |
| Claude Sonnet 4.6 (thinking) | ✅ | ✅ | ✅ | ❌ |
| Claude Opus 4.6 (thinking) | ✅ | ✅ | ✅ | ❌ |
| GPT-OSS-120b | ✅ | ✅ | ✅ | ❌ |

Users can select which reasoning model they want to use within the model selector drop-down under the conversation prompt box:

Model

Gemini 3.7 FlashMediumFast

Low

Medium

High

Gemini 3.6 FlashMediumFast

Low

Medium

High

Gemini 3.5 FlashMediumFast

Low

Medium

High

Gemini 3.1 ProHigh

Low

High

Claude Sonnet 4.6 (Thinking)

Claude Opus 4.6 (Thinking)

GPT-OSS 120B (Medium)

View Usage

Gemini ModelsWeekly Limit Remaining100%Five Hour Limit Remaining100%Claude and GPT modelsWeekly Limit Remaining100%Five Hour Limit Remaining100%

The choice of reasoning model is sticky between user messages within a conversation, so if you change the reasoning model while the Agent is running, it will continue to use the previously selected reasoning model until it has completed its steps for that user turn (or until you cancel the current execution).

Learn more about reasoning model rate limits in [our plans page](/docs/plans).

## Additional Models

Antigravity uses a number of other models for various parts of the stack that are not customizable:

- **Nano Banana 2**: Used by the generative image tool when the Agent wants to produce a UI mockup, needs images to populate a web page or application, generate system or architecture diagrams, or other generative image tasks.
