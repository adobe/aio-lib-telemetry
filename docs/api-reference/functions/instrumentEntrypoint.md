# `instrumentEntrypoint()`

```ts
function instrumentEntrypoint<T>(
  fn: T,
  config: EntrypointInstrumentationConfig,
): (params: Record<string, unknown>) => ReturnType<T>;
```

Defined in: [core/instrumentation.ts:280](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/core/instrumentation.ts#L280)

Instruments the entrypoint of a runtime action.
Needs to be used ONLY with the `main` function of a runtime action.

## Type Parameters

| Type Parameter                                                     |
| ------------------------------------------------------------------ |
| `T` _extends_ (`params`: `Record`\<`string`, `unknown`\>) => `any` |

## Parameters

| Parameter | Type                                                                                  | Description                                           |
| --------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `fn`      | `T`                                                                                   | The entrypoint function to instrument.                |
| `config`  | [`EntrypointInstrumentationConfig`](../interfaces/EntrypointInstrumentationConfig.md) | The configuration for the entrypoint instrumentation. |

## Returns

A wrapped function with the same signature as the original function, but with telemetry instrumentation.

```ts
(params: Record<string, unknown>): ReturnType<T>;
```

### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `params`  | `Record`\<`string`, `unknown`\> |

### Returns

`ReturnType`\<`T`\>

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
