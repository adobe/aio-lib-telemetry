# Deepen Observability for the Event Ingestion Pipeline

## Problem Description

The event ingestion pipeline action (`inputs/actions/ingest-events/index.js`) has already been wired up with the telemetry entrypoint — it uses `instrumentEntrypoint` so every invocation creates a root trace span. The shared telemetry config is at `inputs/telemetry.js`.

However, the team has no visibility into _which part_ of the action is slow when incidents occur. When the storage API times out, the only signal is the root span duration — they can't tell if the problem is in parsing, validation, transformation, or the actual storage call. They also want to track how many events are processed per invocation over time, and how many are rejected due to validation failures.

Add deeper instrumentation to the action to give the team the observability they need. You should use the existing telemetry setup — don't replace it.

## Output Specification

Produce an updated `actions/ingest-events/index.js` with the additional instrumentation applied.

If you add any standalone metrics definitions, you may put them in a separate `actions/ingest-events/metrics.js` file and import from there.

Write a brief `instrumentation-plan.md` describing what you instrumented and why — which signal type you chose for each addition and what observability goal it serves.
