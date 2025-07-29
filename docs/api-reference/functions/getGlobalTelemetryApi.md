# `getGlobalTelemetryApi()`

```ts
function getGlobalTelemetryApi(): TelemetryApi;
```

Defined in: [core/telemetry-api.ts:34](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/core/telemetry-api.ts#L34)

Gets the global telemetry API.

## Returns

[`TelemetryApi`](../interfaces/TelemetryApi.md)

## Throws

If the telemetry API is not initialized.

## Since

0.1.0

## Example

```ts
function someNonAutoInstrumentedFunction() {
  const { tracer } = getGlobalTelemetryApi();
  return tracer.startActiveSpan("some-span", (span) => {
    // ...
  });
}
```
