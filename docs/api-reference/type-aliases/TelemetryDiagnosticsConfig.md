# `TelemetryDiagnosticsConfig`

```ts
type TelemetryDiagnosticsConfig = {
  exportLogs?: boolean;
  loggerName?: string;
  logLevel: DiagnosticsLogLevel;
};
```

Defined in: [types.ts:41](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L41)

The configuration for the telemetry diagnostics.

## Since

0.1.0

## Properties

### exportLogs?

```ts
optional exportLogs?: boolean;
```

Defined in: [types.ts:63](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L63)

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
optional loggerName?: string;
```

Defined in: [types.ts:54](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L54)

The name of the logger to use for the diagnostics.

#### Default

`${actionName}/otel-diagnostics`

#### Since

0.1.0

---

### logLevel

```ts
logLevel: DiagnosticsLogLevel;
```

Defined in: [types.ts:46](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L46)

The log level to use for the diagnostics.

#### Since

0.1.0
