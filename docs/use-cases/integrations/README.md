# Integrations

Since version 1.1.0, this library supports an `integrations` feature that facilitates integration with external systems that require specific telemetry configurations. Integrations are preconfigured patches that automatically handle complex setup tasks, such as context propagation, span linking, and sampling decisions.

> [!IMPORTANT]
> Integrations are configuration patches applied sequentially to your telemetry configuration. Each integration can override or extend existing settings, so the order in which you apply them matters.

- [Integrations](#integrations)
  - [What are Integrations?](#what-are-integrations)
  - [How to Use Integrations](#how-to-use-integrations)
  - [Available Integrations](#available-integrations)

## What are Integrations?

Integrations are functions that return configuration patches for specific external systems. Instead of manually configuring context propagation, span links, and sampling strategies for each integration point, you can use these pre-built integrations to handle the complexity automatically.

Key characteristics:

- **Pre-configured**: Each integration encapsulates best practices for a specific external system
- **Composable**: Can be applied at the global or per-action level
- **Sequential**: Applied in order, with later integrations potentially overriding earlier ones
- **Type-safe**: Full TypeScript support with documented options

## How to Use Integrations

### Global Configuration

Apply integrations to all runtime actions by including them in your global telemetry configuration:

```ts
// telemetry.{js|ts}
import { defineTelemetryConfig } from "@adobe/aio-lib-telemetry";
import { commerceEvents } from "@adobe/aio-lib-telemetry/integrations";

const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    sdkConfig: {
      // Your OpenTelemetry SDK configuration
    },
    integrations: [commerceEvents()],
  };
});

export { telemetryConfig };
```

### Per-Action Configuration

Override global integrations for specific actions:

> [!WARNING]
> Integrations are applied on top of your base configuration. Some options you set manually may be overridden by the integrations you apply.

```ts
// actions/my-webhook-handler/index.js
import { instrumentEntrypoint } from "@adobe/aio-lib-telemetry";
import { commerceWebhooks } from "@adobe/aio-lib-telemetry/integrations";
import { telemetryConfig } from "../../telemetry";

export const main = instrumentEntrypoint(
  async function webhooksHandler(params) {
    // Your webhook handler code
  },
  {
    ...telemetryConfig,
    // This overrides the global integrations
    integrations: [commerceWebhooks()],
  },
);
```

## Available Integrations

### Adobe Commerce Events

**Import**: `commerceEvents` from `@adobe/aio-lib-telemetry/integrations`

**Use Case**: Runtime actions that receive [Adobe Commerce Events](https://developer.adobe.com/commerce/extensibility/events/)

#### What it Does

Adobe Commerce Events are asynchronous event notifications sent from Commerce to your runtime actions. This integration:

1. **Extracts trace context** from the event's `data._metadata` field
2. **Creates span links** to connect your action's trace with the Commerce event trace
3. **Skips context propagation** since events are asynchronous (not part of the same execution trace)
4. **Adds trace ID attribute** (`commerce.traceid`) for backends that don't fully support span links

#### Usage

```ts
import { commerceEvents } from "@adobe/aio-lib-telemetry/integrations";

const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    integrations: [commerceEvents()],
  };
});
```

#### Event Structure

Commerce Events include trace context in the `_metadata` field:

```json
{
  "data": {
    "_metadata": {
      "traceparent": "00-traceId-spanId-01",
      "tracestate": "..."
    }

    // Event payload
  }
}
```

The integration automatically extracts and processes this trace information.

#### When to Use

- Runtime actions registered as Commerce event subscribers
- Actions that need to correlate their telemetry with Commerce event processing
- Scenarios where you want to link asynchronous event handling to the originating Commerce operation

### Adobe Commerce Webhooks

**Import**: `commerceWebhooks` from `@adobe/aio-lib-telemetry/integrations`
**Use Case**: Runtime actions that receive [Adobe Commerce Webhooks](https://developer.adobe.com/commerce/extensibility/webhooks/)

#### What it Does

Adobe Commerce Webhooks are HTTP requests sent from Commerce to your runtime actions. This integration:

1. **Extracts trace context** from HTTP headers following W3C Trace Context specification
2. **Handles sampling decisions** intelligently based on Commerce's configuration
3. **Creates new traces** when Commerce sends non-sampled context (configurable)
4. **Preserves log correlation** by linking to the Commerce trace even when creating new traces

#### Usage

```ts
import { commerceWebhooks } from "@adobe/aio-lib-telemetry/integrations";

// With default configuration
const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    integrations: [commerceWebhooks()],
  };
});

// With custom configuration
const telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    integrations: [
      commerceWebhooks({
        ensureSampling: false, // Disable automatic sampling override
      }),
    ],
  };
});
```

#### Configuration Options

##### `ensureSampling`

**Type**: `boolean`  
**Default**: `true`  
**Since**: 1.1.0

Controls whether runtime actions should always create traces, regardless of Commerce's subscription configuration.

**Background**: Commerce integrations can be configured with:

- **Trace subscriptions**: Full distributed tracing (sampled traces)
- **Log-only subscriptions**: No tracing, only logs (non-sampled traces)

With log-only subscriptions, Commerce propagates trace context marked as non-sampled (for log correlation). By default, OpenTelemetry's ParentBased sampler would cause your runtime action to also not sample, resulting in no trace data.

**When `true` (default)**:

- Runtime actions create their own sampled trace when Commerce's trace is non-sampled
- Links to Commerce's trace for log correlation
- Inherits Commerce's trace normally when it's sampled

**When `false`**:

- Runtime action tracing depends on Commerce's subscription configuration
- No traces exported when Commerce uses log-only subscriptions

**Example**:

```ts
// Ensure traces are always created (recommended)
commerceWebhooks({ ensureSampling: true });

// Follow Commerce's sampling decision
commerceWebhooks({ ensureSampling: false });
```

#### When to Use

- Runtime actions registered as Commerce webhook endpoints
- Actions that need distributed tracing with Commerce operations
- Scenarios where you want flexible control over trace sampling
