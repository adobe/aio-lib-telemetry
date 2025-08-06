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

import type { Context } from "@opentelemetry/api";

describe("api/propagation", () => {
  let propagationApi: typeof import("~/api/propagation");
  const testKey = Symbol("x-test-key");

  const createMockContext = (initialValue?: string) => {
    const state = new Map<symbol, string>();
    if (initialValue) {
      state.set(testKey, initialValue);
    }

    return {
      getValue: vi.fn((key) => state.get(key)),
      setValue: vi.fn((key, value) => {
        const newState = new Map(state);
        newState.set(key, value);

        return createMockContext(value);
      }),

      deleteValue: vi.fn((key) => {
        const newState = new Map(state);
        newState.delete(key);

        return createMockContext();
      }),
    } as Context;
  };

  const mockContext = createMockContext();
  const mockActiveContextGetter = vi.fn(() => mockContext);

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.doMock("@opentelemetry/api", () => ({
      propagation: {
        inject: vi.fn((ctx, carrier) => {
          carrier["x-test"] = ctx.getValue(testKey) ?? "";
        }),

        extract: vi.fn((ctx, carrier) => {
          return ctx.setValue(testKey, carrier["x-test"]);
        }),

        fields: vi.fn(() => ["x-test"]),
      },

      context: {
        active: mockActiveContextGetter,
      },
    }));

    propagationApi = await import("~/api/propagation");
  });

  describe("serializeContextIntoCarrier", () => {
    test("injects into a new carrier when none provided", () => {
      const ctx = createMockContext("from-default-ctx");
      mockActiveContextGetter.mockReturnValueOnce(ctx);

      const carrier = propagationApi.serializeContextIntoCarrier();
      expect(carrier).toHaveProperty("x-test", "from-default-ctx");
    });

    test("injects into the provided carrier and preserves content", () => {
      const ctx = createMockContext("from-custom-ctx");
      const existingCarrier: Record<string, string> = { custom: "value" };

      const carrier = propagationApi.serializeContextIntoCarrier(
        existingCarrier,
        ctx,
      );

      expect(carrier).toBe(existingCarrier);
      expect(carrier.custom).toBe("value");
      expect(carrier["x-test"]).toBe("from-custom-ctx");
      expect(mockActiveContextGetter).not.toHaveBeenCalled();
    });
  });

  describe("deserializeContextFromCarrier", () => {
    test("extracts context from carrier using active context by default", () => {
      const baseCtx = createMockContext();
      mockActiveContextGetter.mockReturnValueOnce(baseCtx);

      const carrier = { "x-test": "hello" };
      const resultCtx = propagationApi.deserializeContextFromCarrier(carrier);

      expect(resultCtx.getValue(testKey)).toBe("hello");
    });

    test("uses custom base context when provided", () => {
      const baseCtx = createMockContext("from-base");
      const carrier = { "x-test": "from-carrier" };

      const resultCtx = propagationApi.deserializeContextFromCarrier(
        carrier,
        baseCtx,
      );

      expect(resultCtx.getValue(testKey)).toBe("from-carrier");
    });

    test("does not modify carrier", () => {
      const carrier = {
        "x-test": "original",
        untouched: "yes",
      };

      const resultCtx = propagationApi.deserializeContextFromCarrier(carrier);
      expect(carrier.untouched).toBe("yes");
      expect(carrier["x-test"]).toBe("original");
      expect(resultCtx.getValue(testKey)).toBe("original");
    });
  });
});
