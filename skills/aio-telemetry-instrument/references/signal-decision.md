# Signal Decision Framework

Map observability goals to the right signal type. Start from what you need to observe, pick the simplest signal that achieves it.

## Instrumentation Depth

Early in the conversation, help the user choose how deep to go. Explain the trade-offs and let them decide. Claude should recommend a depth based on the action's complexity, but the user has the final say.

### Essential

Minimal changes. Relies on what `instrumentEntrypoint` and auto-instrumentation (presets) already provide. Adds a few span attributes for context.

- **What you get**: Root span with timing, automatic HTTP/fetch spans (if preset configured), basic error recording
- **What you add**: 1-3 span attributes on the root span (e.g., entity ID, request type)
- **Best for**: Simple actions, early-stage projects, actions where you just want basic visibility
- **Trade-off**: Limited debugging depth — you see that something failed but may not see where

### Standard

Wraps key internal functions with `instrument()` for child spans. Adds attributes and possibly a metric or two.

- **What you get**: Everything from Essential + child spans for external calls and important operations, richer span attributes
- **What you add**: 2-5 `instrument()` wrappers + span attributes + optionally 1-2 metrics
- **Best for**: Most actions — good observability without over-instrumenting
- **Trade-off**: Moderate code changes, but each one connects to a clear observability goal

### Comprehensive

Full visibility. Per-function spans, metrics for key business indicators, structured logging, span events for notable occurrences.

- **What you get**: Everything from Standard + metrics dashboards, structured logs correlated with traces, detailed span events
- **What you add**: 5-7+ instrumentation points spanning traces, metrics, logs, and events
- **Best for**: Critical actions, complex orchestrators, actions you're actively debugging or optimizing
- **Trade-off**: More code to maintain, higher telemetry volume — make sure every point earns its keep

When presenting these options, adapt the descriptions to the specific action. For a trivial action, "Comprehensive" might only be 3-4 points. For a complex orchestrator, even "Essential" might need a few child spans to be useful.

## Decision Table

| You want to know...                         | Signal              | API                                         | Example                                                    |
| ------------------------------------------- | ------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| How long an operation takes                 | Trace (child span)  | `instrument(fn)`                            | Wrap `fetchCatalogData` to see its duration in a waterfall |
| Which step in a sequence is slow            | Trace (child spans) | `instrument(fn)` for each step              | Wrap each phase of a data pipeline                         |
| What data was processed (filterable)        | Span attribute      | `currentSpan.setAttributes()`               | `{ "order.id": orderId, "product.count": items.length }`   |
| That something happened during a request    | Span event          | `addEventToActiveSpan()`                    | `addEventToActiveSpan("cache.miss", { key })`              |
| How often something happens across requests | Metric (counter)    | `defineMetrics()` + `counter.add(1)`        | Count webhook types, error codes over time                 |
| The distribution of a value over time       | Metric (histogram)  | `defineMetrics()` + `histogram.record(val)` | Response payload sizes, processing times                   |
| The current level of something              | Metric (gauge)      | `defineMetrics()` + `gauge.record(val)`     | Queue depth, batch size                                    |
| Why something failed with context           | Structured log      | `logger.warn/error()`                       | `logger.error("Catalog API 503", { url, retryCount })`     |
| That an error occurred in a span            | Exception recording | `currentSpan.recordException(err)`          | Automatically done by `instrument()` on throw              |

## Choosing Between Similar Signals

### Span attribute vs span event

- **Attribute**: Data you'll filter or group by in your dashboard. Low cardinality preferred (status codes, boolean flags, enum values, small counts). Set once per span.
- **Event**: Something that happened at a point in time during the span. Can occur multiple times. Good for "log-like" data tied to a specific trace.
- **Rule of thumb**: If you'd put it in a WHERE clause, it's an attribute. If you'd view it in a timeline, it's an event.

### Span event vs structured log

- **Span event**: Tightly coupled to the current trace. Visible in trace detail views. Use when the event only makes sense in the context of this specific request.
- **Structured log**: Independent record. Useful even without trace context. Use for operational messages, audit trails, or data you need to search across all requests.
- **Rule of thumb**: If you'd search for it across all requests, use a log. If you'd look at it while inspecting one trace, use a span event.

### Child span vs span attribute

- **Child span**: Use when the operation has meaningful duration and you want to see it in the waterfall view. Especially valuable for I/O operations (HTTP calls, DB queries, SDK calls).
- **Span attribute**: Use when you just want to annotate the parent span with context. No duration, no separate entry in the trace view.
- **Rule of thumb**: If the operation involves I/O or takes >1ms and you'd want to see its timing, wrap it with `instrument()`. If you just want to tag what happened, use an attribute.

### Metric vs span-derived metric

Most observability backends can derive metrics from spans automatically (e.g., "average duration of spans named X"). Prefer this for latency tracking — it avoids duplicate data.

Use explicit metrics (`defineMetrics`) when:

- You need counters/gauges that don't map to span boundaries (e.g., "events received by type")
- You need aggregation that span-derived metrics can't express
- Your backend doesn't support span-derived metrics well

## What NOT to Instrument

- **Pure computation with no I/O**: A function that sorts an array or formats a string. Unless you suspect it's a performance bottleneck, the overhead isn't worth it.
- **Every branch of an if-else**: Use a span attribute to record which branch was taken, not separate spans.
- **Utility functions called many times per request**: Instrumenting a helper called 1000x creates 1000 child spans. Use a single span with a count attribute instead.
- **Sensitive data**: Never put PII, credentials, or tokens in span attributes, events, or logs. Telemetry data is exported to external systems.

## Attribute Naming Conventions

Follow OpenTelemetry semantic conventions where applicable:

- Use dot-separated namespaces: `http.request.method`, `order.item_count`
- Use snake_case for custom attributes: `commerce.order_id`, `catalog.product_count`
- Prefer specific names over generic ones: `payment.gateway_response_code` not `response.code`
- Keep attribute values low-cardinality when possible (avoid UUIDs as metric attribute values)
