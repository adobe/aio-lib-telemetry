# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:71](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/core/instrumentation.ts#L71)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../interfaces/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
