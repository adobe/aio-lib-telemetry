# `defineTelemetryConfig()`

```ts
function defineTelemetryConfig(
  init: (
    params: Record<string, unknown>,
    isDevelopment: boolean,
  ) => TelemetryConfig,
): {
  initializeTelemetry: (
    params: Record<string, unknown>,
    isDevelopment: boolean,
  ) => TelemetryConfig;
};
```

Defined in: [core/config.ts:21](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/core/config.ts#L21)

Helper to define the telemetry configuration for an entrypoint.

## Parameters

| Parameter | Type                                                                                                                             | Description                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `init`    | (`params`: `Record`\<`string`, `unknown`\>, `isDevelopment`: `boolean`) => [`TelemetryConfig`](../interfaces/TelemetryConfig.md) | The function to initialize the telemetry. |

## Returns

```ts
{
  initializeTelemetry: (
    params: Record<string, unknown>,
    isDevelopment: boolean,
  ) => TelemetryConfig;
}
```

### initializeTelemetry()

```ts
initializeTelemetry: (
  params: Record<string, unknown>,
  isDevelopment: boolean,
) => (TelemetryConfig = init);
```

#### Parameters

| Parameter       | Type                            |
| --------------- | ------------------------------- |
| `params`        | `Record`\<`string`, `unknown`\> |
| `isDevelopment` | `boolean`                       |

#### Returns

[`TelemetryConfig`](../interfaces/TelemetryConfig.md)

## Since

0.1.0
