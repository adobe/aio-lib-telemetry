# `tryGetActiveSpan()`

```ts
function tryGetActiveSpan(ctx: Context): Span | null;
```

Defined in: [api/global.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/api/global.ts#L52)

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
