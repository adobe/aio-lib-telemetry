# Grafana Backend Configuration

## Quick Start (Docker LGTM)

Best for local development. Single container with Collector + Prometheus + Tempo + Loki + Grafana.

### Start the stack

```bash
docker run --rm -p 3000:3000 -p 4317:4317 -p 4318:4318 \
  --name otel-lgtm \
  grafana/otel-lgtm:latest
```

Ports: 3000 (Grafana UI), 4317 (gRPC), 4318 (HTTP - recommended).

### Telemetry config

```ts
import {
  defineTelemetryConfig,
  getAioRuntimeResource,
  getPresetInstrumentations,
} from "@adobe/aio-lib-telemetry";

import {
  OTLPTraceExporterProto,
  OTLPLogExporterProto,
  OTLPMetricExporterProto,
  PeriodicExportingMetricReader,
  SimpleLogRecordProcessor,
} from "@adobe/aio-lib-telemetry/otel";

export const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    sdkConfig: {
      serviceName: "my-app-builder-app",
      instrumentations: getPresetInstrumentations("simple"),
      resource: getAioRuntimeResource(),

      // No URL needed - defaults to http://localhost:4318
      traceExporter: new OTLPTraceExporterProto(),
      metricReaders: [
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporterProto(),
        }),
      ],
      logRecordProcessors: [
        new SimpleLogRecordProcessor(new OTLPLogExporterProto()),
      ],
    },
  };
});
```

View at http://localhost:3000 (no login required).

## Deployed Actions (via Tunneling)

For testing deployed actions against local Grafana. For full setup including Docker Compose and tunnel options, see [local-dev-setup.md](local-dev-setup.md).

> **WARNING**: Tunneling is for development only. Never use tunnel URLs in production — they are ephemeral, unauthenticated, and will lose data when stopped.

## Production (Grafana Cloud)

Use Grafana Cloud's OTLP endpoint. Same exporter pattern as above but with:

- URL: Grafana Cloud OTLP endpoint
- Headers: Grafana Cloud authentication token
