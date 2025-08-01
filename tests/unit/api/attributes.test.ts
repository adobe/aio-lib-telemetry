import { beforeEach, describe, expect, test, vi } from "vitest";

describe("api/attributes", () => {
  let attributesApi: typeof import("~/api/attributes");

  const mockAttributes = {
    "some.attribute": "test-value",
    "some.other.attribute": "test-value-2",
  };

  const inferTelemetryAttributesFromRuntimeMetadata = vi.fn(
    () => mockAttributes,
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.doMock("~/helpers/runtime", () => ({
      inferTelemetryAttributesFromRuntimeMetadata,
    }));

    attributesApi = await import("~/api/attributes");
  });

  describe("getAioRuntimeAttributes", () => {
    test("should return attributes inferred from runtime metadata", () => {
      const attributes = attributesApi.getAioRuntimeAttributes();
      expect(attributes).toEqual(mockAttributes);
    });
  });

  describe("getAioRuntimeResource", () => {
    test("should return a resource with runtime attributes", () => {
      const resource = attributesApi.getAioRuntimeResource();

      expect(resource).toBeDefined();
      expect(resource.asyncAttributesPending).toBe(false);
      expect(resource.attributes).toMatchObject(mockAttributes);
    });
  });

  describe("getAioRuntimeResourceWithAttributes", () => {
    test("should merge custom attributes with runtime attributes", () => {
      const customAttributes = {
        foo: "bar",
        baz: "qux",
      };

      const resource =
        attributesApi.getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes).toMatchObject({
        ...mockAttributes,
        ...customAttributes,
      });
    });

    test("should override runtime attributes with custom attributes", () => {
      const customAttributes = {
        "some.attribute": "custom-value",
        custom: "value",
      };

      const resource =
        attributesApi.getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes).toMatchObject({
        "some.attribute": "custom-value",
        "some.other.attribute": "test-value-2",
        custom: "value",
      });
    });

    test("should handle empty custom attributes", () => {
      const resource = attributesApi.getAioRuntimeResourceWithAttributes({});
      expect(resource.attributes).toMatchObject(mockAttributes);
    });
  });
});
