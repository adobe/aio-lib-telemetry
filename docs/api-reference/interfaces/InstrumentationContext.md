# `InstrumentationContext`

Defined in: [types.ts:198](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L198)

The context for the current operation.

## Since

0.1.0

## Properties

### contextCarrier

```ts
contextCarrier: Record<PropertyKey, string>;
```

Defined in: [types.ts:212](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L212)

Holds a carrier that can be used to propagate the active context.

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:209](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L209)

The span of the current operation.

---

### logger

```ts
logger: AioLogger;
```

Defined in: [types.ts:206](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L206)

The logger for the current operation.

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:203](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L203)

The global (managed by the library) meter instance used to create metrics.

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:200](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/types.ts#L200)

The global (managed by the library) tracer instance used to create spans.
