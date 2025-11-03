# `TelemetryConfig`

Defined in: [types.ts:200](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L200)

The configuration options for the telemetry module.

## Since

0.1.0

## Extends

- `Partial`\<[`TelemetryApi`](../type-aliases/TelemetryApi.md)\>

## Properties

### diagnostics?

```ts
optional diagnostics:
  | false
  | TelemetryDiagnosticsConfig;
```

Defined in: [types.ts:227](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L227)

The configuration options for the telemetry diagnostics.

#### Since

0.1.0

---

### instrumentationConfig?

```ts
optional instrumentationConfig: Omit<EntrypointInstrumentationConfig, "initializeTelemetry">;
```

Defined in: [types.ts:218](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L218)

The instrumentation configuration that will be used for the entrypoint function.

#### Remarks

This configuration will be merged with the initial instrumentation configuration provided
in the [instrumentEntrypoint](../functions/instrumentEntrypoint.md) function. The latter will take precedence over this configuration.

#### Default

```ts
undefined;
```

#### Since

1.1.0

---

### meter?

```ts
optional meter: Meter;
```

Defined in: [types.ts:287](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L287)

The meter used to create metrics.

#### Since

0.1.0

#### Inherited from

```ts
Partial.meter;
```

---

### sdkConfig

```ts
sdkConfig: Partial<NodeSDKConfiguration>;
```

Defined in: [types.ts:207](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L207)

The configuration options for the OpenTelemetry SDK.
See the [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) interface.

#### Since

0.1.0

---

### tracer?

```ts
optional tracer: Tracer;
```

Defined in: [types.ts:281](https://github.com/adobe/aio-lib-telemetry/blob/559503f2d0d79c50f3f552437165225cc1007a4f/source/types.ts#L281)

The tracer used to create spans.

#### Since

0.1.0

#### Inherited from

```ts
Partial.tracer;
```
