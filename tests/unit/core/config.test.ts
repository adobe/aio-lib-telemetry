import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Meter, Tracer } from "@opentelemetry/api";

describe("core/config", () => {
  let coreConfig: typeof import("~/core/config");

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.doMock("~/core/metrics", () => ({
      createMetricsProxy: vi.fn(),
    }));

    coreConfig = await import("~/core/config");
  });

  describe("defineTelemetryConfig", () => {
    test("should return an object with initializeTelemetry function", () => {
      const initFn = vi.fn();
      const config = coreConfig.defineTelemetryConfig(initFn);

      expect(config).toEqual({
        initializeTelemetry: initFn,
      });
    });

    test("should work with async initialization functions", () => {
      const asyncInitFn = vi.fn().mockImplementation(async () => ({
        sdkConfig: await new Promise((resolve) => resolve({})),
        tracer: {} as Tracer,
        meter: {} as Meter,
      }));

      const config = coreConfig.defineTelemetryConfig(asyncInitFn);
      expect(config.initializeTelemetry).toBe(asyncInitFn);
    });
  });
});
