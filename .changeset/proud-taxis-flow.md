---
"@adobe/aio-lib-telemetry": patch
---

Fixes a bug where the runtime action `params` weren't being forwarded to the `getContextCarrier` helper of the `instrumentEntrypoint` configuration.
