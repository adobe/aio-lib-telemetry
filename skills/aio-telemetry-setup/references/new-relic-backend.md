# New Relic Backend Configuration

Works in both local dev and production without tunneling (direct export to New Relic cloud).

## Prerequisites

- New Relic account with a license key
- License key set as env var (e.g., `NEW_RELIC_LICENSE_KEY`)

## Environment setup

In `.env`:

```
NEW_RELIC_LICENSE_KEY=your-license-key
```

In `app.config.yaml`:

```yaml
my-action:
  function: path/to/my-action.js
  inputs:
    ENABLE_TELEMETRY: true
    NEW_RELIC_LICENSE_KEY: $NEW_RELIC_LICENSE_KEY
```

## Telemetry config

This sample shows one valid way to configure New Relic. You do not need to preserve the helper function shape, constant names, or property order exactly.

New Relic-specific details that must stay correct:

- The New Relic auth header is `api-key`, not `Authorization`.
- The license key should come from params/env, not be hardcoded.

Common failure points:

- Using the wrong auth header for New Relic
- Hardcoding the license key instead of reading it from params/env

```ts
import {
  defineTelemetryConfig,
  getAioRuntimeResourceWithAttributes,
  getPresetInstrumentations,
} from "@adobe/aio-lib-telemetry";

import {
  OTLPTraceExporterProto,
  OTLPLogExporterProto,
  OTLPMetricExporterProto,
  PeriodicExportingMetricReader,
  SimpleLogRecordProcessor,
} from "@adobe/aio-lib-telemetry/otel";

// Choose correct endpoint for your region:
// US: https://otlp.nr-data.net:4318
// EU: https://otlp.eu01.nr-data.net:4318
const NEW_RELIC_OTLP_ENDPOINT = "https://otlp.nr-data.net:4318";

function newRelicConfig(params: Record<string, unknown>) {
  const makeExporterConfig = (endpoint: string) => ({
    url: `${NEW_RELIC_OTLP_ENDPOINT}/${endpoint}`,
    headers: {
      "api-key": params.NEW_RELIC_LICENSE_KEY as string,
    },
  });

  return {
    traceExporter: new OTLPTraceExporterProto(makeExporterConfig("v1/traces")),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporterProto(makeExporterConfig("v1/metrics")),
      }),
    ],
    logRecordProcessors: [
      new SimpleLogRecordProcessor(
        new OTLPLogExporterProto(makeExporterConfig("v1/logs")),
      ),
    ],
  };
}

export const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    sdkConfig: {
      serviceName: "my-app-builder-app",
      instrumentations: getPresetInstrumentations("simple"),
      resource: getAioRuntimeResourceWithAttributes({
        "service.version": "1.0.0",
      }),
      ...newRelicConfig(params),
    },
    diagnostics: {
      logLevel: isDev ? "debug" : "info",
    },
  };
});
```

If you only need traces, you can omit `metricReaders` and `logRecordProcessors`. If you want all three signals, configure each one explicitly rather than relying on shorthand properties.

## View in New Relic

Service appears under **APM & Services** > **Services - OpenTelemetry**.

- Traces: **Monitor** > **Distributed Tracing**
- Metrics: Query bar with NRQL
- Logs: **Monitor** > **Logs** (auto-correlated with traces)
