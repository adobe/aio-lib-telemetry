import { context, trace } from "@opentelemetry/api";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  addEventToActiveSpan,
  getActiveSpan,
  tryAddEventToActiveSpan,
  tryGetActiveSpan,
} from "~/api/global";

import type { Context, Span } from "@opentelemetry/api";

vi.mock("@opentelemetry/api", () => ({
  context: {
    active: vi.fn(),
  },
  trace: {
    getSpan: vi.fn(),
  },
}));

describe("api/global", () => {
  const mockContext = {} as Context;
  const mockSpan = {
    addEvent: vi.fn(),
    recordException: vi.fn(),
    setStatus: vi.fn(),
    end: vi.fn(),
  } as unknown as Span;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(context.active).mockReturnValue(mockContext);
  });

  describe("getActiveSpan", () => {
    test("should return the active span when it exists", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const span = getActiveSpan();
      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should use provided context when given", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const span = getActiveSpan(mockContext);
      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should throw an error when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);
      expect(() => getActiveSpan()).toThrow("No active span found");
    });
  });

  describe("tryGetActiveSpan", () => {
    test("should return the active span when it exists", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const span = tryGetActiveSpan();
      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should use provided context when given", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const span = tryGetActiveSpan(mockContext);
      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should return null when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);

      const span = tryGetActiveSpan();
      expect(span).toBeNull();
    });
  });

  describe("addEventToActiveSpan", () => {
    test("should add an event to the active span", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      addEventToActiveSpan("test-event");
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", undefined);
    });

    test("should add an event with attributes to the active span", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const attributes = { foo: "bar", baz: 42 };
      addEventToActiveSpan("test-event", attributes);

      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", attributes);
    });

    test("should throw an error when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);
      expect(() => addEventToActiveSpan("test-event")).toThrow(
        "No active span found",
      );
    });
  });

  describe("tryAddEventToActiveSpan", () => {
    test("should add an event to the active span and return true", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const result = tryAddEventToActiveSpan("test-event");
      expect(result).toBe(true);
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", undefined);
    });

    test("should add an event with attributes and return true", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan);

      const attributes = { foo: "bar", baz: 42 };
      const result = tryAddEventToActiveSpan("test-event", attributes);

      expect(result).toBe(true);
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", attributes);
    });

    test("should return false when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);

      const result = tryAddEventToActiveSpan("test-event");
      expect(result).toBe(false);
    });
  });
});
