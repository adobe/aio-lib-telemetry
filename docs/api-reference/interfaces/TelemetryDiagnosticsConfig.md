# `TelemetryDiagnosticsConfig`

Defined in: [types.ts:41](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L41)

The configuration for the telemetry diagnostics.

## Since

0.1.0

## Properties

### exportLogs?

```ts
optional exportLogs: boolean;
```

Defined in: [types.ts:63](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L63)

Whether to make OpenTelemetry also export the diagnostic logs to the configured exporters.
Set to `false` if you don't want to see diagnostic logs in your observability platform.

#### Default

```ts
true;
```

#### Since

0.1.0

---

### loggerName?

```ts
optional loggerName: string;
```

Defined in: [types.ts:54](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L54)

The name of the logger to use for the diagnostics.

#### Default

`${actionName}/otel-diagnostics`

#### Since

0.1.0

---

### logLevel

```ts
logLevel: "info" | "error" | "none" | "warn" | "debug" | "verbose" | "all";
```

Defined in: [types.ts:46](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L46)

The log level to use for the diagnostics.

#### Since

0.1.0
