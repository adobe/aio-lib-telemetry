# Common Troubleshooting Scenarios

Symptom-based lookup for the most frequent issues users encounter.

## Invalid or Misconfigured Config

**Symptom:** Various — may be no data, runtime errors, or partial functionality. Often there's no clear error because invalid properties are silently ignored by the OTel SDK.

**Why this happens:** Many projects use plain JavaScript without TypeScript, so there's no editor feedback on invalid config properties or imports.

**What to check:**

1. **Invalid imports** — Importing from paths that don't exist:
   - `@adobe/aio-lib-telemetry/exporters` (doesn't exist — use `/otel`)
   - `@adobe/aio-lib-telemetry/sdk` (doesn't exist)
   - Importing names that don't exist (e.g., `OTLPTraceExporter` instead of `OTLPTraceExporterProto`)

2. **Wrong config nesting** — Properties at the wrong level:
   - `serviceName` at top level instead of inside `sdkConfig`
   - `traceExporter` at top level instead of inside `sdkConfig`
   - Exporter config (`url`, `headers`) on `sdkConfig` instead of on the exporter constructor

3. **Invalid `sdkConfig` properties** — Keys that don't exist in `NodeSDKConfiguration`:
   - `exporters`, `logExporter`, `metricExporter` (not valid keys)
   - `endpoint`, `url`, `headers` (belong on the exporter, not sdkConfig)
   - `traces`, `metrics`, `logs` (not valid — configure each signal individually)
   - `name` (use `serviceName`)
   - `tracerProvider`, `meterProvider`, `loggerProvider` (not NodeSDK properties)

4. **Wrong signal wiring** — Each signal type has a different pattern:
   - Traces: `traceExporter: new OTLPTraceExporterProto(...)` (exporter directly)
   - Metrics: `metricReaders: [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporterProto(...) })]` (exporter wrapped in reader)
   - Logs: `logRecordProcessors: [new SimpleLogRecordProcessor(new OTLPLogExporterProto(...))]` (exporter wrapped in processor)
   - Mixing these up (e.g., passing a metric exporter directly) causes silent failures

5. **Deprecated singular properties** — Work but should migrate:
   - `metricReader` → `metricReaders` (array)
   - `logRecordProcessor` → `logRecordProcessors` (array)
   - `spanProcessor` → `spanProcessors` (array)

**Fix:** See [config-validation.md](config-validation.md) for the complete valid schema and validation checklist. If the config needs significant rework, suggest starting over with the `aio-telemetry-setup` skill.

---

## No Telemetry Data At All

**Symptom:** Backend shows nothing. No traces, no metrics, no logs.

**Diagnostic checklist (in order of likelihood):**

1. **`ENABLE_TELEMETRY` not set or not `true`**
   - Check `app.config.yaml`: the action's `inputs` must include `ENABLE_TELEMETRY: true`
   - Can be set at package level (all actions) or action level
   - The value is string-compared: `"true"` (lowercase) only
   - This is the #1 cause of "nothing works"

2. **No exporter configured**
   - `defineTelemetryConfig` must return `sdkConfig` with at least one of: `traceExporter`, `metricReaders`, `logRecordProcessors`
   - Without exporters, the SDK starts but has nowhere to send data

3. **Exporter URL wrong or unreachable**
   - Local Grafana: is Docker running? Is port 4318 open?
   - New Relic: correct regional endpoint? (US: `otlp.nr-data.net`, EU: `otlp.eu01.nr-data.net`)
   - Deployed action pointing to `localhost` — this won't work in production

4. **Authentication failure**
   - New Relic: `api-key` header with valid license key?
   - Grafana Cloud: correct auth token?
   - Enable `"debug"` diagnostics to see HTTP response codes

5. **`instrumentEntrypoint` not wrapping main**
   - The exported `main` function must be the instrumented version
   - Common mistake: `export { main }` before wrapping, or forgetting to re-export

6. **Environment variables not reaching the action**
   - Vars in `.env` must be mapped in `app.config.yaml` via `$VAR_NAME` syntax
   - After changing env vars, you must redeploy (`aio app deploy`)

---

## Traces Missing But Metrics/Logs Work (or vice versa)

**Symptom:** Some signal types arrive at the backend, others don't.

**Cause:** Each signal type has its own exporter. One may be misconfigured while others are fine.

**Fix:**

- Check that all three are configured: `traceExporter`, `metricReaders`, `logRecordProcessors`
- Verify each exporter points to the correct path:
  - Traces: `v1/traces`
  - Metrics: `v1/metrics`
  - Logs: `v1/logs`
- Some backends require separate enablement per signal (check backend dashboard settings)

---

## Works Locally, Not In Production

**Symptom:** Telemetry appears in local Grafana/dev, but not after deploying.

**Diagnostic checklist:**

1. **Exporter still pointing to localhost**
   - Local Docker Grafana defaults to `http://localhost:4318`
   - Deployed actions can't reach your local machine
   - For deployed actions, use a cloud endpoint or a tunnel

2. **Environment variables missing in production**
   - Check `app.config.yaml` maps all required vars
   - `aio rt action get <action-name>` shows the action's resolved parameters

3. **Tunnel not running (if using tunnel approach)**
   - Cloudflare tunnel URLs change on restart
   - The tunnel must be running when the action executes

4. **Network restrictions**
   - Adobe I/O Runtime has egress restrictions in some configurations
   - The backend endpoint must be reachable from the runtime environment

---

## Broken or Disconnected Traces

**Symptom:** Traces exist but parent-child relationships are wrong or missing. Spans appear as separate root traces instead of connected.

**Diagnostic checklist:**

1. **Context not propagated between services**
   - When action A calls action B, A must send context via `contextCarrier` (HTTP headers or params body)
   - B must extract it (automatic if using `instrumentEntrypoint`, or manual via `propagation.getContextCarrier`)

2. **Using deprecated propagation**
   - `x-telemetry-context` header and `__telemetryContext` params are deprecated
   - Migrate to W3C Trace Context (`traceparent`/`tracestate` headers)

3. **Commerce Events showing as separate traces**
   - This is by design: `commerceEvents()` integration creates span links, not parent-child
   - Events are async, so they can't be children of the commerce trace
   - Look for span links in your backend to see the connection

4. **`instrument()` called outside `instrumentEntrypoint()` context**
   - Inner spans require an active context from the entrypoint
   - Ensure the call chain is: `instrumentEntrypoint` → your code → `instrument`

---

## Hot Reload Issues (Development)

**Symptom:** Telemetry behaves oddly after saving files during `aio app dev`. Duplicate spans, warnings about "already initialized", or no new data.

**Cause:** The library uses global state (`global.__OTEL_SDK__`) that persists across hot reloads. The SDK detects it was already initialized and skips re-initialization.

**Fix:**

- Restart the dev server (`Ctrl+C` then `aio app dev` again)
- This is a known limitation documented in the library
- Only affects development; production actions are always fresh containers

---

## Ephemeral Container Data Loss

**Symptom:** Some action invocations produce telemetry, others don't — seemingly random.

**Cause:** Adobe I/O Runtime actions run in ephemeral containers. The SDK registers shutdown handlers (`SIGTERM`, `SIGINT`, `beforeExit`) to flush data, but:

- If the container is terminated abruptly, flush may not complete
- Very fast actions may finish before the exporter's batch interval

**Mitigations:**

- Use `SimpleLogRecordProcessor` instead of `BatchLogRecordProcessor` for logs (sends immediately)
- For traces, the library already flushes on action completion — if data is still lost, the container was killed
- This is a known limitation of the serverless execution model

---

## New Relic Specific Issues

### Traces appear but metrics/logs don't (or vice versa)

- Verify all three exporter paths use the correct suffix (`v1/traces`, `v1/metrics`, `v1/logs`)
- Ensure the `api-key` header is set on ALL exporters, not just the trace exporter
- Check the New Relic account's data ingest limits

### One account works, another doesn't

- License keys are account-specific — verify the right key for the right account
- EU vs US endpoints: accounts are region-bound
- Some account types have different OTLP ingest capabilities
- Check account-level data retention and ingest settings in New Relic's admin panel
- If configuration looks identical between accounts, contact **New Relic support** — this is likely an account-level issue on their side

### Data appears in New Relic but looks wrong

- Service name: check `serviceName` in `sdkConfig`
- Missing attributes: check `resource` configuration
- Traces show in "Services - OpenTelemetry" (not regular APM)

---

## Grafana/Docker LGTM Specific Issues

### Nothing shows in Grafana UI

- Is the Docker container running? `docker ps | grep otel-lgtm`
- Check port 4318 is mapped and not in use by another service
- In Grafana (port 3000): check Explore > select the right data source (Tempo for traces, Prometheus for metrics, Loki for logs)

### Data shows locally but not from deployed actions

- Local Docker is only reachable from your machine
- Use a tunnel (Cloudflare) to make it reachable, or use Grafana Cloud for deployed actions
- Tunnel URL changes on restart — update your config

---

## Local Setup Issues

### Docker LGTM not receiving data

**Symptom:** Local Grafana shows nothing despite config pointing to localhost.

**Diagnostic checklist:**

1. **Container running?** — `docker ps | grep otel-lgtm`. If not listed, start it.
2. **Collector reachable?** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:4318/v1/traces` (should return 200 or 405, not connection refused)
3. **Port conflict?** — Another service on 4318? Check with `lsof -i :4318` or `netstat -an | grep 4318`
4. **Correct data source in Grafana?** — In Grafana UI (port 3000), go to Explore and select the right source: Tempo for traces, Prometheus for metrics, Loki for logs
5. **Time range?** — Grafana defaults to a narrow time range. Make sure you're looking at "Last 15 minutes" or wider

### Tunnel not working (Cloudflare/ngrok)

**Symptom:** Deployed actions send telemetry but nothing arrives at local collector.

**Diagnostic checklist:**

1. **Tunnel container running?** — `docker ps | grep cloudflared` (or `ngrok`)
2. **Tunnel URL current?** — Tunnel URLs are ephemeral. If the tunnel restarted, the URL changed. Check: `docker logs cloudflared 2>&1 | grep "https://"`
3. **Config uses the current URL?** — Verify the exporter URL in the telemetry config (or env var) matches the current tunnel URL
4. **Tunnel can reach collector?** — If using Docker Compose, both services must be on the same network. If standalone, ensure the tunnel points to the right host (`localhost` on Linux, `host.docker.internal` on macOS/Windows)
5. **Test the tunnel directly** — `curl -s -o /dev/null -w "%{http_code}" <tunnel-url>/v1/traces` from your machine. If that fails, the tunnel itself is broken.
6. **Tunnel provider issues** — If the tunnel URL is valid but not routing, this is outside the library's scope. Refer the user to Cloudflare/ngrok documentation or support channels.

### Hot reload breaks telemetry (aio app dev)

See the "Hot Reload Issues" section above. TL;DR: restart the dev server.

---

## Support Escalation Guide

**Escalate wisely, not reflexively.** Before suggesting any support contact:

1. **Could this be temporary?** Timeouts, intermittent failures, and CLI errors are often transient. Suggest the user retry, especially if the issue just started or happened once.
2. **Could this be a different root cause?** CLI commands failing might be a local issue (wrong Node version, expired auth, network). Exhaust local troubleshooting first.
3. **What's the impact?** A one-time timeout is not the same as consistently broken functionality. Scale the response.

### Contact the backend provider's support when:

- Configuration is verified correct but data **consistently** doesn't arrive
- One account works and another doesn't with identical config (after verifying keys/endpoints)
- Backend-specific features (dashboards, alerts, queries) aren't working and you've verified the data is being sent

### Contact Adobe support when:

- Runtime environment itself is the issue — env vars not reaching actions after verified correct mapping, log forwarding not taking effect after redeployment, consistent action deployment failures unrelated to code
- **Not for:** one-off CLI errors, timeouts, or issues that might be local environment problems

### Consider opening a GitHub issue on `@adobe/aio-lib-telemetry` when:

- A library error message doesn't match any documented scenario
- Diagnostics show internal library errors (not exporter/backend errors)
- A documented feature **reproducibly** doesn't work as described
- Integration patches (`commerceEvents`, `commerceWebhooks`) behave incorrectly
