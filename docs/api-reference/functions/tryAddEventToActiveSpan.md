# `tryAddEventToActiveSpan()`

```ts
function tryAddEventToActiveSpan(
  event: string,
  attributes?: Attributes,
): boolean;
```

Defined in: [api/global.ts:83](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/api/global.ts#L83)

Tries to add an event to the active span.

## Parameters

| Parameter     | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| `event`       | `string`     | The event name to add.              |
| `attributes?` | `Attributes` | The attributes to add to the event. |

## Returns

`boolean`

## Example

```ts
const successfullyAdded = tryAddEventToActiveSpan("my-event", { foo: "bar" });
```
