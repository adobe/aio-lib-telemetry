# `InstrumentationConfig\<T\>`

Defined in: [types.ts:77](https://github.com/adobe/aio-lib-telemetry/blob/ff54ba0c9f0266286f4859c4aab049b808a70c73/source/types.ts#L77)

The configuration for instrumentation.

## Extended by

- [`EntrypointInstrumentationConfig`](EntrypointInstrumentationConfig.md)

## Type Parameters

| Type Parameter              |
| --------------------------- |
| `T` _extends_ `AnyFunction` |

## Properties

### hooks?

```ts
optional hooks: {
  onError?: (error: unknown, span: Span) => undefined | Error;
  onResult?: (result: ReturnType<T>, span: Span) => void;
};
```

Defined in: [types.ts:108](https://github.com/adobe/aio-lib-telemetry/blob/ff54ba0c9f0266286f4859c4aab049b808a70c73/source/types.ts#L108)

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

#### onResult()?

```ts
optional onResult: (result: ReturnType<T>, span: Span) => void;
```

A function that will be called with the result of the instrumented function (if any, and no error was thrown).
You can use it to do something with the Span.

##### Parameters

| Parameter | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| `result`  | `ReturnType`\<`T`\> | The result of the instrumented function. |
| `span`    | `Span`              | The span of the instrumented function.   |

##### Returns

`void`

---

### isSuccessful()?

```ts
optional isSuccessful: (result: ReturnType<T>) => boolean;
```

Defined in: [types.ts:105](https://github.com/adobe/aio-lib-telemetry/blob/ff54ba0c9f0266286f4859c4aab049b808a70c73/source/types.ts#L105)

A function that will be called to determine if the instrumented function was successful.
By default, the function is considered successful if it doesn't throw an error.

#### Parameters

| Parameter | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| `result`  | `ReturnType`\<`T`\> | The result of the instrumented function. |

#### Returns

`boolean`

Whether the instrumented function was successful.

---

### spanConfig?

```ts
optional spanConfig: SpanOptions & {
  getBaseContext?: (...args: Parameters<T>) => Context;
  spanName?: string;
};
```

Defined in: [types.ts:82](https://github.com/adobe/aio-lib-telemetry/blob/ff54ba0c9f0266286f4859c4aab049b808a70c73/source/types.ts#L82)

Configuration options related to the span started by the instrumented function.
See also the [SpanOptions](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.SpanOptions.html) interface.

#### Type declaration

##### getBaseContext()?

```ts
optional getBaseContext: (...args: Parameters<T>) => Context;
```

The base context to use for the started span.

###### Parameters

| Parameter | Type                | Description                                 |
| --------- | ------------------- | ------------------------------------------- |
| ...`args` | `Parameters`\<`T`\> | The arguments of the instrumented function. |

###### Returns

`Context`

The base context to use for the started span.

##### spanName?

```ts
optional spanName: string;
```

The name of the span. Defaults to the name of given function.
You must use a named function or a provide a name here.
