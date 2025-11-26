# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:73](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/core/instrumentation.ts#L73)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../type-aliases/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
