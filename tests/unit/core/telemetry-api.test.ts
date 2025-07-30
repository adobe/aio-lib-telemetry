import { diag, metrics, trace } from "@opentelemetry/api";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  getGlobalTelemetryApi,
  initializeGlobalTelemetryApi,
} from "~/core/telemetry-api";
import { getRuntimeActionMetadata } from "~/helpers/runtime";

import type { Meter, Tracer } from "@opentelemetry/api";
import type { TelemetryApi } from "~/types";

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

function clearGlobalState() {
  // biome-ignore lint/performance/noDelete: it's for testing purposes
  delete globalThis.__OTEL_TELEMETRY_API__;
}

describe("core/telemetry-api", () => {
  const mockTracer = { startActiveSpan: vi.fn() } as Partial<Tracer>;
  const mockMeter = { createCounter: vi.fn() } as Partial<Meter>;

  const mockMetadata = {
    actionName: "test-action",
    actionVersion: "1.0.0",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearGlobalState();

    vi.mocked(trace.getTracer).mockReturnValue(mockTracer as Tracer);
    vi.mocked(metrics.getMeter).mockReturnValue(mockMeter as Meter);
    vi.mocked(getRuntimeActionMetadata).mockReturnValue(
      mockMetadata as ReturnType<typeof getRuntimeActionMetadata>,
    );
  });

  describe("getGlobalTelemetryApi", () => {
    test("should throw error if telemetry API is not initialized", () => {
      expect(() => getGlobalTelemetryApi()).toThrow(
        "You're trying to perform an operation that requires the telemetry API to be initialized. " +
          "Ensure the `ENABLE_TELEMETRY` environment variable is set to `true` and that you instrumented your entrypoint function.",
      );
    });

    test("should return the global telemetry API when initialized", () => {
      const api = { tracer: mockTracer, meter: mockMeter };
      globalThis.__OTEL_TELEMETRY_API__ = api as TelemetryApi;

      const result = getGlobalTelemetryApi();
      expect(result).toBe(api);
      expect(result.tracer).toBe(mockTracer);
      expect(result.meter).toBe(mockMeter);
    });
  });

  describe("initializeGlobalTelemetryApi", () => {
    test("should initialize with default tracer and meter", () => {
      initializeGlobalTelemetryApi();

      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api).toBeDefined();
      expect(api?.tracer).toBe(mockTracer);
      expect(api?.meter).toBe(mockMeter);

      expect(trace.getTracer).toHaveBeenCalledWith("test-action", "1.0.0");
      expect(metrics.getMeter).toHaveBeenCalledWith("test-action", "1.0.0");
    });

    test("should use provided tracer and meter", () => {
      const customTracer = { startActiveSpan: vi.fn() } as Partial<Tracer>;
      const customMeter = { createCounter: vi.fn() } as Partial<Meter>;

      initializeGlobalTelemetryApi({
        tracer: customTracer as Tracer,
        meter: customMeter as Meter,
      });

      const api = globalThis.__OTEL_TELEMETRY_API__;
      expect(api?.tracer).toBe(customTracer);
      expect(api?.meter).toBe(customMeter);

      // Should not call getTracer/getMeter when custom ones are provided
      expect(trace.getTracer).not.toHaveBeenCalled();
      expect(metrics.getMeter).not.toHaveBeenCalled();
    });

    test("should use provided tracer with default meter", () => {
      const customTracer = { startActiveSpan: vi.fn() } as Partial<Tracer>;

      initializeGlobalTelemetryApi({
        tracer: customTracer as Tracer,
      });

      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api?.tracer).toBe(customTracer);
      expect(api?.meter).toBe(mockMeter);

      expect(trace.getTracer).not.toHaveBeenCalled();
      expect(metrics.getMeter).toHaveBeenCalledWith("test-action", "1.0.0");
    });

    test("should use provided meter with default tracer", () => {
      const customMeter = { createCounter: vi.fn() } as Partial<Meter>;

      initializeGlobalTelemetryApi({
        meter: customMeter as Meter,
      });

      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api?.tracer).toBe(mockTracer);
      expect(api?.meter).toBe(customMeter);

      expect(trace.getTracer).toHaveBeenCalledWith("test-action", "1.0.0");
      expect(metrics.getMeter).not.toHaveBeenCalled();
    });

    test("should warn if already initialized", () => {
      initializeGlobalTelemetryApi();
      initializeGlobalTelemetryApi();

      expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry API already initialized. Skipping initialization.",
      );
    });

    test("should not override existing API when already initialized", () => {
      const firstTracer = { startActiveSpan: vi.fn() } as Partial<Tracer>;
      const firstMeter = { createCounter: vi.fn() } as Partial<Meter>;
      const secondTracer = { startActiveSpan: vi.fn() } as Partial<Tracer>;
      const secondMeter = { createCounter: vi.fn() } as Partial<Meter>;

      const firstApi = {
        tracer: firstTracer as Tracer,
        meter: firstMeter as Meter,
      };

      const secondApi = {
        tracer: secondTracer as Tracer,
        meter: secondMeter as Meter,
      };

      initializeGlobalTelemetryApi(firstApi);
      initializeGlobalTelemetryApi(secondApi);

      const api = globalThis.__OTEL_TELEMETRY_API__;
      expect(api).toEqual(firstApi);
      expect(api?.tracer).toBe(firstTracer);
      expect(api?.meter).toBe(firstMeter);
    });

    test("should handle empty config object", () => {
      initializeGlobalTelemetryApi({});
      const api = globalThis.__OTEL_TELEMETRY_API__;

      expect(api).toBeDefined();
      expect(api?.tracer).toBe(mockTracer);
      expect(api?.meter).toBe(mockMeter);
    });
  });
});
