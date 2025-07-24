# `getActiveSpan()`

```ts
function getActiveSpan(ctx: Context): Span;
```

Defined in: [api/global.ts:28](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/api/global.ts#L28)

Gets the active span from the given context.

## Parameters

| Parameter | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `ctx`     | `Context` | The context to get the span from. |

## Returns

`Span`

## Throws

An error if no span is found.

## Example

```ts
const span = getActiveSpan();
span.addEvent("my-event", { foo: "bar" });
```
