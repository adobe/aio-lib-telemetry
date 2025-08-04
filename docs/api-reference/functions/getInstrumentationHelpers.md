# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:67](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/core/instrumentation.ts#L67)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../interfaces/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
