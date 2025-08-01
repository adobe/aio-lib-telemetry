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

import {
  setupDevelopmentEnv,
  setupLegacyDevelopmentEnv,
  setupProductionEnv,
} from "~~/tests/fixtures/environment";

describe("helpers/runtime", () => {
  let runtimeHelpers: typeof import("~/helpers/runtime");

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();

    runtimeHelpers = await import("~/helpers/runtime");
  });

  describe("isDevelopment", () => {
    test("should return true when AIO_DEV is set", () => {
      vi.stubEnv("AIO_DEV", "true");
      expect(runtimeHelpers.isDevelopment()).toBe(true);
    });

    test("should return true when AIO_DEV is just defined", () => {
      vi.stubEnv("AIO_DEV", "");
      expect(runtimeHelpers.isDevelopment()).toBe(true);
    });

    test("should return true when __OW_ACTION_VERSION is not set", () => {
      expect(runtimeHelpers.isDevelopment()).toBe(true);
    });

    test("should return false when __OW_ACTION_VERSION is set", () => {
      vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");
      expect(runtimeHelpers.isDevelopment()).toBe(false);
    });

    test("should return false when AIO_DEV is not set and __OW_ACTION_VERSION is set", () => {
      vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");
      expect(runtimeHelpers.isDevelopment()).toBe(false);
    });

    test("should return true when AIO_DEV is set and __OW_ACTION_VERSION is not set", () => {
      vi.stubEnv("AIO_DEV", "true");
      expect(runtimeHelpers.isDevelopment()).toBe(true);
    });
  });

  describe("isTelemetryEnabled", () => {
    test("should return true when __ENABLE_TELEMETRY is 'true'", () => {
      vi.stubEnv("__ENABLE_TELEMETRY", "true");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(true);
    });

    test("should return false when __ENABLE_TELEMETRY is 'false'", () => {
      vi.stubEnv("__ENABLE_TELEMETRY", "false");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);
    });

    test("should return false when __ENABLE_TELEMETRY is not set", () => {
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);
    });

    test("should return false for any non-true value", () => {
      vi.stubEnv("__ENABLE_TELEMETRY", "1");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);

      vi.stubEnv("__ENABLE_TELEMETRY", "yes");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);

      vi.stubEnv("__ENABLE_TELEMETRY", "TRUE");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);
    });
  });

  describe("getRuntimeActionMetadata", () => {
    test("should return correct metadata for production", () => {
      setupProductionEnv();

      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      expect(metadata).toEqual({
        activationId: "test-prod-activation-id",
        namespace: "test-prod-namespace",
        apiHost: "test-prod-api-host",
        apiKey: "test-prod-api-key",
        isDevelopment: false,

        region: "test-prod-region",
        cloud: "test-prod-cloud",
        transactionId: "test-prod-transaction-id",
        actionVersion: "1.0.0",
        deadline: expect.any(Date),

        packageName: "test-prod-package-name",
        actionName: "test-prod-action-name",
      });
    });

    test("should return correct metadata for development", () => {
      setupDevelopmentEnv();

      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      expect(metadata).toEqual({
        activationId: "test-dev-activation-id",
        namespace: "test-dev-namespace",
        apiHost: "test-dev-api-host",
        apiKey: "test-dev-api-key",
        isDevelopment: true,

        region: "local",
        cloud: "local",
        transactionId: "unknown",
        deadline: null,

        packageName: "test-dev-package-name",
        actionName: "test-dev-action-name",
        actionVersion: "0.0.0 (development)",
      });
    });

    test("should return correct metadata for legacy development", () => {
      setupLegacyDevelopmentEnv();

      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      expect(metadata).toEqual({
        activationId: "test-dev-activation-id",
        namespace: "test-dev-namespace",
        apiHost: "test-dev-api-host",
        apiKey: "test-dev-api-key",
        isDevelopment: true,

        region: "local",
        cloud: "local",
        transactionId: "unknown",
        deadline: null,

        packageName: "unknown",
        actionName: "test-dev-action-name",
        actionVersion: "0.0.0 (development)",
      });
    });

    test("should cache inferred metadata", () => {
      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      const metadata2 = runtimeHelpers.getRuntimeActionMetadata();

      expect(metadata).toBe(metadata2);
    });
  });

  describe("inferTelemetryAttributesFromRuntimeMetadata", () => {
    // biome-ignore lint/performance/useTopLevelRegex: No major performance impact as this is a test.
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    test("should infer correct attributes for production", () => {
      setupProductionEnv();
      const attributes =
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "service.version": "1.0.0",
        "service.name": "test-prod-namespace/test-prod-package-name",

        "deployment.region": "test-prod-region",
        "deployment.cloud": "test-prod-cloud",
        "deployment.environment": "production",

        "action.name": "test-prod-action-name",
        "action.package_name": "test-prod-package-name",
        "action.namespace": "test-prod-namespace",
        "action.activation_id": "test-prod-activation-id",
        "action.transaction_id": "test-prod-transaction-id",
        "action.deadline": expect.stringMatching(ISO_DATE_REGEX),
      });
    });

    test("should infer correct attributes for development", () => {
      setupDevelopmentEnv();
      const attributes =
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "service.version": "0.0.0 (development)",
        "service.name":
          "test-dev-namespace-local-development/test-dev-package-name",

        "deployment.region": "local",
        "deployment.cloud": "local",
        "deployment.environment": "development",

        "action.name": "test-dev-action-name",
        "action.package_name": "test-dev-package-name",
        "action.namespace": "test-dev-namespace",
        "action.activation_id": "test-dev-activation-id",
        "action.transaction_id": "unknown",
      });
    });

    test("should infer correct attributes for legacy development", () => {
      setupLegacyDevelopmentEnv();
      const attributes =
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "service.version": "0.0.0 (development)",
        "service.name": "test-dev-namespace-local-development",

        "deployment.region": "local",
        "deployment.cloud": "local",
        "deployment.environment": "development",

        "action.name": "test-dev-action-name",
        "action.package_name": "unknown",
        "action.namespace": "test-dev-namespace",
        "action.activation_id": "test-dev-activation-id",
        "action.transaction_id": "unknown",
      });
    });
  });
});
