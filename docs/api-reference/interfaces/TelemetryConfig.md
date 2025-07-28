# `TelemetryConfig`

Defined in: [types.ts:148](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L148)

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

Defined in: [types.ts:156](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L156)

The configuration options for the telemetry diagnostics.

---

### meter?

```ts
optional meter: Meter;
```

Defined in: [types.ts:194](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L194)

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

Defined in: [types.ts:153](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L153)

The configuration options for the OpenTelemetry SDK.
See the [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) interface.

---

### tracer?

```ts
optional tracer: Tracer;
```

Defined in: [types.ts:191](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L191)

The tracer used to create spans.

#### Inherited from

```ts
Partial.tracer;
```
