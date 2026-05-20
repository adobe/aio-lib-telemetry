const { instrumentEntrypoint, getInstrumentationHelpers } = require('@adobe/aio-lib-telemetry');
const { telemetryConfig } = require('../../telemetry');

// Parses raw event payload into structured events
function parsePayload(rawBody) {
  const parsed = JSON.parse(rawBody);
  return parsed.events || [];
}

// Validates a single event object against expected schema
function validateEvent(event) {
  return (
    typeof event.type === 'string' &&
    typeof event.timestamp === 'number' &&
    event.payload !== undefined
  );
}

// Transforms an event before storage (normalizes fields, adds metadata)
function transformEvent(event) {
  return {
    ...event,
    type: event.type.toLowerCase().trim(),
    receivedAt: Date.now(),
    source: 'app-builder-ingest',
  };
}

// Stores events in bulk to external storage API
async function storeEvents(events, storageToken) {
  const response = await fetch('https://events-storage.example.com/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storageToken}`,
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Storage API error ${response.status}: ${err}`);
  }

  return response.json();
}

// Sends a summary notification to a downstream webhook
async function notifyDownstream(summary, webhookUrl) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(summary),
  });

  if (!response.ok) {
    // Non-fatal — log and continue
    console.warn(`Downstream notification failed: ${response.status}`);
  }
}

// Simple helper to compute average of an array
function average(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function handler(params) {
  const events = parsePayload(params.__ow_body || '{"events":[]}');
  const valid = events.filter(validateEvent);
  const invalid = events.length - valid.length;

  const transformed = valid.map(transformEvent);
  const storeResult = await storeEvents(transformed, params.STORAGE_TOKEN);

  const summary = {
    received: events.length,
    stored: storeResult.count,
    invalidSkipped: invalid,
    avgPayloadSize: average(transformed.map(e => JSON.stringify(e.payload).length)),
  };

  if (params.DOWNSTREAM_WEBHOOK_URL) {
    await notifyDownstream(summary, params.DOWNSTREAM_WEBHOOK_URL);
  }

  return { statusCode: 200, body: summary };
}

const main = instrumentEntrypoint(handler, telemetryConfig);
module.exports = { main };
