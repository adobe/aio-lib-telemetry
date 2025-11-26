# `EntrypointInstrumentationConfig`

Defined in: [types.ts:240](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L240)

The configuration for entrypoint instrumentation.

## Since

0.1.0

## Extends

- [`InstrumentationConfig`](../type-aliases/InstrumentationConfig.md)\<[`EntrypointFunction`](../type-aliases/EntrypointFunction.md)\>

## Properties

### hooks?

```ts
optional hooks: {
  onError?: (error: unknown, span: Span) => Error | undefined;
  onResult?: (result: unknown, span: Span) => void;
};
```

Defined in: [types.ts:138](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L138)

Hooks that can be used to act on a span depending on the result of the function.

#### onError()?

```ts
optional onError: (error: unknown, span: Span) => Error | undefined;
```

A function that will be called when the instrumented function fails.
You can use it to do something with the Span.

##### Parameters

| Parameter | Type      | Description                                      |
| --------- | --------- | ------------------------------------------------ |
| `error`   | `unknown` | The error produced by the instrumented function. |
| `span`    | `Span`    | The span of the instrumented function.           |

##### Returns

`Error` \| `undefined`

##### Since

0.1.0

#### onResult()?

```ts
optional onResult: (result: unknown, span: Span) => void;
```

A function that will be called with the result of the instrumented function (if any, and no error was thrown).
You can use it to do something with the Span.

##### Parameters

| Parameter | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `result`  | `unknown` | The result of the instrumented function. |
| `span`    | `Span`    | The span of the instrumented function.   |

##### Returns

`void`

##### Since

0.1.0

#### Inherited from

```ts
InstrumentationConfig.hooks;
```

---

### initializeTelemetry()

```ts
initializeTelemetry: (
  params: Record<string, unknown>,
  isDevelopment: boolean,
) => TelemetryConfig;
```

Defined in: [types.ts:266](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L266)

This function is called at the start of the action.

#### Parameters

| Parameter       | Type                            | Description                                        |
| --------------- | ------------------------------- | -------------------------------------------------- |
| `params`        | `Record`\<`string`, `unknown`\> | The parameters of the action.                      |
| `isDevelopment` | `boolean`                       | Whether the action is running in development mode. |

#### Returns

[`TelemetryConfig`](TelemetryConfig.md)

The telemetry configuration to use for the action.

#### Since

0.1.0

---

### integrations?

```ts
optional integrations: TelemetryIntegration[];
```

Defined in: [types.ts:255](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L255)

Integrations with external telemetry systems.

#### Since

1.1.0

#### Default

```ts
[];
```

---

### isSuccessful()?

```ts
optional isSuccessful: (result: unknown) => boolean;
```

Defined in: [types.ts:135](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L135)

A function that will be called to determine if the instrumented function was successful.
By default, the function is considered successful if it doesn't throw an error.

#### Parameters

| Parameter | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `result`  | `unknown` | The result of the instrumented function. |

#### Returns

`boolean`

Whether the instrumented function was successful.

#### Since

0.1.0

#### Inherited from

```ts
InstrumentationConfig.isSuccessful;
```

---

### propagation?

```ts
optional propagation: TelemetryPropagationConfig;
```

Defined in: [types.ts:248](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L248)

Configuration options related to context propagation.
See the [TelemetryPropagationConfig](../type-aliases/TelemetryPropagationConfig.md) for the interface.

#### Since

0.1.0

---

### spanConfig?

```ts
optional spanConfig: SpanOptions & {
  getBaseContext?: (...args: [Record<string, unknown>]) => Context;
  spanName?: string;
};
```

Defined in: [types.ts:106](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L106)

Configuration options related to the span started by the instrumented function.
See also the [SpanOptions](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.SpanOptions.html) interface.

#### Type Declaration

##### getBaseContext()?

```ts
optional getBaseContext: (...args: [Record<string, unknown>]) => Context;
```

The base context to use for the started span.

###### Parameters

| Parameter | Type                                | Description                                 |
| --------- | ----------------------------------- | ------------------------------------------- |
| ...`args` | \[`Record`\<`string`, `unknown`\>\] | The arguments of the instrumented function. |

###### Returns

`Context`

The base context to use for the started span.

###### Since

0.1.0

##### spanName?

```ts
optional spanName: string;
```

The name of the span. Defaults to the name of given function.
You must use a named function or a provide a name here.

###### Since

0.1.0

#### Since

0.1.0

#### Inherited from

```ts
InstrumentationConfig.spanConfig;
```
