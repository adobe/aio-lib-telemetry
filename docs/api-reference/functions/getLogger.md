# `getLogger()`

```ts
function getLogger(name: string, config?: AioLoggerConfig): AioLogger;
```

Defined in: [core/logging.ts:83](https://github.com/adobe/aio-lib-telemetry/blob/b7459bc16d246bc755238cf4edba48b0006bfd42/source/core/logging.ts#L83)

Get a logger instance.

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
