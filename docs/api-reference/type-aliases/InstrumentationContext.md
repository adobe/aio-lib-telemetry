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

Defined in: [types.ts:292](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L292)

The context for the current operation.

## Since

0.1.0

## Properties

### contextCarrier

```ts
contextCarrier: Record<PropertyKey, string>;
```

Defined in: [types.ts:321](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L321)

Holds a carrier that can be used to propagate the active context.

#### Since

0.1.0

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:315](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L315)

The span of the current operation.

#### Since

0.1.0

---

### logger

```ts
logger: ReturnType<typeof getLogger>;
```

Defined in: [types.ts:309](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L309)

The logger for the current operation.

#### Since

0.1.0

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:303](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L303)

The global (managed by the library) meter instance used to create metrics.

#### Since

0.1.0

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:297](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/types.ts#L297)

The global (managed by the library) tracer instance used to create spans.

#### Since

0.1.0
