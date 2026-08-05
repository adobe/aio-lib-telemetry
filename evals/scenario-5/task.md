# Diagnose Missing Runtime Invocation Attributes

## Problem Description

The inventory team has deployed an App Builder action with `@adobe/aio-lib-telemetry`. Its telemetry configuration and action code are provided under `inputs/`.

During testing across multiple invocations of the same warm Runtime container, the team observes:

- The root span has the current `action.activation_id`, `action.transaction_id`, `action.deadline`, and `action.region`.
- Logs written by the action have the current invocation attributes, including when its logger is reused.
- The auto-instrumented Undici span created for the inventory API request does not have those invocation attributes.
- Metrics do not have invocation IDs or deadlines as dimensions.

The team considers this inconsistent and wants to know whether the telemetry setup is broken. Their trace backend requires the activation ID and execution region on every span, including auto-instrumented spans.

Diagnose the observed behavior and adapt the telemetry configuration only where necessary. Preserve trace exporting and avoid introducing high-cardinality metric dimensions.

## Output Specification

Produce:

- `diagnosis.md` — explain which observations are expected, why resources cannot hold invocation metadata safely, and why the auto-instrumented span differs from the root span
- `telemetry.js` — update the supplied configuration so every recording span receives current invocation attributes while traces continue to export

Do not modify the action handler unless the diagnosis shows that it is incorrectly using the library.
