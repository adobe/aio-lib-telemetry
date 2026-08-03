# Configure a Custom Tracer and Meter

The library automatically creates a default tracer and meter if none are provided alongside the `sdkConfig`. However, you can supply your own custom implementations if you need more specific functionality.

> [!NOTE]
> Generally you shouldn't need more than one tracer and meter per app. That's why this library only works with a single instance of both. If you want different tracer/meter names per runtime action you can use environment variables.

```ts
// telemetry.{js|ts}

import { defineTelemetryConfig } from "@adobe/aio-lib-telemetry";
import { trace, metrics } from "@adobe/aio-lib-telemetry/otel";

const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  const tracer = trace.getTracer("my-custom-tracer");
  const meter = metrics.getMeter("my-custom-meter");

  return {
    sdkConfig: {/* SDK Configuration */},

    tracer,
    meter,
  };
});

export { telemetryConfig };
```

See more about the `otel` import path in the API Reference: [OpenTelemetry Re-Exports](../api-reference/README.md#opentelemetry-api).
