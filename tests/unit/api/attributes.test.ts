import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  getAioRuntimeAttributes,
  getAioRuntimeResource,
  getAioRuntimeResourceWithAttributes,
} from "~/api/attributes";
import { inferTelemetryAttributesFromRuntimeMetadata } from "~/helpers/runtime";

// Mock the runtime helpers module
vi.mock("~/helpers/runtime", () => ({
  inferTelemetryAttributesFromRuntimeMetadata: vi.fn(),
}));

describe("api/attributes", () => {
  const mockAttributes = {
    "some.attribute": "test-value",
    "some.other.attribute": "test-value-2",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(inferTelemetryAttributesFromRuntimeMetadata).mockReturnValue(
      mockAttributes as unknown as ReturnType<
        typeof inferTelemetryAttributesFromRuntimeMetadata
      >,
    );
  });

  describe("getAioRuntimeAttributes", () => {
    test("should return attributes inferred from runtime metadata", () => {
      const attributes = getAioRuntimeAttributes();

      expect(attributes).toEqual(mockAttributes);
      expect(inferTelemetryAttributesFromRuntimeMetadata).toHaveBeenCalledTimes(
        1,
      );
    });

    test("should return the same attributes on multiple calls", () => {
      const attributes1 = getAioRuntimeAttributes();
      const attributes2 = getAioRuntimeAttributes();

      expect(attributes1).toEqual(attributes2);
      expect(inferTelemetryAttributesFromRuntimeMetadata).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  describe("getAioRuntimeResource", () => {
    test("should return a resource with runtime attributes", () => {
      const resource = getAioRuntimeResource();

      expect(resource).toBeDefined();
      expect(resource.asyncAttributesPending).toBe(false);
      expect(resource.attributes).toMatchObject(mockAttributes);
      expect(inferTelemetryAttributesFromRuntimeMetadata).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe("getAioRuntimeResourceWithAttributes", () => {
    test("should merge custom attributes with runtime attributes", () => {
      const customAttributes = {
        foo: "bar",
        baz: "qux",
      };

      const resource = getAioRuntimeResourceWithAttributes(customAttributes);
      expect(resource.attributes).toMatchObject({
        ...mockAttributes,
        ...customAttributes,
      });

      expect(inferTelemetryAttributesFromRuntimeMetadata).toHaveBeenCalledTimes(
        1,
      );
    });

    test("should override runtime attributes with custom attributes", () => {
      const customAttributes = {
        "some.attribute": "custom-value",
        custom: "value",
      };

      const resource = getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes["some.attribute"]).toBe("custom-value");
      expect(resource.attributes["some.other.attribute"]).toBe("test-value-2");
      expect(resource.attributes.custom).toBe("value");
    });

    test("should handle empty custom attributes", () => {
      const resource = getAioRuntimeResourceWithAttributes({});
      expect(resource.attributes).toMatchObject(mockAttributes);
    });
  });
});
