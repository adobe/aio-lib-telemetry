import { context, propagation } from "@opentelemetry/api";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  deserializeContextFromCarrier,
  serializeContextIntoCarrier,
} from "~/api/propagation";

import type { Context } from "@opentelemetry/api";

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
  const mockContext = {
    _testProperty: "original-context",
    _testId: "context-123",
  } as Context & { _testProperty: string; _testId: string };

  const mockExtractedContext = {
    _testProperty: "extracted-context",
    _testId: "extracted-456",
  } as Context & { _testProperty: string; _testId: string };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(context.active).mockReturnValue(mockContext);
    vi.mocked(propagation.extract).mockReturnValue(mockExtractedContext);
    vi.mocked(propagation.inject).mockImplementation((ctx, carrier) => {
      Object.assign(carrier as Record<string, string>, ctx);
      return carrier;
    });
  });

  describe("serializeContextIntoCarrier", () => {
    test("should inject context into a new carrier when no carrier is provided", () => {
      const carrier = serializeContextIntoCarrier();
      expect(carrier).toMatchObject(mockContext);

      expect(propagation.inject).toHaveBeenCalledWith(
        mockContext,
        expect.any(Object),
      );
    });

    test("should use custom context when provided", () => {
      const customContext = {
        _testProperty: "custom-context",
        _testId: "custom-789",
      } as Context & typeof mockContext;

      const existingCarrier = { test: "value" };
      const carrier = serializeContextIntoCarrier(
        existingCarrier,
        customContext,
      );

      expect(carrier).toBe(existingCarrier);
      expect(propagation.inject).toHaveBeenCalledWith(
        customContext,
        existingCarrier,
      );

      expect(carrier).toMatchObject(customContext);
    });

    test("should preserve carrier content", () => {
      type CustomCarrier = {
        traceparent: string;
        custom: string;
      };

      const originalCarrier: CustomCarrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
        custom: "42",
      } satisfies Record<string, string>;

      const carrier = serializeContextIntoCarrier(originalCarrier);
      expect(carrier).toBe(originalCarrier);
      expect(carrier).toMatchObject(originalCarrier);

      expect(carrier.custom).toBe("42");
      expect(carrier.traceparent).toBe(
        "00-1234567890abcdef-1234567890abcdef-01",
      );
    });
  });

  describe("deserializeContextFromCarrier", () => {
    test("should extract context from carrier using active context as base", () => {
      const carrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
      };

      const extractedContext = deserializeContextFromCarrier(carrier);
      expect(extractedContext).toMatchObject(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(mockContext, carrier);
    });

    test("should use custom base context when provided", () => {
      const carrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
      };

      const customBaseContext = {
        _testProperty: "custom-base",
        _testId: "base-999",
      } as Context & typeof mockContext;

      const extractedContext = deserializeContextFromCarrier(
        carrier,
        customBaseContext,
      );

      expect(extractedContext).toMatchObject(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(
        customBaseContext,
        carrier,
      );
    });

    test("should preserve and not consume carrier content", () => {
      type CustomCarrier = {
        traceparent: string;
        custom: string;
      };

      const carrier: CustomCarrier = {
        traceparent: "00-1234567890abcdef-1234567890abcdef-01",
        custom: "value",
      };

      const extractedContext = deserializeContextFromCarrier(carrier);
      expect(extractedContext).toMatchObject(mockExtractedContext);
      expect(propagation.extract).toHaveBeenCalledWith(mockContext, carrier);

      expect(carrier.custom).toBe("value");
      expect(carrier.traceparent).toBe(
        "00-1234567890abcdef-1234567890abcdef-01",
      );
    });
  });
});
