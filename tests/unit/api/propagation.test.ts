import { context, propagation, ROOT_CONTEXT } from "@opentelemetry/api";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  deserializeContextFromCarrier,
  serializeContextIntoCarrier,
} from "~/api/propagation";

describe("api/propagation", () => {
  const testKey = Symbol("x-test-key");

  beforeEach(() => {
    propagation.setGlobalPropagator({
      inject(ctx, carrier) {
        carrier["x-test"] = ctx.getValue(testKey) ?? "";
      },

      extract(ctx, carrier) {
        return ctx.setValue(testKey, carrier["x-test"]);
      },

      fields: () => ["x-test"],
    });
  });

  describe("serializeContextIntoCarrier", () => {
    test("injects into a new carrier when none provided", () => {
      const ctx = ROOT_CONTEXT.setValue(testKey, "from-default-ctx");
      vi.spyOn(context, "active").mockReturnValueOnce(ctx);

      const carrier = serializeContextIntoCarrier();
      expect(carrier).toHaveProperty("x-test", "from-default-ctx");
    });

    test("injects into the provided carrier and preserves content", () => {
      const ctx = ROOT_CONTEXT.setValue(testKey, "from-custom-ctx");
      const existingCarrier: Record<string, string> = { custom: "value" };

      const carrier = serializeContextIntoCarrier(existingCarrier, ctx);
      const activeSpy = vi.spyOn(context, "active");

      expect(carrier).toBe(existingCarrier);
      expect(carrier.custom).toBe("value");
      expect(carrier["x-test"]).toBe("from-custom-ctx");

      expect(activeSpy).not.toHaveBeenCalled();
    });
  });

  describe("deserializeContextFromCarrier", () => {
    test("extracts context from carrier using active context by default", () => {
      const baseCtx = ROOT_CONTEXT;
      vi.spyOn(context, "active").mockReturnValueOnce(baseCtx);

      const carrier = { "x-test": "hello" };
      const resultCtx = deserializeContextFromCarrier(carrier);

      expect(resultCtx.getValue(testKey)).toBe("hello");
    });

    test("uses custom base context when provided", () => {
      const baseCtx = ROOT_CONTEXT.setValue(testKey, "from-base");
      const carrier = { "x-test": "from-carrier" };

      const resultCtx = deserializeContextFromCarrier(carrier, baseCtx);
      expect(resultCtx.getValue(testKey)).toBe("from-carrier");
    });

    test("does not modify carrier", () => {
      const carrier = {
        "x-test": "original",
        untouched: "yes",
      };

      const resultCtx = deserializeContextFromCarrier(carrier);
      expect(carrier.untouched).toBe("yes");
      expect(carrier["x-test"]).toBe("original");

      expect(resultCtx.getValue(testKey)).toBe("original");
    });
  });
});
