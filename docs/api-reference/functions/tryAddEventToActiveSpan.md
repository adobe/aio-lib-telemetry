# `tryAddEventToActiveSpan()`

```ts
function tryAddEventToActiveSpan(
  event: string,
  attributes?: Attributes,
): boolean;
```

Defined in: [api/global.ts:88](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/api/global.ts#L88)

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
