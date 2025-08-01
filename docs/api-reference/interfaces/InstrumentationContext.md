# `InstrumentationContext`

Defined in: [types.ts:235](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/types.ts#L235)

The context for the current operation.

## Since

0.1.0

## Properties

### contextCarrier

```ts
contextCarrier: Record<PropertyKey, string>;
```

Defined in: [types.ts:264](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/types.ts#L264)

Holds a carrier that can be used to propagate the active context.

#### Since

0.1.0

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:258](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/types.ts#L258)

The span of the current operation.

#### Since

0.1.0

---

### logger

```ts
logger: AioLogger;
```

Defined in: [types.ts:252](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/types.ts#L252)

The logger for the current operation.

#### Since

0.1.0

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:246](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/types.ts#L246)

The global (managed by the library) meter instance used to create metrics.

#### Since

0.1.0

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:240](https://github.com/adobe/aio-lib-telemetry/blob/311fa6dfe22958d569615a6746bf4a3a8211a5c3/source/types.ts#L240)

The global (managed by the library) tracer instance used to create spans.

#### Since

0.1.0
