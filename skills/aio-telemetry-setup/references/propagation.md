# Context Propagation

Distributed tracing requires passing trace context between services. This applies to any outbound call — other App Builder actions, external APIs, microservices, or any system that supports W3C Trace Context.

## Automatic Propagation (default)

The library automatically extracts context from incoming requests by checking these locations in order:

1. **[DEPRECATED]** `x-telemetry-context` HTTP header
2. `params.__telemetryContext` parameter (Openwhisk/Event Ingress)
3. `params.data.__telemetryContext` parameter (nested data object)
4. **[RECOMMENDED]** W3C Trace Context HTTP headers (traceparent/tracestate)

No code needed on the receiving side. Just use `instrumentEntrypoint` and it handles extraction.

## Sending Context

### Using getInstrumentationHelpers (simplest)

Inside any instrumented function:

```ts
import { getInstrumentationHelpers } from "@adobe/aio-lib-telemetry";

function callOtherAction() {
  const { contextCarrier } = getInstrumentationHelpers();

  // HTTP call - send as headers
  fetch(url, { headers: { ...contextCarrier } });

  // Action-to-action - send in params
  invokeAction("other-action", { ...contextCarrier });
}
```

### Using serializeContextIntoCarrier

Outside instrumented functions (but within an active trace):

```ts
import { serializeContextIntoCarrier } from "@adobe/aio-lib-telemetry";

const carrier = serializeContextIntoCarrier();
// carrier contains W3C traceparent/tracestate headers
```

## Manual Propagation

When the carrier isn't in a standard location, tell the library where to find it:

```ts
instrumentEntrypoint(main, {
  ...telemetryConfig,
  propagation: {
    getContextCarrier: (params) => ({
      carrier: params.data.myCustomCarrier,
      // baseCtx: optionalCustomContext,
    }),
  },
});
```

## Disabling Propagation

```ts
instrumentEntrypoint(main, {
  ...telemetryConfig,
  propagation: { skip: true },
});
```

## Common Patterns

**Action calls another Action via HTTP:**

- Sender: Send `contextCarrier` as HTTP headers
- Receiver: Automatic extraction from W3C headers (no code needed if using `instrumentEntrypoint`)

**Action triggers another Action via Openwhisk invoke:**

- Sender: Send carrier in params body
- Receiver: Automatic extraction from `params.__telemetryContext`

**Action calls an external API / microservice (managed by developer):**

- Sender: Send `contextCarrier` as HTTP headers — same as above
- Receiver: If the external service uses OTel, its SDK automatically extracts W3C `traceparent`/`tracestate` headers. No special handling needed on either side — this is standard W3C Trace Context.

**Action calls a third-party API (not instrumented by developer):**

- Sending context is harmless (extra headers are ignored by the receiver)
- If outbound HTTP auto-instrumentation is active (e.g., `"simple"` preset), the HTTP call already produces a client span — no manual propagation needed

**Action receives Commerce Event (async):**

- Use `commerceEvents()` integration (creates span link, not parent-child)

**Action receives Commerce Webhook (sync HTTP):**

- Use `commerceWebhooks()` integration (handles sampling decisions)
