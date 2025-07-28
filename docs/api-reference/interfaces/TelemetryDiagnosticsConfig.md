# `TelemetryDiagnosticsConfig`

Defined in: [types.ts:44](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L44)

The configuration for the telemetry diagnostics.

## Since

0.1.0

## Properties

### exportLogs?

```ts
optional exportLogs: boolean;
```

Defined in: [types.ts:59](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L59)

Whether to make OpenTelemetry also export the diagnostic logs to the configured exporters.
Set to `false` if you don't want to see diagnostic logs in your observability platform.

#### Default

```ts
true;
```

---

### loggerName?

```ts
optional loggerName: string;
```

Defined in: [types.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L52)

The name of the logger to use for the diagnostics.

#### Default

`${actionName}/otel-diagnostics`

---

### logLevel

```ts
logLevel: "info" | "error" | "none" | "warn" | "debug" | "verbose" | "all";
```

Defined in: [types.ts:46](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L46)

The log level to use for the diagnostics.
