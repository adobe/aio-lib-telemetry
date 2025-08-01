# `getPresetInstrumentations()`

```ts
function getPresetInstrumentations(
  preset: TelemetryInstrumentationPreset,
):
  | (HttpInstrumentation | GraphQLInstrumentation | UndiciInstrumentation)[]
  | Instrumentation<InstrumentationConfig>[];
```

Defined in: [api/presets.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/api/presets.ts#L52)

Get the instrumentations for a given preset.

## Parameters

| Parameter | Type                                                                                  | Description                                    |
| --------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `preset`  | [`TelemetryInstrumentationPreset`](../type-aliases/TelemetryInstrumentationPreset.md) | The preset to get the instrumentations for. \* |

## Returns

\| (`HttpInstrumentation` \| `GraphQLInstrumentation` \| `UndiciInstrumentation`)[]
\| `Instrumentation`\<`InstrumentationConfig`\>[]

The instrumentations for the given preset:

- `full`: All the Node.js [auto-instrumentations](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
- `simple`: Instrumentations for:
  [Http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http),
  [GraphQL](https://www.npmjs.com/package/@opentelemetry/instrumentation-graphql), and
  [Undici](https://www.npmjs.com/package/@opentelemetry/instrumentation-undici)

## Throws

If the preset is unknown.

## Since

0.1.0

## Example

```ts
const instrumentations = getPresetInstrumentations("simple");
// instrumentations = [HttpInstrumentation, GraphQLInstrumentation, UndiciInstrumentation]
```
