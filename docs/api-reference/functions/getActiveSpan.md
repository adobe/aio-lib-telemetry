# `getActiveSpan()`

```ts
function getActiveSpan(ctx?: Context): Span;
```

Defined in: [api/global.ts:30](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/api/global.ts#L30)

Gets the active span from the given context.

## Parameters

| Parameter | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `ctx`     | `Context` | The context to get the span from. |

## Returns

`Span`

## Throws

If no span is found.

## Since

0.1.0

## Example

```ts
const span = getActiveSpan();
span.addEvent("my-event", { foo: "bar" });
```
