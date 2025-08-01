---
"@adobe/aio-lib-telemetry": patch
---

Fix error handling in entrypoint by letting runtime errors bubble up and only throwing if the error happens during instrumentation wrapping.
