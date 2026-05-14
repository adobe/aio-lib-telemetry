# API Quick Reference

## Import Paths

```ts
// Main API
import { ... } from "@adobe/aio-lib-telemetry";

// OpenTelemetry re-exports (exporters, processors, etc.)
import { ... } from "@adobe/aio-lib-telemetry/otel";

// Integrations
import { ... } from "@adobe/aio-lib-telemetry/integrations";
```

## Main API Functions

### Configuration

| Function                                     | Purpose                                                                                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `defineTelemetryConfig(callback)`            | Create telemetry config. Callback receives `(params, isDev)` and returns `TelemetryConfig`          |
| `getPresetInstrumentations(preset)`          | Get instrumentation set. `"simple"` = HTTP + Undici + GraphQL. `"full"` = all auto-instrumentations |
| `getAioRuntimeResource()`                    | Create OTel Resource with App Builder runtime attributes                                            |
| `getAioRuntimeResourceWithAttributes(attrs)` | Same as above but merge custom attributes                                                           |

### Instrumentation

| Function                           | Purpose                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `instrumentEntrypoint(fn, config)` | Wrap action's `main` function. Initializes SDK, creates root span. Use once per action.             |
| `instrument(fn, config?)`          | Wrap any function with a span. Only works within an `instrumentEntrypoint` context.                 |
| `getInstrumentationHelpers()`      | Get `{ currentSpan, contextCarrier, tracer, meter, logger }`. Must be inside instrumented function. |

### Metrics & Logging

| Function                    | Purpose                                                                       |
| --------------------------- | ----------------------------------------------------------------------------- |
| `defineMetrics(callback)`   | Define metrics lazily. Callback receives `meter`, returns metric instruments. |
| `getLogger(name, options?)` | Create Winston logger with OTel transport. Logs auto-export.                  |

### Context Propagation

| Function                                 | Purpose                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `serializeContextIntoCarrier()`          | Serialize active context into W3C headers carrier object                         |
| `deserializeContextFromCarrier(carrier)` | Deserialize context from carrier (rarely needed - auto-propagation handles this) |

### Active Span Access

| Function                                | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `getActiveSpan()`                       | Get current active span. Throws if none.     |
| `tryGetActiveSpan()`                    | Get current active span or `undefined`.      |
| `addEventToActiveSpan(name, attrs?)`    | Add event to active span. Throws if no span. |
| `tryAddEventToActiveSpan(name, attrs?)` | Add event to active span. No-op if no span.  |

### Global API

| Function                    | Purpose                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `getGlobalTelemetryApi()`   | Get `{ tracer, meter }` outside instrumented context. Throws if SDK not initialized. |
| `getAioRuntimeAttributes()` | Get runtime attributes as key-value object (action name, namespace, region, etc.)    |

## Key Types

```ts
// Telemetry config returned by defineTelemetryConfig callback
type TelemetryConfig = {
  sdkConfig: Partial<NodeSDKConfiguration>;
  tracer?: Tracer; // Custom tracer (optional, auto-created if omitted)
  meter?: Meter; // Custom meter (optional, auto-created if omitted)
  diagnostics?:
    | false
    | {
        logLevel: DiagnosticsLogLevel;
        loggerName?: string;
        exportLogs?: boolean;
      };
  instrumentationConfig?: EntrypointInstrumentationConfig; // Optional per-config instrumentation overrides
};

// Config for instrument() and instrumentEntrypoint()
type InstrumentationConfig<T> = {
  spanConfig?: SpanOptions & {
    spanName?: string;
    getBaseContext?: (...args) => Context;
  };
  isSuccessful?: (result: ReturnType<T>) => boolean;
  hooks?: {
    onResult?: (result: ReturnType<T>, span: Span) => void;
    onError?: (error: unknown, span: Span) => Error | undefined;
  };
};

// Entrypoint extends InstrumentationConfig with:
interface EntrypointInstrumentationConfig
  extends InstrumentationConfig<EntrypointFunction> {
  propagation?: {
    skip?: boolean;
    getContextCarrier?: (params) => { carrier; baseCtx? };
  };
  integrations?: TelemetryIntegration[];
  initializeTelemetry: (params, isDevelopment) => TelemetryConfig;
}

// Returned by getInstrumentationHelpers()
type InstrumentationContext = {
  currentSpan: Span;
  contextCarrier: Record<PropertyKey, string>;
  tracer: Tracer;
  meter: Meter;
  logger: ReturnType<typeof getLogger>;
};
```

## OpenTelemetry Re-exports (`/otel`)

Commonly used re-exports from `@adobe/aio-lib-telemetry/otel`:

**Exporters:**

- `OTLPTraceExporterProto`, `OTLPTraceExporterHttp`, `OTLPTraceExporterGrpc`
- `OTLPMetricExporterProto`, `OTLPMetricExporterHttp`, `OTLPMetricExporterGrpc`
- `OTLPLogExporterProto`, `OTLPLogExporterHttp`, `OTLPLogExporterGrpc`

**Processors:**

- `SimpleLogRecordProcessor`, `BatchLogRecordProcessor`
- `PeriodicExportingMetricReader`

**Core OTel APIs:**

- `trace`, `metrics`, `context`, `SpanStatusCode`, `SpanKind`
