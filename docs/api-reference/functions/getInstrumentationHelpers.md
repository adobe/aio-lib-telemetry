# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:62](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/core/instrumentation.ts#L62)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../interfaces/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
