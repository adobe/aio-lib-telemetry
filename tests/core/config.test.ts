import { metrics } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineMetrics, defineTelemetryConfig } from "~/core/config";
import * as telemetryApi from "~/core/telemetry-api";

// Mock dependencies
vi.mock("~/core/telemetry-api", () => ({
  getGlobalTelemetryApi: vi.fn(),
}));

describe("core/config", () => {
  describe("defineTelemetryConfig", () => {
    it("should return an object with initializeTelemetry function", () => {
      const initFn = vi.fn();
      const config = defineTelemetryConfig(initFn);

      expect(config).toEqual({
        initializeTelemetry: initFn,
      });
    });

    it("should preserve the original function reference", () => {
      const initFn = vi.fn().mockReturnValue({
        sdkConfig: {},
        tracer: {} as any,
        meter: {} as any,
      });

      const config = defineTelemetryConfig(initFn);

      expect(config.initializeTelemetry).toBe(initFn);
    });

    it("should work with async initialization functions", () => {
      const asyncInitFn = vi.fn().mockResolvedValue({
        sdkConfig: {},
        tracer: {} as any,
        meter: {} as any,
      });

      const config = defineTelemetryConfig(asyncInitFn);

      expect(config.initializeTelemetry).toBe(asyncInitFn);
    });
  });

  describe("defineMetrics", () => {
    const mockMeter = {
      createCounter: vi.fn(),
      createHistogram: vi.fn(),
      createGauge: vi.fn(),
      createUpDownCounter: vi.fn(),
      createObservableCounter: vi.fn(),
      createObservableGauge: vi.fn(),
      createObservableUpDownCounter: vi.fn(),
    } as any;

    const mockTracer = {} as any;

    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockReturnValue({
        meter: mockMeter,
        tracer: mockTracer,
      });
    });

    it("should create a proxy that lazily initializes metrics", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const metrics = defineMetrics((meter) => ({
        requestCount: meter.createCounter("request.count", {
          description: "Number of requests",
        }),
      }));

      // Metrics should not be created until accessed
      expect(mockMeter.createCounter).not.toHaveBeenCalled();

      // Accessing the metric should trigger initialization
      const counter = metrics.requestCount;

      expect(mockMeter.createCounter).toHaveBeenCalledWith("request.count", {
        description: "Number of requests",
      });
      expect(counter).toBe(mockCounter);
    });

    it("should only initialize metrics once", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const metrics = defineMetrics((meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      // Access the metric multiple times
      const counter1 = metrics.requestCount;
      const counter2 = metrics.requestCount;
      const counter3 = metrics.requestCount;

      expect(mockMeter.createCounter).toHaveBeenCalledTimes(1);
      expect(counter1).toBe(counter2);
      expect(counter2).toBe(counter3);
    });

    it("should support multiple metric types", () => {
      const mockCounter = { add: vi.fn() };
      const mockHistogram = { record: vi.fn() };
      const mockGauge = { record: vi.fn() };

      mockMeter.createCounter.mockReturnValue(mockCounter);
      mockMeter.createHistogram.mockReturnValue(mockHistogram);
      mockMeter.createGauge.mockReturnValue(mockGauge);

      const metrics = defineMetrics((meter) => ({
        requestCount: meter.createCounter("request.count"),
        requestDuration: meter.createHistogram("request.duration"),
        activeConnections: meter.createGauge("connections.active"),
      }));

      expect(metrics.requestCount).toBe(mockCounter);
      expect(metrics.requestDuration).toBe(mockHistogram);
      expect(metrics.activeConnections).toBe(mockGauge);

      expect(mockMeter.createCounter).toHaveBeenCalledWith(
        "request.count",
        undefined,
      );
      expect(mockMeter.createHistogram).toHaveBeenCalledWith(
        "request.duration",
        undefined,
      );
      expect(mockMeter.createGauge).toHaveBeenCalledWith(
        "connections.active",
        undefined,
      );
    });

    it("should throw error if telemetry API is not initialized", () => {
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockImplementation(() => {
        throw new Error("Telemetry API not initialized");
      });

      const metrics = defineMetrics((meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => metrics.requestCount).toThrow(
        "Failed to initialize metrics: Telemetry API not initialized",
      );
    });

    it("should handle circular dependency detection", () => {
      let metricsRef: any;

      const metrics = defineMetrics((meter) => {
        // Try to access the metrics during creation
        try {
          // This should throw
          const count = metricsRef.requestCount;
        } catch (e) {
          // Expected
        }

        return {
          requestCount: meter.createCounter("request.count"),
        };
      });

      metricsRef = metrics;

      // This should work fine after initialization
      expect(() => metrics.requestCount).not.toThrow();
    });

    it("should return undefined for symbol properties", () => {
      const metrics = defineMetrics((meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const symbolProp = Symbol("test");
      expect((metrics as any)[symbolProp]).toBeUndefined();
    });

    it("should handle errors in metric creation", () => {
      mockMeter.createCounter.mockImplementation(() => {
        throw new Error("Failed to create counter");
      });

      const metrics = defineMetrics((meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => metrics.requestCount).toThrow(
        "Failed to initialize metrics: Failed to create counter",
      );
    });

    it("should pass the meter instance to the factory function", () => {
      const factoryFn = vi.fn().mockReturnValue({});

      defineMetrics(factoryFn);

      // Access any property to trigger initialization
      const metrics = defineMetrics(factoryFn);
      try {
        (metrics as any).someProperty;
      } catch {
        // Expected since we return empty object
      }

      expect(factoryFn).toHaveBeenCalledWith(mockMeter);
    });
  });
});
