# `defineTelemetryConfig()`

```ts
function defineTelemetryConfig(
  init: (
    params: RecursiveStringRecord,
    isDevelopment: boolean,
  ) => TelemetryConfig,
): {
  initializeTelemetry: (
    params: RecursiveStringRecord,
    isDevelopment: boolean,
  ) => TelemetryConfig;
};
```

Defined in: [core/config.ts:24](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/core/config.ts#L24)

Helper to define the telemetry config for an entrypoint.

## Parameters

| Parameter | Type                                                                                                                     | Description                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `init`    | (`params`: `RecursiveStringRecord`, `isDevelopment`: `boolean`) => [`TelemetryConfig`](../interfaces/TelemetryConfig.md) | The function to initialize the telemetry. |

## Returns

```ts
{
  initializeTelemetry: (
    params: RecursiveStringRecord,
    isDevelopment: boolean,
  ) => TelemetryConfig;
}
```

### initializeTelemetry()

```ts
initializeTelemetry: (params: RecursiveStringRecord, isDevelopment: boolean) =>
  (TelemetryConfig = init);
```

#### Parameters

| Parameter       | Type                    |
| --------------- | ----------------------- |
| `params`        | `RecursiveStringRecord` |
| `isDevelopment` | `boolean`               |

#### Returns

[`TelemetryConfig`](../interfaces/TelemetryConfig.md)
