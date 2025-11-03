# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:73](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/core/instrumentation.ts#L73)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../type-aliases/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
