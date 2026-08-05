# `instrument()`

```ts
function instrument<T>(
  fn: T,
  config?: InstrumentationConfig<T>,
): (...args: Parameters<T>) => ReturnType<T>;
```

Defined in: [core/instrumentation.ts:115](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/core/instrumentation.ts#L115)

Instruments a function and adds the current runtime invocation attributes to its span.

## Type Parameters

| Type Parameter              |
| --------------------------- |
| `T` _extends_ `AnyFunction` |

## Parameters

| Parameter | Type                                                                       | Description                                |
| --------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| `fn`      | `T`                                                                        | The function to instrument.                |
| `config`  | [`InstrumentationConfig`](../type-aliases/InstrumentationConfig.md)\<`T`\> | The configuration for the instrumentation. |

## Returns

A wrapped function with the same signature as the original function, but with telemetry instrumentation.

(...`args`: `Parameters`\<`T`\>) => `ReturnType`\<`T`\>

## Throws

If the span name is not provided and the function is not named.

## Since

0.1.0

## Example

```ts
const instrumentedFn = instrument(someFunction, {
  // Optional configuration
  spanConfig: {
    spanName: "some-span",
    attributes: {
      "some-attribute": "some-value",
    },
  },
});
```
