# `TelemetryIntegration`

```ts
type TelemetryIntegration = {
  name: string;
  patchInstrumentationConfig?: (payload: {
    instrumentationConfig: Omit<
      EntrypointInstrumentationConfig,
      "initializeTelemetry" | "integrations"
    >;
    params: Record<string, unknown>;
    updateInstrumentationConfig: (
      config: Partial<EntrypointInstrumentationConfig>,
    ) => void;
  }) => void;
};
```

Defined in: [types.ts:167](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L167)

A telemetry integration.

## Since

1.1.0

## Properties

### name

```ts
name: string;
```

Defined in: [types.ts:172](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L172)

The name of the integration.

#### Since

1.1.0

---

### patchInstrumentationConfig()?

```ts
optional patchInstrumentationConfig: (payload: {
  instrumentationConfig: Omit<EntrypointInstrumentationConfig, "initializeTelemetry" | "integrations">;
  params: Record<string, unknown>;
  updateInstrumentationConfig: (config: Partial<EntrypointInstrumentationConfig>) => void;
}) => void;
```

Defined in: [types.ts:183](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L183)

A function that patches the [EntrypointInstrumentationConfig](../interfaces/EntrypointInstrumentationConfig.md) provided in [defineTelemetryConfig](../functions/defineTelemetryConfig.md) or in the [instrumentEntrypoint](../functions/instrumentEntrypoint.md) function.

#### Parameters

| Parameter                             | Type                                                                                                                                                                                                                                                                                                                                                                             | Description                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `payload`                             | \{ `instrumentationConfig`: `Omit`\<[`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md), `"initializeTelemetry"` \| `"integrations"`\>; `params`: `Record`\<`string`, `unknown`\>; `updateInstrumentationConfig`: (`config`: `Partial`\<[`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md)\>) => `void`; \} | The payload containing data to be used by the patcher.                                                        |
| `payload.instrumentationConfig`       | `Omit`\<[`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md), `"initializeTelemetry"` \| `"integrations"`\>                                                                                                                                                                                                                                     | The [EntrypointInstrumentationConfig](../interfaces/EntrypointInstrumentationConfig.md) to patch.             |
| `payload.params`                      | `Record`\<`string`, `unknown`\>                                                                                                                                                                                                                                                                                                                                                  | The parameters of the action.                                                                                 |
| `payload.updateInstrumentationConfig` | (`config`: `Partial`\<[`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md)\>) => `void`                                                                                                                                                                                                                                                         | A function to update the [EntrypointInstrumentationConfig](../interfaces/EntrypointInstrumentationConfig.md). |

#### Returns

`void`

#### Since

1.1.0
