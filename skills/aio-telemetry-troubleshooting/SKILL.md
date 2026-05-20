---
name: aio-telemetry-troubleshooting
description: >-
  Interactive troubleshooting for @adobe/aio-lib-telemetry issues in Adobe App Builder runtime actions.
  Use when a user reports: (1) telemetry not working, no data showing up, (2) missing traces, metrics, or logs,
  (3) broken distributed traces or disconnected spans, (4) errors from the telemetry library,
  (5) "works locally but not in production" issues, (6) backend-specific problems (New Relic, Grafana, etc.),
  (7) hot reload / dev mode telemetry issues, (8) configuration validation or review,
  or (9) any unexpected behavior related to @adobe/aio-lib-telemetry.
  Triggers on: "telemetry not working", "no traces", "missing spans", "export failed",
  "telemetry error", "debug telemetry", "traces not showing", "broken traces",
  "check my config", "validate configuration".
---

# Telemetry Troubleshooting

## Key Principle

`@adobe/aio-lib-telemetry` mostly forwards `sdkConfig` to OpenTelemetry's `NodeSDKConfiguration`. Validate config shape directly, especially in JavaScript projects without type checking.

## Approach

**Do not jump into the codebase.** Start by understanding the user's problem through conversation. Only inspect code after gathering enough context for a targeted search.

For fixed-choice questions, use the runtime's selectable-question tool.

## Phase 1: Triage

Ask the user to describe their problem. Understand:

1. **What symptom?** (nothing at all, partial data, errors, wrong data)
2. **What changed?** (new setup, was working before, after a deploy, after config change)
3. **Environment?** (local dev with `aio app dev`, or deployed to I/O Runtime)
4. **Backend?** (Grafana/Docker LGTM, New Relic, Grafana Cloud, other OTLP)

### Quick Wins to Check First

Before deep investigation, suggest these (many issues are one of these):

1. **Is `ENABLE_TELEMETRY: true` set in `app.config.yaml` inputs?** — #1 cause of "nothing works"
2. **Is the entrypoint wrapped?** — `export const main = instrumentEntrypoint(handler, { ...telemetryConfig })`
3. **Is at least one exporter configured?** — `traceExporter`, `metricReaders`, or `logRecordProcessors` in sdkConfig

If the user has an **error message**, look it up in [references/error-messages.md](references/error-messages.md) for the exact cause and fix.

## Phase 2: Gather Evidence

Get diagnostic information early and do what you can before asking for more input.

### Enable diagnostics

If not already enabled, ask the user to add this to their telemetry config and re-run:

```ts
diagnostics: {
  logLevel: "debug",
}
```

See [references/diagnostics-guide.md](references/diagnostics-guide.md) for complete details on log levels, where output appears, and how to interpret it.

### Get activation logs

Retrieve logs yourself when possible:

1. **Find the activation** — Ask for the activation ID or help identify it with `aio rt activation list`.
2. **Query the logs** — Run `aio rt activation logs <activation_id>` and analyze the output.
3. **If logs are unavailable** — Check log forwarding with `aio app config get log-forwarding` or fall back to code, config, error messages, and backend evidence.

### Add temporary logging

Add temporary log statements when they help verify execution flow or runtime config. Examples:

- `console.log` at key points to verify execution order
- Logging `params` (sanitized) to verify env vars reach the action
- Logging exporter config to verify URLs and headers are correct
- Adding `getLogger()` calls to trace data flow

After adding temporary logs, have the user trigger the action and share the output. Remove the logs once the issue is resolved.

### Validate their configuration

When you read the user's code, **always validate the config against the known schema.** Many issues come from invalid configs that silently fail — especially from plain JS users without type checking.

Use [references/config-validation.md](references/config-validation.md) to check:

1. **Import paths** — Only `@adobe/aio-lib-telemetry`, `/otel`, and `/integrations` exist
2. **Import names** — Are they importing things that actually exist? (e.g., `OTLPTraceExporterProto` not `OTLPTraceExporter`)
3. **Config structure** — Does `defineTelemetryConfig` return `{ sdkConfig: { ... } }`? Not flat properties?
4. **sdkConfig properties** — Only valid `NodeSDKConfiguration` properties? No invented keys?
5. **Signal wiring** — Metrics need a reader wrapping the exporter, logs need a processor wrapping the exporter. Traces take the exporter directly.
6. **app.config.yaml** — `ENABLE_TELEMETRY`, env var mapping with `$VAR_NAME`

If the config is invalid, that's likely the root cause. Explain what's wrong, show the correct structure, and if it's a significant setup problem, mention the `aio-telemetry-setup` skill can help them start fresh.

### Read their code (targeted)

Only after understanding the symptom, read:

- Their telemetry config (`defineTelemetryConfig` call)
- Their `app.config.yaml` (env vars, `ENABLE_TELEMETRY`)
- Their entrypoint (`instrumentEntrypoint` wrapping)
- Exporter configuration (URLs, auth headers)

## Phase 3: Diagnose

Match findings against known scenarios in [references/common-scenarios.md](references/common-scenarios.md):

- **No data at all** — ENABLE_TELEMETRY, missing exporter, wrong URL, auth failure
- **Invalid config** — Wrong properties, wrong nesting, nonexistent imports
- **Partial signals** — One exporter misconfigured while others work
- **Works locally, not deployed** — Exporter pointing to localhost, missing env vars
- **Broken traces** — Context propagation not set up between services
- **Hot reload weirdness** — Restart dev server
- **Intermittent data loss** — Shutdown timing
- **Local setup issues** — Docker not running, tunnel down, ports blocked, tunnel URL stale

### Local setup troubleshooting

If the user has a local observability stack (Docker LGTM, tunneling), check these:

1. **Docker container running?** — `docker ps | grep otel-lgtm`
2. **Collector reachable?** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:4318/v1/traces` (should return 200 or 405)
3. **Tunnel alive?** — Check tunnel container logs (`docker logs cloudflared` or `docker logs ngrok`)
4. **Tunnel URL current?** — If the tunnel restarted, verify the config points to the new URL.
5. **Port conflicts?** — Another service may be using 3000, 4317, or 4318

For tunnel-specific issues beyond basic connectivity (Cloudflare account issues, ngrok limits, etc.), refer the user to the respective tool's documentation or support channels.

### Using diagnostics for RCA

Diagnostic output tells you exactly what happened:

1. **Did the SDK start?** Look for "OpenTelemetry automatic instrumentation started successfully"
2. **Any errors?** `error` level messages have the root cause
3. **Exporter issues?** At `debug` level, OTel logs HTTP requests — look for connection refused, 401, 429, timeouts
4. **Did shutdown complete?** "shutdown successful" means data was flushed

## Phase 4: Fix or Escalate

### Fix it

Provide the specific fix. If the problem is a **setup issue** (missing config, wrong structure), explain what's wrong and suggest the `aio-telemetry-setup` skill can help them set it up correctly from scratch.

If an OTel SDK option is unclear, consult [references/documentation-sources.md](references/documentation-sources.md).

### Escalate wisely (last resort, not first instinct)

Before escalating, rule out transient failures, local environment problems, and one-off breakage.

Only escalate after configuration, code, and local environment checks are exhausted:

- **Backend provider support** (New Relic, Grafana, Splunk) — verified config, but data still does not arrive or backend-specific features fail
- **Adobe support** — Runtime issues such as env vars not reaching actions, log forwarding not taking effect, or repeatable deployment failures unrelated to code
- **GitHub issue on @adobe/aio-lib-telemetry** — undocumented library errors or reproducible features that do not work as described

For library and OpenTelemetry documentation sources, see [references/documentation-sources.md](references/documentation-sources.md).

## References

| File                                                                       | When to read                                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [references/documentation-sources.md](references/documentation-sources.md) | Raw GitHub doc paths and OpenTelemetry JS docs                                     |
| [references/config-validation.md](references/config-validation.md)         | Validating user's config — import paths, schema, valid properties, common mistakes |
| [references/error-messages.md](references/error-messages.md)               | User reports a specific error message                                              |
| [references/diagnostics-guide.md](references/diagnostics-guide.md)         | Need to enable/interpret diagnostic output, or need to ask user for logs           |
| [references/common-scenarios.md](references/common-scenarios.md)           | Matching symptoms to known causes and fixes                                        |
