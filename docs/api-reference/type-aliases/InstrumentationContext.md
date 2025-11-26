# `InstrumentationContext`

```ts
type InstrumentationContext = {
  contextCarrier: Record<PropertyKey, string>;
  currentSpan: Span;
  logger: ReturnType<typeof getLogger>;
  meter: Meter;
  tracer: Tracer;
};
```

Defined in: [types.ts:294](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L294)

The context for the current operation.

## Since

0.1.0

## Properties

### contextCarrier

```ts
contextCarrier: Record<PropertyKey, string>;
```

Defined in: [types.ts:323](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L323)

Holds a carrier that can be used to propagate the active context.

#### Since

0.1.0

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:317](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L317)

The span of the current operation.

#### Since

0.1.0

---

### logger

```ts
logger: ReturnType<typeof getLogger>;
```

Defined in: [types.ts:311](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L311)

The logger for the current operation.

#### Since

0.1.0

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:305](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L305)

The global (managed by the library) meter instance used to create metrics.

#### Since

0.1.0

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:299](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/types.ts#L299)

The global (managed by the library) tracer instance used to create spans.

#### Since

0.1.0
