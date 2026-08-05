# `instrumentEntrypoint()`

```ts
function instrumentEntrypoint<T>(
  fn: T,
  config: EntrypointInstrumentationConfig,
): (params: Record<string, unknown>) => ReturnType<T>;
```

Defined in: [core/instrumentation.ts:279](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/core/instrumentation.ts#L279)

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

(`params`: `Record`\<`string`, `unknown`\>) => `ReturnType`\<`T`\>

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
