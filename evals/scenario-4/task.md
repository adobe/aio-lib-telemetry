# Wire Up Tracing for the Commerce Event Handler

## Problem Description

The commerce integration team has an App Builder action (`inputs/actions/commerce-event-handler/index.js`) that receives Adobe Commerce order events asynchronously and triggers a downstream fulfillment action via OpenWhisk. The project has a working telemetry config at `inputs/telemetry.js`, but the event handler action has never been instrumented — it still exports the raw handler directly.

The team wants two things from observability:

1. Traces for every event this handler processes, linked to the originating Commerce trace so they can correlate order events with their fulfillment outcomes
2. Distributed tracing context forwarded to the `fulfill-order` action it invokes, so that the fulfillment traces can be connected back to this handler in the trace backend

The telemetry config and app.config.yaml are already in the `inputs/` directory. Your job is to wire the action into telemetry correctly and enable the tracing linkage described above.

## Output Specification

Produce:

- `actions/commerce-event-handler/index.js` — the updated action with telemetry wiring
- `app.config.yaml` — updated to enable telemetry for the action
- `telemetry.js` — updated if needed (you may keep the original if it requires no changes)
