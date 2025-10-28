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

import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Meter, Tracer } from "@opentelemetry/api";

describe("core/config", () => {
  let coreConfig: typeof import("~/core/config");

  beforeEach(async () => {
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
