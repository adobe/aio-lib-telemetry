import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Context, Span } from "@opentelemetry/api";

describe("api/global", () => {
  let globalApi: typeof import("~/api/global");

  const mockContext = {} as Context;
  const mockSpan = {
    addEvent: vi.fn(),
    recordException: vi.fn(),
    setStatus: vi.fn(),
    end: vi.fn(),
  } as unknown as Span;

  const mockContextActive = vi.fn(() => mockContext);
  const mockTraceGetSpan = vi.fn(() => mockSpan);

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.doMock("@opentelemetry/api", () => ({
      context: { active: mockContextActive },
      trace: { getSpan: mockTraceGetSpan },
    }));

    globalApi = await import("~/api/global");
  });

  describe("getActiveSpan", () => {
    test("should return the active span when it exists using default context", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      const span = globalApi.getActiveSpan();

      expect(span).toBe(mockSpan);
      expect(mockContextActive).toHaveBeenCalledTimes(1);
      expect(mockTraceGetSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should use provided context when given", () => {
      const newContext = {} as Context;
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      const span = globalApi.getActiveSpan(newContext);

      expect(span).toBe(mockSpan);
      expect(mockTraceGetSpan).toHaveBeenCalledWith(newContext);
      expect(mockContextActive).not.toHaveBeenCalled();
    });

    test("should throw an error when no span is found", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(undefined as unknown as Span);

      expect(() => globalApi.getActiveSpan()).toThrowError(
        "No active span found",
      );
      expect(mockContextActive).toHaveBeenCalled();
      expect(mockTraceGetSpan).toHaveBeenCalledWith(mockContext);
    });
  });

  describe("tryGetActiveSpan", () => {
    test("should return the active span when it exists using default context", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      const span = globalApi.tryGetActiveSpan();

      expect(span).toBe(mockSpan);
      expect(mockContextActive).toHaveBeenCalledTimes(1);
      expect(mockTraceGetSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should use provided context when given", () => {
      const newContext = {} as Context;
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      const span = globalApi.tryGetActiveSpan(newContext);

      expect(span).toBe(mockSpan);
      expect(mockTraceGetSpan).toHaveBeenCalledWith(newContext);
      expect(mockContextActive).not.toHaveBeenCalled();
    });

    test("should return null when no span is found", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(undefined as unknown as Span);

      const span = globalApi.tryGetActiveSpan();

      expect(span).toBeNull();
      expect(mockContextActive).toHaveBeenCalled();
      expect(mockTraceGetSpan).toHaveBeenCalledWith(mockContext);
    });
  });

  describe("addEventToActiveSpan", () => {
    test("should add an event to the active span", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      globalApi.addEventToActiveSpan("test-event");

      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", undefined);
      expect(mockContextActive).toHaveBeenCalled();
      expect(mockTraceGetSpan).toHaveBeenCalledWith(mockContext);
    });

    test("should add an event with attributes to the active span", () => {
      const attributes = { foo: "bar", baz: 42 };
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      globalApi.addEventToActiveSpan("test-event", attributes);

      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", attributes);
    });

    test("should throw an error when no span is found", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(undefined as unknown as Span);

      expect(() => globalApi.addEventToActiveSpan("test-event")).toThrowError(
        "No active span found",
      );
    });
  });

  describe("tryAddEventToActiveSpan", () => {
    test("should add an event to the active span and return true", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      const result = globalApi.tryAddEventToActiveSpan("test-event");

      expect(result).toBe(true);
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", undefined);
    });

    test("should add an event with attributes and return true", () => {
      const attributes = { foo: "bar", baz: 42 };
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(mockSpan);

      const result = globalApi.tryAddEventToActiveSpan(
        "test-event",
        attributes,
      );

      expect(result).toBe(true);
      expect(mockSpan.addEvent).toHaveBeenCalledWith("test-event", attributes);
    });

    test("should return false when no span is found", () => {
      mockContextActive.mockReturnValueOnce(mockContext);
      mockTraceGetSpan.mockReturnValueOnce(undefined as unknown as Span);

      const result = globalApi.tryAddEventToActiveSpan("test-event");

      expect(result).toBe(false);
      expect(mockSpan.addEvent).not.toHaveBeenCalled();
    });
  });
});
