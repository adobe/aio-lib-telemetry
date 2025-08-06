# `EntrypointInstrumentationConfig`

Defined in: [types.ts:187](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L187)

The configuration for entrypoint instrumentation.

## Since

0.1.0

## Extends

- [`InstrumentationConfig`](InstrumentationConfig.md)\<(`params`: `Record`\<`string`, `unknown`\>) => `unknown`\>

## Properties

### hooks?

```ts
optional hooks: {
  onError?: (error: unknown, span: Span) => undefined | Error;
  onResult?: (result: unknown, span: Span) => void;
};
```

Defined in: [types.ts:138](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L138)

Hooks that can be used to act on a span depending on the result of the function.

#### onError()?

```ts
optional onError: (error: unknown, span: Span) => undefined | Error;
```

A function that will be called when the instrumented function fails.
You can use it to do something with the Span.

##### Parameters

| Parameter | Type      | Description                                      |
| --------- | --------- | ------------------------------------------------ |
| `error`   | `unknown` | The error produced by the instrumented function. |
| `span`    | `Span`    | The span of the instrumented function.           |

##### Returns

`undefined` \| `Error`

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

[`InstrumentationConfig`](InstrumentationConfig.md).[`hooks`](InstrumentationConfig.md#hooks)

---

### initializeTelemetry()

```ts
initializeTelemetry: (
  params: Record<string, unknown>,
  isDevelopment: boolean,
) => TelemetryConfig;
```

Defined in: [types.ts:206](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L206)

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

### isSuccessful()?

```ts
optional isSuccessful: (result: unknown) => boolean;
```

Defined in: [types.ts:135](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L135)

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

[`InstrumentationConfig`](InstrumentationConfig.md).[`isSuccessful`](InstrumentationConfig.md#issuccessful)

---

### propagation?

```ts
optional propagation: TelemetryPropagationConfig;
```

Defined in: [types.ts:195](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L195)

Configuration options related to context propagation.
See the [TelemetryPropagationConfig](TelemetryPropagationConfig.md) for the interface.

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

Defined in: [types.ts:106](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/types.ts#L106)

Configuration options related to the span started by the instrumented function.
See also the [SpanOptions](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.SpanOptions.html) interface.

#### Type declaration

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

[`InstrumentationConfig`](InstrumentationConfig.md).[`spanConfig`](InstrumentationConfig.md#spanconfig)
