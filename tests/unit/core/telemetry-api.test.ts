import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Meter, Tracer } from "@opentelemetry/api";

describe("core/telemetry-api", () => {
  let coreTelemetryApi: typeof import("~/core/telemetry-api");

  const mockTracer = { startActiveSpan: vi.fn() };
  const mockMeter = { createCounter: vi.fn() };
  const mockMetadata = {
    actionName: "test-action",
    actionVersion: "1.0.0",
  };

  const diagWarn = vi.fn();
  const getMeter = vi.fn(() => mockMeter);
  const getTracer = vi.fn(() => mockTracer);

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    // Clear any previous API instance
    globalThis.__OTEL_TELEMETRY_API__ = null;

    vi.doMock("@opentelemetry/api", () => ({
      diag: {
        warn: diagWarn,
      },
      metrics: {
        getMeter,
      },
      trace: {
        getTracer,
      },
    }));

    vi.doMock("~/helpers/runtime", () => ({
      getRuntimeActionMetadata: vi.fn(() => mockMetadata),
    }));

    coreTelemetryApi = await import("~/core/telemetry-api");
  });

  describe("getGlobalTelemetryApi", () => {
    test("should throw error if telemetry API is not initialized", () => {
      expect(() => coreTelemetryApi.getGlobalTelemetryApi()).toThrow(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });

    test("should return the global telemetry API when initialized", () => {
      const api = { tracer: mockTracer, meter: mockMeter };
      vi.stubGlobal("__OTEL_TELEMETRY_API__", api);

      const result = coreTelemetryApi.getGlobalTelemetryApi();
      expect(result).toBe(api);
      expect(result.tracer).toBe(mockTracer);
      expect(result.meter).toBe(mockMeter);
    });
  });

  describe("initializeGlobalTelemetryApi", () => {
    test("should initialize with default tracer and meter", () => {
      coreTelemetryApi.initializeGlobalTelemetryApi();

      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api).toBeDefined();
      expect(api?.tracer).toBe(mockTracer);
      expect(api?.meter).toBe(mockMeter);

      expect(getTracer).toHaveBeenCalledWith(
        mockMetadata.actionName,
        mockMetadata.actionVersion,
      );

      expect(getMeter).toHaveBeenCalledWith(
        mockMetadata.actionName,
        mockMetadata.actionVersion,
      );
    });

    test("should use provided tracer and meter", () => {
      const customTracer = { startActiveSpan: vi.fn() };
      const customMeter = { createCounter: vi.fn() };

      coreTelemetryApi.initializeGlobalTelemetryApi({
        tracer: customTracer as unknown as Tracer,
        meter: customMeter as unknown as Meter,
      });

      const api = globalThis.__OTEL_TELEMETRY_API__;
      expect(api?.tracer).toBe(customTracer);
      expect(api?.meter).toBe(customMeter);

      // Should not call getTracer/getMeter when custom ones are provided
      expect(getTracer).not.toHaveBeenCalled();
      expect(getMeter).not.toHaveBeenCalled();
    });

    test("should use provided tracer with default meter", () => {
      const customTracer = { startActiveSpan: vi.fn() } as Partial<Tracer>;

      coreTelemetryApi.initializeGlobalTelemetryApi({
        tracer: customTracer as Tracer,
      });

      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api?.tracer).toBe(customTracer);
      expect(api?.meter).toBe(mockMeter);

      expect(getTracer).not.toHaveBeenCalled();
      expect(getMeter).toHaveBeenCalledWith(
        mockMetadata.actionName,
        mockMetadata.actionVersion,
      );
    });

    test("should use provided meter with default tracer", () => {
      const customMeter = { createCounter: vi.fn() } as Partial<Meter>;

      coreTelemetryApi.initializeGlobalTelemetryApi({
        meter: customMeter as Meter,
      });

      const api = globalThis.__OTEL_TELEMETRY_API__;
      expect(api?.tracer).toBe(mockTracer);
      expect(api?.meter).toBe(customMeter);

      expect(getMeter).not.toHaveBeenCalled();
      expect(getTracer).toHaveBeenCalledWith(
        mockMetadata.actionName,
        mockMetadata.actionVersion,
      );
    });

    test("should warn if already initialized and keep existing API", () => {
      // Initialize first time
      coreTelemetryApi.initializeGlobalTelemetryApi();
      const firstApi = globalThis.__OTEL_TELEMETRY_API__;

      // Try to initialize again
      coreTelemetryApi.initializeGlobalTelemetryApi();

      expect(diagWarn).toHaveBeenCalledWith(expect.any(String));
      expect(globalThis.__OTEL_TELEMETRY_API__).toBe(firstApi);
    });

    test("should not override existing API when already initialized", () => {
      const firstTracer = { startActiveSpan: vi.fn() };
      const firstMeter = { createCounter: vi.fn() };
      const secondTracer = { startActiveSpan: vi.fn() };
      const secondMeter = { createCounter: vi.fn() };

      const firstApi = {
        tracer: firstTracer as unknown as Tracer,
        meter: firstMeter as unknown as Meter,
      };

      const secondApi = {
        tracer: secondTracer as unknown as Tracer,
        meter: secondMeter as unknown as Meter,
      };

      coreTelemetryApi.initializeGlobalTelemetryApi(firstApi);
      coreTelemetryApi.initializeGlobalTelemetryApi(secondApi);

      const api = globalThis.__OTEL_TELEMETRY_API__;
      expect(api?.tracer).toBe(firstTracer);
      expect(api?.meter).toBe(firstMeter);
    });

    test("should handle empty config object", () => {
      coreTelemetryApi.initializeGlobalTelemetryApi({});
      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api).toBeDefined();
      expect(api?.tracer).toBe(mockTracer);
      expect(api?.meter).toBe(mockMeter);
    });
  });
});
