# Configuration Validation Guide

`@adobe/aio-lib-telemetry` is a thin wrapper over the OpenTelemetry JS SDK (`@opentelemetry/sdk-node`). The config users write maps directly to OTel's `NodeSDKConfiguration`. When validating, check both the library's wrapper structure AND the underlying OTel schema.

For OTel-specific questions beyond the library's API, refer to the official docs: https://opentelemetry.io/docs/languages/js/

## Valid Import Paths

Only three import paths exist:

```js
// Main API - library functions
import { ... } from "@adobe/aio-lib-telemetry";

// OTel re-exports - exporters, processors, SDK primitives
import { ... } from "@adobe/aio-lib-telemetry/otel";

// Integrations - Commerce Events/Webhooks
import { ... } from "@adobe/aio-lib-telemetry/integrations";
```

**Anything else is invalid.** Common mistakes:

- `@adobe/aio-lib-telemetry/exporters` (does not exist)
- `@adobe/aio-lib-telemetry/sdk` (does not exist)
- `@adobe/aio-lib-telemetry/traces` (does not exist)
- Importing directly from `@opentelemetry/*` packages (works but unnecessary — use `/otel`)

### Main API exports (`@adobe/aio-lib-telemetry`)

```
defineTelemetryConfig, instrumentEntrypoint, instrument,
getInstrumentationHelpers, getPresetInstrumentations,
getAioRuntimeResource, getAioRuntimeResourceWithAttributes,
getLogger, defineMetrics,
serializeContextIntoCarrier, deserializeContextFromCarrier,
getActiveSpan, tryGetActiveSpan,
addEventToActiveSpan, tryAddEventToActiveSpan,
getGlobalTelemetryApi, getAioRuntimeAttributes
```

### OTel re-exports (`@adobe/aio-lib-telemetry/otel`)

**Exporters (renamed for clarity):**

```
OTLPTraceExporterProto, OTLPTraceExporterHttp, OTLPTraceExporterGrpc
OTLPMetricExporterProto, OTLPMetricExporterHttp, OTLPMetricExporterGrpc
OTLPLogExporterProto, OTLPLogExporterHttp, OTLPLogExporterGrpc
ConsoleSpanExporter, ConsoleMetricExporter, ConsoleLogRecordExporter
InMemorySpanExporter, InMemoryMetricExporter, InMemoryLogRecordExporter
```

**Processors and readers:**

```
SimpleLogRecordProcessor, BatchLogRecordProcessor
PeriodicExportingMetricReader, MetricReader
SimpleSpanProcessor, BatchSpanProcessor, NoopSpanProcessor
```

**Samplers:**

```
AlwaysOnSampler, AlwaysOffSampler, ParentBasedSampler, TraceIdRatioBasedSampler
SamplingDecision
```

**Providers and utilities:**

```
LoggerProvider, MeterProvider, BasicTracerProvider, NodeTracerProvider
RandomIdGenerator, AggregationType, DataPointType, InstrumentType, TimeoutError
```

**Full OTel API re-exports:**

```
Everything from @opentelemetry/api (trace, context, metrics, SpanStatusCode, SpanKind, etc.)
Everything from @opentelemetry/api-logs
Everything from @opentelemetry/resources (Resource, etc.)
Everything from @opentelemetry/semantic-conventions
Everything from @opentelemetry/otlp-exporter-base
```

**Common invalid import names:**

- `OTLPTraceExporter` → use `OTLPTraceExporterProto` (or Http/Grpc)
- `OTLPMetricExporter` → use `OTLPMetricExporterProto` (or Http/Grpc)
- `OTLPLogExporter` → use `OTLPLogExporterProto` (or Http/Grpc)
- `BatchSpanExporter` → does not exist, use `BatchSpanProcessor`
- `SimpleSpanExporter` → does not exist, use `SimpleSpanProcessor`

### Integration exports (`@adobe/aio-lib-telemetry/integrations`)

```
commerceEvents, commerceWebhooks
```

## Config Structure Validation

### Top-level: what `defineTelemetryConfig` callback must return

```ts
{
  sdkConfig: Partial<NodeSDKConfiguration>,  // REQUIRED
  tracer?: Tracer,                           // optional, auto-created if omitted
  meter?: Meter,                             // optional, auto-created if omitted
  diagnostics?: false | TelemetryDiagnosticsConfig,  // optional
  instrumentationConfig?: { ... },           // optional, per-config overrides
}
```

**Common mistakes at this level:**

- Putting `serviceName` at the top level instead of inside `sdkConfig`
- Putting `traceExporter` at the top level instead of inside `sdkConfig`
- Returning `sdkConfig` properties directly without the `sdkConfig` wrapper
- Adding arbitrary properties that don't exist in the type

### Inside `sdkConfig`: valid `NodeSDKConfiguration` properties

| Property              | Type                        | Notes                                              |
| --------------------- | --------------------------- | -------------------------------------------------- |
| `serviceName`         | `string`                    | Short service identifier                           |
| `traceExporter`       | `SpanExporter`              | e.g., `new OTLPTraceExporterProto(...)`            |
| `spanProcessors`      | `SpanProcessor[]`           | Alternative to traceExporter for custom processing |
| `metricReaders`       | `IMetricReader[]`           | e.g., `[new PeriodicExportingMetricReader({...})]` |
| `logRecordProcessors` | `LogRecordProcessor[]`      | e.g., `[new SimpleLogRecordProcessor(...)]`        |
| `instrumentations`    | `Instrumentation[]`         | e.g., `getPresetInstrumentations("simple")`        |
| `resource`            | `Resource`                  | e.g., `getAioRuntimeResource()`                    |
| `sampler`             | `Sampler`                   | e.g., `new AlwaysOnSampler()`                      |
| `contextManager`      | `ContextManager`            | Rarely needed                                      |
| `textMapPropagator`   | `TextMapPropagator \| null` | Rarely needed                                      |
| `resourceDetectors`   | `ResourceDetector[]`        | Auto-detection config                              |
| `autoDetectResources` | `boolean`                   | Default: true                                      |
| `views`               | `ViewOptions[]`             | Metric views                                       |
| `spanLimits`          | `SpanLimits`                | Span attribute/event limits                        |
| `idGenerator`         | `IdGenerator`               | Custom trace/span ID generation                    |

**Deprecated properties (still work but should migrate):**

- `metricReader` → use `metricReaders` (array)
- `logRecordProcessor` → use `logRecordProcessors` (array)
- `spanProcessor` → use `spanProcessors` (array)

**Common invalid properties inside sdkConfig:**

- `exporters` (not a property — use `traceExporter`, `metricReaders`, `logRecordProcessors`)
- `logExporter` (not a property — use `logRecordProcessors: [new SimpleLogRecordProcessor(exporter)]`)
- `metricExporter` (not a property — use `metricReaders: [new PeriodicExportingMetricReader({ exporter })]`)
- `tracerProvider` (not a NodeSDKConfiguration property)
- `meterProvider` (not a NodeSDKConfiguration property)
- `loggerProvider` (not a NodeSDKConfiguration property)
- `endpoint` / `url` (these go on the exporter, not on sdkConfig)
- `headers` (these go on the exporter, not on sdkConfig)
- `name` (use `serviceName`)
- `traces` / `metrics` / `logs` (not valid — configure each signal type individually)

### Diagnostics config

```ts
diagnostics: {
  logLevel: "none" | "error" | "warn" | "info" | "debug" | "verbose" | "all",
  loggerName?: string,   // default: "${actionName}/otel-diagnostics"
  exportLogs?: boolean,  // default: true
}
// OR
diagnostics: false  // to explicitly disable
```

### Entrypoint config (second arg to `instrumentEntrypoint`)

```ts
instrumentEntrypoint(handler, {
  ...telemetryConfig,        // spread from defineTelemetryConfig
  propagation?: {            // context propagation config
    skip?: boolean,
    getContextCarrier?: (params) => { carrier, baseCtx? },
  },
  integrations?: [...],      // TelemetryIntegration[]
  spanConfig?: {             // root span config
    spanName?: string,
    ...SpanOptions,
  },
  isSuccessful?: (result) => boolean,
  hooks?: {
    onResult?: (result, span) => void,
    onError?: (error, span) => Error | undefined,
  },
})
```

## Validation Checklist

When reviewing a user's config, check in this order:

1. **Import paths** — Are all imports from valid paths? Are the imported names correct?
2. **Config structure** — Does `defineTelemetryConfig` return `{ sdkConfig: { ... } }` (not flat properties)?
3. **sdkConfig properties** — Are all properties valid `NodeSDKConfiguration` keys? No invented properties?
4. **Exporter instantiation** — Are exporters created with `new`? Correct class names? Correct constructor args?
5. **Signal wiring** — Is each signal type (traces/metrics/logs) correctly wired?
   - Traces: `traceExporter: new OTLPTraceExporter...(...)`
   - Metrics: `metricReaders: [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter...(...) })]`
   - Logs: `logRecordProcessors: [new SimpleLogRecordProcessor(new OTLPLogExporter...(...))]`
6. **Entrypoint wrapping** — Is `instrumentEntrypoint` correctly wrapping and exporting the main function?
7. **app.config.yaml** — Is `ENABLE_TELEMETRY: true` set? Are env vars mapped with `$VAR_NAME`?

## When in Doubt

If a property or pattern isn't documented in the library's API, check if it belongs to the underlying OpenTelemetry SDK: https://opentelemetry.io/docs/languages/js/

The library passes `sdkConfig` almost directly to `new NodeSDK(sdkConfig)`. If it's valid in OTel's NodeSDK, it's valid in `sdkConfig`. If it's not valid there, it's not valid here either.
