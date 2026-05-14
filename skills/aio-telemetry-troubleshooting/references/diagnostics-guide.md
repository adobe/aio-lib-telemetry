# Diagnostics Guide

How to enable, read, and use the library's diagnostic output for root cause analysis.

## Enabling Diagnostics

Add `diagnostics` to the telemetry config:

```ts
export const telemetryConfig = defineTelemetryConfig((params, isDev) => ({
  sdkConfig: {
    /* ... */
  },
  diagnostics: {
    logLevel: isDev ? "debug" : "info",
    // exportLogs: true,    // default: true (send diag logs to backend)
    // loggerName: "custom", // default: "${actionName}/otel-diagnostics"
  },
}));
```

### Log Levels (from least to most verbose)

| Level       | Shows                                        |
| ----------- | -------------------------------------------- |
| `"none"`    | Nothing                                      |
| `"error"`   | SDK failures, export errors                  |
| `"warn"`    | + duplicate init warnings, deprecations      |
| `"info"`    | + SDK lifecycle messages (started, shutdown) |
| `"debug"`   | + internal OTel SDK debug output             |
| `"verbose"` | + detailed trace/span creation info          |
| `"all"`     | Everything                                   |

**Recommended for troubleshooting:** `"debug"` — gives internal OTel details without overwhelming noise.

## Where Diagnostic Logs Appear

### Activation logs (`aio rt activation logs <id>`)

**ALL diagnostic levels** appear here. This is the primary place to read diagnostics.

**Limitations:**

- Without log forwarding, Runtime only stores logs for **failed or async** activations (7-day retention)
- Maximum 10 MB per activation (truncated beyond that)
- The `x-ow-extra-logging` header forces all logs to be captured but is throttled in production

### Observability backend (if `exportLogs: true`)

Only `info`, `warn`, `error` diagnostic logs are exported. `debug`/`verbose`/`all` levels are **intentionally filtered out** to prevent leaking verbose internal data to backends.

This means: if you need `debug` output, you must read activation logs — it won't appear in Grafana/New Relic/etc.

### Log forwarding destinations

If the App Builder project uses log forwarding (Splunk, Azure Log Analytics, New Relic), activation logs go to that destination instead of being accessible via `aio rt activation logs`.

Supported destinations: Splunk Cloud, Splunk Enterprise, Azure Log Analytics, New Relic.

Configured via: `aio app config set log-forwarding`

## Reading Diagnostic Output

### Healthy startup sequence

When everything works, you should see (at `info` level):

```
[otel-diagnostics] OpenTelemetry automatic instrumentation started successfully
```

And on shutdown:

```
[otel-diagnostics] Shutting down the telemetry SDK. No more telemetry data will be emitted
[otel-diagnostics] Telemetry SDK shutdown reason -> "invocation-complete"
[otel-diagnostics] OpenTelemetry automatic instrumentation shutdown successful
```

### Warning signs

| Message                                                      | Meaning                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| `Telemetry SDK already initialized, skipping...`             | Hot reload re-initialized (normal in dev, suspicious in prod) |
| `Telemetry API already initialized. Skipping...`             | Same as above                                                 |
| `Telemetry SDK not initialized, skipping telemetry shutdown` | SDK never started — check `ENABLE_TELEMETRY`                  |

### Error signs

| Message                                                                         | Meaning                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------- |
| `Failed to start the telemetry SDK, your application won't emit telemetry data` | SDK crash on init — underlying error follows |
| `Failed to shutdown the telemetry SDK, telemetry data may not be flushed`       | Shutdown error — data may be lost            |
| `Failed to set the telemetry diagnostics`                                       | Diagnostics logger itself failed             |

### Debug-level output

At `"debug"` level, you also see OpenTelemetry SDK internals:

- Exporter connection attempts and results
- Span creation/completion events
- Resource detection details
- Propagation header parsing

This is where you find **why** an exporter failed (e.g., connection refused, 401 auth error, timeout).

## Asking Users for Diagnostic Logs

### When activation logs are available

Ask the user to:

1. Enable diagnostics at `"debug"` level
2. Trigger the action
3. Run `aio rt activation logs <activation_id>` and share the output

**Note:** They need the activation ID. They can find it via:

- `aio rt activation list` — shows recent activations
- The response body of a web action invocation
- The `aio app logs` command for application-level logs

### When log forwarding is enabled

Activation logs go to the forwarding destination. Ask the user to:

1. Check which destination: `aio app config get log-forwarding`
2. Pull logs from that destination (Splunk search, Azure query, New Relic logs, etc.)
3. Filter by action name and/or time range

### When the user can't get logs

If they can't provide logs, work with what's available:

- The **error message** they see (match against error-messages.md)
- Their **telemetry config code** (look for misconfiguration)
- Their **app.config.yaml** (check `ENABLE_TELEMETRY`, env vars)
- Their **backend dashboard** (any partial data arriving?)
- Whether it **ever worked** or never worked at all

## Using Diagnostics for RCA

### Step 1: Check if SDK started

Look for "OpenTelemetry automatic instrumentation started successfully". If missing, SDK never started.

### Step 2: Check for errors

Any `error` level messages indicate failures. The error object following the message has the root cause.

### Step 3: Check exporter output (debug level)

At `debug`, OTel logs exporter HTTP requests. Look for:

- Connection refused → wrong URL or service not running
- 401/403 → authentication issue (wrong API key, expired token)
- 429 → rate limiting
- Timeout → network issue or slow backend

### Step 4: Check shutdown

"shutdown successful" means flush completed. If missing or "failed to shutdown", data may not have been sent before the container terminated.
