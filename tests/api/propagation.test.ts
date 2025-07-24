import type { Context } from "@opentelemetry/api";

import { context, propagation } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deserializeContextFromCarrier,
  serializeContextIntoCarrier,
} from "~/api/propagation";

// Mock OpenTelemetry API
vi.mock("@opentelemetry/api", () => ({
  context: {
    active: vi.fn(),
  },
  propagation: {
    inject: vi.fn(),
    extract: vi.fn(),
  },
}));

describe("api/propagation", () => {
  const mockContext = {} as Context;
  const mockExtractedContext = {} as Context;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(context.active).mockReturnValue(mockContext);
    vi.mocked(propagation.extract).mockReturnValue(mockExtractedContext);
  });

  describe("serializeContextIntoCarrier", () => {
    it("should inject context into a new carrier when no carrier is provided", () => {
      const result = serializeContextIntoCarrier();

      expect(result).toEqual({});
      expect(propagation.inject).toHaveBeenCalledWith(mockContext, {});
    });

    it("should inject context into an existing carrier", () => {
      const existingCarrier = { foo: "bar", baz: "qux" };
      const result = serializeContextIntoCarrier(existingCarrier);

      expect(result).toBe(existingCarrier);
      expect(propagation.inject).toHaveBeenCalledWith(
        mockContext,
        existingCarrier,
      );
    });

    it("should use custom context when provided", () => {
      const customContext = {} as Context;
      const existingCarrier = { test: "value" };

      const result = serializeContextIntoCarrier(
        existingCarrier,
        customContext,
      );

      expect(result).toBe(existingCarrier);
      expect(propagation.inject).toHaveBeenCalledWith(
        customContext,
        existingCarrier,
      );
    });

    it("should preserve carrier type", () => {
      type CustomCarrier = {
        traceparent: string;
        custom: string;
      };

      const carrier: CustomCarrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
        custom: "42",
      } satisfies Record<string, string>;

      const result = serializeContextIntoCarrier(carrier);

      expect(result).toBe(carrier);
      expect(result.custom).toBe("42");
      expect(result.traceparent).toBe(
        "00-1234567890abcdef-1234567890abcdef-01",
      );
    });
  });

  describe("deserializeContextFromCarrier", () => {
    it("should extract context from carrier using active context as base", () => {
      const carrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
      };

      const result = deserializeContextFromCarrier(carrier);

      expect(result).toBe(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(mockContext, carrier);
    });

    it("should use custom base context when provided", () => {
      const carrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
      };
      const customBaseContext = {} as any;

      const result = deserializeContextFromCarrier(carrier, customBaseContext);

      expect(result).toBe(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(
        customBaseContext,
        carrier,
      );
    });

    it("should handle empty carrier", () => {
      const carrier = {};

      const result = deserializeContextFromCarrier(carrier);

      expect(result).toBe(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(mockContext, carrier);
    });

    it("should handle carrier with multiple headers", () => {
      const carrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
        tracestate: "vendor1=value1,vendor2=value2",
        baggage: "key1=value1,key2=value2",
      };

      const result = deserializeContextFromCarrier(carrier);

      expect(result).toBe(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(mockContext, carrier);
    });

    it("should preserve carrier type", () => {
      type CustomCarrier = {
        traceparent: string;
        custom: string;
      };

      const carrier: CustomCarrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
        custom: "value",
      };

      const result = deserializeContextFromCarrier(carrier);

      expect(result).toBe(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(mockContext, carrier);
    });
  });

  describe("round-trip serialization", () => {
    it("should support round-trip context propagation", () => {
      // Simulate a round-trip
      const originalContext = {} as any;
      const carrier = {};

      // First serialize
      vi.mocked(context.active).mockReturnValue(originalContext);
      serializeContextIntoCarrier(carrier);

      // Then deserialize
      deserializeContextFromCarrier(carrier);

      expect(propagation.inject).toHaveBeenCalledWith(originalContext, carrier);
      expect(propagation.extract).toHaveBeenCalledWith(
        originalContext,
        carrier,
      );
    });
  });
});
