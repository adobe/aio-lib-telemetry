---
"@adobe/aio-lib-telemetry": patch
---

Fixes logging on shutdown which was throwing if the SDK was not initialized, instead of just reporting a warning
