# `tryGetActiveSpan()`

```ts
function tryGetActiveSpan(ctx: Context): Span | null;
```

Defined in: [api/global.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/api/global.ts#L52)

Tries to get the active span from the given context.

## Parameters

| Parameter | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `ctx`     | `Context` | The context to get the span from. |

## Returns

`Span` \| `null`

## Since

0.1.0

## Example

```ts
const span = tryGetActiveSpan();
if (span) {
  span.addEvent("my-event", { foo: "bar" });
}
```
