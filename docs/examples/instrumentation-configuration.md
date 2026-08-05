# Customize Instrumentation

In most cases, instrumenting your functions works seamlessly without additional configuration. However, certain scenarios, such as customizing the span name, configuring automatic span events, or reacting to the result of a wrapped function, may require further customization.

The `instrument` helper accepts an optional second argument that allows you to fine-tune the instrumentation.

```ts
// somewhere/in_your/codebase/somefile.{js|ts}

import { instrument } from "@adobe/aio-lib-telemetry";

function externalApiRequest() {
  /* ... */
}
instrument(externalApiRequest, {
  // Place instrumentation options here.
});
```

The `instrumentEntrypoint` helper also supports instrumentation options, but its second argument is also used for the telemetry configuration, so both must be combined:

```ts
import { instrumentEntrypoint } from "@adobe/aio-lib-telemetry";

import { telemetryConfig } from "./telemetry";

function main(params) {
  /* ... */
}

export const instrumentedMain = instrumentEntrypoint(main, {
  ...telemetryConfig,
  // Place instrumentation options here.
});
```

See [`EntrypointInstrumentationConfig`](../api-reference/interfaces/EntrypointInstrumentationConfig.md) for the entrypoint configuration reference.

Common uses for these options include:

- **Customizing Span Names**: Set [`spanConfig.spanName`](../api-reference/type-aliases/InstrumentationConfig.md#spanname). See [`SpanConfig`](../api-reference/type-aliases/InstrumentationConfig.md#spanconfig) for the other span options.
- **Reacting to the Result**: Set [`onResult`](../api-reference/type-aliases/InstrumentationConfig.md#onresult).
- **Handling Errors**: Set [`onError`](../api-reference/type-aliases/InstrumentationConfig.md#onerror).
- **Handling Success/Failure**: See [Customize Span Status](./span-status.md).

See [`InstrumentationConfig`](../api-reference/type-aliases/InstrumentationConfig.md) for all available configuration options.
