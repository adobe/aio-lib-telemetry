# `getAioRuntimeResource()`

```ts
function getAioRuntimeResource(): Resource;
```

Defined in: [api/attributes.ts:45](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/api/attributes.ts#L45)

Creates a [resource](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.resources.Resource.html)
from the attributes inferred from the Adobe I/O Runtime and returns it as an OpenTelemetry Resource object.

## Returns

`Resource`

## See

https://opentelemetry.io/docs/languages/js/resources/

## Since

0.1.0

## Example

```ts
const resource = getAioRuntimeResource();
// use this resource in your OpenTelemetry configuration
```
