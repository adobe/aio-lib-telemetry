// Starter telemetry config — needs to be completed for New Relic
const { defineTelemetryConfig, getAioRuntimeResource, getPresetInstrumentations } = require('@adobe/aio-lib-telemetry');

module.exports.telemetryConfig = defineTelemetryConfig((params, isDev) => {
  return {
    sdkConfig: {
      serviceName: 'catalog-service',
      instrumentations: getPresetInstrumentations('simple'),
      resource: getAioRuntimeResource(),
      // TODO: add New Relic exporters here
    },
  };
});
