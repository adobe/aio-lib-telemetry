# `TelemetryPropagationConfig\<T\>`

Defined in: [types.ts:54](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L54)

Configuration related to context propagation (for distributed tracing).

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

Defined in: [types.ts:70](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L70)

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

Defined in: [types.ts:61](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L61)

By default, an instrumented entrypoint will try to automatically read (and use) the context from the incoming request.
Set to `true` if you want to skip this automatic context propagation.

#### Default

```ts
false;
```
