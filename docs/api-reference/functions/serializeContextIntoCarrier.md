# `serializeContextIntoCarrier()`

```ts
function serializeContextIntoCarrier<Carrier>(
  carrier?: Carrier,
  ctx?: Context,
): Carrier;
```

Defined in: [api/propagation.ts:38](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/api/propagation.ts#L38)

Serializes the current context into a carrier.

## Type Parameters

| Type Parameter                                          |
| ------------------------------------------------------- |
| `Carrier` _extends_ `Record`\<`PropertyKey`, `string`\> |

## Parameters

| Parameter  | Type      | Description                                               |
| ---------- | --------- | --------------------------------------------------------- |
| `carrier?` | `Carrier` | The carrier object to inject the context into.            |
| `ctx?`     | `Context` | The context to serialize. Defaults to the active context. |

## Returns

`Carrier`

## Since

0.1.0

## Examples

```ts
const carrier = serializeContextIntoCarrier();
// carrier is now a record with the context data
```

```ts
const myCarrier = { more: "data" };
const carrier = serializeContextIntoCarrier(myCarrier);
// carrier now contains both the existing data and the context data
// carrier = { more: 'data', ...contextData }
```
