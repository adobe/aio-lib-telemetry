// Telemetry configuration for the fulfillment service
const { defineTelemetryConfig, getAioRuntimeResource, getPresetInstrumentations } = require('@adobe/aio-lib-telemetry');
const { OTLPTraceExporter, OTLPMetricExporter, OTLPLogExporter } = require('@adobe/aio-lib-telemetry/exporters');

const NR_ENDPOINT = 'https://otlp.nr-data.net:4318';

module.exports.telemetryConfig = defineTelemetryConfig((params, isDev) => {
  const headers = { 'Authorization': `Api-Key ${params.NEW_RELIC_LICENSE_KEY}` };

  return {
    serviceName: 'fulfillment-service',
    sdkConfig: {
      instrumentations: getPresetInstrumentations('full'),
      resource: getAioRuntimeResource(),
      exporters: {
        traces: new OTLPTraceExporter({ url: `${NR_ENDPOINT}/v1/traces`, headers }),
        metrics: new OTLPMetricExporter({ url: `${NR_ENDPOINT}/v1/metrics`, headers }),
        logs: new OTLPLogExporter({ url: `${NR_ENDPOINT}/v1/logs`, headers }),
      },
    },
    diagnostics: { logLevel: 'verbose' },
  };
});
