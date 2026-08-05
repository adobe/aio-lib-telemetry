# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:74](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/core/instrumentation.ts#L74)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../type-aliases/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
