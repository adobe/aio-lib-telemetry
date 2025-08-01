import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Counter, Meter } from "@opentelemetry/api";
import type { MetricTypes } from "~/core/metrics";

describe("core/metrics", () => {
  let coreMetrics: typeof import("~/core/metrics");

  const getTracer = vi.fn();
  const createCounter = vi.fn();
  const getGlobalTelemetryApi = vi.fn(() => ({
    meter: mockMeter,
    tracer: mockTracer,
  }));

  const mockMeter = { createCounter };
  const mockTracer = { getTracer };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.doMock("~/core/telemetry-api", () => ({
      getGlobalTelemetryApi,
    }));

    coreMetrics = await import("~/core/metrics");
  });

  describe("createMetricsProxy", () => {
    test("should lazily initialize metrics on first access", () => {
      const mockCounter = { add: vi.fn() };
      createCounter.mockReturnValueOnce(mockCounter);

      const createMetricsFn = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const proxy = coreMetrics.defineMetrics(createMetricsFn);
      expect(createMetricsFn).not.toHaveBeenCalled();

      // After the first access, the factory should be called.
      const counter = proxy.requestCount;
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
      expect(createMetricsFn).toHaveBeenCalledWith(mockMeter);
      expect(counter).toBe(mockCounter);
    });

    test("should cache initialized metrics", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValueOnce(mockCounter);

      const createMetricsFn = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const proxy = coreMetrics.defineMetrics(createMetricsFn);
      const counter1 = proxy.requestCount;
      const counter2 = proxy.requestCount;
      const counter3 = proxy.requestCount;

      // Factory should only be called once
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
      expect(counter1).toBe(counter2);
      expect(counter2).toBe(counter3);
    });

    test("should handle symbol property access", () => {
      const proxy = coreMetrics.defineMetrics(
        () =>
          ({
            requestCount: {} as Counter,
          }) as Record<PropertyKey, MetricTypes>,
      );

      const symbolProp = Symbol("test");
      expect(proxy[symbolProp]).toBeUndefined();
    });

    test("should throw error when accessing metrics during initialization", () => {
      let proxyRef: Record<PropertyKey, MetricTypes> = {};
      const proxy = coreMetrics.defineMetrics((meter: Meter) => {
        // Try to access proxy during initialization
        expect(() => proxyRef.someMetric).toThrow();

        return {
          requestCount: meter.createCounter("request.count"),
        };
      });

      proxyRef = proxy;
      expect(() => proxy.requestCount).not.toThrow();
    });

    test("should throw descriptive error when telemetry API is not initialized", () => {
      const error = new Error("Telemetry API not initialized");
      getGlobalTelemetryApi.mockImplementationOnce(() => {
        throw error;
      });

      const proxy = coreMetrics.defineMetrics((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        expect.objectContaining({
          message: expect.stringContaining(error.message),
          cause: error,
        }),
      );
    });

    test("should throw descriptive error when metric creation fails", () => {
      const error = new Error("Counter creation failed");
      createCounter.mockImplementationOnce(() => {
        throw error;
      });

      const proxy = coreMetrics.defineMetrics((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        expect.objectContaining({
          message: expect.stringContaining(error.message),
          cause: error,
        }),
      );
    });

    test("should handle non-Error exceptions", () => {
      const stringError = "String error";
      getGlobalTelemetryApi.mockImplementationOnce(() => {
        throw stringError;
      });

      const proxy = coreMetrics.defineMetrics((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        expect.objectContaining({
          message: expect.stringContaining(stringError),
        }),
      );
    });

    test("should not reinitialize after successful initialization", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValueOnce(mockCounter);

      const createMetricsFn = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
        errorCount: meter.createCounter("error.count"),
      }));

      const proxy = coreMetrics.defineMetrics(createMetricsFn);
      const _ = [proxy.requestCount, proxy.errorCount];

      expect(createMetricsFn).toHaveBeenCalledTimes(1);
    });
  });
});
