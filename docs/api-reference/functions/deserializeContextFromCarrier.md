# `deserializeContextFromCarrier()`

```ts
function deserializeContextFromCarrier<Carrier>(
  carrier: Carrier,
  baseCtx: Context,
): Context;
```

Defined in: [api/propagation.ts:59](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/api/propagation.ts#L59)

Deserializes the context from a carrier and augments the given base context with it.

## Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `Carrier` _extends_ `Record`\<`string`, `string`\> |

## Parameters

| Parameter | Type      | Description                                                  |
| --------- | --------- | ------------------------------------------------------------ |
| `carrier` | `Carrier` | The carrier object to extract the context from.              |
| `baseCtx` | `Context` | The base context to augment. Defaults to the active context. |

## Returns

`Context`

## Since

0.1.0

## Example

```ts
const carrier = { traceparent: "...00-069ea333a3d430..." };
const ctx = deserializeContextFromCarrier(carrier);
// ctx now contains the context data from the carrier
```
