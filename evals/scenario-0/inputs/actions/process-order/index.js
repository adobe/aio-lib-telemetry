const { Core } = require('@adobe/aio-sdk');

async function main(params) {
  const logger = Core.Logger('process-order', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Processing order', { orderId: params.orderId });

    // Validate input
    if (!params.orderId) {
      return { statusCode: 400, body: { error: 'Missing orderId' } };
    }

    // Fetch order details from external API
    const response = await fetch(`https://api.example.com/orders/${params.orderId}`, {
      headers: { Authorization: `Bearer ${params.API_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Order API returned ${response.status}`);
    }

    const order = await response.json();

    // Apply business logic
    const processed = {
      orderId: order.id,
      total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: order.items.length,
      status: 'processed',
    };

    logger.info('Order processed successfully', { orderId: order.id, total: processed.total });

    return { statusCode: 200, body: processed };
  } catch (err) {
    logger.error('Failed to process order', { error: err.message });
    return { statusCode: 500, body: { error: err.message } };
  }
}

module.exports = { main };
