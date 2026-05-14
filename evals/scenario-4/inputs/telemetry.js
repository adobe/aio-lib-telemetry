const {
  defineTelemetryConfig,
  getAioRuntimeResource,
  getPresetInstrumentations,
} = require('@adobe/aio-lib-telemetry');

const {
  OTLPTraceExporterProto,
  OTLPMetricExporterProto,
  OTLPLogExporterProto,
  PeriodicExportingMetricReader,
  SimpleLogRecordProcessor,
} = require('@adobe/aio-lib-telemetry/otel');

module.exports.telemetryConfig = defineTelemetryConfig((params, isDev) => ({
  sdkConfig: {
    serviceName: 'commerce-integration',
    instrumentations: getPresetInstrumentations('simple'),
    resource: getAioRuntimeResource(),
    traceExporter: new OTLPTraceExporterProto(),
    metricReaders: [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporterProto() })],
    logRecordProcessors: [new SimpleLogRecordProcessor(new OTLPLogExporterProto())],
  },
  diagnostics: isDev ? { logLevel: 'debug' } : undefined,
}));
