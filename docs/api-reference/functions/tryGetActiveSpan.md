# `tryGetActiveSpan()`

```ts
function tryGetActiveSpan(ctx: Context): null | Span;
```

Defined in: [api/global.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/api/global.ts#L52)

Tries to get the active span from the given context.

## Parameters

| Parameter | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `ctx`     | `Context` | The context to get the span from. |

## Returns

`null` \| `Span`

## Since

0.1.0

## Example

```ts
const span = tryGetActiveSpan();
if (span) {
  span.addEvent("my-event", { foo: "bar" });
}
```
