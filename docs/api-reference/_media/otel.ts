/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// This file re-exports the most commonly used OpenTelemetry components.
// It provides core APIs, SDKs, exporters, and resources while omitting
// specialized packages like individual instrumentations and similar utilities.

/** biome-ignore-all lint/performance/noBarrelFile: This is the import entrypoint for the public API. */

export * from "@opentelemetry/api";
export * from "@opentelemetry/api-logs";
export { OTLPLogExporter as OTLPLogExporterGrpc } from "@opentelemetry/exporter-logs-otlp-grpc";
export { OTLPLogExporter as OTLPLogExporterHttp } from "@opentelemetry/exporter-logs-otlp-http";
export { OTLPLogExporter as OTLPLogExporterProto } from "@opentelemetry/exporter-logs-otlp-proto";
export { OTLPMetricExporter as OTLPMetricExporterGrpc } from "@opentelemetry/exporter-metrics-otlp-grpc";
export { OTLPMetricExporter as OTLPMetricExporterHttp } from "@opentelemetry/exporter-metrics-otlp-http";
export { OTLPMetricExporter as OTLPMetricExporterProto } from "@opentelemetry/exporter-metrics-otlp-proto";
export { OTLPTraceExporter as OTLPTraceExporterGrpc } from "@opentelemetry/exporter-trace-otlp-grpc";
export { OTLPTraceExporter as OTLPTraceExporterHttp } from "@opentelemetry/exporter-trace-otlp-http";
export { OTLPTraceExporter as OTLPTraceExporterProto } from "@opentelemetry/exporter-trace-otlp-proto";
export * from "@opentelemetry/otlp-exporter-base";
export * from "@opentelemetry/otlp-grpc-exporter-base";
export * from "@opentelemetry/resources";
export {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  InMemoryLogRecordExporter,
  LoggerProvider,
  type SdkLogRecord,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
export {
  AggregationType,
  ConsoleMetricExporter,
  createAllowListAttributesProcessor,
  createDenyListAttributesProcessor,
  DataPointType,
  InMemoryMetricExporter,
  InstrumentType,
  MeterProvider,
  MetricReader,
  PeriodicExportingMetricReader,
  TimeoutError,
} from "@opentelemetry/sdk-metrics";
export {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  NodeTracerProvider,
  NoopSpanProcessor,
  ParentBasedSampler,
  RandomIdGenerator,
  SamplingDecision,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";
export * from "@opentelemetry/semantic-conventions";
