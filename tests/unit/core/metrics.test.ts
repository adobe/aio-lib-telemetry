import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMetricsProxy } from "~/core/metrics";
import * as telemetryApi from "~/core/telemetry-api";

import type { Counter, Meter, Tracer } from "@opentelemetry/api";
import type { MetricTypes } from "~/core/metrics";

// Mock dependencies
vi.mock("~/core/telemetry-api", () => ({
  getGlobalTelemetryApi: vi.fn(),
}));

describe("core/metrics", () => {
  describe("createMetricsProxy", () => {
    const mockTracer = { getTracer: vi.fn() };
    const mockMeter = {
      createCounter: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockReturnValue({
        meter: mockMeter as unknown as Meter,
        tracer: mockTracer as unknown as Tracer,
      });
    });

    it("should create a proxy object", () => {
      const proxy = createMetricsProxy(() => ({}));

      expect(proxy).toBeDefined();
      expect(typeof proxy).toBe("object");
    });

    it("should lazily initialize metrics on first access", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const createMetricsFn = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const proxy = createMetricsProxy(createMetricsFn);
      expect(createMetricsFn).not.toHaveBeenCalled();

      // After the first access, the factory should be called.
      const counter = proxy.requestCount;
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
      expect(createMetricsFn).toHaveBeenCalledWith(mockMeter);
      expect(counter).toBe(mockCounter);
    });

    it("should cache initialized metrics", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const createMetricsFn = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const proxy = createMetricsProxy(createMetricsFn);
      const counter1 = proxy.requestCount;
      const counter2 = proxy.requestCount;
      const counter3 = proxy.requestCount;

      // Factory should only be called once
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
      expect(counter1).toBe(counter2);
      expect(counter2).toBe(counter3);
    });

    it("should handle symbol property access", () => {
      const proxy = createMetricsProxy(
        () =>
          ({
            requestCount: {} as Counter,
          }) as Record<PropertyKey, MetricTypes>,
      );

      const symbolProp = Symbol("test");
      expect(proxy[symbolProp]).toBeUndefined();
    });

    it("should throw error when accessing metrics during initialization", () => {
      let proxyRef: Record<PropertyKey, MetricTypes> = {};
      const proxy = createMetricsProxy((meter: Meter) => {
        // Try to access proxy during initialization
        expect(() => proxyRef.someMetric).toThrow(
          'Circular dependency detected: Do not access metrics inside the defineMetrics function. Only create and return metrics objects. Attempted to access "someMetric"',
        );

        return {
          requestCount: meter.createCounter("request.count"),
        };
      });

      proxyRef = proxy;
      expect(() => proxy.requestCount).not.toThrow();
    });

    it("should throw descriptive error when telemetry API is not initialized", () => {
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockImplementation(() => {
        throw new Error("Telemetry API not initialized");
      });

      const proxy = createMetricsProxy((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        "Failed to initialize metrics: Telemetry API not initialized",
      );
    });

    it("should throw descriptive error when metric creation fails", () => {
      mockMeter.createCounter.mockImplementation(() => {
        throw new Error("Counter creation failed");
      });

      const proxy = createMetricsProxy((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        "Failed to initialize metrics: Counter creation failed",
      );
    });

    it("should handle non-Error exceptions", () => {
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockImplementation(() => {
        // biome-ignore lint/style/useThrowOnlyError: This is for testing purposes.
        throw "String error";
      });

      const proxy = createMetricsProxy((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        "Failed to initialize metrics: String error",
      );
    });

    it("should not reinitialize after successful initialization", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const createMetricsFn = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
        errorCount: meter.createCounter("error.count"),
      }));

      const proxy = createMetricsProxy(createMetricsFn);
      const _ = [proxy.requestCount, proxy.errorCount];

      expect(createMetricsFn).toHaveBeenCalledTimes(1);
    });
  });
});
