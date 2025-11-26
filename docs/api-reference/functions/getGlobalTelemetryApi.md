# `getGlobalTelemetryApi()`

```ts
function getGlobalTelemetryApi(): TelemetryApi;
```

Defined in: [core/telemetry-api.ts:34](https://github.com/adobe/aio-lib-telemetry/blob/317842f77a9a2210592cfbae768ca97d536e39af/source/core/telemetry-api.ts#L34)

Gets the global telemetry API.

## Returns

[`TelemetryApi`](../type-aliases/TelemetryApi.md)

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
