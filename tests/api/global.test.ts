import type { Context, Span } from "@opentelemetry/api";

import { context, trace } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addEventToActiveSpan,
  getActiveSpan,
  tryAddEventToActiveSpan,
  tryGetActiveSpan,
} from "~/api/global";

// Mock OpenTelemetry API
vi.mock("@opentelemetry/api", () => ({
  context: {
    active: vi.fn(),
  },
  trace: {
    getSpan: vi.fn(),
  },
}));

describe("api/global", () => {
  const mockSpan = {
    addEvent: vi.fn(),
    recordException: vi.fn(),
    setStatus: vi.fn(),
    end: vi.fn(),
  } as unknown as Span;

  const mockContext = {} as Context;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(context.active).mockReturnValue(mockContext);
  });

  describe("getActiveSpan", () => {
    it("should return the active span when it exists", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);

      const span = getActiveSpan();

      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(mockContext);
    });

    it("should use provided context when given", () => {
      const customContext = Symbol("customContext");
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);

      const span = getActiveSpan(customContext as any);

      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(customContext);
    });

    it("should throw an error when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);

      expect(() => getActiveSpan()).toThrow("No active span found");
    });
  });

  describe("tryGetActiveSpan", () => {
    it("should return the active span when it exists", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);

      const span = tryGetActiveSpan();

      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(mockContext);
    });

    it("should return null when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);

      const span = tryGetActiveSpan();

      expect(span).toBeNull();
    });

    it("should use provided context when given", () => {
      const customContext = Symbol("customContext");
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);

      const span = tryGetActiveSpan(customContext as any);

      expect(span).toBe(mockSpan);
      expect(trace.getSpan).toHaveBeenCalledWith(customContext);
    });
  });

  describe("addEventToActiveSpan", () => {
    it("should add an event to the active span", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);

      addEventToActiveSpan("test-event");

      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", undefined);
    });

    it("should add an event with attributes to the active span", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);
      const attributes = { foo: "bar", baz: 42 };

      addEventToActiveSpan("test-event", attributes);

      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", attributes);
    });

    it("should throw an error when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);

      expect(() => addEventToActiveSpan("test-event")).toThrow(
        "No active span found",
      );
    });
  });

  describe("tryAddEventToActiveSpan", () => {
    it("should add an event to the active span and return true", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);

      const result = tryAddEventToActiveSpan("test-event");

      expect(result).toBe(true);
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", undefined);
    });

    it("should add an event with attributes and return true", () => {
      vi.mocked(trace.getSpan).mockReturnValue(mockSpan as any);
      const attributes = { foo: "bar", baz: 42 };

      const result = tryAddEventToActiveSpan("test-event", attributes);

      expect(result).toBe(true);
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", attributes);
    });

    it("should return false when no span is found", () => {
      vi.mocked(trace.getSpan).mockReturnValue(undefined);

      const result = tryAddEventToActiveSpan("test-event");

      expect(result).toBe(false);
      expect(mockSpan.addEvent).not.toHaveBeenCalled();
    });
  });
});
