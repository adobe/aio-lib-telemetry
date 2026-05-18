# `TelemetryConfig`

Defined in: [types.ts:200](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L200)

The configuration options for the telemetry module.

## Since

0.1.0

## Extends

- `Partial`\<[`TelemetryApi`](../type-aliases/TelemetryApi.md)\>

## Properties

### diagnostics?

```ts
optional diagnostics?:
  | false
  | TelemetryDiagnosticsConfig;
```

Defined in: [types.ts:205](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L205)

The configuration options for the telemetry diagnostics.

#### Since

0.1.0

---

### instrumentationConfig?

```ts
optional instrumentationConfig?: Omit<EntrypointInstrumentationConfig, "initializeTelemetry">;
```

Defined in: [types.ts:216](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L216)

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
optional meter?: Meter;
```

Defined in: [types.ts:285](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L285)

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

Defined in: [types.ts:226](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L226)

The configuration options for the OpenTelemetry SDK.
See the [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) interface.

#### Since

0.1.0

---

### tracer?

```ts
optional tracer?: Tracer;
```

Defined in: [types.ts:279](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L279)

The tracer used to create spans.

#### Since

0.1.0

#### Inherited from

```ts
Partial.tracer;
```
