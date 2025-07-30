# `tryAddEventToActiveSpan()`

```ts
function tryAddEventToActiveSpan(
  event: string,
  attributes?: Attributes,
): boolean;
```

Defined in: [api/global.ts:88](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/api/global.ts#L88)

Tries to add an event to the active span.

## Parameters

| Parameter     | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| `event`       | `string`     | The event name to add.              |
| `attributes?` | `Attributes` | The attributes to add to the event. |

## Returns

`boolean`

## Since

0.1.0

## Example

```ts
const successfullyAdded = tryAddEventToActiveSpan("my-event", { foo: "bar" });
```
