const { getLogger, instrumentEntrypoint } = require("@adobe/aio-lib-telemetry");
const { telemetryConfig } = require("../../telemetry");

let logger;

async function handler(params) {
  logger ??= getLogger("check-inventory");
  logger.info("Checking inventory", { sku: params.sku });

  const response = await fetch(
    `https://inventory.example.com/stock/${params.sku}`,
  );

  return {
    statusCode: response.status,
    body: await response.json(),
  };
}

const main = instrumentEntrypoint(handler, telemetryConfig);
module.exports = { main };
