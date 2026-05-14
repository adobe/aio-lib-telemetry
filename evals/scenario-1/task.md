# Connect App Builder Telemetry to New Relic

## Problem Description

The catalog service team has a working App Builder project with two actions: `sync-products` and `send-notifications`. The project already has a minimal telemetry configuration file at `inputs/telemetry.js`, but it doesn't export data anywhere yet — no backend is configured. The project structure is described in `inputs/app.config.yaml`.

The team has a New Relic account (US region) and wants to ship traces, metrics, and logs from both actions to New Relic. They have a New Relic license key that they store securely and want to inject through environment variables rather than hardcoding it. The setup should work identically in local development and when deployed to I/O Runtime.

Complete the telemetry setup so data flows to New Relic. You do not need to implement the action handlers themselves — focus on the telemetry configuration and the infrastructure wiring.

## Output Specification

Produce the following files:

- `telemetry.js` — the completed telemetry configuration with New Relic exporters
- `app.config.yaml` — updated to enable telemetry and wire in the New Relic license key for both actions
- `.env` — showing how the license key is stored locally (use a placeholder value)
