import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRuntimeActionMetadata,
  inferTelemetryAttributesFromRuntimeMetadata,
  isDevelopment,
  isTelemetryEnabled,
} from "~/helpers/runtime";

describe("helpers/runtime", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env
    process.env = { ...originalEnv };
    // Clear any cached metadata
    (global as any).runtimeMetadata = null;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isDevelopment", () => {
    it("should return true when AIO_DEV is set", () => {
      process.env.AIO_DEV = "true";
      expect(isDevelopment()).toBe(true);
    });

    it("should return true when AIO_DEV is empty string", () => {
      process.env.AIO_DEV = "";
      expect(isDevelopment()).toBe(true);
    });

    it("should return true when __OW_ACTION_VERSION is not set", () => {
      delete process.env.AIO_DEV;
      delete process.env.__OW_ACTION_VERSION;
      expect(isDevelopment()).toBe(true);
    });

    it("should return false when AIO_DEV is not set and __OW_ACTION_VERSION is set", () => {
      delete process.env.AIO_DEV;
      process.env.__OW_ACTION_VERSION = "1.0.0";
      expect(isDevelopment()).toBe(false);
    });
  });

  describe("isTelemetryEnabled", () => {
    it("should return true when __ENABLE_TELEMETRY is 'true'", () => {
      process.env.__ENABLE_TELEMETRY = "true";
      expect(isTelemetryEnabled()).toBe(true);
    });

    it("should return false when __ENABLE_TELEMETRY is 'false'", () => {
      process.env.__ENABLE_TELEMETRY = "false";
      expect(isTelemetryEnabled()).toBe(false);
    });

    it("should return false when __ENABLE_TELEMETRY is not set", () => {
      delete process.env.__ENABLE_TELEMETRY;
      expect(isTelemetryEnabled()).toBe(false);
    });

    it("should return false for any non-'true' value", () => {
      process.env.__ENABLE_TELEMETRY = "1";
      expect(isTelemetryEnabled()).toBe(false);

      process.env.__ENABLE_TELEMETRY = "yes";
      expect(isTelemetryEnabled()).toBe(false);

      process.env.__ENABLE_TELEMETRY = "TRUE";
      expect(isTelemetryEnabled()).toBe(false);
    });
  });

  describe("getRuntimeActionMetadata", () => {
    const setupProductionEnv = () => {
      process.env.__OW_ACTIVATION_ID = "test-activation-id";
      process.env.__OW_NAMESPACE = "test-namespace";
      process.env.__OW_API_HOST = "https://api.example.com";
      process.env.__OW_API_KEY = "test-api-key";
      process.env.__OW_ACTION_NAME = "/test-namespace/test-package/test-action";
      process.env.__OW_ACTION_VERSION = "1.0.0";
      process.env.__OW_REGION = "us-east-1";
      process.env.__OW_CLOUD = "aws";
      process.env.__OW_TRANSACTION_ID = "test-transaction-id";
      process.env.__OW_DEADLINE = "1234567890000";
      delete process.env.AIO_DEV;
    };

    const setupDevelopmentEnv = () => {
      process.env.__OW_ACTIVATION_ID = "dev-activation-id";
      process.env.__OW_NAMESPACE = "dev-namespace";
      process.env.__OW_API_HOST = "http://localhost:3233";
      process.env.__OW_API_KEY = "dev-api-key";
      process.env.__OW_ACTION_NAME = "/dev-namespace/dev-package/dev-action";
      process.env.AIO_DEV = "true";
      // These are typically not set in development
      delete process.env.__OW_ACTION_VERSION;
      delete process.env.__OW_REGION;
      delete process.env.__OW_CLOUD;
      delete process.env.__OW_TRANSACTION_ID;
      delete process.env.__OW_DEADLINE;
    };

    it("should return correct metadata for production environment", () => {
      setupProductionEnv();

      const metadata = getRuntimeActionMetadata();

      expect(metadata).toEqual({
        activationId: "test-activation-id",
        namespace: "test-namespace",
        apiHost: "https://api.example.com",
        apiKey: "test-api-key",
        isDevelopment: false,
        region: "us-east-1",
        cloud: "aws",
        transactionId: "test-transaction-id",
        actionVersion: "1.0.0",
        deadline: new Date(1_234_567_890_000 * 1000),
        packageName: "test-package",
        actionName: "test-action",
      });
    });

    it("should return correct metadata for development environment", () => {
      setupDevelopmentEnv();

      const metadata = getRuntimeActionMetadata();

      expect(metadata).toEqual({
        activationId: "dev-activation-id",
        namespace: "dev-namespace",
        apiHost: "http://localhost:3233",
        apiKey: "dev-api-key",
        isDevelopment: true,
        region: "local",
        cloud: "local",
        transactionId: "unknown",
        actionVersion: "0.0.0 (development)",
        deadline: null,
        packageName: "dev-package",
        actionName: "dev-action",
      });
    });

    it("should handle action name without package", () => {
      setupDevelopmentEnv();
      process.env.__OW_ACTION_NAME = "simple-action";

      const metadata = getRuntimeActionMetadata();

      expect(metadata.packageName).toBe("unknown");
      expect(metadata.actionName).toBe("simple-action");
    });

    it("should handle complex action names with multiple slashes", () => {
      setupProductionEnv();
      process.env.__OW_ACTION_NAME = "/namespace/package/sub-package/action";

      const metadata = getRuntimeActionMetadata();

      expect(metadata.packageName).toBe("package");
      expect(metadata.actionName).toBe("sub-package/action");
    });

    it("should cache metadata across multiple calls", () => {
      setupProductionEnv();

      const metadata1 = getRuntimeActionMetadata();
      const metadata2 = getRuntimeActionMetadata();

      expect(metadata1).toBe(metadata2); // Same reference
    });

    it("should handle missing deadline", () => {
      setupProductionEnv();
      delete process.env.__OW_DEADLINE;

      const metadata = getRuntimeActionMetadata();

      expect(metadata.deadline).toBeNull();
    });

    it("should handle invalid deadline", () => {
      setupProductionEnv();
      process.env.__OW_DEADLINE = "invalid";

      const metadata = getRuntimeActionMetadata();

      expect(metadata.deadline).toEqual(new Date(Number.NaN));
    });
  });

  describe("inferTelemetryAttributesFromRuntimeMetadata", () => {
    it("should infer correct attributes for production", () => {
      process.env.__OW_ACTIVATION_ID = "prod-activation-id";
      process.env.__OW_NAMESPACE = "prod-namespace";
      process.env.__OW_ACTION_NAME = "/prod-namespace/prod-package/prod-action";
      process.env.__OW_ACTION_VERSION = "2.0.0";
      process.env.__OW_REGION = "eu-west-1";
      process.env.__OW_CLOUD = "azure";
      process.env.__OW_TRANSACTION_ID = "prod-transaction-id";
      process.env.__OW_DEADLINE = "1234567890000";
      delete process.env.AIO_DEV;

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "service.name": "prod-namespace/prod-package",
        "service.version": "2.0.0",
        "deployment.region": "eu-west-1",
        "deployment.cloud": "azure",
        "deployment.environment": "production",
        "action.package_name": "prod-package",
        "action.namespace": "prod-namespace",
        "action.activation_id": "prod-activation-id",
        "action.transaction_id": "prod-transaction-id",
        "action.deadline": new Date(1_234_567_890_000 * 1000).toISOString(),
      });
    });

    it("should infer correct attributes for development", () => {
      process.env.__OW_ACTIVATION_ID = "dev-activation-id";
      process.env.__OW_NAMESPACE = "dev-namespace";
      process.env.__OW_ACTION_NAME = "/dev-namespace/dev-package/dev-action";
      process.env.AIO_DEV = "true";
      delete process.env.__OW_ACTION_VERSION;
      delete process.env.__OW_DEADLINE;

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).toEqual({
        "service.name": "dev-namespace-local-development/dev-package",
        "service.version": "0.0.0 (development)",
        "deployment.region": "local",
        "deployment.cloud": "local",
        "deployment.environment": "development",
        "action.package_name": "dev-package",
        "action.namespace": "dev-namespace",
        "action.activation_id": "dev-activation-id",
        "action.transaction_id": "unknown",
      });
    });

    it("should handle unknown package name in development", () => {
      process.env.__OW_ACTIVATION_ID = "dev-activation-id";
      process.env.__OW_NAMESPACE = "dev-namespace";
      process.env.__OW_ACTION_NAME = "simple-action";
      process.env.AIO_DEV = "true";

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes["service.name"]).toBe(
        "dev-namespace-local-development/",
      );
    });

    it("should not include deadline attribute when deadline is null", () => {
      process.env.__OW_ACTIVATION_ID = "test-activation-id";
      process.env.__OW_NAMESPACE = "test-namespace";
      process.env.__OW_ACTION_NAME = "/test-namespace/test-package/test-action";
      delete process.env.__OW_DEADLINE;

      const attributes = inferTelemetryAttributesFromRuntimeMetadata();

      expect(attributes).not.toHaveProperty("action.deadline");
    });
  });
});
