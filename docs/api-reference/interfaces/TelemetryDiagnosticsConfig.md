# `TelemetryDiagnosticsConfig`

Defined in: [types.ts:41](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L41)

The configuration for the telemetry diagnostics.

## Since

0.1.0

## Properties

### exportLogs?

```ts
optional exportLogs: boolean;
```

Defined in: [types.ts:56](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L56)

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

Defined in: [types.ts:49](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L49)

The name of the logger to use for the diagnostics.

#### Default

`${actionName}/otel-diagnostics`

---

### logLevel

```ts
logLevel: "info" | "error" | "none" | "warn" | "debug" | "verbose" | "all";
```

Defined in: [types.ts:43](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L43)

The log level to use for the diagnostics.
