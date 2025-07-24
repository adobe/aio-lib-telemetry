# `addEventToActiveSpan()`

```ts
function addEventToActiveSpan(event: string, attributes?: Attributes): void;
```

Defined in: [api/global.ts:68](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/api/global.ts#L68)

Adds an event to the given span.

## Parameters

| Parameter     | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| `event`       | `string`     | The event name to add.              |
| `attributes?` | `Attributes` | The attributes to add to the event. |

## Returns

`void`

## Example

```ts
addEventToActiveSpan("my-event", { foo: "bar" });
```
