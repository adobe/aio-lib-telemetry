# `getPresetInstrumentations()`

```ts
function getPresetInstrumentations(
  preset: TelemetryInstrumentationPreset,
):
  | (
      | HttpInstrumentation
      | GraphQLInstrumentation
      | UndiciInstrumentation
      | WinstonInstrumentation
    )[]
  | Instrumentation<InstrumentationConfig>[];
```

Defined in: [api/presets.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/api/presets.ts#L52)

Get the instrumentations for a given preset.

## Parameters

| Parameter | Type                                                                                  | Description                                 |
| --------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `preset`  | [`TelemetryInstrumentationPreset`](../type-aliases/TelemetryInstrumentationPreset.md) | The preset to get the instrumentations for. |

## Returns

\| (
\| `HttpInstrumentation`
\| `GraphQLInstrumentation`
\| `UndiciInstrumentation`
\| `WinstonInstrumentation`)[]
\| `Instrumentation`\<`InstrumentationConfig`\>[]

The instrumentations for the given preset:

- `full`: All the Node.js [auto-instrumentations](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
- `simple`: Instrumentations for:
  [Http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http),
  [GraphQL](https://www.npmjs.com/package/@opentelemetry/instrumentation-graphql),
  [Undici](https://www.npmjs.com/package/@opentelemetry/instrumentation-undici), and
  [Winston](https://www.npmjs.com/package/@opentelemetry/instrumentation-winston)

## Since

0.1.0

## Example

```ts
const instrumentations = getPresetInstrumentations("simple");
// instrumentations = [HttpInstrumentation, GraphQLInstrumentation, UndiciInstrumentation, WinstonInstrumentation]
```
