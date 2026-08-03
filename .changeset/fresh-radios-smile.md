---
"@adobe/aio-lib-telemetry": patch
---

Correct runtime metadata across warm container invocations:

- Keep only stable action and service attributes on the shared OpenTelemetry resource, avoiding high-cardinality metric dimensions.
- Attach the current activation ID, transaction ID, and deadline to spans and exported logs for every invocation.
- Ensure logs emitted through reused logger instances use the current invocation attributes.
