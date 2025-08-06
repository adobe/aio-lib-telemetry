# `getPresetInstrumentations()`

```ts
function getPresetInstrumentations(
  preset: TelemetryInstrumentationPreset,
): Instrumentation<InstrumentationConfig>[];
```

Defined in: [api/presets.ts:53](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/api/presets.ts#L53)

Gets the instrumentations for a given preset.

## Parameters

| Parameter | Type                                                                                  | Description                                    |
| --------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `preset`  | [`TelemetryInstrumentationPreset`](../type-aliases/TelemetryInstrumentationPreset.md) | The preset to get the instrumentations for. \* |

## Returns

`Instrumentation`\<`InstrumentationConfig`\>[]

The instrumentations for the given preset:

- `full`: All the Node.js [auto-instrumentations](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
- `simple`: Instrumentations for:
  - [Http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http),
  - [GraphQL](https://www.npmjs.com/package/@opentelemetry/instrumentation-graphql)
  - [Undici](https://www.npmjs.com/package/@opentelemetry/instrumentation-undici)

## Throws

If the preset is unknown.

## Since

0.1.0

## Example

```ts
const instrumentations = getPresetInstrumentations("simple");
// instrumentations = [HttpInstrumentation, GraphQLInstrumentation, UndiciInstrumentation]
```
