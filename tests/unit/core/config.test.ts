import { beforeEach, describe, expect, test, vi } from "vitest";

import { defineMetrics, defineTelemetryConfig } from "~/core/config";
import * as metricsApi from "~/core/metrics";

import type { Meter, Tracer } from "@opentelemetry/api";

// Mock dependencies
vi.mock("~/core/metrics", () => ({
  createMetricsProxy: vi.fn(),
}));

describe("core/config", () => {
  describe("defineTelemetryConfig", () => {
    test("should return an object with initializeTelemetry function", () => {
      const initFn = vi.fn();
      const config = defineTelemetryConfig(initFn);

      expect(config).toEqual({
        initializeTelemetry: initFn,
      });
    });

    test("should preserve the original function reference", () => {
      const initFn = vi.fn().mockReturnValue({
        sdkConfig: {},
        tracer: {} as Tracer,
        meter: {} as Meter,
      });

      const config = defineTelemetryConfig(initFn);
      expect(config.initializeTelemetry).toBe(initFn);
    });

    test("should work with async initialization functions", () => {
      const asyncInitFn = vi.fn().mockImplementation(async () => ({
        sdkConfig: await new Promise((resolve) => resolve({})),
        tracer: {} as Tracer,
        meter: {} as Meter,
      }));

      const config = defineTelemetryConfig(asyncInitFn);
      expect(config.initializeTelemetry).toBe(asyncInitFn);
    });
  });

  describe("defineMetrics", () => {
    const mockMeter = {
      createCounter: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(metricsApi.createMetricsProxy).mockImplementation(
        (createMetrics) => {
          const targetObject = createMetrics(mockMeter as unknown as Meter);
          return new Proxy(targetObject, {
            get(target, prop) {
              return target[prop as keyof typeof target];
            },
          });
        },
      );
    });

    test("should create a proxy that lazily initializes metrics", () => {
      mockMeter.createCounter.mockReturnValue({
        add: vi.fn(),
      });

      const metricsInit = vi.fn((meter: Meter) => ({
        requestCount: meter.createCounter("request.count"),
      }));

      const metrics = defineMetrics(metricsInit);

      expect(metrics.requestCount).toBeDefined();
      expect(metricsApi.createMetricsProxy).toHaveBeenCalledWith(metricsInit);
      expect(metricsInit).toHaveBeenCalledWith(mockMeter);
    });
  });
});
