# `TelemetryConfig`

Defined in: [types.ts:167](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L167)

The configuration options for the telemetry module.

## Since

0.1.0

## Extends

- `Partial`\<[`TelemetryApi`](TelemetryApi.md)\>

## Properties

### diagnostics?

```ts
optional diagnostics: false | TelemetryDiagnosticsConfig;
```

Defined in: [types.ts:180](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L180)

The configuration options for the telemetry diagnostics.

#### Since

0.1.0

---

### meter?

```ts
optional meter: Meter;
```

Defined in: [types.ts:227](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L227)

The meter used to create metrics.

#### Since

0.1.0

#### Inherited from

[`TelemetryApi`](TelemetryApi.md).[`meter`](TelemetryApi.md#meter)

---

### sdkConfig

```ts
sdkConfig: Partial<NodeSDKConfiguration>;
```

Defined in: [types.ts:174](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L174)

The configuration options for the OpenTelemetry SDK.
See the [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) interface.

#### Since

0.1.0

---

### tracer?

```ts
optional tracer: Tracer;
```

Defined in: [types.ts:221](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L221)

The tracer used to create spans.

#### Since

0.1.0

#### Inherited from

[`TelemetryApi`](TelemetryApi.md).[`tracer`](TelemetryApi.md#tracer)
