# `TelemetryApi`

```ts
type TelemetryApi = {
  meter: Meter;
  tracer: Tracer;
};
```

Defined in: [types.ts:274](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/types.ts#L274)

Defines the global telemetry API. These items should be set once per application.

## Since

0.1.0

## Properties

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:285](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/types.ts#L285)

The meter used to create metrics.

#### Since

0.1.0

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:279](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/types.ts#L279)

The tracer used to create spans.

#### Since

0.1.0
