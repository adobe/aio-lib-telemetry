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
} from "#test/fixtures/environment";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("helpers/runtime", () => {
  let runtimeHelpers: typeof import("#helpers/runtime");

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();

    runtimeHelpers = await import("#helpers/runtime");
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
    test("should return true when __AIO_LIB_TELEMETRY_ENABLE_TELEMETRY is 'true'", () => {
      vi.stubEnv("__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY", "true");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(true);
    });

    test("should return false when __AIO_LIB_TELEMETRY_ENABLE_TELEMETRY is 'false'", () => {
      vi.stubEnv("__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY", "false");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);
    });

    test("should return false when __AIO_LIB_TELEMETRY_ENABLE_TELEMETRY is not set", () => {
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);
    });

    test("should return false for any non-true value", () => {
      vi.stubEnv("__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY", "1");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);

      vi.stubEnv("__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY", "yes");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);

      vi.stubEnv("__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY", "TRUE");
      expect(runtimeHelpers.isTelemetryEnabled()).toBe(false);
    });
  });

  describe("getRuntimeActionMetadata", () => {
    test("should return correct metadata for production", () => {
      setupProductionEnv();

      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      expect(metadata).toEqual({
        actionName: "test-prod-action-name",
        actionVersion: "1.0.0",
        activationId: "test-prod-activation-id",
        apiHost: "test-prod-api-host",
        apiKey: "test-prod-api-key",
        cloud: "test-prod-cloud",
        deadline: expect.any(Date),
        isDevelopment: false,
        namespace: "test-prod-namespace",

        packageName: "test-prod-package-name",

        region: "test-prod-region",
        transactionId: "test-prod-transaction-id",
      });
    });

    test("should return correct metadata for development", () => {
      setupDevelopmentEnv();

      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      expect(metadata).toEqual({
        actionName: "test-dev-action-name",
        actionVersion: "0.0.0 (development)",
        activationId: "test-dev-activation-id",
        apiHost: "test-dev-api-host",
        apiKey: "test-dev-api-key",
        cloud: "local",
        deadline: null,
        isDevelopment: true,
        namespace: "test-dev-namespace",

        packageName: "test-dev-package-name",

        region: "local",
        transactionId: "unknown",
      });
    });

    test("should return correct metadata for legacy development", () => {
      setupLegacyDevelopmentEnv();

      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      expect(metadata).toEqual({
        actionName: "test-dev-action-name",
        actionVersion: "0.0.0 (development)",
        activationId: "test-dev-activation-id",
        apiHost: "test-dev-api-host",
        apiKey: "test-dev-api-key",
        cloud: "local",
        deadline: null,
        isDevelopment: true,
        namespace: "test-dev-namespace",

        packageName: "unknown",

        region: "local",
        transactionId: "unknown",
      });
    });

    test("should cache inferred metadata", () => {
      const metadata = runtimeHelpers.getRuntimeActionMetadata();
      const metadata2 = runtimeHelpers.getRuntimeActionMetadata();

      expect(metadata).toBe(metadata2);
    });
  });

  describe("inferTelemetryAttributesFromRuntimeMetadata", () => {
    test("should infer correct attributes for production", () => {
      setupProductionEnv();
      const attributes =
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "action.activation_id": "test-prod-activation-id",
        "action.deadline": expect.stringMatching(ISO_DATE_REGEX),

        "action.name": "test-prod-action-name",
        "action.namespace": "test-prod-namespace",
        "action.package_name": "test-prod-package-name",
        "action.transaction_id": "test-prod-transaction-id",
        environment: "production",
        "service.name": "test-prod-namespace/test-prod-package-name",
        "service.version": "1.0.0",
      });
    });

    test("should infer correct attributes for development", () => {
      setupDevelopmentEnv();
      const attributes =
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "action.activation_id": "test-dev-activation-id",

        "action.name": "test-dev-action-name",
        "action.namespace": "test-dev-namespace",
        "action.package_name": "test-dev-package-name",

        environment: "development",
        "service.name":
          "test-dev-namespace-local-development/test-dev-package-name",
      });
    });

    test("should infer correct attributes for legacy development", () => {
      setupLegacyDevelopmentEnv();
      const attributes =
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "action.activation_id": "test-dev-activation-id",

        "action.name": "test-dev-action-name",
        "action.namespace": "test-dev-namespace",

        environment: "development",
        "service.name": "test-dev-namespace-local-development",
      });
    });
  });
});
