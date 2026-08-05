# `getAioRuntimeInvocationAttributes()`

```ts
function getAioRuntimeInvocationAttributes(): RuntimeInvocationAttributes;
```

Defined in: [api/attributes.ts:71](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/api/attributes.ts#L71)

Returns attributes for the current Adobe I/O Runtime invocation. Call this
during each invocation so warm containers use the current values.

## Returns

`RuntimeInvocationAttributes`

## Since

1.3.0

## Example

```ts
const attributes = getAioRuntimeInvocationAttributes();
// attributes = { action.activation_id: "activation-id", action.region: "region", ... }
```
