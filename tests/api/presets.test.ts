import { describe, expect, it } from "vitest";
import { getPresetInstrumentations } from "~/api/presets";

describe("api/presets", () => {
  describe("getPresetInstrumentations", () => {
    it("should return simple instrumentations for 'simple' preset", () => {
      const instrumentations = getPresetInstrumentations("simple");

      expect(instrumentations).toHaveLength(4);

      // Check that we have the expected instrumentation types
      const instrumentationNames = instrumentations.map(
        (i) => i.instrumentationName,
      );
      expect(instrumentationNames).toContain(
        "@opentelemetry/instrumentation-http",
      );
      expect(instrumentationNames).toContain(
        "@opentelemetry/instrumentation-graphql",
      );
      expect(instrumentationNames).toContain(
        "@opentelemetry/instrumentation-undici",
      );
      expect(instrumentationNames).toContain(
        "@opentelemetry/instrumentation-winston",
      );
    });

    it("should configure http instrumentation with requireParentforIncomingSpans", () => {
      const instrumentations = getPresetInstrumentations("simple");

      const httpInstrumentation = instrumentations.find(
        (i) => i.instrumentationName === "@opentelemetry/instrumentation-http",
      );

      expect(httpInstrumentation).toBeDefined();
      // Check that the config is properly set
      const config = (httpInstrumentation as any).getConfig();
      expect(config.requireParentforIncomingSpans).toBe(true);
    });

    it("should configure undici instrumentation with requireParentforSpans", () => {
      const instrumentations = getPresetInstrumentations("simple");

      const undiciInstrumentation = instrumentations.find(
        (i) =>
          i.instrumentationName === "@opentelemetry/instrumentation-undici",
      );

      expect(undiciInstrumentation).toBeDefined();
      // Check that the config is properly set
      const config = (undiciInstrumentation as any).getConfig();
      expect(config.requireParentforSpans).toBe(true);
    });

    it("should return auto instrumentations for 'full' preset", () => {
      const instrumentations = getPresetInstrumentations("full");

      expect(Array.isArray(instrumentations)).toBe(true);
      expect(instrumentations.length).toBeGreaterThan(4); // Should have more than simple preset

      // Check that it includes HTTP instrumentation with custom config
      const httpInstrumentation = instrumentations.find(
        (i) => i.instrumentationName === "@opentelemetry/instrumentation-http",
      );
      expect(httpInstrumentation).toBeDefined();
    });

    it("should return empty array for unknown preset", () => {
      const instrumentations = getPresetInstrumentations("unknown" as any);

      expect(instrumentations).toEqual([]);
    });

    it("should return empty array for undefined preset", () => {
      const instrumentations = getPresetInstrumentations(undefined as any);

      expect(instrumentations).toEqual([]);
    });

    it("should return empty array for null preset", () => {
      const instrumentations = getPresetInstrumentations(null as any);

      expect(instrumentations).toEqual([]);
    });
  });
});
