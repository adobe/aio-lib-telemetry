# `instrumentEntrypoint()`

```ts
function instrumentEntrypoint<T>(
  fn: T,
  config: EntrypointInstrumentationConfig<T>,
): (params: Record<string, unknown>) => Promise<Awaited<ReturnType<T>>>;
```

Defined in: [core/instrumentation.ts:265](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/core/instrumentation.ts#L265)

Instruments the entrypoint of a runtime action.
Needs to be used ONLY with the `main` function of a runtime action.

## Type Parameters

| Type Parameter                                                     |
| ------------------------------------------------------------------ |
| `T` _extends_ (`params`: `Record`\<`string`, `unknown`\>) => `any` |

## Parameters

| Parameter | Type                                                                                         | Description                                           |
| --------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `fn`      | `T`                                                                                          | The entrypoint function to instrument.                |
| `config`  | [`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md)\<`T`\> | The configuration for the entrypoint instrumentation. |

## Returns

A wrapped function with the same signature as the original function, but with telemetry instrumentation.

```ts
(params: Record<string, unknown>): Promise<Awaited<ReturnType<T>>>;
```

### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `params`  | `Record`\<`string`, `unknown`\> |

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`T`\>\>\>

## Throws

If the instrumentation or the execution of the entrypoint fails.

## Since

0.1.0

## Example

```ts
import { telemetryConfig } from "../telemetry";

const instrumentedEntrypoint = instrumentEntrypoint(main, {
  ...telemetryConfig,
  // Optional configuration
});
```
