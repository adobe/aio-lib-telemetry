# `getGlobalTelemetryApi()`

```ts
function getGlobalTelemetryApi(): TelemetryApi;
```

Defined in: [core/telemetry-api.ts:34](https://github.com/adobe/aio-lib-telemetry/blob/9592ef0d673b0c1c4209408c0de01f199de38283/source/core/telemetry-api.ts#L34)

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
