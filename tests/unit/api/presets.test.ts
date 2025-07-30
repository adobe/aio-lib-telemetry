import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { describe, expect, test } from "vitest";

import { getPresetInstrumentations } from "~/api/presets";

import type { TelemetryInstrumentationPreset } from "~/types";

describe("api/presets", () => {
  describe("getPresetInstrumentations", () => {
    test("should return simple instrumentations for 'simple' preset", () => {
      const instrumentations = getPresetInstrumentations("simple");
      expect(Array.isArray(instrumentations)).toBe(true);
      expect(instrumentations).toHaveLength(4);

      const instrumentationNames = instrumentations.map(
        (i) => i.instrumentationName,
      );

      expect(instrumentationNames).toEqual(
        expect.arrayContaining([
          "@opentelemetry/instrumentation-http",
          "@opentelemetry/instrumentation-graphql",
          "@opentelemetry/instrumentation-undici",
          "@opentelemetry/instrumentation-winston",
        ]),
      );
    });

    test("should return auto instrumentations for 'full' preset", () => {
      const instrumentations = getPresetInstrumentations("full");

      expect(Array.isArray(instrumentations)).toBe(true);
      expect(instrumentations.length).toBeGreaterThan(0);
    });

    test.each(["unknown", "invalid", undefined, null] as const)(
      "should throw for invalid preset '%s'",
      (preset) => {
        expect(() =>
          getPresetInstrumentations(preset as TelemetryInstrumentationPreset),
        ).toThrow(`Unknown instrumentation preset: ${preset}`);
      },
    );

    test.each(["simple", "full"] as const)(
      "preset '%s' should configure http instrumentation with requireParentforIncomingSpans",
      (preset) => {
        const instrumentations = getPresetInstrumentations(preset);
        const httpInstrumentation = instrumentations.find(
          (i) =>
            i.instrumentationName === "@opentelemetry/instrumentation-http",
        );

        expect(httpInstrumentation).toBeDefined();
        expect(httpInstrumentation).toBeInstanceOf(HttpInstrumentation);

        const config = (httpInstrumentation as HttpInstrumentation).getConfig();
        expect(config.requireParentforIncomingSpans).toBe(true);
      },
    );

    test.each(["simple", "full"] as const)(
      "preset '%s' should configure undici instrumentation with requireParentforSpans",
      (preset) => {
        const instrumentations = getPresetInstrumentations(preset);
        const undiciInstrumentation = instrumentations.find(
          (i) =>
            i.instrumentationName === "@opentelemetry/instrumentation-undici",
        );

        expect(undiciInstrumentation).toBeDefined();
        expect(undiciInstrumentation).toBeInstanceOf(UndiciInstrumentation);

        const config = (
          undiciInstrumentation as UndiciInstrumentation
        ).getConfig();

        expect(config.requireParentforSpans).toBe(true);
      },
    );

    test("full preset should configure http instrumentation with requireParentforIncomingSpans", () => {
      const instrumentations = getPresetInstrumentations("full");
      const httpInstrumentation = instrumentations.find(
        (i) => i.instrumentationName === "@opentelemetry/instrumentation-http",
      );

      expect(httpInstrumentation).toBeDefined();
      expect(httpInstrumentation).toBeInstanceOf(HttpInstrumentation);

      const config = (httpInstrumentation as HttpInstrumentation).getConfig();
      expect(config.requireParentforIncomingSpans).toBe(true);
    });
  });
});
