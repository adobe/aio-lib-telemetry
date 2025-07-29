# `TelemetryConfig`

Defined in: [types.ts:145](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L145)

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

Defined in: [types.ts:153](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L153)

The configuration options for the telemetry diagnostics.

---

### meter?

```ts
optional meter: Meter;
```

Defined in: [types.ts:191](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L191)

The meter used to create metrics.

#### Inherited from

```ts
Partial.meter;
```

---

### sdkConfig

```ts
sdkConfig: Partial<NodeSDKConfiguration>;
```

Defined in: [types.ts:150](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L150)

The configuration options for the OpenTelemetry SDK.
See the [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) interface.

---

### tracer?

```ts
optional tracer: Tracer;
```

Defined in: [types.ts:188](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L188)

The tracer used to create spans.

#### Inherited from

```ts
Partial.tracer;
```
