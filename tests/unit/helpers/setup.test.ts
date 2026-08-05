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

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("helpers/setup", () => {
  let setupHelpers: typeof import("#helpers/setup");

  beforeEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();

    setupHelpers = await import("#helpers/setup");
  });

  describe("setTelemetryEnv", () => {
    test("should not replace the `process.env` object reference", () => {
      const originalEnv = process.env;

      setupHelpers.setTelemetryEnv({});
      expect(process.env).toBe(originalEnv);
    });

    // Regression test. See https://magento.slack.com/archives/C013UDBFBGB/p1785777302104349
    test("should preserve getter-backed properties on `process.env`", () => {
      const originalEnv = process.env;
      let callCount = 0;

      process.env = new Proxy(originalEnv, {
        get(target, prop) {
          if (prop === "__OW_ACTIVATION_ID") {
            callCount += 1;
            return `activation-${callCount}`;
          }
          return target[prop as string];
        },
        set(target, prop, value) {
          target[prop as string] = value;
          return true;
        },
      });

      try {
        setupHelpers.setTelemetryEnv({});
        expect(process.env.__OW_ACTIVATION_ID).toBe("activation-1");

        setupHelpers.setTelemetryEnv({});
        expect(process.env.__OW_ACTIVATION_ID).toBe("activation-2");
      } finally {
        process.env = originalEnv;
      }
    });

    test("should set __AIO_LIB_TELEMETRY_ENABLE_TELEMETRY based on the ENABLE_TELEMETRY param", () => {
      setupHelpers.setTelemetryEnv({ ENABLE_TELEMETRY: true });
      expect(process.env.__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY).toBe("true");

      setupHelpers.setTelemetryEnv({ ENABLE_TELEMETRY: false });
      expect(process.env.__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY).toBe("false");

      setupHelpers.setTelemetryEnv({});
      expect(process.env.__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY).toBe("false");
    });

    test("should default OTEL_NODE_RESOURCE_DETECTORS to 'none' if unset", () => {
      vi.stubEnv("OTEL_NODE_RESOURCE_DETECTORS", undefined);

      setupHelpers.setTelemetryEnv({});
      expect(process.env.OTEL_NODE_RESOURCE_DETECTORS).toBe("none");
    });

    test("should not override an existing OTEL_NODE_RESOURCE_DETECTORS value", () => {
      vi.stubEnv("OTEL_NODE_RESOURCE_DETECTORS", "env,host");

      setupHelpers.setTelemetryEnv({});
      expect(process.env.OTEL_NODE_RESOURCE_DETECTORS).toBe("env,host");
    });

    test("should use the given LOG_LEVEL param when set", () => {
      setupHelpers.setTelemetryEnv({ LOG_LEVEL: "warn" });
      expect(process.env.__AIO_LIB_TELEMETRY_LOG_LEVEL).toBe("warn");
    });

    test("should fall back to 'info' in production when LOG_LEVEL is an empty string", () => {
      vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");

      setupHelpers.setTelemetryEnv({ LOG_LEVEL: "" });
      expect(process.env.__AIO_LIB_TELEMETRY_LOG_LEVEL).toBe("info");
    });

    test("should fall back to 'info' in production when LOG_LEVEL is not given", () => {
      vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");

      setupHelpers.setTelemetryEnv({});
      expect(process.env.__AIO_LIB_TELEMETRY_LOG_LEVEL).toBe("info");
    });

    test("should default to 'debug' in development when LOG_LEVEL is unset", () => {
      setupHelpers.setTelemetryEnv({ LOG_LEVEL: "" });
      expect(process.env.__AIO_LIB_TELEMETRY_LOG_LEVEL).toBe("debug");
    });
  });

  afterEach(() => {
    delete process.env.__OW_ACTIVATION_ID;
  });
});
