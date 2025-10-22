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

import { SpanStatusCode } from "@opentelemetry/api";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

import type { Context } from "@opentelemetry/api";
import type { InstrumentationContext } from "~/types";

describe("core/instrumentation", () => {
  let instrumentation: typeof import("~/core/instrumentation");
  let runtimeHelpers: typeof import("~/helpers/runtime");
  let propagation: typeof import("~/api/propagation");

  const mockSpan = {
    registerName: vi.fn(),
    setStatus: vi.fn(),
    recordException: vi.fn(),
    end: vi.fn(),
    addEvent: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.doMock("~/helpers/runtime", () => ({
      getRuntimeActionMetadata: vi.fn(() => ({
        actionName: "test-action",
        actionVersion: "1.0.0",
        isDevelopment: false,
        namespace: "test-namespace",
        activationId: "test-activation",
        apiHost: "test-host",
        apiKey: "test-key",
        region: "test-region",
        cloud: "test-cloud",
        transactionId: "test-transaction",
        deadline: null,
        packageName: "test-package",
      })),

      isTelemetryEnabled: vi.fn(() => true),
      isDevelopment: vi.fn(() => false),
    }));

    vi.doMock("~/core/sdk", () => ({
      ensureSdkInitialized: vi.fn(),
      initializeSdk: vi.fn(),
      initializeDiagnostics: vi.fn(),
    }));

    vi.doMock("~/core/telemetry-api", () => ({
      initializeGlobalTelemetryApi: vi.fn(),
      getGlobalTelemetryApi: vi.fn(() => ({
        meter: {},
        tracer: {
          startActiveSpan: vi.fn((name, _options, _ctx, fn) => {
            // Note: This is a hacky way to get the span name for easier testing
            // This registerName is not part of the public Span API.
            // Because we're not able to check at runtime which is the name of the span
            // We're creating this "fake" method to be able to expect it's called with the correct name
            mockSpan.registerName(name);
            return fn(mockSpan);
          }),
        },
      })),
    }));

    vi.doMock("~/core/logging", () => ({
      getLogger: vi.fn(() => ({
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
      })),
    }));

    vi.doMock("~/api/propagation", () => ({
      serializeContextIntoCarrier: vi.fn(() => ({ traceparent: "test-trace" })),
      deserializeContextFromCarrier: vi.fn(() => ({
        getValue: vi.fn(),
        setValue: vi.fn(),
        deleteValue: vi.fn(),
      })),
    }));

    vi.doMock("@opentelemetry/api", async () => {
      const actual = await vi.importActual("@opentelemetry/api");
      return {
        ...actual,
        context: {
          // @ts-expect-error - It can't infer the type of the module correctly.
          ...actual.context,
          active: vi.fn(() => ({
            getValue: vi.fn(),
            setValue: vi.fn(),
            deleteValue: vi.fn(),
          })),
        },
      };
    });

    instrumentation = await import("~/core/instrumentation");
    runtimeHelpers = await import("~/helpers/runtime");
    propagation = await import("~/api/propagation");
  });

  describe("getInstrumentationHelpers", () => {
    test("should throw different errors when telemetry is not enabled or called outside instrumented function", () => {
      // This should throw because telemetry is not enabled
      vi.mocked(runtimeHelpers.isTelemetryEnabled).mockReturnValue(false);
      expect(() => instrumentation.getInstrumentationHelpers()).toThrow();

      let telemetryNotEnabledError: Error | null = null;
      try {
        instrumentation.getInstrumentationHelpers();
      } catch (error) {
        telemetryNotEnabledError = error as Error;
      }

      // This should also throw because we're outside an instrumented function
      vi.mocked(runtimeHelpers.isTelemetryEnabled).mockReturnValue(true);
      expect(() => instrumentation.getInstrumentationHelpers()).toThrow();

      let outsideInstrumentedFunctionError: Error | null = null;
      try {
        instrumentation.getInstrumentationHelpers();
      } catch (error) {
        outsideInstrumentedFunctionError = error as Error;
      }

      expect(telemetryNotEnabledError).not.toBe(
        outsideInstrumentedFunctionError,
      );

      expect(telemetryNotEnabledError?.message).not.toEqual(
        outsideInstrumentedFunctionError?.message,
      );
    });

    test("should return helpers when called within instrumented function", () => {
      let capturedHelpers: InstrumentationContext | null = null;

      const testFn = instrumentation.instrument(function testFunction() {
        capturedHelpers = instrumentation.getInstrumentationHelpers();
        return "success";
      });

      const result = testFn();
      expect(result).toBe("success");

      if (!capturedHelpers) {
        assert.fail("capturedHelpers is null");
      }

      const helpers = capturedHelpers as InstrumentationContext;
      expect(helpers).toBeDefined();
      expect(helpers.currentSpan).toBeDefined();
      expect(helpers.logger).toBeDefined();
      expect(helpers.tracer).toBeDefined();
      expect(helpers.meter).toBeDefined();
      expect(helpers.contextCarrier).toBeDefined();
    });
  });

  describe("instrument", () => {
    test("should wrap a function and return the same result", () => {
      const originalFn = vi.fn((a: number, b: number) => a + b);
      const instrumentedFn = instrumentation.instrument(originalFn);
      const result = instrumentedFn(2, 3);

      expect(result).toBe(5);
      expect(originalFn).toHaveBeenCalledWith(2, 3);
    });

    test("should use function name as span name by default", () => {
      const namedFunction = vi.fn(function myFunction() {
        return "result";
      });

      const instrumented = instrumentation.instrument(namedFunction);
      instrumented();

      expect(mockSpan.registerName).toHaveBeenCalledWith("myFunction");
    });

    test("should use provided span name", () => {
      const fn = vi.fn(function testFn() {
        return "result";
      });

      const instrumented1 = instrumentation.instrument(fn, {
        spanConfig: { spanName: "custom-span" },
      });

      expect(instrumented1()).toBe("result");
      expect(mockSpan.registerName).toHaveBeenCalledWith("custom-span");

      const instrumented2 = instrumentation.instrument(() => "anonymous", {
        spanConfig: { spanName: "anonymous-span" },
      });

      expect(instrumented2()).toBe("anonymous");
      expect(mockSpan.registerName).toHaveBeenCalledWith("anonymous-span");
    });

    test("should throw error when no span name available", () => {
      expect(() => instrumentation.instrument(() => "nothing")).toThrow();
    });

    test("should handle async functions correctly", async () => {
      const asyncFn = vi.fn().mockResolvedValue("async result");
      const instrumentedFn = instrumentation.instrument(asyncFn);

      const result = instrumentedFn();
      expect(result).toBeInstanceOf(Promise);

      const resolvedResult = await result;
      expect(resolvedResult).toBe("async result");
    });

    test("should handle sync errors and propagate them", () => {
      const error = new Error("sync error");
      const errorFn = vi.fn(() => {
        throw error;
      });

      const instrumentedFn = instrumentation.instrument(errorFn);
      expect(() => instrumentedFn()).toThrow(error);
    });

    test("should handle async errors and propagate them", async () => {
      const error = new Error("async error");
      const errorFn = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw error;
      });

      const errorFn2 = vi.fn(() => Promise.reject(error));

      // Non-catched error in an async function
      const instrumentedFn = instrumentation.instrument(errorFn);
      await expect(instrumentedFn()).rejects.toThrow(error);

      // Rejected promise in an async function
      const instrumentedFn2 = instrumentation.instrument(errorFn2);
      await expect(instrumentedFn2()).rejects.toThrow(error);
    });

    test("non-throwing functions should use isSuccessful predicate to determine success", () => {
      const fn = vi.fn(() => ({ success: false, data: "test" }));

      const instrumentedFn = instrumentation.instrument(fn, {
        spanConfig: { spanName: "predicate-test" },
        isSuccessful: (result) => result.success === true,
      });

      instrumentedFn();

      // Even though the function doesn't throw the `isSuccessful` predicate
      // will be used to determine the final status of the span
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
      });
    });

    test("should call onResult hook", () => {
      const onResult = vi.fn();
      const fn = vi.fn().mockReturnValue("result");

      const instrumentedFn = instrumentation.instrument(fn, {
        hooks: { onResult },
      });

      const nonSuccessfulInstrumentedFn = instrumentation.instrument(fn, {
        isSuccessful: () => false,
        hooks: {
          onResult,
        },
      });

      const result = instrumentedFn();
      const nonSuccessfulResult = nonSuccessfulInstrumentedFn();

      expect(result).toBe("result");
      expect(nonSuccessfulResult).toBe("result");

      expect(onResult).toHaveBeenCalledTimes(2);
      expect(onResult).toHaveBeenCalledWith("result", mockSpan);
    });

    test("should call onError hook", () => {
      const error = new Error("test error");
      const customError = new Error("custom error");
      const onError = vi.fn().mockReturnValue(customError);

      const fn = vi.fn(() => {
        throw error;
      });

      const instrumentedFn = instrumentation.instrument(fn, {
        hooks: { onError },
      });

      expect(() => instrumentedFn()).toThrow(error);
      expect(onError).toHaveBeenCalledOnce();
      expect(onError).toHaveBeenCalledWith(error, mockSpan);
      expect(mockSpan.recordException).toHaveBeenCalledWith(customError);
    });

    test("should handle non-Error exceptions", () => {
      const error = "string error";
      const fn = vi.fn(() => {
        throw error;
      });

      const instrumentedFn = instrumentation.instrument(fn, {
        spanConfig: { spanName: "non-error-test" },
      });

      expect(() => instrumentedFn()).toThrow(error);
      expect(mockSpan.recordException).toHaveBeenCalledWith({
        code: -1,
        name: "Unknown Error",
        message: 'Unhandled error at span "non-error-test": string error',
        stack: expect.any(String),
      });

      const namedInstrumentedFn = instrumentation.instrument(
        vi.fn(function named() {
          throw error;
        }),
        {},
      );

      expect(() => namedInstrumentedFn()).toThrow(error);
      expect(mockSpan.recordException).toHaveBeenCalledWith({
        code: -1,
        name: "Unknown Error",
        message: 'Unhandled error at span "named": string error',
        stack: expect.any(String),
      });
    });

    test("should pass through when telemetry is disabled", async () => {
      vi.mocked(runtimeHelpers.isTelemetryEnabled).mockReturnValue(false);

      const fn = vi.fn((x: number) => x * 2);
      const instrumentedDuplicate = instrumentation.instrument(fn, {
        spanConfig: { spanName: "disabled-test" },
      });

      const result = instrumentedDuplicate(5);
      expect(result).toBe(10);
      expect(fn).toHaveBeenCalledWith(5);

      const sdk = await import("~/core/sdk");
      expect(sdk.ensureSdkInitialized).not.toHaveBeenCalled();
    });

    test("should maintain separate contexts for concurrent operations", async () => {
      const contexts: InstrumentationContext[] = [];

      const fn1 = instrumentation.instrument(async function op1() {
        const ctx = instrumentation.getInstrumentationHelpers();
        await new Promise((resolve) => setTimeout(resolve, 15));
        contexts.push(ctx);

        return "op1";
      });

      const fn2 = instrumentation.instrument(async function op2() {
        const ctx = instrumentation.getInstrumentationHelpers();
        await new Promise((resolve) => setTimeout(resolve, 30));
        contexts.push(ctx);

        return "op2";
      });

      const [result1, result2] = await Promise.all([fn1(), fn2()]);
      expect(result1).toBe("op1");
      expect(result2).toBe("op2");

      const [ctx1, ctx2] = contexts;
      expect(ctx1).not.toBe(ctx2);
    });

    test("should propagate context through inner non-instrumented functions", () => {
      const contexts: InstrumentationContext[] = [];

      // Non-instrumented inner function
      const inner = vi.fn(function innerFn() {
        contexts.push(instrumentation.getInstrumentationHelpers());
        return "inner";
      });

      // Instrumented outer function
      const outer = instrumentation.instrument(function outerFn() {
        contexts.push(instrumentation.getInstrumentationHelpers());
        const result = inner();

        return `outer-${result}`;
      });

      const result = outer();
      expect(result).toBe("outer-inner");

      expect(contexts).toHaveLength(2);
      const [ctx1, ctx2] = contexts;

      expect(ctx1).toBe(ctx2);
      expect(ctx1.tracer).toBeDefined();
      expect(ctx2.tracer).toBeDefined();
      expect(ctx1.meter).toBeDefined();
      expect(ctx2.meter).toBeDefined();
    });

    test("inner instrumented functions should have their own context", () => {
      const contexts: InstrumentationContext[] = [];

      const inner = instrumentation.instrument(function innerFn() {
        contexts.push(instrumentation.getInstrumentationHelpers());
        return "inner";
      });

      const outer = instrumentation.instrument(function outerFn() {
        contexts.push(instrumentation.getInstrumentationHelpers());
        const result = inner();
        return `outer-${result}`;
      });

      expect(outer()).toBe("outer-inner");

      const [ctx1, ctx2] = contexts;
      expect(ctx1).not.toBe(ctx2);
    });
  });

  describe("instrumentEntrypoint", () => {
    let mockInitializeTelemetry: ReturnType<typeof vi.fn>;
    let mockMain: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockMain = vi.fn(() => ({ statusCode: 200 }));
      mockInitializeTelemetry = vi.fn(() => ({
        sdkConfig: {},
        tracer: {},
        meter: {},
        diagnostics: { logLevel: "info" as const },
      }));
    });

    test("should instrument entrypoint function and preserve behavior", async () => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      const params = {};
      const result = await instrumentedMain(params);

      expect(result).toEqual({ statusCode: 200 });
      expect(mockMain).toHaveBeenCalledWith(params);
      expect(mockInitializeTelemetry).toHaveBeenCalled();
    });

    test.each([
      { ENABLE_TELEMETRY: "true", LOG_LEVEL: "debug" },
      { ENABLE_TELEMETRY: "false", LOG_LEVEL: "info" },
    ])("should always set telemetry environment variables", (params) => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      instrumentedMain(params);
      expect(process.env.__AIO_LIB_TELEMETRY_LOG_LEVEL).toBe(params.LOG_LEVEL);
      expect(process.env.__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY).toBe(
        params.ENABLE_TELEMETRY,
      );
    });

    test.each([
      { isDevelopment: true, logLevel: "debug" },
      { isDevelopment: false, logLevel: "info" },
    ])(
      "should default log level parameter when not provided depending on the environment",
      ({ isDevelopment, logLevel }) => {
        vi.mocked(runtimeHelpers.isDevelopment).mockReturnValue(isDevelopment);

        const instrumentedMain = instrumentation.instrumentEntrypoint(
          mockMain,
          {
            initializeTelemetry: mockInitializeTelemetry,
          },
        );

        instrumentedMain({});
        expect(process.env.__AIO_LIB_TELEMETRY_LOG_LEVEL).toBe(logLevel);
      },
    );

    test("should pass through when telemetry is disabled", async () => {
      // Temporarily override the telemetry enabled mock.
      vi.mocked(runtimeHelpers.isTelemetryEnabled).mockReturnValue(false);

      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      const params = {};
      const result = await instrumentedMain(params);

      expect(result).toEqual({ statusCode: 200 });
      expect(mockMain).toHaveBeenCalledWith(params);
      expect(mockInitializeTelemetry).not.toHaveBeenCalled();

      vi.mocked(runtimeHelpers.isTelemetryEnabled).mockReturnValue(true);
    });

    test.each([
      {
        __ow_headers: {
          "x-telemetry-context": JSON.stringify({
            traceparent: "00-123-456-01",
          }),
        },
      },
      {
        __telemetryContext: { traceparent: "00-123-456-01" },
      },
      {
        data: {
          __telemetryContext: { traceparent: "00-123-456-01" },
        },
      },
      {
        __ow_headers: {
          traceparent: "00-123-456-01",
        },
      },
    ])("should handle context propagation from different sources", (params) => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      instrumentedMain({
        ENABLE_TELEMETRY: "true",
        ...params,
      });

      expect(propagation.deserializeContextFromCarrier).toHaveBeenCalledWith(
        { traceparent: "00-123-456-01" },
        expect.any(Object),
      );
    });

    test("should skip propagation if no context is provided", () => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      instrumentedMain({ ENABLE_TELEMETRY: "true" });
      expect(propagation.deserializeContextFromCarrier).not.toHaveBeenCalled();
    });

    test("should skip propagation when configured", () => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
        propagation: { skip: true },
      });

      instrumentedMain({
        ENABLE_TELEMETRY: "true",
        __telemetryContext: { traceparent: "00-123-456-01" },
      });

      expect(propagation.deserializeContextFromCarrier).not.toHaveBeenCalled();
    });

    test("should receive params in getContextCarrier", () => {
      let capturedParams: Record<string, unknown> | null = null;
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
        propagation: {
          getContextCarrier: (entrypointParams) => {
            capturedParams = entrypointParams;
            return { carrier: {}, baseCtx: undefined };
          },
        },
      });

      const params = { ENABLE_TELEMETRY: "true" };
      instrumentedMain(params);

      expect(capturedParams).toBe(params);
    });

    test("should use custom base context if provided", () => {
      const baseContext = {} as Context;

      const mockDeserializeContextFromCarrier = vi.fn();
      vi.mocked(propagation.deserializeContextFromCarrier).mockImplementation(
        mockDeserializeContextFromCarrier,
      );

      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
        propagation: {
          getContextCarrier: () => ({ carrier: {}, baseCtx: baseContext }),
        },
      });

      instrumentedMain({ ENABLE_TELEMETRY: "true" });
      expect(mockDeserializeContextFromCarrier).toHaveBeenCalledWith(
        {},
        baseContext,
      );
    });

    test("should use default context if no base context is provided", () => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
        propagation: {
          getContextCarrier: () => ({ carrier: {}, baseCtx: undefined }),
        },
      });

      const mockDeserializeContextFromCarrier = vi.fn();
      vi.mocked(propagation.deserializeContextFromCarrier).mockImplementation(
        mockDeserializeContextFromCarrier,
      );

      instrumentedMain({ ENABLE_TELEMETRY: "true" });
      expect(mockDeserializeContextFromCarrier).toHaveBeenCalledWith(
        {},
        expect.any(Object),
      );
    });

    test.each([new Error("Unexpected error"), "Unexpected string error"])(
      "should throw if there's some unexpected error during instrumentation",
      (error) => {
        vi.mocked(mockInitializeTelemetry).mockImplementation(() => {
          throw error;
        });

        const instrumentedMain = instrumentation.instrumentEntrypoint(
          mockMain,
          {
            initializeTelemetry: mockInitializeTelemetry,
          },
        );

        expect(() => instrumentedMain({})).toThrow();
      },
    );

    test("should bubble up sync runtime errors", () => {
      const error = new Error("Runtime error");
      mockMain.mockImplementation(() => {
        throw error;
      });

      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      expect(() => instrumentedMain({})).toThrow(error);
    });

    test("should bubble up async runtime errors", async () => {
      const error = new Error("Runtime error");
      mockMain.mockRejectedValueOnce(error);

      const instrumentedMain = instrumentation.instrumentEntrypoint(mockMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      await expect(instrumentedMain({})).rejects.toThrow(error);
    });

    test("should provide instrumentation context to entrypoint", () => {
      let capturedContext: InstrumentationContext | null = null;

      const mainWithInstrumentation = vi.fn(() => {
        capturedContext = instrumentation.getInstrumentationHelpers();
        return { statusCode: 200 };
      });

      const instrumentedMain = instrumentation.instrumentEntrypoint(
        mainWithInstrumentation,
        {
          initializeTelemetry: mockInitializeTelemetry,
        },
      );

      instrumentedMain({ ENABLE_TELEMETRY: "true" });

      if (!capturedContext) {
        assert.fail("capturedContext is null");
      }

      const context = capturedContext as InstrumentationContext;
      expect(context).toBeDefined();
      expect(context.currentSpan).toBeDefined();
      expect(context.logger).toBeDefined();
      expect(context.tracer).toBeDefined();
      expect(context.meter).toBeDefined();
    });

    test("should handle async entrypoints", async () => {
      const asyncMain = vi.fn().mockResolvedValue({ statusCode: 200 });

      const instrumentedMain = instrumentation.instrumentEntrypoint(asyncMain, {
        initializeTelemetry: mockInitializeTelemetry,
      });

      const result = instrumentedMain({ ENABLE_TELEMETRY: "true" });
      expect(result).toBeInstanceOf(Promise);

      await expect(result).resolves.toEqual({ statusCode: 200 });
    });

    test("should set correct span name for entrypoint", () => {
      // For unnamed functions the span name is set to actionName/entrypoint
      const unnamedEntrypoint = instrumentation.instrumentEntrypoint(
        () => "dummy",
        {
          initializeTelemetry: mockInitializeTelemetry,
        },
      );

      unnamedEntrypoint({});
      expect(mockSpan.registerName).toHaveBeenCalledWith(
        "test-action/entrypoint",
      );

      const spanConfigNamedEntrypoint = instrumentation.instrumentEntrypoint(
        () => "dummy",
        {
          initializeTelemetry: mockInitializeTelemetry,
          spanConfig: { spanName: "custom-span" },
        },
      );

      spanConfigNamedEntrypoint({});
      expect(mockSpan.registerName).toHaveBeenCalledWith("custom-span");

      const namedEntrypoint = instrumentation.instrumentEntrypoint(
        function main() {
          return "dummy";
        },
        {
          initializeTelemetry: mockInitializeTelemetry,
        },
      );

      namedEntrypoint({});
      expect(mockSpan.registerName).toHaveBeenCalledWith("test-action/main");
    });

    test("should mark root span as error if the runtime action fails", () => {
      const error = {
        statusCode: 500,
        message: "Runtime action failed",
      };

      const instrumentedMain = instrumentation.instrumentEntrypoint(
        function main() {
          return { error };
        },
        {
          initializeTelemetry: mockInitializeTelemetry,
        },
      );

      const result = instrumentedMain({});
      expect(result).toEqual({ error });
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
      });
    });

    test("should not instrusively mark root span if the runtime action returns a non-object", () => {
      const instrumentedMain = instrumentation.instrumentEntrypoint(
        function main() {
          return "test";
        },
        {
          initializeTelemetry: mockInitializeTelemetry,
        },
      );

      const result = instrumentedMain({});
      expect(result).toEqual("test");
      expect(mockSpan.setStatus).not.toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
      });
    });
  });
});
