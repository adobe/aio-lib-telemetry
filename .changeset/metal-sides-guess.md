---
"@adobe/aio-lib-telemetry": patch
---

Fix `Carrier` generic type in [`serializeContextIntoCarrier`](../docs/api-reference/functions/serializeContextIntoCarrier.md) and [`deserializeContextFromCarrier`](../docs/api-reference/functions/deserializeContextFromCarrier.md) to use `PropertyKey` as the `Record` key.

Applies this change also in the `carrier` return type of [`getContextCarrier`](../docs/api-reference/interfaces/TelemetryPropagationConfig.md#getcontextcarrier) and the `contextCarrier` parameter of [`InstrumentationContext`](../docs/api-reference/interfaces/InstrumentationContext.md#contextcarrier).
