# `instrumentEntrypoint()`

```ts
function instrumentEntrypoint<T>(
  fn: T,
  config: EntrypointInstrumentationConfig<T>,
): (params: RecursiveStringRecord) => Promise<Awaited<ReturnType<T>>>;
```

Defined in: [core/instrumentation.ts:270](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/core/instrumentation.ts#L270)

Instruments the entrypoint of a runtime action.
Needs to be used ONLY with the `main` function of a runtime action.

## Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `T` _extends_ (`params`: `RecursiveStringRecord`) => `any` |

## Parameters

| Parameter | Type                                                                                         | Description                                           |
| --------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `fn`      | `T`                                                                                          | The entrypoint function to instrument.                |
| `config`  | [`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md)\<`T`\> | The configuration for the entrypoint instrumentation. |

## Returns

A wrapped function with the same signature as the original function, but with telemetry instrumentation.

```ts
(params: RecursiveStringRecord): Promise<Awaited<ReturnType<T>>>;
```

### Parameters

| Parameter | Type                    |
| --------- | ----------------------- |
| `params`  | `RecursiveStringRecord` |

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
