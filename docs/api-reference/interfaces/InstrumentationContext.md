# `InstrumentationContext`

Defined in: [types.ts:234](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L234)

The context for the current operation.

## Since

0.1.0

## Properties

### contextCarrier

```ts
contextCarrier: Record<PropertyKey, string>;
```

Defined in: [types.ts:263](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L263)

Holds a carrier that can be used to propagate the active context.

#### Since

0.1.0

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:257](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L257)

The span of the current operation.

#### Since

0.1.0

---

### logger

```ts
logger: AioLogger;
```

Defined in: [types.ts:251](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L251)

The logger for the current operation.

#### Since

0.1.0

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:245](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L245)

The global (managed by the library) meter instance used to create metrics.

#### Since

0.1.0

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:239](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/types.ts#L239)

The global (managed by the library) tracer instance used to create spans.

#### Since

0.1.0
