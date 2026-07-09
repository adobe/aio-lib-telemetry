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

import { metrics, trace } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type {
  Meter,
  SpanContext,
  SpanOptions,
  Tracer,
} from "@opentelemetry/api";
import type { TelemetryIntegration } from "#src/types";

describe("integrations/commerce", () => {
  let instrumentation: typeof import("#src/core/instrumentation");
  let commerce: typeof import("#src/integrations/commerce");

  let tracer: Tracer;
  let meter: Meter;

  function createInstrumentedEntrypointWithCapture(
    integration: TelemetryIntegration,
    mainFn?: () => unknown,
  ) {
    let capturedSpanContext: SpanContext | null = null;
    const mockInitializeTelemetry = vi.fn(() => ({
      meter,
      sdkConfig: {},
      tracer,
    }));

    const instrumentedMain = instrumentation.instrumentEntrypoint(
      mainFn ??
        function main() {
          capturedSpanContext =
            instrumentation
              .getInstrumentationHelpers()
              .currentSpan?.spanContext() ?? null;
          return { statusCode: 200 };
        },
      {
        initializeTelemetry: mockInitializeTelemetry,
        integrations: [integration],
      },
    );

    return {
      execute: instrumentedMain,
      getCapturedSpanContext: () => capturedSpanContext,
    };
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    tracer = trace.getTracer("test-tracer");
    meter = metrics.getMeter("test-meter");
    vi.stubGlobal("__OTEL_TELEMETRY_API__", {
      meter,
      tracer,
    });

    vi.doMock("#src/helpers/runtime", () => ({
      getRuntimeActionMetadata: vi.fn(() => ({
        actionName: "test-action",
        actionVersion: "1.0.0",
        activationId: "test-activation",
        apiHost: "test-host",
        apiKey: "test-key",
        cloud: "test-cloud",
        deadline: null,
        isDevelopment: false,
        namespace: "test-namespace",
        packageName: "test-package",
        region: "test-region",
        transactionId: "test-transaction",
      })),
      isDevelopment: vi.fn(() => false),

      isTelemetryEnabled: vi.fn(() => true),
    }));

    await import("#src/helpers/runtime");

    instrumentation = await import("#src/core/instrumentation");
    commerce = await import("#src/integrations/commerce");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("integrations should be overridable per runtime action", () => {
    const commerceIntegration = commerce.commerceEvents();
    const spy = vi.spyOn(commerceIntegration, "patchInstrumentationConfig");

    const mockInitializeTelemetry = vi.fn(() => ({
      integrations: [commerceIntegration],
      meter,
      sdkConfig: {},
      tracer,
    }));

    const instrumentedMain = instrumentation.instrumentEntrypoint(
      function main() {
        return { statusCode: 200 };
      },
      {
        initializeTelemetry: mockInitializeTelemetry,
        // Override the default integrations with an empty array
        integrations: [],
      },
    );

    const params = {
      ENABLE_TELEMETRY: "true",
    };

    instrumentedMain(params);
    expect(spy).not.toHaveBeenCalledWith();
  });

  test("should throw an error if the integration fails to apply", () => {
    const integration = {
      name: "test-integration",
      patchInstrumentationConfig: vi.fn(() => {
        throw new Error("test-error");
      }),
    } satisfies TelemetryIntegration;

    const { execute: withNameExecute } =
      createInstrumentedEntrypointWithCapture(integration);
    expect(() => withNameExecute({ ENABLE_TELEMETRY: "true" })).toThrow(
      "test-error",
    );

    const nonErrorThrowingIntegration = {
      name: "test-integration",
      patchInstrumentationConfig: vi.fn(() => {
        // biome-ignore lint/style/useThrowOnlyError: Test purposes
        throw "test-error";
      }),
    } satisfies TelemetryIntegration;

    const { execute: nonErrorThrowingExecute } =
      createInstrumentedEntrypointWithCapture(nonErrorThrowingIntegration);
    expect(() => nonErrorThrowingExecute({ ENABLE_TELEMETRY: "true" })).toThrow(
      "test-error",
    );

    const withoutNameIntegration = {
      patchInstrumentationConfig: vi.fn(() => {
        throw new Error("test-error");
      }),
    } as unknown as TelemetryIntegration;

    const { execute: withoutNameExecute } =
      createInstrumentedEntrypointWithCapture(withoutNameIntegration);

    expect(() => withoutNameExecute({ ENABLE_TELEMETRY: "true" })).toThrow(
      'Failed to apply integration "unknown" to the telemetry configuration: test-error',
    );
  });

  describe("commerceEvents", () => {
    beforeEach(() => {
      vi.stubGlobal("__OTEL_SDK__", new NodeSDK());
    });

    test("should skip propagation", () => {
      const integration = commerce.commerceEvents();
      const { execute, getCapturedSpanContext } =
        createInstrumentedEntrypointWithCapture(integration);

      const params = {
        data: {
          _metadata: {
            traceparent:
              "00-1234567890abcdef1234567890abcdef-1234567890abcdef-01",
          },
        },
        ENABLE_TELEMETRY: "true",
      };

      execute(params);

      const capturedSpanContext = getCapturedSpanContext();
      if (!capturedSpanContext) {
        expect.fail("capturedSpanContext is null");
      }

      expect(capturedSpanContext.traceId).not.toBe(
        "1234567890abcdef1234567890abcdef",
      );
      expect(capturedSpanContext.spanId).not.toBe("1234567890abcdef");
    });

    test("should add span link when valid trace context is present", () => {
      const integration = commerce.commerceEvents();
      const spy = vi.spyOn(tracer, "startActiveSpan");
      const { execute } = createInstrumentedEntrypointWithCapture(integration);

      const params = {
        data: {
          _metadata: {
            traceparent:
              "00-1234567890abcdef1234567890abcdef-1234567890abcdef-01",
          },
        },
        ENABLE_TELEMETRY: "true",
      };

      execute(params);

      const capturedSpanConfig = spy.mock.calls.at(0)?.at(1) as SpanOptions;
      expect(capturedSpanConfig.links).toBeDefined();
      expect(capturedSpanConfig.links?.length).toBe(1);
      expect(capturedSpanConfig.links?.[0].context.traceId).toBe(
        "1234567890abcdef1234567890abcdef",
      );

      expect(capturedSpanConfig.links?.[0].context.spanId).toBe(
        "1234567890abcdef",
      );
    });

    test.each([
      { data: {} },
      { data: { _metadata: {} } },
      { data: { _metadata: { traceparent: "invalid-trace-context" } } },
    ])("should handle missing/invalid trace context gracefully", (params) => {
      const integration = commerce.commerceEvents();
      const { execute, getCapturedSpanContext } =
        createInstrumentedEntrypointWithCapture(integration);

      const actionParams = {
        ENABLE_TELEMETRY: "true",
        ...params,
      };

      execute(actionParams);

      const capturedSpanContext = getCapturedSpanContext();
      if (!capturedSpanContext) {
        expect.fail("capturedSpanContext is null");
      }
    });
  });

  describe("commerceWebhooks", () => {
    beforeEach(() => {
      vi.stubGlobal("__OTEL_SDK__", new NodeSDK());
    });

    test("should propagate context when trace is sampled", () => {
      const integration = commerce.commerceWebhooks();
      const { execute, getCapturedSpanContext } =
        createInstrumentedEntrypointWithCapture(integration);

      const params = {
        __ow_headers: {
          traceparent:
            "00-1234567890abcdef1234567890abcdef-1234567890abcdef-01",
        },
        ENABLE_TELEMETRY: "true",
      };

      execute(params);

      const capturedSpanContext = getCapturedSpanContext();
      if (!capturedSpanContext) {
        expect.fail("capturedSpanContext is null");
      }

      // Should inherit the trace ID from the propagated context
      expect(capturedSpanContext.traceId).toBe(
        "1234567890abcdef1234567890abcdef",
      );
    });

    test("should create new root trace when ensureSampling=true and trace is not sampled", () => {
      const integration = commerce.commerceWebhooks({ ensureSampling: true });
      const { execute, getCapturedSpanContext } =
        createInstrumentedEntrypointWithCapture(integration);

      const params = {
        __ow_headers: {
          // Non-sampled trace (last byte is 00 instead of 01)
          traceparent:
            "00-1234567890abcdef1234567890abcdef-1234567890abcdef-00",
        },
        ENABLE_TELEMETRY: "true",
      };

      execute(params);

      const capturedSpanContext = getCapturedSpanContext();
      if (!capturedSpanContext) {
        expect.fail("capturedSpanContext is null");
      }

      // Should create a new trace ID (not inherit from non-sampled trace)
      expect(capturedSpanContext.traceId).not.toBe(
        "1234567890abcdef1234567890abcdef",
      );
    });

    test("should respect ensureSampling=false and not create new root when trace is not sampled", () => {
      const integration = commerce.commerceWebhooks({ ensureSampling: false });
      const { execute, getCapturedSpanContext } =
        createInstrumentedEntrypointWithCapture(integration);

      const params = {
        __ow_headers: {
          // Non-sampled trace (last byte is 00 instead of 01)
          traceparent:
            "00-1234567890abcdef1234567890abcdef-1234567890abcdef-00",
        },
        ENABLE_TELEMETRY: "true",
      };

      execute(params);

      const capturedSpanContext = getCapturedSpanContext();
      if (!capturedSpanContext) {
        expect.fail("capturedSpanContext is null");
      }

      // Should inherit the trace ID even though it's not sampled
      expect(capturedSpanContext.traceId).toBe(
        "1234567890abcdef1234567890abcdef",
      );
    });

    test("should add span link when creating new root trace", () => {
      const integration = commerce.commerceWebhooks({ ensureSampling: true });
      const spy = vi.spyOn(tracer, "startActiveSpan");
      const { execute } = createInstrumentedEntrypointWithCapture(integration);

      const params = {
        __ow_headers: {
          // Non-sampled trace
          traceparent:
            "00-1234567890abcdef1234567890abcdef-1234567890abcdef-00",
        },
        ENABLE_TELEMETRY: "true",
      };

      execute(params);

      const capturedSpanConfig = spy.mock.calls.at(0)?.at(1) as SpanOptions;
      expect(capturedSpanConfig.links).toBeDefined();
      expect(capturedSpanConfig.links?.length).toBe(1);
      expect(capturedSpanConfig.links?.[0].context.traceId).toBe(
        "1234567890abcdef1234567890abcdef",
      );

      expect(capturedSpanConfig.links?.[0].context.spanId).toBe(
        "1234567890abcdef",
      );
    });

    test.each([
      {},
      { __ow_headers: {} },
      { __ow_headers: { traceparent: "invalid-trace-context" } },
    ])("should handle missing/invalid trace context gracefully", (params) => {
      const integration = commerce.commerceWebhooks();
      const spy = vi.spyOn(tracer, "startActiveSpan");
      const { execute } = createInstrumentedEntrypointWithCapture(integration);

      const actionParams = {
        ENABLE_TELEMETRY: "true",
        ...params,
      };

      execute(actionParams);

      const capturedSpanConfig = spy.mock.calls.at(0)?.at(1) as SpanOptions;
      expect(capturedSpanConfig.links).toBeDefined();
      expect(capturedSpanConfig.links?.length).toBe(0);
    });
  });
});
