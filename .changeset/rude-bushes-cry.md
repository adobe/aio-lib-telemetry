---
"@adobe/aio-lib-telemetry": major
---

[`getPresetInstrumentations`](../docs/api-reference/functions/getPresetInstrumentations.md) now throws an `Error` if the given `preset` is unknown. This change has been made to prevent silent failures.

There's no need to update your code if you're using correctly the presets provided by the library. At most you may want to add a `try`/`catch` block to handle the error.
