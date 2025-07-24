# `tryGetActiveSpan()`

```ts
function tryGetActiveSpan(ctx: Context): null | Span;
```

Defined in: [api/global.ts:49](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/api/global.ts#L49)

Tries to get the active span from the given context.

## Parameters

| Parameter | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `ctx`     | `Context` | The context to get the span from. |

## Returns

`null` \| `Span`

## Example

```ts
const span = tryGetActiveSpan();
if (span) {
  span.addEvent("my-event", { foo: "bar" });
}
```
