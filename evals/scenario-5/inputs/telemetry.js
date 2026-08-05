const {
  defineTelemetryConfig,
  getAioRuntimeResource,
  getPresetInstrumentations,
} = require("@adobe/aio-lib-telemetry");

const {
  OTLPTraceExporterProto,
  OTLPMetricExporterProto,
  OTLPLogExporterProto,
  PeriodicExportingMetricReader,
  SimpleLogRecordProcessor,
} = require("@adobe/aio-lib-telemetry/otel");

module.exports.telemetryConfig = defineTelemetryConfig(() => ({
  sdkConfig: {
    serviceName: "inventory-check",
    instrumentations: getPresetInstrumentations("simple"),
    resource: getAioRuntimeResource(),
    traceExporter: new OTLPTraceExporterProto({
      url: "https://telemetry.example.com/v1/traces",
    }),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporterProto({
          url: "https://telemetry.example.com/v1/metrics",
        }),
      }),
    ],
    logRecordProcessors: [
      new SimpleLogRecordProcessor(
        new OTLPLogExporterProto({
          url: "https://telemetry.example.com/v1/logs",
        }),
      ),
    ],
  },
}));
