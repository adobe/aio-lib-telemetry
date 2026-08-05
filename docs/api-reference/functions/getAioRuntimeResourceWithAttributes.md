# `getAioRuntimeResourceWithAttributes()`

```ts
function getAioRuntimeResourceWithAttributes(
  attributes: Record<string, string>,
): Resource;
```

Defined in: [api/attributes.ts:107](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/api/attributes.ts#L107)

Creates a [resource](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.resources.Resource.html)
that combines stable attributes inferred from the Adobe I/O Runtime with the provided attributes.

## Parameters

| Parameter    | Type                           | Description                                                                               |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------------- |
| `attributes` | `Record`\<`string`, `string`\> | The attributes to combine with the stable attributes inferred from the Adobe I/O Runtime. |

## Returns

`Resource`

## See

https://opentelemetry.io/docs/languages/js/resources/

## Since

0.1.0

## Example

```ts
const resource = getAioRuntimeResourceWithAttributes({ foo: "bar" });
// resource = { action.namespace: "my-namespace", action.name: "my-action", foo: "bar", ... }
// use this resource in your OpenTelemetry configuration
```
