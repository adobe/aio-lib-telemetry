# `TelemetryApi`

```ts
type TelemetryApi = {
  meter: Meter;
  tracer: Tracer;
};
```

Defined in: [types.ts:276](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L276)

Defines the global telemetry API. These items should be set once per application.

## Since

0.1.0

## Properties

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:287](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L287)

The meter used to create metrics.

#### Since

0.1.0

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:281](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L281)

The tracer used to create spans.

#### Since

0.1.0
