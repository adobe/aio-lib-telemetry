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

Instrument one App Builder runtime action at a time. Start from the observability goal and add the minimum code needed.

Skip phases that are already answered. If the first message already identifies the action, goal, and requested code changes, implement directly.

For fixed-choice questions, use the runtime's selectable-question tool.

## Scope

Work on one action per session. If the user asks for multiple actions or "the whole project," have them choose the first action and continue one at a time.

## Key Principles

- Keep one shared `defineTelemetryConfig` and branch on `params` or `isDev` inside it. Separate config files are rare (see [references/implementation-patterns.md](references/implementation-patterns.md)).
- If API shape or OTel behavior is unclear, use [references/documentation-sources.md](references/documentation-sources.md).

## Prerequisites

Before instrumenting, confirm that `@adobe/aio-lib-telemetry` is installed and that the project already has a `defineTelemetryConfig` call. If either is missing, route to `aio-telemetry-setup`.

This skill can still add per-action setup such as `instrumentEntrypoint` and `ENABLE_TELEMETRY: true` for the target action.

For single-turn implementation tasks, prefer concrete code over advice.

## Phase 0: Discover the Action

**Before anything else**, identify which action to instrument.

1. Read `app.config.yaml` at the project root and any `ext.config.yaml` files
2. Parse the declared actions and ask which one to instrument

If no actions are declared in config files, ask the user to point to the action file directly.

Once the action is identified, let the user describe the goal before filling any gaps with follow-up questions.

## Phase 1: Understand the Action

Read the action's source code systematically. Follow the checklist in [references/code-analysis.md](references/code-analysis.md):

1. Find the entrypoint — search for `instrumentEntrypoint`. If not present for this action, note it as something to add in Phase 4.
2. Trace the call graph from main — identify external calls, business logic, error paths
3. Classify the action by its primary pattern (see [references/action-patterns.md](references/action-patterns.md)):
   - API proxy, event handler, data pipeline, orchestrator, CRUD handler, or trivial
4. Check what's already instrumented — avoid duplicating existing work
5. Check auto-instrumentation coverage — if a preset is configured ("simple" = HTTP/GraphQL/Undici, "full" = all Node auto-instrumentations), outbound HTTP calls may already produce spans. Not all auto-instrumentations work reliably in App Builder runtime.

For data-pipeline and event-ingestion actions, apply these defaults unless the request clearly asks for something else:

- Use `instrument()` for I/O boundaries such as storage writes, downstream notifications, or SDK/network calls.
- Do not wrap pure computation helpers such as validation, mapping, aggregation, or formatting unless they perform I/O.
- Define custom metrics with `defineMetrics()` at module scope, not inside the handler.
- Add low-cardinality span attributes for counts and outcomes on the root span or child spans.

Present a brief summary to the user:

> "I've read your action. Here's what I see: [2-3 sentence summary of what the action does, its external dependencies, and its complexity]."

## Phase 2: Discover Observability Goals

Ask only for missing inputs:

- **Depth** — Essential, Standard, or Comprehensive. Recommend one based on action complexity and use [references/signal-decision.md](references/signal-decision.md) for tradeoffs.
- **Signals** — traces, metrics, logs, or all. Default to traces if unsure.
- **Integration** — ask only if the action matches `commerceWebhooks()` or `commerceEvents()`.
- **Primary question** — "When this action fails or is slow, what do you need to see?"

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

Do not proceed to Phase 4 without user approval unless you are in direct implementation mode from the user's initial request.

## Phase 4: Implement

After approval, implement each item. See [references/implementation-patterns.md](references/implementation-patterns.md) for code patterns.

### Implementation order

1. **Metrics definitions** — `defineMetrics()` calls at module level or in a separate metrics file
2. **Function wrapping** — `instrument()` around target functions
3. **Span enrichment** — attributes and events inside already-instrumented functions
4. **Logging** — `getLogger()` or `getInstrumentationHelpers().logger` calls
5. **Propagation** — `contextCarrier` in outbound calls to other instrumented services

Minimal pattern:

```ts
const fetchProductData = instrument(async function fetchProductData(productId) {
  return commerceClient.getProduct(productId);
});
```

### After implementation

1. Check that every `instrument()` call uses a named function or provides `spanConfig.spanName`
2. Check import paths — only `@adobe/aio-lib-telemetry`, `@adobe/aio-lib-telemetry/otel`, and `@adobe/aio-lib-telemetry/integrations` are valid
3. Suggest how to verify:
   > "To verify: run your action, then check [their backend] for a trace from [action name]. You should see [describe expected span tree based on what was implemented]."

### If issues arise

- Setup problems discovered during implementation → suggest the `aio-telemetry-setup` skill
- Runtime errors or unexpected behavior after implementation → suggest the `aio-telemetry-troubleshooting` skill

For library and OpenTelemetry documentation sources, see [references/documentation-sources.md](references/documentation-sources.md).

## References

| File                                                                           | When to read                                                         |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [references/documentation-sources.md](references/documentation-sources.md)     | Raw GitHub doc paths and OpenTelemetry JS docs                       |
| [references/signal-decision.md](references/signal-decision.md)                 | Deciding which signal type to use, choosing instrumentation depth    |
| [references/implementation-patterns.md](references/implementation-patterns.md) | Writing the actual instrumentation code (Phase 4)                    |
| [references/action-patterns.md](references/action-patterns.md)                 | Classifying the action and building default instrumentation profiles |
| [references/code-analysis.md](references/code-analysis.md)                     | Systematic code reading checklist (Phase 1)                          |
