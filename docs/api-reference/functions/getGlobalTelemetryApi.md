# `getGlobalTelemetryApi()`

```ts
function getGlobalTelemetryApi(): TelemetryApi;
```

Defined in: [core/telemetry-api.ts:34](https://github.com/adobe/aio-lib-telemetry/blob/251e841bc40ec2c3d9101b1aa24a65d5160e2dd2/source/core/telemetry-api.ts#L34)

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
