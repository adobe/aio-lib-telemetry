# `InstrumentationContext`

Defined in: [types.ts:201](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L201)

The context for the current operation.

## Since

0.1.0

## Properties

### contextCarrier

```ts
contextCarrier: Record<string, string>;
```

Defined in: [types.ts:215](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L215)

Holds a carrier that can be used to propagate the active context.

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:212](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L212)

The span of the current operation.

---

### logger

```ts
logger: AioLogger;
```

Defined in: [types.ts:209](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L209)

The logger for the current operation.

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:206](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L206)

The global (managed by the library) meter instance used to create metrics.

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:203](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/types.ts#L203)

The global (managed by the library) tracer instance used to create spans.
