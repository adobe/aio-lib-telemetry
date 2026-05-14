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

Ask the user to understand their needs before generating code. Adapt questions based on answers:

If the user already provides the backend, action scope, integration needs, distributed tracing requirement, and expected output files, skip the questionnaire and generate the complete implementation directly. In that direct-output mode, produce the requested files in one pass instead of staging the answer across multiple turns.

**1. Situation assessment** (skip if obvious from context):

- New project or adding to existing instrumented actions?
- TypeScript or JavaScript?

**2. Backend choice**:

- Grafana (local Docker LGTM or hosted Grafana Cloud)?
- New Relic?
- Other OTLP-compatible backend?
- "Not sure yet" (generate with localhost defaults)

**3. Signals needed**:

- All three (traces + metrics + logs)? (recommended default)
- Just traces?
- Traces + logs?

**4. Integrations**:

- Receiving Adobe Commerce Events? -> `commerceEvents()`
- Receiving Adobe Commerce Webhooks? -> `commerceWebhooks()`
- Neither?

**5. Distributed tracing**:

- Single action (no propagation needed)?
- Calls other instrumented services — other actions, external APIs, microservices? (needs context propagation)

**6. Local development setup**:

- Need a local observability stack to see telemetry during development?
- Already have a backend they can use for dev? (e.g., New Relic account, Grafana Cloud)
- If local: Docker available? (for LGTM stack)
- Testing deployed actions locally? (needs tunneling — see local dev reference)

Generate code incrementally as the conversation progresses. Don't dump everything at once.

When the request is an implementation task with explicit deliverables such as `telemetry.js`, `app.config.yaml`, or an action entrypoint file, prefer a complete working output over an exploratory conversation.

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

Create a `telemetry.{ts,js}` file. This is shared across all actions.

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

**Dynamic configuration**: The `defineTelemetryConfig` callback receives `params` and `isDev`. Use conditional logic inside it for environment-specific behavior (different exporters in dev vs production, params-based feature flags, etc.) rather than creating separate config files. A single shared config is the norm — multiple `defineTelemetryConfig` calls are only needed in very niche cases where actions have fundamentally different SDK requirements.

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

For integration details, see [references/integrations.md](references/integrations.md).

Choose one placement for an integration: either define it in the shared telemetry config for all relevant actions, or add it in a specific `instrumentEntrypoint` call for one action. Do not apply the same integration in both places.

For Adobe Commerce event handlers that invoke another action, the complete pattern has two separate parts:

1. Apply `commerceEvents()` to link the incoming Commerce trace to the handler span.
2. Forward `contextCarrier` on any downstream OpenWhisk invocation so the next action joins the trace.

Do not use `x-telemetry-context` or `__telemetryContext` when authoring new code. Those are legacy extraction paths, not the recommended propagation mechanism.

### Step 5: Instrument your action (next skill)

With the entrypoint wrapped, your action produces a root span. To add deeper instrumentation — child spans for internal functions, custom metrics, structured logging, span attributes/events — use the `aio-telemetry-instrument` skill. It provides a guided, per-action approach to decide what to instrument and at what depth.

At this point, **setup is complete**. The steps below are optional and depend on the user's architecture.

### Step 6: Context propagation (optional)

Needed when the runtime action calls **other instrumented services** — whether other App Builder actions, external APIs, microservices, or any system that supports W3C Trace Context.

**Sending side** — serialize context into outbound requests:

```ts
import { getInstrumentationHelpers } from "@adobe/aio-lib-telemetry";

function callExternalService() {
  const { contextCarrier } = getInstrumentationHelpers();
  // contextCarrier contains W3C traceparent/tracestate headers
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

- **Another App Builder action**: Automatic extraction if it uses `instrumentEntrypoint`. For new code, send W3C `contextCarrier`; don't introduce deprecated `x-telemetry-context` headers or `__telemetryContext` fields manually.
- **Another App Builder action**: Automatic extraction if it uses `instrumentEntrypoint` and you pass `contextCarrier` in the normal params body or HTTP headers. Reach for `propagation.getContextCarrier` only when the carrier lives in a custom shape.
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
| New Relic setup   | `use-cases/new-relic.md`                 | New Relic backend configuration                                         |
| Integrations      | `use-cases/integrations/README.md`       | Commerce Events/Webhooks integrations                                   |
| Tunnel forwarding | `use-cases/support/tunnel-forwarding.md` | Local dev tunneling setup                                               |

### OpenTelemetry JS documentation

URL: `https://opentelemetry.io/docs/languages/js/`

Use for: SDK internals, exporter options, instrumentation libraries, propagation protocol, SDK lifecycle, anything beyond the library's wrapper API.

## References

| File                                                               | When to read                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| [references/grafana-backend.md](references/grafana-backend.md)     | Configuring Grafana (Docker LGTM or Grafana Cloud) as backend   |
| [references/new-relic-backend.md](references/new-relic-backend.md) | Configuring New Relic as backend                                |
| [references/local-dev-setup.md](references/local-dev-setup.md)     | Setting up local observability stack, Docker Compose, tunneling |
| [references/integrations.md](references/integrations.md)           | Adobe Commerce Events and Webhooks integrations                 |
| [references/propagation.md](references/propagation.md)             | Context propagation between services, manual propagation        |
| [references/api-surface.md](references/api-surface.md)             | Full API reference — functions, types, imports                  |
