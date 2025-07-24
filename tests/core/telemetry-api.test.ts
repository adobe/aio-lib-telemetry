import { diag, metrics, trace } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getGlobalTelemetryApi,
  initializeGlobalTelemetryApi,
} from "~/core/telemetry-api";
import * as runtimeHelpers from "~/helpers/runtime";

// Mock dependencies
vi.mock("@opentelemetry/api", () => ({
  diag: {
    warn: vi.fn(),
  },
  metrics: {
    getMeter: vi.fn(),
  },
  trace: {
    getTracer: vi.fn(),
  },
}));

vi.mock("~/helpers/runtime", () => ({
  getRuntimeActionMetadata: vi.fn(),
}));

describe("core/telemetry-api", () => {
  const mockTracer = { startActiveSpan: vi.fn() } as any;
  const mockMeter = { createCounter: vi.fn() } as any;
  const mockMetadata = {
    actionName: "test-action",
    actionVersion: "1.0.0",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global state
    (global as any).__OTEL_TELEMETRY_API__ = null;

    vi.mocked(runtimeHelpers.getRuntimeActionMetadata).mockReturnValue(
      mockMetadata as any,
    );
    vi.mocked(trace.getTracer).mockReturnValue(mockTracer);
    vi.mocked(metrics.getMeter).mockReturnValue(mockMeter);
  });

  describe("getGlobalTelemetryApi", () => {
    it("should throw error if telemetry API is not initialized", () => {
      expect(() => getGlobalTelemetryApi()).toThrow(
        "Telemetry API not initialized",
      );
    });

    it("should return the global telemetry API when initialized", () => {
      const api = { tracer: mockTracer, meter: mockMeter };
      (global as any).__OTEL_TELEMETRY_API__ = api;

      const result = getGlobalTelemetryApi();

      expect(result).toBe(api);
      expect(result.tracer).toBe(mockTracer);
      expect(result.meter).toBe(mockMeter);
    });
  });

  describe("initializeGlobalTelemetryApi", () => {
    it("should initialize with default tracer and meter", () => {
      initializeGlobalTelemetryApi();

      const api = (global as any).__OTEL_TELEMETRY_API__;

      expect(api).toBeDefined();
      expect(api.tracer).toBe(mockTracer);
      expect(api.meter).toBe(mockMeter);

      expect(trace.getTracer).toHaveBeenCalledWith("test-action", "1.0.0");
      expect(metrics.getMeter).toHaveBeenCalledWith("test-action", "1.0.0");
    });

    it("should use provided tracer and meter", () => {
      const customTracer = { startActiveSpan: vi.fn() } as any;
      const customMeter = { createCounter: vi.fn() } as any;

      initializeGlobalTelemetryApi({
        tracer: customTracer,
        meter: customMeter,
      });

      const api = (global as any).__OTEL_TELEMETRY_API__;

      expect(api.tracer).toBe(customTracer);
      expect(api.meter).toBe(customMeter);

      // Should not call getTracer/getMeter when custom ones are provided
      expect(trace.getTracer).not.toHaveBeenCalled();
      expect(metrics.getMeter).not.toHaveBeenCalled();
    });

    it("should use provided tracer with default meter", () => {
      const customTracer = { startActiveSpan: vi.fn() } as any;

      initializeGlobalTelemetryApi({
        tracer: customTracer,
      });

      const api = (global as any).__OTEL_TELEMETRY_API__;

      expect(api.tracer).toBe(customTracer);
      expect(api.meter).toBe(mockMeter);

      expect(trace.getTracer).not.toHaveBeenCalled();
      expect(metrics.getMeter).toHaveBeenCalledWith("test-action", "1.0.0");
    });

    it("should use provided meter with default tracer", () => {
      const customMeter = { createCounter: vi.fn() } as any;

      initializeGlobalTelemetryApi({
        meter: customMeter,
      });

      const api = (global as any).__OTEL_TELEMETRY_API__;

      expect(api.tracer).toBe(mockTracer);
      expect(api.meter).toBe(customMeter);

      expect(trace.getTracer).toHaveBeenCalledWith("test-action", "1.0.0");
      expect(metrics.getMeter).not.toHaveBeenCalled();
    });

    it("should warn if already initialized", () => {
      // First initialization
      initializeGlobalTelemetryApi();

      // Second initialization attempt
      initializeGlobalTelemetryApi();

      expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry API already initialized. Skipping initialization.",
      );
    });

    it("should not override existing API when already initialized", () => {
      const firstTracer = { startActiveSpan: vi.fn() } as any;
      const firstMeter = { createCounter: vi.fn() } as any;
      const secondTracer = { startActiveSpan: vi.fn() } as any;
      const secondMeter = { createCounter: vi.fn() } as any;

      // First initialization
      initializeGlobalTelemetryApi({
        tracer: firstTracer,
        meter: firstMeter,
      });

      // Second initialization attempt
      initializeGlobalTelemetryApi({
        tracer: secondTracer,
        meter: secondMeter,
      });

      const api = (global as any).__OTEL_TELEMETRY_API__;

      // Should still have the first API
      expect(api.tracer).toBe(firstTracer);
      expect(api.meter).toBe(firstMeter);
    });

    it("should handle empty config object", () => {
      initializeGlobalTelemetryApi({});

      const api = (global as any).__OTEL_TELEMETRY_API__;

      expect(api).toBeDefined();
      expect(api.tracer).toBe(mockTracer);
      expect(api.meter).toBe(mockMeter);
    });
  });

  describe("integration", () => {
    it("should work together - initialize then get", () => {
      const customTracer = { startActiveSpan: vi.fn() } as any;
      const customMeter = { createCounter: vi.fn() } as any;

      initializeGlobalTelemetryApi({
        tracer: customTracer,
        meter: customMeter,
      });

      const api = getGlobalTelemetryApi();

      expect(api.tracer).toBe(customTracer);
      expect(api.meter).toBe(customMeter);
    });

    it("should maintain singleton pattern", () => {
      initializeGlobalTelemetryApi();

      const api1 = getGlobalTelemetryApi();
      const api2 = getGlobalTelemetryApi();

      expect(api1).toBe(api2);
    });
  });
});
