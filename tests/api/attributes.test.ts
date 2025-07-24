import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAioRuntimeAttributes,
  getAioRuntimeResource,
  getAioRuntimeResourceWithAttributes,
} from "~/api/attributes";
import * as runtimeHelpers from "~/helpers/runtime";

// Mock the runtime helpers module
vi.mock("~/helpers/runtime", () => ({
  inferTelemetryAttributesFromRuntimeMetadata: vi.fn(),
}));

describe("api/attributes", () => {
  const mockAttributes = {
    "action.namespace": "test-namespace",
    "action.name": "test-action",
    "service.name": "test-service",
    "service.version": "1.0.0",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata,
    ).mockReturnValue(mockAttributes);
  });

  describe("getAioRuntimeAttributes", () => {
    it("should return attributes inferred from runtime metadata", () => {
      const attributes = getAioRuntimeAttributes();

      expect(attributes).toEqual(mockAttributes);
      expect(
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata,
      ).toHaveBeenCalledTimes(1);
    });

    it("should return the same attributes on multiple calls", () => {
      const attributes1 = getAioRuntimeAttributes();
      const attributes2 = getAioRuntimeAttributes();

      expect(attributes1).toEqual(attributes2);
      expect(
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata,
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe("getAioRuntimeResource", () => {
    it("should return a resource with runtime attributes", () => {
      const resource = getAioRuntimeResource();

      expect(resource).toBeDefined();
      expect(resource.attributes).toMatchObject(mockAttributes);
      expect(
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata,
      ).toHaveBeenCalledTimes(1);
    });

    it("should include default telemetry SDK attributes", () => {
      const resource = getAioRuntimeResource();

      // Check for default OpenTelemetry SDK attributes
      expect(resource.attributes).toHaveProperty("telemetry.sdk.name");
      expect(resource.attributes).toHaveProperty("telemetry.sdk.language");
      expect(resource.attributes).toHaveProperty("telemetry.sdk.version");
    });
  });

  describe("getAioRuntimeResourceWithAttributes", () => {
    it("should merge custom attributes with runtime attributes", () => {
      const customAttributes = {
        foo: "bar",
        baz: "qux",
      };

      const resource = getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes).toMatchObject({
        ...mockAttributes,
        ...customAttributes,
      });
      expect(
        runtimeHelpers.inferTelemetryAttributesFromRuntimeMetadata,
      ).toHaveBeenCalledTimes(1);
    });

    it("should override runtime attributes with custom attributes", () => {
      const customAttributes = {
        "action.name": "custom-action",
        custom: "value",
      };

      const resource = getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes["action.name"]).toBe("custom-action");
      expect(resource.attributes["action.namespace"]).toBe("test-namespace");
      expect(resource.attributes.custom).toBe("value");
    });

    it("should handle empty custom attributes", () => {
      const resource = getAioRuntimeResourceWithAttributes({});

      expect(resource.attributes).toMatchObject(mockAttributes);
    });
  });
});
