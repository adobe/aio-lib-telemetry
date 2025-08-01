---
"@adobe/aio-lib-telemetry": patch
---

[Automatic instrumentation for the Winston logger provider](https://www.npmjs.com/package/@opentelemetry/instrumentation-winston) has been removed from the `simple` preset. It's not needed because the OpenTelemetry transport added by that instrumentation is already added manually.
