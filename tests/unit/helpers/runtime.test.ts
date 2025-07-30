import { afterEach, test as baseTest, describe, expect, vi } from "vitest";

import {
  setupDevelopmentEnv,
  setupLegacyDevelopmentEnv,
  setupProductionEnv,
} from "~~/tests/fixtures/environment";

type Deps = typeof import("~/helpers/runtime");
type ExtendTest = { deps: Deps };

// See: https://vitest.dev/guide/test-context.html#test-extend
const test = baseTest.extend<ExtendTest>({
  // biome-ignore lint/correctness/noEmptyPattern: Vitest requires the context object to be destructured (for some reason)
  deps: async ({}, use) => {
    // The `helper/runtime` module caches data at the module level
    // Vitest can't reset top-level imports, that's why we need to import dynamically.
    const deps = await import("~/helpers/runtime");
    await use(deps);

    // Reset the module after using it.
    // Otherwise side effects will persist between tests.
    // This will run after the test has finished.
    vi.resetModules();
  },
});

describe("helpers/runtime", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isDevelopment", () => {
    test("should return true when AIO_DEV is set", ({ deps }) => {
      const { isDevelopment } = deps;

      vi.stubEnv("AIO_DEV", "true");
      expect(isDevelopment()).toBe(true);
    });

    test("should return true when AIO_DEV is just defined", ({ deps }) => {
      const { isDevelopment } = deps;

      vi.stubEnv("AIO_DEV", "");
      expect(isDevelopment()).toBe(true);
    });

    test("should return true when __OW_ACTION_VERSION is not set", ({
      deps,
    }) => {
      const { isDevelopment } = deps;
      expect(isDevelopment()).toBe(true);
    });

    test("should return false when __OW_ACTION_VERSION is set", ({ deps }) => {
      const { isDevelopment } = deps;

      vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");
      expect(isDevelopment()).toBe(false);
    });

    test("should return false when AIO_DEV is not set and __OW_ACTION_VERSION is set", ({
      deps,
    }) => {
      const { isDevelopment } = deps;

      vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");
      expect(isDevelopment()).toBe(false);
    });

    test("should return true when AIO_DEV is set and __OW_ACTION_VERSION is not set", ({
      deps,
    }) => {
      const { isDevelopment } = deps;

      vi.stubEnv("AIO_DEV", "true");
      expect(isDevelopment()).toBe(true);
    });
  });

  describe("isTelemetryEnabled", () => {
    test("should return true when __ENABLE_TELEMETRY is 'true'", ({ deps }) => {
      const { isTelemetryEnabled } = deps;

      vi.stubEnv("__ENABLE_TELEMETRY", "true");
      expect(isTelemetryEnabled()).toBe(true);
    });

    test("should return false when __ENABLE_TELEMETRY is 'false'", ({
      deps,
    }) => {
      const { isTelemetryEnabled } = deps;

      vi.stubEnv("__ENABLE_TELEMETRY", "false");
      expect(isTelemetryEnabled()).toBe(false);
    });

    test("should return false when __ENABLE_TELEMETRY is not set", ({
      deps,
    }) => {
      const { isTelemetryEnabled } = deps;
      expect(isTelemetryEnabled()).toBe(false);
    });

    test("should return false for any non-true value", ({ deps }) => {
      const { isTelemetryEnabled } = deps;

      vi.stubEnv("__ENABLE_TELEMETRY", "1");
      expect(isTelemetryEnabled()).toBe(false);

      vi.stubEnv("__ENABLE_TELEMETRY", "yes");
      expect(isTelemetryEnabled()).toBe(false);

      vi.stubEnv("__ENABLE_TELEMETRY", "TRUE");
      expect(isTelemetryEnabled()).toBe(false);
    });
  });

  describe("getRuntimeActionMetadata", () => {
    test("should return correct metadata for production", ({ deps }) => {
      const { getRuntimeActionMetadata } = deps;
      setupProductionEnv();

      const metadata = getRuntimeActionMetadata();
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

    test("should return correct metadata for development", ({ deps }) => {
      const { getRuntimeActionMetadata } = deps;
      setupDevelopmentEnv();

      const metadata = getRuntimeActionMetadata();
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

    test("should return correct metadata for legacy development", ({
      deps,
    }) => {
      const { getRuntimeActionMetadata } = deps;
      setupLegacyDevelopmentEnv();

      const metadata = getRuntimeActionMetadata();
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

    baseTest("should cache inferred metadata", async () => {
      const { getRuntimeActionMetadata } = await import("~/helpers/runtime");
      const metadata = getRuntimeActionMetadata();
      const metadata2 = getRuntimeActionMetadata();

      // biome-ignore lint/suspicious/noMisplacedAssertion: Justified as we are extending the Test API.
      expect(metadata).toBe(metadata2);
      vi.resetModules();
    });
  });

  describe("inferTelemetryAttributesFromRuntimeMetadata", () => {
    // biome-ignore lint/performance/useTopLevelRegex: No major performance impact as this is a test.
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    test("should infer correct attributes for production", ({ deps }) => {
      const { inferTelemetryAttributesFromRuntimeMetadata } = deps;
      setupProductionEnv();

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();
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

    test("should infer correct attributes for development", ({ deps }) => {
      const { inferTelemetryAttributesFromRuntimeMetadata } = deps;
      setupDevelopmentEnv();

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();
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

    test("should infer correct attributes for legacy development", ({
      deps,
    }) => {
      const { inferTelemetryAttributesFromRuntimeMetadata } = deps;
      setupLegacyDevelopmentEnv();

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();
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
