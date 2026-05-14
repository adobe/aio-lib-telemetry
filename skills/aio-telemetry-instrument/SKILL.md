---
name: aio-telemetry-instrument
description: >-
  Interactive guide for adding telemetry instrumentation to an Adobe App Builder runtime action
  using @adobe/aio-lib-telemetry. Use when the user wants to: (1) decide what to instrument inside
  a runtime action, (2) add child spans with instrument() to trace internal functions,
  (3) add custom metrics with defineMetrics(), (4) add span attributes or events to enrich traces,
  (5) add structured logging correlated with traces, (6) choose between traces, metrics, and logs
  for an observability goal, (7) instrument outbound HTTP calls or cross-action propagation, or
  (8) get a guided assessment of what telemetry to add to a specific action.
  Prerequisite: general telemetry setup done (library installed, defineTelemetryConfig defined). Per-action steps like instrumentEntrypoint and ENABLE_TELEMETRY can be handled here.
  Triggers on: "instrument this action", "what should I trace", "add spans", "add metrics to my action",
  "what should I observe", "help me instrument", "add logging", "instrument my function".
---

# Instrument a Runtime Action

Add telemetry instrumentation to one App Builder runtime action at a time. Start from what you need to observe, work backward to the minimum code changes.

## Adaptive Flow

The user may provide enough context in their initial message to skip phases. If their request already implies a specific action, signals, or depth (e.g., "add a counter metric to my checkout action"), correlate that with the skill's phases and jump to the appropriate step silently. Don't ask questions you already have answers to.

## Scope

One action per session. If the user asks to instrument multiple actions or "the whole project":

1. Acknowledge the goal
2. Explain that effective instrumentation requires understanding each action's responsibilities individually
3. Ask them to pick the action they care about most, or the one they need observability for right now
4. After completing one action, offer to continue with the next

## Key Principles

`@adobe/aio-lib-telemetry` is a **thin wrapper** over the OpenTelemetry JS SDK. When unsure about specific API options, instrumentation patterns, or OTel SDK behavior, consult the documentation sources listed at the bottom of this file.

A single `defineTelemetryConfig` shared across actions is usually enough. The config callback receives `params` and `isDev` — use conditional logic inside it rather than creating separate config files (see [references/implementation-patterns.md](references/implementation-patterns.md) for examples). Only suggest separate configs if the use case genuinely requires it.

## Prerequisites

The general telemetry setup must be in place before instrumenting. Check the user's codebase for:

1. `@adobe/aio-lib-telemetry` installed as a dependency
2. A `defineTelemetryConfig` call somewhere in the project (usually in a shared `telemetry.ts` or `telemetry.js`)

If either is missing, route to the `aio-telemetry-setup` skill — don't attempt general setup here.

The following are **per-action steps** that this skill can handle if needed:

- Wrapping the action's main function with `instrumentEntrypoint`
- Adding `ENABLE_TELEMETRY: true` in `app.config.yaml` for the action

If these aren't done for the target action yet, handle them as part of Phase 4 (Implement).

## Phase 0: Discover the Action

**Before anything else**, identify which action to instrument.

1. Read `app.config.yaml` at the project root
2. Search for any `ext.config.yaml` files in the project
3. Parse the declared actions from both files
4. Present the list to the user and ask which one they want to instrument

If no actions are declared in config files, ask the user to point to the action file directly.

Once the action is identified, **let the user explain what they want**. Give them space to describe their goal, any specific problems they're trying to observe, or the context behind this request. Their explanation may answer many of the Phase 2 questions preemptively — listen before asking.

## Phase 1: Understand the Action

Read the action's source code systematically. Follow the checklist in [references/code-analysis.md](references/code-analysis.md):

1. Find the entrypoint — search for `instrumentEntrypoint`. If not present for this action, note it as something to add in Phase 4.
2. Trace the call graph from main — identify external calls, business logic, error paths
3. Classify the action by its primary pattern (see [references/action-patterns.md](references/action-patterns.md)):
   - API proxy, event handler, data pipeline, orchestrator, CRUD handler, or trivial
4. Check what's already instrumented — avoid duplicating existing work
5. Check auto-instrumentation coverage — if a preset is configured ("simple" = HTTP/GraphQL/Undici, "full" = all Node auto-instrumentations), outbound HTTP calls may already produce spans. Not all auto-instrumentations work reliably in App Builder runtime.

Present a brief summary to the user:

> "I've read your action. Here's what I see: [2-3 sentence summary of what the action does, its external dependencies, and its complexity]."

## Phase 2: Discover Observability Goals

Ask guided questions based on what you **don't already know** from context. If the user already explained their goals in Phase 0, skip to the relevant questions. Adapt based on the action's pattern from Phase 1.

### Instrumentation depth

Explain the three levels and let the user choose. Recommend a level based on the action's complexity, but let them decide. See [references/signal-decision.md](references/signal-decision.md) for details.

- **Essential**: Rely on root span + auto-instrumentation, add a few key attributes. Minimal code changes.
- **Standard**: Wrap key functions with `instrument()`, add attributes, maybe a metric. Good balance.
- **Comprehensive**: Full per-function spans, metrics, structured logging, span events. Maximum visibility.

### Additional questions (ask only if not already answered)

1. **Signals** — Which signals do they want: traces, metrics, logs, or all? Default to traces if unsure.
2. **Integrations** — If the action matches an available integration, ask about it:
   - Commerce webhook handler → suggest `commerceWebhooks()`
   - Commerce event processor → suggest `commerceEvents()`
   - Skip this question entirely if no integration matches.
3. **Specific concerns** — "When this action fails or is slow in production, what would you want to see in your dashboard to understand why?"

### Important API distinction

`instrumentEntrypoint` and `instrument()` have different options:

- **Entrypoint**: `propagation`, `integrations`, `initializeTelemetry` — handled by setup
- **instrument()**: `spanConfig`, `hooks` (`onResult`, `onError`), `isSuccessful` — this skill's domain

The entrypoint config can also use `params` and `isDev` for conditional behavior (different exporters in dev, params-based sampling, etc.).

## Phase 3: Propose

Based on the action analysis (Phase 1) and observability goals (Phase 2), create a proposal.

### Proposal format

Present the plan as a table:

| #   | What                          | Signal             | API                           | Why                                   |
| --- | ----------------------------- | ------------------ | ----------------------------- | ------------------------------------- |
| 1   | Wrap `fetchProductData`       | Trace (child span) | `instrument(fn)`              | See external call duration separately |
| 2   | Add `product.count` attribute | Span attribute     | `currentSpan.setAttributes()` | Know how many products per invocation |
| 3   | Record cache hit/miss         | Metric (counter)   | `defineMetrics()`             | Track cache effectiveness over time   |

### Proposal rules

- Scope the proposal to the chosen depth level (Essential/Standard/Comprehensive)
- Every item must connect to an observability goal from Phase 2
- Use the signal decision framework from [references/signal-decision.md](references/signal-decision.md) to pick the right signal type
- If the action is trivial, say so honestly: "The root span from `instrumentEntrypoint` plus auto-instrumentation covers this well. You might just want to add 1-2 span attributes for context."
- Account for what auto-instrumentation already covers — don't duplicate

### Checkpoint

Present the proposal and wait for approval:

> "Here's my plan for instrumenting [action name]. Does this cover what you need, or would you like to adjust anything before I make the changes?"

Do not proceed to Phase 4 without user approval.

## Phase 4: Implement

After approval, implement each item. See [references/implementation-patterns.md](references/implementation-patterns.md) for code patterns.

### Implementation order

1. **Metrics definitions** — `defineMetrics()` calls at module level or in a separate metrics file
2. **Function wrapping** — `instrument()` around target functions (use named functions or provide `spanConfig.spanName`)
3. **Span enrichment** — attributes and events inside already-instrumented functions
4. **Logging** — `getLogger()` or `getInstrumentationHelpers().logger` calls
5. **Propagation** — `contextCarrier` in outbound calls to other instrumented services

### After implementation

1. Check that every `instrument()` call uses a named function or provides `spanConfig.spanName`
2. Check import paths — only `@adobe/aio-lib-telemetry`, `@adobe/aio-lib-telemetry/otel`, and `@adobe/aio-lib-telemetry/integrations` are valid
3. Suggest how to verify:
   > "To verify: run your action, then check [their backend] for a trace from [action name]. You should see [describe expected span tree based on what was implemented]."

### If issues arise

- Setup problems discovered during implementation → suggest the `aio-telemetry-setup` skill
- Runtime errors or unexpected behavior after implementation → suggest the `aio-telemetry-troubleshooting` skill

## Documentation Sources

When unsure or doubtful about library behavior, API options, or OTel internals, consult these sources. Assess which is more likely to have the answer and check that one first.

### Library documentation (fetch via raw.githubusercontent.com)

Base URL: `https://raw.githubusercontent.com/adobe/aio-lib-telemetry/refs/heads/main/docs/`

| Doc           | Path                               | Covers                                                                  |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| Usage guide   | `usage.md`                         | Main guide — config, instrumentation, signals, propagation              |
| API reference | `api-reference/README.md`          | Full API surface (query subdirs for specific functions/types as needed) |
| OTel concepts | `concepts/open-telemetry.md`       | Library's relationship to OpenTelemetry                                 |
| Integrations  | `use-cases/integrations/README.md` | Commerce Events/Webhooks integrations                                   |

### OpenTelemetry JS documentation

URL: `https://opentelemetry.io/docs/languages/js/`

Use for: SDK internals, instrumentation libraries, span/metric/log API details, propagation protocol, anything beyond the library's wrapper API.

## References

| File                                                                           | When to read                                                         |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [references/signal-decision.md](references/signal-decision.md)                 | Deciding which signal type to use, choosing instrumentation depth    |
| [references/implementation-patterns.md](references/implementation-patterns.md) | Writing the actual instrumentation code (Phase 4)                    |
| [references/action-patterns.md](references/action-patterns.md)                 | Classifying the action and building default instrumentation profiles |
| [references/code-analysis.md](references/code-analysis.md)                     | Systematic code reading checklist (Phase 1)                          |
