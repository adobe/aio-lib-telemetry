import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMetricsProxy } from "~/core/metrics";
import * as telemetryApi from "~/core/telemetry-api";

// Mock dependencies
vi.mock("~/core/telemetry-api", () => ({
  getGlobalTelemetryApi: vi.fn(),
}));

describe("core/metrics", () => {
  describe("createMetricsProxy", () => {
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

    it("should create a proxy object", () => {
      const proxy = createMetricsProxy(() => ({}));

      expect(proxy).toBeDefined();
      expect(typeof proxy).toBe("object");
    });

    it("should lazily initialize metrics on first access", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const createMetricsFn = vi.fn((meter: any) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const proxy = createMetricsProxy(createMetricsFn);

      // Factory should not be called yet
      expect(createMetricsFn).not.toHaveBeenCalled();

      // Access the metric
      const counter = proxy.requestCount;

      // Now factory should be called
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
      expect(createMetricsFn).toHaveBeenCalledWith(mockMeter);
      expect(counter).toBe(mockCounter);
    });

    it("should cache initialized metrics", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const createMetricsFn = vi.fn((meter: any) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const proxy = createMetricsProxy(createMetricsFn);

      // Access multiple times
      const counter1 = proxy.requestCount;
      const counter2 = proxy.requestCount;
      const counter3 = proxy.requestCount;

      // Factory should only be called once
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
      expect(counter1).toBe(counter2);
      expect(counter2).toBe(counter3);
    });

    it("should handle symbol property access", () => {
      const proxy = createMetricsProxy(() => ({
        requestCount: {} as any,
      }));

      const symbolProp = Symbol("test");
      expect(proxy[symbolProp as any]).toBeUndefined();
    });

    it("should throw error when accessing metrics during initialization", () => {
      let proxyRef: any;

      const proxy = createMetricsProxy((meter: any) => {
        // Try to access proxy during initialization
        expect(() => proxyRef.someMetric).toThrow(
          'Circular dependency detected: Do not access metrics inside the defineMetrics function. Only create and return metrics objects. Attempted to access "someMetric"',
        );

        return {
          requestCount: meter.createCounter("request.count"),
        };
      });

      proxyRef = proxy;

      // This should work fine
      expect(() => proxy.requestCount).not.toThrow();
    });

    it("should throw descriptive error when telemetry API is not initialized", () => {
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockImplementation(() => {
        throw new Error("Telemetry API not initialized");
      });

      const proxy = createMetricsProxy((meter: any) => ({
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

      const proxy = createMetricsProxy((meter: any) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        "Failed to initialize metrics: Counter creation failed",
      );
    });

    it("should support all metric types", () => {
      const mockCounter = { add: vi.fn() };
      const mockUpDownCounter = { add: vi.fn() };
      const mockGauge = { record: vi.fn() };
      const mockHistogram = { record: vi.fn() };
      const mockObservableCounter = { addCallback: vi.fn() };
      const mockObservableGauge = { addCallback: vi.fn() };
      const mockObservableUpDownCounter = { addCallback: vi.fn() };

      mockMeter.createCounter.mockReturnValue(mockCounter);
      mockMeter.createUpDownCounter.mockReturnValue(mockUpDownCounter);
      mockMeter.createGauge.mockReturnValue(mockGauge);
      mockMeter.createHistogram.mockReturnValue(mockHistogram);
      mockMeter.createObservableCounter.mockReturnValue(mockObservableCounter);
      mockMeter.createObservableGauge.mockReturnValue(mockObservableGauge);
      mockMeter.createObservableUpDownCounter.mockReturnValue(
        mockObservableUpDownCounter,
      );

      const proxy = createMetricsProxy((meter: any) => ({
        counter: meter.createCounter("counter"),
        upDownCounter: meter.createUpDownCounter("up-down-counter"),
        gauge: meter.createGauge("gauge"),
        histogram: meter.createHistogram("histogram"),
        observableCounter: meter.createObservableCounter("observable-counter"),
        observableGauge: meter.createObservableGauge("observable-gauge"),
        observableUpDownCounter: meter.createObservableUpDownCounter(
          "observable-up-down-counter",
        ),
      }));

      expect(proxy.counter).toBe(mockCounter);
      expect(proxy.upDownCounter).toBe(mockUpDownCounter);
      expect(proxy.gauge).toBe(mockGauge);
      expect(proxy.histogram).toBe(mockHistogram);
      expect(proxy.observableCounter).toBe(mockObservableCounter);
      expect(proxy.observableGauge).toBe(mockObservableGauge);
      expect(proxy.observableUpDownCounter).toBe(mockObservableUpDownCounter);
    });

    it("should handle non-Error exceptions", () => {
      vi.mocked(telemetryApi.getGlobalTelemetryApi).mockImplementation(() => {
        throw "String error";
      });

      const proxy = createMetricsProxy((meter: any) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      expect(() => proxy.requestCount).toThrow(
        "Failed to initialize metrics: String error",
      );
    });

    it("should not reinitialize after successful initialization", () => {
      const mockCounter = { add: vi.fn() };
      mockMeter.createCounter.mockReturnValue(mockCounter);

      const createMetricsFn = vi.fn((meter: any) => ({
        requestCount: meter.createCounter("request.count"),
        errorCount: meter.createCounter("error.count"),
      }));

      const proxy = createMetricsProxy(createMetricsFn);

      // Access first metric
      const counter1 = proxy.requestCount;
      expect(createMetricsFn).toHaveBeenCalledTimes(1);

      // Access second metric - should not reinitialize
      const counter2 = proxy.errorCount;
      expect(createMetricsFn).toHaveBeenCalledTimes(1);
    });
  });
});
