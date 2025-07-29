# `instrument()`

```ts
function instrument<T>(
  fn: T,
  config: InstrumentationConfig<T>,
): (...args: Parameters<T>) => ReturnType<T>;
```

Defined in: [core/instrumentation.ts:103](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/core/instrumentation.ts#L103)

Instruments a function.

## Type Parameters

| Type Parameter              |
| --------------------------- |
| `T` _extends_ `AnyFunction` |

## Parameters

| Parameter | Type                                                                     | Description                                |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| `fn`      | `T`                                                                      | The function to instrument.                |
| `config`  | [`InstrumentationConfig`](../interfaces/InstrumentationConfig.md)\<`T`\> | The configuration for the instrumentation. |

## Returns

A wrapped function with the same signature as the original function, but with telemetry instrumentation.

```ts
(...args: Parameters<T>): ReturnType<T>;
```

### Parameters

| Parameter | Type                |
| --------- | ------------------- |
| ...`args` | `Parameters`\<`T`\> |

### Returns

`ReturnType`\<`T`\>

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
