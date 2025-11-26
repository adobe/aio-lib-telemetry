# `TelemetryPropagationConfig`

```ts
type TelemetryPropagationConfig = {
  getContextCarrier?: (params: Record<string, unknown>) => {
    baseCtx?: Context;
    carrier: Record<PropertyKey, string>;
  };
  skip?: boolean;
};
```

Defined in: [types.ts:70](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L70)

Configuration related to context propagation (for distributed tracing).

## Since

0.1.0

## Properties

### getContextCarrier()?

```ts
optional getContextCarrier: (params: Record<string, unknown>) => {
  baseCtx?: Context;
  carrier: Record<PropertyKey, string>;
};
```

Defined in: [types.ts:89](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L89)

A function that returns the carrier for the current context.
Use it to specify where your carrier is located in the incoming parameters, when it's not one of the defaults.

#### Parameters

| Parameter | Type                            | Description                                                    |
| --------- | ------------------------------- | -------------------------------------------------------------- |
| `params`  | `Record`\<`string`, `unknown`\> | The classic `params` object received by Adobe runtime actions. |

#### Returns

```ts
{
  baseCtx?: Context;
  carrier: Record<PropertyKey, string>;
}
```

The carrier of the context to retrieve and an optional base context to use for the started span (defaults to the active context).

##### baseCtx?

```ts
optional baseCtx: Context;
```

##### carrier

```ts
carrier: Record<PropertyKey, string>;
```

#### Since

0.1.0

---

### skip?

```ts
optional skip: boolean;
```

Defined in: [types.ts:78](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L78)

By default, an instrumented entrypoint will try to automatically read (and use) the context from the incoming request.
Set to `true` if you want to skip this automatic context propagation.

#### Default

```ts
false;
```

#### Since

0.1.0
