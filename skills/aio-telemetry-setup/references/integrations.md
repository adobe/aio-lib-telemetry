# Integrations

Integrations are preconfigured patches that handle incoming trace extraction, span linking, and sampling for external systems. Import from `@adobe/aio-lib-telemetry/integrations`.

## Adobe Commerce Events

For runtime actions receiving asynchronous Adobe Commerce Events.

```ts
import { commerceEvents } from "@adobe/aio-lib-telemetry/integrations";
```

**What it does:**

1. Extracts trace context from `data._metadata` field (traceparent/tracestate)
2. Creates span links to Commerce event trace (not parent-child, since events are async)
3. Handles only the incoming Commerce event linkage; it does not propagate trace context to any downstream action you invoke
4. Adds `commerce.traceid` attribute for backends without span link support

**Usage (global):**

```ts
export const telemetryConfig = defineTelemetryConfig((params, isDev) => ({
  sdkConfig: {
    /* ... */
  },
  integrations: [commerceEvents()],
}));
```

**Usage (per-action):**

```ts
export const main = instrumentEntrypoint(handler, {
  ...telemetryConfig,
  integrations: [commerceEvents()],
});
```

**When to use:** Actions registered as Commerce event subscribers.

If the action invokes another instrumented service after processing the event, also pass `contextCarrier` on that outbound call.

## Adobe Commerce Webhooks

For runtime actions receiving synchronous Adobe Commerce Webhooks (HTTP requests).

```ts
import { commerceWebhooks } from "@adobe/aio-lib-telemetry/integrations";
```

**What it does:**

1. Extracts W3C trace context from HTTP headers
2. Handles sampling intelligently based on Commerce's subscription config
3. Creates new sampled trace when Commerce sends non-sampled context (configurable)
4. Links to Commerce trace for log correlation

**Options:**

```ts
commerceWebhooks({
  ensureSampling: true, // default: true
  // true = always create traces even if Commerce uses log-only subscriptions
  // false = follow Commerce's sampling decision
});
```

**When to use:** Actions registered as Commerce webhook endpoints.

## Applying Integrations

Integrations are applied sequentially. Later integrations can override earlier ones.

**Global** (all actions):

```ts
const telemetryConfig = defineTelemetryConfig((params, isDev) => ({
  sdkConfig: {
    /* ... */
  },
  integrations: [commerceEvents()],
}));
```

**Per-action** (overrides global):

```ts
export const main = instrumentEntrypoint(handler, {
  ...telemetryConfig,
  integrations: [commerceWebhooks()], // overrides global integrations
});
```
