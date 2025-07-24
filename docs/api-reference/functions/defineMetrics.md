# `defineMetrics()`

```ts
function defineMetrics<T>(createMetrics: (meter: Meter) => T): T;
```

Defined in: [core/config.ts:46](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/core/config.ts#L46)

Helper to define a record of metrics.

## Type Parameters

| Type Parameter                                    |
| ------------------------------------------------- |
| `T` _extends_ `Record`\<`string`, `MetricTypes`\> |

## Parameters

| Parameter       | Type                      | Description                                                               |
| --------------- | ------------------------- | ------------------------------------------------------------------------- |
| `createMetrics` | (`meter`: `Meter`) => `T` | A function that receives a meter which can be used to create the metrics. |

## Returns

`T`

## See

https://opentelemetry.io/docs/concepts/signals/metrics/

## Example

```ts
const metrics = defineMetrics((meter) => {
  return {
    myMetric: meter.createCounter("my-metric", { description: "My metric" }),
  };
});
```
