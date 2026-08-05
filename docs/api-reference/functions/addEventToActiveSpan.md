# `addEventToActiveSpan()`

```ts
function addEventToActiveSpan(event: string, attributes?: Attributes): void;
```

Defined in: [api/global.ts:72](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/api/global.ts#L72)

Adds an event to the given span.

## Parameters

| Parameter     | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| `event`       | `string`     | The event name to add.              |
| `attributes?` | `Attributes` | The attributes to add to the event. |

## Returns

`void`

## Since

0.1.0

## Example

```ts
addEventToActiveSpan("my-event", { foo: "bar" });
```
