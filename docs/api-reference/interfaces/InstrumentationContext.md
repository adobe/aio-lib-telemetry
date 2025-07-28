# `InstrumentationContext`

Defined in: [types.ts:174](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L174)

The context for the current operation.

## Properties

### contextCarrier

```ts
contextCarrier: Record<string, string>;
```

Defined in: [types.ts:188](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L188)

Holds a carrier that can be used to propagate the active context.

---

### currentSpan

```ts
currentSpan: Span;
```

Defined in: [types.ts:185](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L185)

The span of the current operation.

---

### logger

```ts
logger: AioLogger;
```

Defined in: [types.ts:182](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L182)

The logger for the current operation.

---

### meter

```ts
meter: Meter;
```

Defined in: [types.ts:179](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L179)

The global (managed by the library) meter instance used to create metrics.

---

### tracer

```ts
tracer: Tracer;
```

Defined in: [types.ts:176](https://github.com/adobe/aio-lib-telemetry/blob/705ee9c1d1db27539c2bb0122590608defceced2/source/types.ts#L176)

The global (managed by the library) tracer instance used to create spans.
