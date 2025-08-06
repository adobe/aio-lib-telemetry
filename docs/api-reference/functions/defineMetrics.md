# `defineMetrics()`

```ts
function defineMetrics<T>(createMetrics: (meter: Meter) => T): T;
```

Defined in: [core/metrics.ts:52](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/core/metrics.ts#L52)

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
