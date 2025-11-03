---
"@adobe/aio-lib-telemetry": minor
---

Deprecate custom `x-telemetry-context` header. From now on, if invoking via HTTP requests, propagated context doesn't need to be nested inside that header. Following the W3C Trace Propagation spec, you can send the `traceparent` (and related) headers as normal headers. They will be picked from `__ow_headers` instead. **Note that this only applies for runtime actions invoked via HTTP requests**. When invoked via events you should still use the special `__telemetryContext` variables or specify yourself where to find the context carrier.
