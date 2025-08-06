# `getLogger()`

```ts
function getLogger(name: string, config?: AioLoggerConfig): AioLogger;
```

Defined in: [core/logging.ts:83](https://github.com/adobe/aio-lib-telemetry/blob/dd348342643b2b66d5a8c5267221de639b83642e/source/core/logging.ts#L83)

Gets a logger instance that can export OpenTelemetry logs.

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
