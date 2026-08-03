# Add Runtime Invocation Attributes to All Spans

By default, Runtime invocation attributes are added only to spans created through `instrumentEntrypoint` or `instrument`. You can opt into adding them to every span, including spans created directly through OpenTelemetry APIs or by auto-instrumentations, by configuring a custom span processor.

This uses the underlying OpenTelemetry SDK directly and is not behavior provided by the library's instrumentation helpers.

```js
// telemetry.js

import {
  defineTelemetryConfig,
  getAioRuntimeInvocationAttributes,
  getAioRuntimeResource,
  getPresetInstrumentations,
} from "@adobe/aio-lib-telemetry";
import {
  BatchSpanProcessor,
  OTLPTraceExporterProto,
} from "@adobe/aio-lib-telemetry/otel";

class InvocationAttributesSpanProcessor {
  onStart(span) {
    span.setAttributes(getAioRuntimeInvocationAttributes());
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}

export const telemetryConfig = defineTelemetryConfig(() => {
  const traceExporter = new OTLPTraceExporterProto({
    url: "https://example.com/v1/traces",
  });

  return {
    sdkConfig: {
      resource: getAioRuntimeResource(),
      instrumentations: getPresetInstrumentations("simple"),
      spanProcessors: [
        new InvocationAttributesSpanProcessor(),
        new BatchSpanProcessor(traceExporter),
      ],
    },
  };
});
```

> [!IMPORTANT]
> When `spanProcessors` is configured, the OpenTelemetry Node SDK ignores `traceExporter` and uses only the processors in the array. Add the appropriate exporting span processor explicitly, as shown above.

The processor reads the Runtime values whenever a span starts, so reused warm containers receive the current invocation's attributes. Avoid leaving unawaited background work running after an invocation completes, because a span started during a later invocation would receive that later invocation's values.
