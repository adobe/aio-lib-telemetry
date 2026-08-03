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

describe("api/attributes", () => {
  let attributesApi: typeof import("#api/attributes");

  const mockAttributes = {
    "some.attribute": "test-value",
    "some.other.attribute": "test-value-2",
  };
  const mockInvocationAttributes = {
    "action.activation_id": "activation-id",
    "action.deadline": "2026-08-03T12:00:00.000Z",
    "action.region": "region",
    "action.transaction_id": "transaction-id",
  };

  const inferTelemetryAttributesFromRuntimeMetadata = vi.fn(
    () => mockAttributes,
  );
  const getRuntimeInvocationAttributes = vi.fn(() => mockInvocationAttributes);

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.doMock("#helpers/runtime", () => ({
      getRuntimeInvocationAttributes,
      inferTelemetryAttributesFromRuntimeMetadata,
    }));

    attributesApi = await import("#api/attributes");
  });

  describe("getAioRuntimeAttributes", () => {
    test("should preserve the combined runtime attributes", () => {
      const attributes = attributesApi.getAioRuntimeAttributes();
      expect(attributes).toEqual({
        ...mockAttributes,
        ...mockInvocationAttributes,
      });
    });
  });

  describe("getAioRuntimeResourceAttributes", () => {
    test("should return only stable resource attributes", () => {
      const attributes = attributesApi.getAioRuntimeResourceAttributes();
      expect(attributes).toEqual(mockAttributes);
    });
  });

  describe("getAioRuntimeInvocationAttributes", () => {
    test("should return the current invocation attributes", () => {
      const attributes = attributesApi.getAioRuntimeInvocationAttributes();
      expect(attributes).toEqual(mockInvocationAttributes);
    });
  });

  describe("getAioRuntimeResource", () => {
    test("should return a resource with only stable attributes", () => {
      const resource = attributesApi.getAioRuntimeResource();

      expect(resource).toBeDefined();
      expect(resource.asyncAttributesPending).toBe(false);
      expect(resource.attributes).toMatchObject(mockAttributes);
      expect(resource.attributes).not.toHaveProperty("action.activation_id");
    });
  });

  describe("getAioRuntimeResourceWithAttributes", () => {
    test("should merge custom attributes with runtime attributes", () => {
      const customAttributes = {
        baz: "qux",
        foo: "bar",
      };

      const resource =
        attributesApi.getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes).toMatchObject({
        ...mockAttributes,
        ...customAttributes,
      });
      expect(resource.attributes).not.toHaveProperty("action.activation_id");
    });

    test("should override runtime attributes with custom attributes", () => {
      const customAttributes = {
        custom: "value",
        "some.attribute": "custom-value",
      };

      const resource =
        attributesApi.getAioRuntimeResourceWithAttributes(customAttributes);

      expect(resource.attributes).toMatchObject({
        custom: "value",
        "some.attribute": "custom-value",
        "some.other.attribute": "test-value-2",
      });
    });

    test("should handle empty custom attributes", () => {
      const resource = attributesApi.getAioRuntimeResourceWithAttributes({});
      expect(resource.attributes).toMatchObject(mockAttributes);
    });
  });
});
