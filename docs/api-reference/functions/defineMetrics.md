# `defineMetrics()`

```ts
function defineMetrics<T>(createMetrics: (meter: Meter) => T): T;
```

Defined in: [core/config.ts:48](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/core/config.ts#L48)

Helper to define a record of metrics.

## Type Parameters

| Type Parameter                                         |
| ------------------------------------------------------ |
| `T` _extends_ `Record`\<`PropertyKey`, `MetricTypes`\> |

## Parameters

| Parameter       | Type                      | Description                                                               |
| --------------- | ------------------------- | ------------------------------------------------------------------------- |
| `createMetrics` | (`meter`: `Meter`) => `T` | A function that receives a meter which can be used to create the metrics. |

## Returns

`T`

## See

https://opentelemetry.io/docs/concepts/signals/metrics/

## Since

0.1.0

## Example

```ts
const metrics = defineMetrics((meter) => {
  return {
    myMetric: meter.createCounter("my-metric", { description: "My metric" }),
  };
});
```
