---
"@adobe/aio-lib-telemetry": patch
---

[[BREAKING]](https://github.com/adobe/aio-lib-telemetry/blob/main/README.md#versioning-policy) Update OpenTelemetry dependencies (see the [Renovate PR](https://github.com/adobe/aio-lib-telemetry/pull/62) for the full list). The `otel` entrypoint no longer re-exports the `NoopLogRecordProcessor` class, as it's no longer exported by the OpenTelemetry Logs SDK. If you were using it, removing it should be safe, as it basically does nothing and it's the same as not using the processor at all.
