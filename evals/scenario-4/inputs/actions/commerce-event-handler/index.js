const openwhisk = require('openwhisk');
const { telemetryConfig } = require('../../telemetry');

// Handles an Adobe Commerce order.created event
// and triggers the downstream fulfillment action
async function handler(params) {
  const event = params.data;

  if (!event || event.type !== 'com.adobe.commerce.order.created') {
    return { statusCode: 200, body: { skipped: true } };
  }

  const orderId = event.value.entity_id;
  const storeCode = event.value.store_code;

  // Invoke the fulfill-order action asynchronously
  const ow = openwhisk();
  await ow.actions.invoke({
    name: 'fulfillment-service/fulfill-order',
    params: {
      orderId,
      storeCode,
      priority: event.value.priority || 'normal',
    },
    blocking: false,
  });

  return {
    statusCode: 200,
    body: { accepted: true, orderId },
  };
}

module.exports = { main: handler };
