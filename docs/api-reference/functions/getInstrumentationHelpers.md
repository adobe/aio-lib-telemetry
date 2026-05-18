# `getInstrumentationHelpers()`

```ts
function getInstrumentationHelpers(): InstrumentationContext;
```

Defined in: [core/instrumentation.ts:73](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/core/instrumentation.ts#L73)

Access helpers for the current instrumented operation.

## Returns

[`InstrumentationContext`](../type-aliases/InstrumentationContext.md)

## Throws

If the function is called in a runtime action that has not
telemetry enabled or if it is called outside of an instrumented function.

## Since

0.1.0
