# API Reference

A comprehensive reference for the public API provided by the `@aio-lib-telemetry` library.

## Available Imports

These are all the imports you can get from this library when importing from `@adobe/aio-lib-telemetry`.

```typescript
import {
  // Configuration
  defineTelemetryConfig,
  defineMetrics,

  // Configuration Helpers
  getAioRuntimeAttributes,
  getAioRuntimeResource,
  getAioRuntimeResourceWithAttributes,
  getPresetInstrumentations,

  // Tracing Helpers
  getActiveSpan,
  tryGetActiveSpan,
  addEventToActiveSpan,
  serializeContextIntoCarrier,
  deserializeContextFromCarrier,

  // Instrumentation
  instrument,
  instrumentEntrypoint,
  getInstrumentationHelpers,

  // Logging
  getLogger,

  // Global Telemetry API
  getGlobalTelemetryApi,
} from "@adobe/aio-lib-telemetry";
```

### OpenTelemetry API

OpenTelemetry features a modular architecture consisting of over 25 packages, which can make importing specific APIs rather complex. To streamline this process, our library offers a convenient "meta-package" [`otel` import path](_media/otel.ts). This allows you to import all the necessary OpenTelemetry APIs from a single source, simplifying the setup.

While this does not include every OpenTelemetry API, it covers the most common ones you will need in your code. If you find any essential APIs missing, feel free to open an issue or submit a PR. You can also import the APIs you need from the individual OpenTelemetry packages, but this is a convenient way to import all the APIs you need in a single import.

> [!TIP]
> When working with OpenTelemetry exporters, you have three protocols to choose from:
>
> - **OTLP/GRPC**, **OTLP/HTTP**, and **OTLP/Proto**
>
> The official packages use the same class name for exporters across all protocols, which can make it tricky to pick the right one or get reliable auto-completion. To help with this, our library re-exports them with clear protocol suffixes, for example:
>
> - `OTLPTraceExporter` from `@opentelemetry/exporter-trace-otlp-http` -> `OTLPTraceExporterHttp`
> - `OTLPTraceExporter` from `@opentelemetry/exporter-trace-otlp-grpc` -> `OTLPTraceExporterGrpc`
> - `OTLPTraceExporter` from `@opentelemetry/exporter-trace-otlp-proto` -> `OTLPTraceExporterProto`
>
> Using them is the same as using the original class, but with a more predictable and consistent naming convention.

```typescript
import {
  // Import all the OpenTelemetry APIs you need
  SimpleSpanProcessor,
  CompressionAlgorithm,
  OTLPTraceExporterProto,
  OTLPMetricExporterHttp,
  OTLPLogExporterGrpc,
  // ...
} from "@adobe/aio-lib-telemetry/otel";
```

## Interfaces

| Interface                                                                        | Description                                         |
| -------------------------------------------------------------------------------- | --------------------------------------------------- |
| [EntrypointInstrumentationConfig](interfaces/EntrypointInstrumentationConfig.md) | The configuration for entrypoint instrumentation.   |
| [TelemetryConfig](interfaces/TelemetryConfig.md)                                 | The configuration options for the telemetry module. |

## Type Aliases

| Type Alias                                                                       | Description                                                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [DiagnosticsLogLevel](type-aliases/DiagnosticsLogLevel.md)                       | Available log levels for the OpenTelemetry `DiagLogger`.                          |
| [EntrypointFunction](type-aliases/EntrypointFunction.md)                         | The shape of the entrypoint function.                                             |
| [InstrumentationConfig](type-aliases/InstrumentationConfig.md)                   | The configuration for instrumentation.                                            |
| [InstrumentationContext](type-aliases/InstrumentationContext.md)                 | The context for the current operation.                                            |
| [TelemetryApi](type-aliases/TelemetryApi.md)                                     | Defines the global telemetry API. These items should be set once per application. |
| [TelemetryDiagnosticsConfig](type-aliases/TelemetryDiagnosticsConfig.md)         | The configuration for the telemetry diagnostics.                                  |
| [TelemetryInstrumentationPreset](type-aliases/TelemetryInstrumentationPreset.md) | Defines the names of available instrumentation presets.                           |
| [TelemetryIntegration](type-aliases/TelemetryIntegration.md)                     | A telemetry integration.                                                          |
| [TelemetryPropagationConfig](type-aliases/TelemetryPropagationConfig.md)         | Configuration related to context propagation (for distributed tracing).           |

## Functions

| Function                                                                                | Description                                                                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [addEventToActiveSpan](functions/addEventToActiveSpan.md)                               | Adds an event to the given span.                                                                                    |
| [defineMetrics](functions/defineMetrics.md)                                             | Helper to define a record of metrics.                                                                               |
| [defineTelemetryConfig](functions/defineTelemetryConfig.md)                             | Helper to define the telemetry configuration for an entrypoint.                                                     |
| [deserializeContextFromCarrier](functions/deserializeContextFromCarrier.md)             | Deserializes the context from a carrier and augments the given base context with it.                                |
| [getActiveSpan](functions/getActiveSpan.md)                                             | Gets the active span from the given context.                                                                        |
| [getAioRuntimeAttributes](functions/getAioRuntimeAttributes.md)                         | biome-ignore-all lint/performance/noBarrelFile: This is the import entrypoint for the public API.                   |
| [getAioRuntimeResource](functions/getAioRuntimeResource.md)                             | biome-ignore-all lint/performance/noBarrelFile: This is the import entrypoint for the public API.                   |
| [getAioRuntimeResourceWithAttributes](functions/getAioRuntimeResourceWithAttributes.md) | biome-ignore-all lint/performance/noBarrelFile: This is the import entrypoint for the public API.                   |
| [getGlobalTelemetryApi](functions/getGlobalTelemetryApi.md)                             | Gets the global telemetry API.                                                                                      |
| [getInstrumentationHelpers](functions/getInstrumentationHelpers.md)                     | Access helpers for the current instrumented operation.                                                              |
| [getLogger](functions/getLogger.md)                                                     | Gets a logger instance that can export OpenTelemetry logs.                                                          |
| [getPresetInstrumentations](functions/getPresetInstrumentations.md)                     | Gets the instrumentations for a given preset.                                                                       |
| [instrument](functions/instrument.md)                                                   | Instruments a function.                                                                                             |
| [instrumentEntrypoint](functions/instrumentEntrypoint.md)                               | Instruments the entrypoint of a runtime action. Needs to be used ONLY with the `main` function of a runtime action. |
| [serializeContextIntoCarrier](functions/serializeContextIntoCarrier.md)                 | Serializes the current context into a carrier.                                                                      |
| [tryAddEventToActiveSpan](functions/tryAddEventToActiveSpan.md)                         | Tries to add an event to the active span.                                                                           |
| [tryGetActiveSpan](functions/tryGetActiveSpan.md)                                       | Tries to get the active span from the given context.                                                                |
