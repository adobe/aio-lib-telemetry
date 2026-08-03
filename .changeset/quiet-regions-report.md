---
"@adobe/aio-lib-telemetry": minor
---

Expose the region selected at execution time as `action.region` through `getAioRuntimeInvocationAttributes`, on spans created through the library's instrumentation helpers, and on logs exported through `getLogger`. The value may differ between invocations because Runtime routes each invocation independently.
