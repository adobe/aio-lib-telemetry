# `getLogger()`

```ts
function getLogger(name: string, config?: AioLoggerConfig): AioLogger;
```

Defined in: [core/logging.ts:98](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/core/logging.ts#L98)

Gets a logger instance that can export OpenTelemetry logs with the current
runtime invocation attributes.

## Parameters

| Parameter | Type              | Description                      |
| --------- | ----------------- | -------------------------------- |
| `name`    | `string`          | The name of the logger           |
| `config?` | `AioLoggerConfig` | The configuration for the logger |

## Returns

`AioLogger`

## Since

0.1.0

## Example

```ts
const logger = getLogger("my-logger", { level: "debug" });
logger.debug("Hello, world!");
```
