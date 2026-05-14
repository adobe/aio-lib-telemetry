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

`@adobe/aio-lib-telemetry` is a **thin wrapper** over the OpenTelemetry JS SDK (`@opentelemetry/sdk-node`). The `sdkConfig` object maps directly to OTel's `NodeSDKConfiguration`. When unsure about library API or OTel SDK options, consult the documentation sources listed at the bottom of this file.

Many users write plain JavaScript without TypeScript, so they get **no editor feedback** on invalid config properties. Config validation is a critical part of troubleshooting.

## Approach

**Do not jump into the codebase.** Start by understanding the user's problem through conversation. Only inspect code after gathering enough context for a targeted search.

The user may not be technical or familiar with OpenTelemetry internals. Adapt explanations to their level. Guide gently, don't assume knowledge.

## Phase 1: Triage

Ask the user to describe their problem. Understand:

1. **What symptom?** (nothing at all, partial data, errors, wrong data)
2. **What changed?** (new setup, was working before, after a deploy, after config change)
3. **Environment?** (local dev with `aio app dev`, or deployed to I/O Runtime)
4. **Backend?** (Grafana/Docker LGTM, New Relic, Grafana Cloud, other OTLP)

Don't ask all at once — start with "What's happening?" and follow up based on their answer.

### Quick Wins to Check First

Before deep investigation, suggest these (many issues are one of these):

1. **Is `ENABLE_TELEMETRY: true` set in `app.config.yaml` inputs?** — #1 cause of "nothing works"
2. **Is the entrypoint wrapped?** — `export const main = instrumentEntrypoint(handler, { ...telemetryConfig })`
3. **Is at least one exporter configured?** — `traceExporter`, `metricReaders`, or `logRecordProcessors` in sdkConfig

If the user has an **error message**, look it up in [references/error-messages.md](references/error-messages.md) for the exact cause and fix.

## Phase 2: Gather Evidence

Try to get diagnostic information. Be proactive — do as much as you can yourself before asking the user.

### Enable diagnostics

If not already enabled, ask the user to add this to their telemetry config and re-run:

```ts
diagnostics: {
  logLevel: "debug",
}
```

See [references/diagnostics-guide.md](references/diagnostics-guide.md) for complete details on log levels, where output appears, and how to interpret it.

### Get activation logs

Be proactive about retrieving logs yourself:

1. **Find the activation** — Ask the user for the activation ID. If they don't have it, help them find it:
   - Run `aio rt activation list` to see recent activations
   - Ask them to identify the relevant one by timestamp or action name
2. **Query the logs** — Once you have the ID, run `aio rt activation logs <activation_id>` yourself and analyze the output
3. **Caveat:** Without log forwarding, Runtime only stores logs for failed or async activations
4. **Log forwarding** — If they use log forwarding (Splunk, Azure Log Analytics, New Relic), ask them to pull logs from there. They can check their setup with `aio app config get log-forwarding`.
5. **No logs available** — Work with what you have: their code, config, error messages, and whether the backend shows any partial data.

### Add temporary logging

You are allowed to **add temporary log statements** to the user's code to help diagnose issues. This is a valid troubleshooting technique. Examples:

- `console.log` at key points to verify execution order
- Logging `params` (sanitized) to verify env vars reach the action
- Logging exporter config to verify URLs and headers are correct
- Adding `getLogger()` calls to trace data flow

After adding temporary logs, ask the user to trigger the action and share the output. **Remove all temporary logs once the issue is resolved.**

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
- **Intermittent data loss** — Ephemeral container shutdown timing
- **Local setup issues** — Docker not running, tunnel down, ports blocked, tunnel URL stale

### Local setup troubleshooting

If the user has a local observability stack (Docker LGTM, tunneling), check these:

1. **Docker container running?** — `docker ps | grep otel-lgtm`
2. **Collector reachable?** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:4318/v1/traces` (should return 200 or 405)
3. **Tunnel alive?** — Check tunnel container logs (`docker logs cloudflared` or `docker logs ngrok`)
4. **Tunnel URL current?** — Tunnel URLs are ephemeral; if the tunnel restarted, the URL changed. Verify the config still points to the right URL.
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

When fixing config issues, if you're unsure whether a particular OTel SDK option is valid or what it does, consult the documentation sources listed in the references table below.

### Escalate wisely (last resort, not first instinct)

Before suggesting support escalation, evaluate:

1. **Could this be temporary?** — Timeouts, intermittent failures, and CLI errors are often transient. Ask the user to retry first, especially if the error just started or happened once.
2. **Could this be a different root cause?** — CLI commands not working might be a local environment issue (wrong Node version, auth expired, network), not a platform bug. Exhaust local troubleshooting first.
3. **What's the actual impact?** — A one-time timeout is different from consistently broken functionality. Scale the response to the severity.

Only escalate after you've exhausted configuration, code, and local environment troubleshooting:

- **Backend provider support** (New Relic, Grafana, Splunk) — when config is verified correct but data consistently doesn't arrive, one account works and another doesn't with identical config, or backend-specific features aren't working
- **Adobe support** — when Runtime environment itself is the issue (env vars not reaching actions after verified correct mapping, log forwarding config not taking effect, consistent action deployment failures unrelated to code)
- **GitHub issue on @adobe/aio-lib-telemetry** — when a library error doesn't match any documented scenario, diagnostics show internal library errors, or a documented feature reproducibly doesn't work as described

## Documentation Sources

When unsure or doubtful about library behavior, API options, or OTel internals, consult these sources. Assess which is more likely to have the answer and check that one first.

### Library documentation (fetch via raw.githubusercontent.com)

Base URL: `https://raw.githubusercontent.com/adobe/aio-lib-telemetry/refs/heads/main/docs/`

| Doc               | Path                                     | Covers                                                                  |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Usage guide       | `usage.md`                               | Main guide — config, instrumentation, signals, propagation              |
| API reference     | `api-reference/README.md`                | Full API surface (query subdirs for specific functions/types as needed) |
| OTel concepts     | `concepts/open-telemetry.md`             | Library's relationship to OpenTelemetry                                 |
| Grafana setup     | `use-cases/grafana.md`                   | Grafana backend configuration                                           |
| Grafana advanced  | `use-cases/grafana/advanced.md`          | Advanced Grafana patterns                                               |
| New Relic setup   | `use-cases/new-relic.md`                 | New Relic backend configuration                                         |
| Integrations      | `use-cases/integrations/README.md`       | Commerce Events/Webhooks integrations                                   |
| Tunnel forwarding | `use-cases/support/tunnel-forwarding.md` | Local dev tunneling setup                                               |

### OpenTelemetry JS documentation

URL: `https://opentelemetry.io/docs/languages/js/`

Use for: SDK internals, exporter options, instrumentation libraries, propagation protocol, SDK lifecycle, anything beyond the library's wrapper API.

## References

| File                                                               | When to read                                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [references/config-validation.md](references/config-validation.md) | Validating user's config — import paths, schema, valid properties, common mistakes |
| [references/error-messages.md](references/error-messages.md)       | User reports a specific error message                                              |
| [references/diagnostics-guide.md](references/diagnostics-guide.md) | Need to enable/interpret diagnostic output, or need to ask user for logs           |
| [references/common-scenarios.md](references/common-scenarios.md)   | Matching symptoms to known causes and fixes                                        |
