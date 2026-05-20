# Local Development Setup

Set up a local observability stack to see traces, metrics, and logs during development.

## Option 1: Docker LGTM (quickest)

Single container with OTel Collector + Prometheus + Tempo + Loki + Grafana.

```bash
docker run --rm -p 3000:3000 -p 4317:4317 -p 4318:4318 \
  --name otel-lgtm \
  grafana/otel-lgtm:latest
```

- Grafana UI: http://localhost:3000 (no login required)
- OTLP HTTP: `http://localhost:4318` (recommended)
- OTLP gRPC: `localhost:4317`

No exporter URL needed in config — the OTLP exporters default to `http://localhost:4318`.

### Persistent data

Add a volume to keep data across restarts:

```bash
docker run --rm -p 3000:3000 -p 4317:4317 -p 4318:4318 \
  -v lgtm-data:/data \
  --name otel-lgtm \
  grafana/otel-lgtm:latest
```

## Option 2: Docker Compose with Tunnel

For testing **deployed** actions against your local stack. Deployed I/O Runtime actions can't reach `localhost`, so a tunnel exposes the collector over a public URL.

> **WARNING: Tunneling is for development and testing ONLY.**
>
> A tunnel exposes your local collector to the public internet without authentication. **NEVER** use a tunnel URL in production configuration. Production actions must export to a proper hosted backend (Grafana Cloud, New Relic, Datadog, etc.) with authentication.
>
> If you accidentally deploy with a tunnel URL:
>
> - Telemetry data will be lost when the tunnel stops
> - Tunnel URLs are ephemeral and change on restart
> - There is no authentication — anyone with the URL can send data to your collector

### Docker Compose file

Create `docker-compose.telemetry.yml` in your project (or anywhere convenient):

```yaml
services:
  otel-lgtm:
    image: grafana/otel-lgtm:latest
    container_name: otel-lgtm
    restart: unless-stopped
    ports:
      - "3000:3000" # Grafana UI
      - "4317:4317" # OTLP gRPC
      - "4318:4318" # OTLP HTTP
    volumes:
      - "lgtm-data:/data"
    networks: [telemetry]

  # Cloudflare Tunnel - Exposes collector for deployed actions
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    networks: [telemetry]
    depends_on: [otel-lgtm]
    command:
      - "tunnel"
      - "--url"
      - "http://otel-lgtm:4318"

networks:
  telemetry:
    driver: bridge

volumes:
  lgtm-data:
```

Start:

```bash
docker compose -f docker-compose.telemetry.yml up -d
```

The Cloudflare tunnel logs will show the public URL (e.g., `https://abc123.trycloudflare.com`). Check with:

```bash
docker logs cloudflared 2>&1 | grep "https://"
```

### Alternative: ngrok

If you prefer ngrok over Cloudflare:

```bash
# Replace the cloudflared service with:
ngrok:
  image: ngrok/ngrok:latest
  container_name: ngrok
  restart: unless-stopped
  networks: [telemetry]
  depends_on: [otel-lgtm]
  command: http otel-lgtm:4318
  environment:
    - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
```

ngrok requires a free account and auth token. Set `NGROK_AUTHTOKEN` in your environment.

### Alternative: standalone tunnel (no Docker Compose)

If you already have Docker LGTM running standalone:

```bash
# Cloudflare (Linux — uses host networking)
docker run --rm -it --net=host cloudflare/cloudflared:latest tunnel --url http://localhost:4318

# Cloudflare (macOS/Windows)
docker run --rm -it cloudflare/cloudflared:latest tunnel --url http://host.docker.internal:4318
```

## Telemetry Config for Local Dev

Use `isDev` to switch between local and production exporters:

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

function makeCollectorConfig(baseUrl: string) {
  const exp = (path: string) => ({ url: `${baseUrl}/${path}` });

  return {
    traceExporter: new OTLPTraceExporterProto(exp("v1/traces")),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporterProto(exp("v1/metrics")),
      }),
    ],
    logRecordProcessors: [
      new SimpleLogRecordProcessor(new OTLPLogExporterProto(exp("v1/logs"))),
    ],
  };
}

export const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  // Local dev: export to localhost (Docker LGTM)
  // Deployed (testing): export to tunnel URL
  // Production: export to hosted backend
  const exportUrl = isDev
    ? "http://localhost:4318"
    : (params.OTEL_EXPORTER_URL as string) || "http://localhost:4318";

  return {
    sdkConfig: {
      serviceName: "my-app-builder-app",
      instrumentations: getPresetInstrumentations("simple"),
      resource: getAioRuntimeResource(),
      ...makeCollectorConfig(exportUrl),
    },
    diagnostics: isDev ? { logLevel: "debug" } : undefined,
  };
});
```

### Using a tunnel URL for deployed action testing

When testing deployed actions against a local stack via tunnel:

1. Get the tunnel URL from `cloudflared` / `ngrok` logs
2. Set it as an env var in `app.config.yaml`:

```yaml
my-action:
  function: actions/my-action/index.js
  inputs:
    ENABLE_TELEMETRY: true
    OTEL_EXPORTER_URL: $OTEL_EXPORTER_URL
```

3. Set in `.env`:

```
OTEL_EXPORTER_URL=https://abc123.trycloudflare.com
```

4. Deploy and trigger the action — data flows through the tunnel to your local Grafana

> **Remember**: Remove or replace `OTEL_EXPORTER_URL` with your production backend URL before deploying to production. The tunnel URL will stop working the moment you stop the tunnel.

## Using a Cloud Backend for Dev

If you already have a New Relic account, Grafana Cloud, or another hosted backend, you can skip the local stack entirely and export directly. This avoids Docker and tunneling but means dev and production data go to the same place. Use `isDev` to set a different `service.name` or add a `deployment.environment` resource attribute to distinguish them.
