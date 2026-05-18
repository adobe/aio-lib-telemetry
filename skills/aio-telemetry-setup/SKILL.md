---
name: aio-telemetry-setup
description: >
  Interactive setup guide for adding OpenTelemetry observability to Adobe App Builder runtime actions
  using @adobe/aio-lib-telemetry. Use when the user wants to: (1) add telemetry/observability to an
  App Builder action, (2) instrument runtime actions with traces, metrics, or logs, (3) configure an
  observability backend (Grafana, New Relic, Datadog, etc.) for App Builder, (4) set up distributed
  tracing across actions, (5) add Commerce event/webhook integrations, or (6) understand how to setup
  @adobe/aio-lib-telemetry. Triggers on: "add telemetry", "instrument my action", "set up tracing",
  "configure observability", "export traces/metrics/logs", "OpenTelemetry for App Builder".
---

# `@adobe/aio-lib-telemetry` Setup

Interactive setup guide. Gather user requirements through conversation, then generate the right configuration.

## Interactive Flow

Ask only for missing inputs: project state, backend, desired signals, any `commerceEvents()` or `commerceWebhooks()` integration, whether traces must continue downstream, and whether local development needs Docker or tunneling. If the user already gives these, generate the implementation in one pass.

For fixed-choice questions, use the runtime's selectable-question tool.

Generate incrementally unless the user asks for concrete files.

## Setup Steps

### Step 1: Install

```sh
npm install @adobe/aio-lib-telemetry
```

### Step 2: Enable telemetry

In `app.config.yaml`, add `ENABLE_TELEMETRY: true` as input to each action (or at package level for all actions).

```yaml
runtimeManifest:
  packages:
    my-package:
      actions:
        my-action:
          function: actions/my-action/index.js
          inputs:
            ENABLE_TELEMETRY: true
```

CRITICAL: Without this env var set to `true`, telemetry silently does nothing. This is the #1 setup mistake.

### Step 3: Create telemetry config

Create a `telemetry.{ts,js}` file.

**Minimal config (no backend yet):**

```ts
import {
  defineTelemetryConfig,
  getPresetInstrumentations,
  getAioRuntimeResource,
} from "@adobe/aio-lib-telemetry";

export const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    sdkConfig: {
      serviceName: "my-app-builder-app",
      instrumentations: getPresetInstrumentations("simple"),
      resource: getAioRuntimeResource(),
    },
  };
});
```

For backend-specific exporter configuration, read the appropriate reference:

- **Grafana**: See [references/grafana-backend.md](references/grafana-backend.md)
- **New Relic**: See [references/new-relic-backend.md](references/new-relic-backend.md)
- **Other OTLP backends**: Adapt the Grafana pattern with the backend's OTLP endpoint URL and auth headers

Use `params` or `isDev` inside one shared `defineTelemetryConfig` for environment-specific behavior. Separate config files are rare.

### Step 4: Instrument entrypoint

Wrap the action's `main` function:

```ts
import { instrumentEntrypoint } from "@adobe/aio-lib-telemetry";
import { telemetryConfig } from "./telemetry";

function main(params) {
  // existing implementation
}

const instrumentedMain = instrumentEntrypoint(main, telemetryConfig);
export { instrumentedMain as main };
```

If using integrations, merge them into the config:

```ts
import { commerceEvents } from "@adobe/aio-lib-telemetry/integrations";

const instrumentedMain = instrumentEntrypoint(main, {
  ...telemetryConfig,
  integrations: [commerceEvents()],
});
```

See [references/integrations.md](references/integrations.md) for details.

Use one placement only: shared telemetry config or a specific `instrumentEntrypoint`.

For Commerce handlers that invoke another action, use `commerceEvents()` on the handler and forward `contextCarrier` on the downstream OpenWhisk call. Do not introduce `x-telemetry-context` or `__telemetryContext` in new code.

### Step 5: Instrument your action (next skill)

With the entrypoint wrapped, your action produces a root span. For deeper instrumentation, use `aio-telemetry-instrument`.

At this point, **setup is complete**. The steps below are optional and depend on the user's architecture.

### Step 6: Context propagation (optional)

Needed when the runtime action calls **other instrumented services** — whether other App Builder actions, external APIs, microservices, or any system that supports W3C Trace Context.

**Sending side** — serialize context into outbound requests:

```ts
import { getInstrumentationHelpers } from "@adobe/aio-lib-telemetry";

function callExternalService() {
  const { contextCarrier } = getInstrumentationHelpers();
  fetch(serviceUrl, { headers: { ...contextCarrier } });
}
```

For OpenWhisk action-to-action calls, pass the carrier in the params body rather than HTTP headers:

```ts
function invokeFulfillment(openwhisk, payload) {
  const { contextCarrier } = getInstrumentationHelpers();

  return openwhisk.actions.invoke({
    name: "fulfill-order",
    params: { ...payload, ...contextCarrier },
  });
}
```

**Receiving side** — depends on the target:

- **Another App Builder action**: Automatic extraction if it uses `instrumentEntrypoint` and you send `contextCarrier` in normal params or headers. Use `propagation.getContextCarrier` only for custom carrier shapes.
- **External service with OTel**: Their SDK handles W3C header extraction automatically
- **Custom setup**: They need to extract `traceparent`/`tracestate` from headers

For manual propagation, non-HTTP scenarios, or disabling propagation, see [references/propagation.md](references/propagation.md).

### Step 7: Local development setup (optional)

If the user wants to see telemetry data during local development, guide them through setting up a local observability stack. See [references/local-dev-setup.md](references/local-dev-setup.md) for:

- Docker LGTM stack (all-in-one local collector + backends)
- Docker Compose with tunneling for testing deployed actions
- `isDev` conditional configuration patterns

## Helpers Available Inside Instrumented Functions

`getInstrumentationHelpers()` returns:

- `currentSpan` - active span (set attributes, add events)
- `contextCarrier` - pre-serialized W3C headers for propagation
- `tracer` - global tracer for creating custom spans
- `meter` - global meter for creating custom metrics
- `logger` - auto-configured logger correlated to current trace

Throws if called outside an instrumented function.

## Troubleshooting Quick Reference

| Symptom                            | Likely cause                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| No telemetry at all                | `ENABLE_TELEMETRY` not set to `true`                                                                                            |
| No spans for inner functions       | Used `instrument` but function never called within an `instrumentEntrypoint` context. See the `aio-telemetry-instrument` skill. |
| Traces not linking across services | Context carrier not sent in outbound headers                                                                                    |
| Signals missing occasionally       | Container shut down before flush completed (known limitation)                                                                   |

Enable diagnostics for debugging:

```ts
defineTelemetryConfig((params, isDev) => ({
  sdkConfig: {
    /* ... */
  },
  diagnostics: { logLevel: "debug" },
}));
```

For library and OpenTelemetry documentation sources, see [references/documentation-sources.md](references/documentation-sources.md).

## References

| File                                                                       | When to read                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [references/documentation-sources.md](references/documentation-sources.md) | Raw GitHub doc paths and OpenTelemetry JS docs                  |
| [references/grafana-backend.md](references/grafana-backend.md)             | Configuring Grafana (Docker LGTM or Grafana Cloud) as backend   |
| [references/new-relic-backend.md](references/new-relic-backend.md)         | Configuring New Relic as backend                                |
| [references/local-dev-setup.md](references/local-dev-setup.md)             | Setting up local observability stack, Docker Compose, tunneling |
| [references/integrations.md](references/integrations.md)                   | Adobe Commerce Events and Webhooks integrations                 |
| [references/propagation.md](references/propagation.md)                     | Context propagation between services, manual propagation        |
| [references/api-surface.md](references/api-surface.md)                     | Full API reference — functions, types, imports                  |
