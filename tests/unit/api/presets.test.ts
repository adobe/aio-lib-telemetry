/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { beforeEach, describe, expect, test } from "vitest";

import type { TelemetryInstrumentationPreset } from "~/types";

describe("api/presets", () => {
  let apiPresets: typeof import("~/api/presets");

  beforeEach(async () => {
    apiPresets = await import("~/api/presets");
  });

  describe("getPresetInstrumentations", () => {
    test("should return simple instrumentations for 'simple' preset", () => {
      const instrumentations = apiPresets.getPresetInstrumentations("simple");
      expect(Array.isArray(instrumentations)).toBe(true);

      const expectedInstrumentations = 3;
      expect(instrumentations).toHaveLength(expectedInstrumentations);

      const instrumentationNames = instrumentations.map(
        (i) => i.instrumentationName,
      );

      expect(instrumentationNames).toEqual(
        expect.arrayContaining([
          "@opentelemetry/instrumentation-http",
          "@opentelemetry/instrumentation-graphql",
          "@opentelemetry/instrumentation-undici",
        ]),
      );
    });

    test("should return auto instrumentations for 'full' preset", () => {
      const instrumentations = apiPresets.getPresetInstrumentations("full");

      expect(Array.isArray(instrumentations)).toBe(true);
      expect(instrumentations.length).toBeGreaterThan(0);
    });

    test.each(["unknown", "invalid", undefined, null] as const)(
      "should throw for invalid preset '%s'",
      (preset) => {
        expect(() =>
          apiPresets.getPresetInstrumentations(
            preset as TelemetryInstrumentationPreset,
          ),
        ).toThrow(`Unknown instrumentation preset: ${preset}`);
      },
    );

    test.each(["simple", "full"] as const)(
      "preset '%s' should configure http instrumentation with requireParentforIncomingSpans",
      (preset) => {
        const instrumentations = apiPresets.getPresetInstrumentations(preset);
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
        const instrumentations = apiPresets.getPresetInstrumentations(preset);
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
  });
});
