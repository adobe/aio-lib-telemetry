# Add Observability to the Order Processing Action

## Problem Description

Your team's e-commerce App Builder application has been running in production for a few months. The `process-order` action calls an external orders API, applies business logic, and returns a result. Recently, the ops team has been seeing occasional timeouts and wants visibility into what's happening: how long each step takes, whether external API calls are succeeding, and what the invocation volume looks like.

The action is already declared in `app.config.yaml` (see `inputs/app.config.yaml`), and the current action code lives at `inputs/actions/process-order/index.js`. The project currently has no telemetry in place — no observability library is installed or configured.

Your goal is to integrate the `@adobe/aio-lib-telemetry` library to export traces, metrics, and logs to a local development observability stack (Docker LGTM). The setup should work both when running locally with `aio app dev` and when deployed to I/O Runtime.

## Output Specification

Produce the following files in your working directory:

- `telemetry.js` — the shared telemetry configuration module
- `actions/process-order/index.js` — the updated action with telemetry integrated
- `app.config.yaml` — the updated configuration with telemetry enabled

The output files should form a complete, working telemetry setup that a developer could deploy immediately.
