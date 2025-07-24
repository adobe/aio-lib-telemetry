# `getLogger()`

```ts
function getLogger(name: string, config?: AioLoggerConfig): AioLogger;
```

Defined in: [core/logging.ts:82](https://github.com/adobe/aio-lib-telemetry/blob/62a2891c310a2377adc467291b72c2e0696970c1/source/core/logging.ts#L82)

Get a logger instance.

## Parameters

| Parameter | Type              | Description                      |
| --------- | ----------------- | -------------------------------- |
| `name`    | `string`          | The name of the logger           |
| `config?` | `AioLoggerConfig` | The configuration for the logger |

## Returns

`AioLogger`

## Example

```ts
const logger = getLogger("my-logger", { level: "debug" });
logger.debug("Hello, world!");
```
