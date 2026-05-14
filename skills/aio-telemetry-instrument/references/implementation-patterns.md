# Implementation Patterns

Code patterns for each instrumentation technique using the `@adobe/aio-lib-telemetry` API. Reference this during Phase 4 (Implement).

## Entrypoint vs Function Instrumentation

These are different APIs with different options:

**`instrumentEntrypoint(fn, config)`** — for the action's main function:

- Has `propagation` (context propagation settings)
- Has `integrations` (Commerce webhooks/events)
- Has `initializeTelemetry` (SDK config callback)
- General setup is handled by the setup skill, but wrapping a specific action's main function with `instrumentEntrypoint` can be done in this skill if needed

**`instrument(fn, options)`** — for internal functions:

- Has `spanConfig` (span name, attributes, base context)
- Has `isSuccessful` (custom success predicate — by default, functions that don't throw are considered successful)
- Has `hooks`:
  - `onResult(result, span)` — called after the function completes (both success and error status). Use to enrich the span with result-specific attributes (e.g., response size, item count). The span status is already set by this point.
  - `onError(error, span)` — called when the function throws. Can return a replacement Error or undefined to keep the original.
- This is what the instrument skill primarily works with

## Wrapping Functions with instrument()

### Named function (preferred)

```ts
import { instrument } from "@adobe/aio-lib-telemetry";

// Span name derived from function name automatically
export const fetchProducts = instrument(function fetchProducts(
  catalogId: string,
) {
  return fetch(`https://catalog.api/products?catalog=${catalogId}`);
});
```

### Arrow function (requires explicit span name)

```ts
export const fetchProducts = instrument(
  (catalogId: string) =>
    fetch(`https://catalog.api/products?catalog=${catalogId}`),
  { spanConfig: { spanName: "fetchProducts" } },
);
```

### With result hooks (annotate span based on result)

```ts
export const fetchProducts = instrument(
  function fetchProducts(catalogId: string) {
    return fetch(`https://catalog.api/products?catalog=${catalogId}`).then(
      (r) => r.json(),
    );
  },
  {
    hooks: {
      onResult: (result, span) => {
        span.setAttributes({
          "products.count": result.items?.length ?? 0,
        });
      },
    },
  },
);
```

### With error hooks

```ts
export const callExternalApi = instrument(
  function callExternalApi(url: string) {
    return fetch(url).then((r) => r.json());
  },
  {
    hooks: {
      onError: (error, span) => {
        span.setAttributes({ "error.type": error.name });
        // Return undefined to let the original error propagate
        // Or return a new Error to replace it
        return undefined;
      },
    },
  },
);
```

### With custom success predicate

```ts
// For functions that return error objects instead of throwing
export const callExternalApi = instrument(
  function callExternalApi() {
    return externalSdk.call(); // Returns { ok: boolean, data: ... }
  },
  {
    isSuccessful: (result) => result.ok === true,
  },
);
```

## Span Attributes

### Inside an instrumented function

```ts
import { getInstrumentationHelpers } from "@adobe/aio-lib-telemetry";

function processOrder(order) {
  const { currentSpan } = getInstrumentationHelpers();
  currentSpan.setAttributes({
    "order.id": order.id,
    "order.item_count": order.items.length,
    "order.currency": order.currency,
  });
  // ... process
}
```

### Safe access (outside instrumented context or when telemetry may be disabled)

```ts
import { tryGetActiveSpan } from "@adobe/aio-lib-telemetry";

function utilityFunction(data) {
  const span = tryGetActiveSpan();
  span?.setAttributes({ "data.size": data.length });
  // ... process
}
```

## Span Events

### Via convenience helpers

```ts
import { addEventToActiveSpan } from "@adobe/aio-lib-telemetry";

addEventToActiveSpan("cache.miss", { key: cacheKey });
```

### Via currentSpan directly (inside instrumented functions)

```ts
const { currentSpan } = getInstrumentationHelpers();
currentSpan.addEvent("cache.miss", { key: cacheKey });
```

Both approaches work inside instrumented functions. `addEventToActiveSpan` is a convenience that doesn't require getting helpers first. `currentSpan.addEvent()` is equally valid when you already have the helpers reference.

### Safe version (won't throw if no active span)

```ts
import { tryAddEventToActiveSpan } from "@adobe/aio-lib-telemetry";

tryAddEventToActiveSpan("validation.failed", {
  field: "email",
  reason: "invalid format",
});
```

## Metrics

### Define metrics (module-level, lazily initialized)

```ts
import { defineMetrics } from "@adobe/aio-lib-telemetry";

export const metrics = defineMetrics((meter) => ({
  requestsByType: meter.createCounter("action.requests_by_type", {
    description: "Requests processed by type",
  }),
  processingDuration: meter.createHistogram("action.processing_duration_ms", {
    description: "Processing duration in milliseconds",
    unit: "ms",
  }),
  payloadSize: meter.createHistogram("action.payload_size_bytes", {
    description: "Incoming payload sizes",
    unit: "bytes",
  }),
}));
```

### Use metrics (inside action execution)

```ts
metrics.requestsByType.add(1, { type: params.eventType });
metrics.processingDuration.record(endTime - startTime);
metrics.payloadSize.record(JSON.stringify(params).length);
```

### Metric temporality

In serverless environments like App Builder runtime, actions are ephemeral — each invocation starts fresh. This means **delta temporality** is usually the right choice for metric readers, because cumulative metrics would reset on every invocation. Configure the metric reader accordingly:

```ts
import { PeriodicExportingMetricReader } from "@adobe/aio-lib-telemetry/otel";

new PeriodicExportingMetricReader({
  exporter: metricExporter,
  // Some backends require delta temporality configuration on the exporter side
});
```

Check your backend's OTLP documentation for how to configure delta temporality — it varies by provider.

### Metric naming conventions

- Dot-separated namespaces: `action.requests_total`
- Include units when ambiguous: `_ms`, `_bytes`
- Use snake_case: `order_processing_duration_ms`

## Structured Logging

### Inside an instrumented function (via helpers)

```ts
const { logger } = getInstrumentationHelpers();
logger.info("Processing order", {
  orderId: order.id,
  itemCount: order.items.length,
});
logger.warn("Retrying external call", { attempt: retryCount, url });
logger.error("Failed to process", { orderId: order.id, error: err.message });
```

### Standalone (outside instrumented context)

```ts
import { getLogger } from "@adobe/aio-lib-telemetry";

const logger = getLogger("order-processor");
logger.info("Processing started");
```

Logs from `getInstrumentationHelpers().logger` automatically correlate with the active trace. Standalone `getLogger` logs are independent.

## Context Propagation for Outbound Calls

### HTTP calls to other instrumented services

```ts
import { getInstrumentationHelpers } from "@adobe/aio-lib-telemetry";

function callDownstreamService(url: string, payload: unknown) {
  const { contextCarrier } = getInstrumentationHelpers();
  return fetch(url, {
    method: "POST",
    headers: { ...contextCarrier, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
```

### Invoking another runtime action

```ts
const { contextCarrier } = getInstrumentationHelpers();
openwhisk().actions.invoke({
  name: "other-action",
  params: { ...payload, ...contextCarrier },
});
```

The `contextCarrier` contains W3C Trace Context headers (`traceparent`, `tracestate`).

**Receiving side caveats**: The library's `instrumentEntrypoint` tries to auto-extract context from predictable locations (`__ow_headers`, `x-telemetry-context` header, `__telemetryContext` param, `params.data.__telemetryContext`). However, this won't always work — for example, runtime action invocations via OpenWhisk may not pass headers in a format the library expects. If auto-extraction doesn't work, the receiving action can use a custom `propagation.getContextCarrier` to specify where the context lives in the incoming params.

## Auto-Instrumentation Presets

```ts
import { getPresetInstrumentations } from "@adobe/aio-lib-telemetry";

// In defineTelemetryConfig:
sdkConfig: {
  instrumentations: getPresetInstrumentations("simple"),
  // "simple" = HTTP + GraphQL + Undici (fetch)
  // "full" = all Node.js auto-instrumentations
}
```

**Caveat**: Not all auto-instrumentations in "full" work in App Builder runtime. "simple" is the safer default. The `/otel` entrypoint does **not** export auto-instrumentation libraries — it provides APIs, SDKs, exporters, and resources. If specific auto-instrumentation libraries beyond the presets are needed, they must be installed directly from `@opentelemetry/instrumentation-*` packages and added to the `instrumentations` array in `sdkConfig`.

## Config: Conditional vs Separate

`defineTelemetryConfig` receives `params` and `isDev` as arguments precisely so you can adapt behavior at runtime. Before suggesting separate config files, consider whether a single config with conditional logic covers the need.

### Conditional config (preferred)

```ts
export const telemetryConfig = defineTelemetryConfig((params, isDev) => ({
  sdkConfig: {
    // Different exporter in dev vs production
    traceExporter: isDev
      ? new OTLPTraceExporterHttp({ url: "http://localhost:4318/v1/traces" })
      : new OTLPTraceExporterHttp({ url: params.OTLP_ENDPOINT }),

    // Verbose diagnostics in dev, off in production
    ...(isDev ? {} : {}),
  },
  // Enable diagnostics only in development
  diagnostics: isDev ? { logLevel: "debug" } : false,
}));
```

### Params-based conditional logic

```ts
export const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  // Adjust sampling based on action params
  const isHighPriority = params.priority === "critical";

  return {
    sdkConfig: {
      sampler: isHighPriority
        ? new AlwaysOnSampler()
        : new TraceIdRatioBasedSampler(0.1),
      // Use params for endpoint URLs, auth tokens, etc.
      traceExporter: new OTLPTraceExporterHttp({
        url: params.OTLP_ENDPOINT,
        headers: { Authorization: `Bearer ${params.OTLP_TOKEN}` },
      }),
    },
  };
});
```

### Separate config files (rare)

Only needed when actions have fundamentally different telemetry requirements that can't be expressed with conditionals (e.g., completely different exporter stacks). Most of the time, a single config with conditional logic is cleaner and easier to maintain.
