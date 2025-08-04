# `TelemetryPropagationConfig\<T\>`

Defined in: [types.ts:66](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L66)

Configuration related to context propagation (for distributed tracing).

## Since

0.1.0

## Type Parameters

| Type Parameter              |
| --------------------------- |
| `T` _extends_ `AnyFunction` |

## Properties

### getContextCarrier()?

```ts
optional getContextCarrier: (...args: Parameters<T>) => {
  baseCtx?: Context;
  carrier: Record<string, string>;
};
```

Defined in: [types.ts:82](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L82)

A function that returns the carrier for the current context.
Use it to specify where your carrier is located in the incoming parameters, when it's not one of the defaults.

#### Parameters

| Parameter | Type                | Description                                 |
| --------- | ------------------- | ------------------------------------------- |
| ...`args` | `Parameters`\<`T`\> | The arguments of the instrumented function. |

#### Returns

```ts
{
  baseCtx?: Context;
  carrier: Record<string, string>;
}
```

The carrier of the context to retrieve and an optional base context to use for the started span (defaults to the active context).

##### baseCtx?

```ts
optional baseCtx: Context;
```

##### carrier

```ts
carrier: Record<string, string>;
```

---

### skip?

```ts
optional skip: boolean;
```

Defined in: [types.ts:73](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L73)

By default, an instrumented entrypoint will try to automatically read (and use) the context from the incoming request.
Set to `true` if you want to skip this automatic context propagation.

#### Default

```ts
false;
```
