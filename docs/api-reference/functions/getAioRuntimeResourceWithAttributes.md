# `getAioRuntimeResourceWithAttributes()`

```ts
function getAioRuntimeResourceWithAttributes(
  attributes: Record<string, string>,
): Resource;
```

Defined in: [api/attributes.ts:59](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/api/attributes.ts#L59)

Creates a [resource](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.resources.Resource.html)
that combines the attributes inferred from the Adobe I/O Runtime with the provided attributes.

## Parameters

| Parameter    | Type                           | Description                                                                        |
| ------------ | ------------------------------ | ---------------------------------------------------------------------------------- |
| `attributes` | `Record`\<`string`, `string`\> | The attributes to combine with the attributes inferred from the Adobe I/O Runtime. |

## Returns

`Resource`

## See

https://opentelemetry.io/docs/languages/js/resources/

## Example

```ts
const resource = getAioRuntimeResourceWithAttributes({ foo: "bar" });
// resource = { action.namespace: "my-namespace", action.name: "my-action", foo: "bar", ... }
// use this resource in your OpenTelemetry configuration
```
