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

import { AsyncLocalStorage } from "node:async_hooks";

import { context, SpanStatusCode } from "@opentelemetry/api";

import {
  deserializeContextFromCarrier,
  serializeContextIntoCarrier,
} from "~/api/propagation";
import { getLogger } from "~/core/logging";
import {
  ensureSdkInitialized,
  initializeDiagnostics,
  initializeSdk,
} from "~/core/sdk";
import {
  getGlobalTelemetryApi,
  initializeGlobalTelemetryApi,
} from "~/core/telemetry-api";
import {
  getRuntimeActionMetadata,
  isDevelopment,
  isTelemetryEnabled,
} from "~/helpers/runtime";

import type { Span } from "@opentelemetry/api";
import type {
  EntrypointInstrumentationConfig,
  InstrumentationConfig,
  InstrumentationContext as InstrumentationHelpers,
} from "~/types";

/** Wildcard signature for a function. */
// biome-ignore lint/suspicious/noExplicitAny: generic wrapper.
export type AnyFunction = (...args: any[]) => any | Promise<any>;

/** AsyncLocalStorage for helpers context. */
let helpersStorage: AsyncLocalStorage<InstrumentationHelpers> | null = null;

const UNKNOWN_ERROR_CODE = -1;
const UNKNOWN_ERROR_NAME = "Unknown Error";

/** @internal Returns the module-level helpers storage. */
function __getHelpersStorage() {
  if (!helpersStorage) {
    helpersStorage = new AsyncLocalStorage<InstrumentationHelpers>();
  }

  return helpersStorage;
}

/**
 * Access helpers for the current instrumented operation.
 *
 * @throws {Error} If the function is called in a runtime action that has not
 * telemetry enabled or if it is called outside of an instrumented function.
 *
 * @since 0.1.0
 */
export function getInstrumentationHelpers(): InstrumentationHelpers {
  if (!isTelemetryEnabled()) {
    throw new Error(
      "getInstrumentationHelpers has been called in a runtime action that has not telemetry enabled. " +
        "Ensure the `ENABLE_TELEMETRY` environment variable is set to `true`. Otherwise, instrumentation will not work.",
    );
  }

  const ctx = __getHelpersStorage().getStore();

  if (!ctx) {
    throw new Error(
      "getInstrumentationHelpers can only be called from within an instrumented function",
    );
  }

  return ctx;
}

/**
 * Instruments a function.
 *
 * @param fn - The function to instrument.
 * @param config - The configuration for the instrumentation.
 * @returns A wrapped function with the same signature as the original function, but with telemetry instrumentation.
 *
 * @throws {Error} If the span name is not provided and the function is not named.
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const instrumentedFn = instrument(someFunction, {
 *   // Optional configuration
 *   spanConfig: {
 *     spanName: "some-span",
 *       attributes: {
 *         "some-attribute": "some-value",
 *       },
 *   },
 * });
 */
export function instrument<T extends AnyFunction>(
  fn: T,
  { spanConfig, isSuccessful, hooks }: InstrumentationConfig<T> = {},
): (...args: Parameters<T>) => ReturnType<T> {
  const {
    spanName = fn.name,
    getBaseContext,
    ...spanOptions
  } = spanConfig ?? {};

  if (!spanName) {
    throw new Error(
      "Span name is required. Either provide a name or use a named function.",
    );
  }

  const { onResult, onError } = hooks ?? {};

  /** Handles a (potentially) successful result within the given span. */
  function handleResult(result: Awaited<ReturnType<T>>, span: Span) {
    // If `isSuccessful` predicate is not provided, we assume the result is successful.
    // Because if it reached this point, it didn't throw.
    if (isSuccessful === undefined || isSuccessful(result)) {
      span.setStatus({ code: SpanStatusCode.OK });
      onResult?.(result, span);
    } else {
      span.setStatus({ code: SpanStatusCode.ERROR });
      onResult?.(result, span);
    }

    return result;
  }

  /** Handles an error result within the given span. */
  function handleError(error: unknown, span: Span) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    const givenError = onError?.(error, span);

    if (givenError) {
      span.recordException(givenError);
    } else if (error instanceof Error) {
      span.recordException(error);
    } else if (error) {
      const stackCarrier: { stack?: string } = new Error("Unhandled error");

      if (Error.captureStackTrace) {
        // This will capture and override the default stack trace.
        Error.captureStackTrace(stackCarrier);
      }

      const exception = {
        code: UNKNOWN_ERROR_CODE,
        name: UNKNOWN_ERROR_NAME,
        message: `Unhandled error at span "${spanName}": ${error}`,
        stack: stackCarrier.stack,
      };

      span.recordException(exception);
    }

    return error;
  }

  /** Sets up the context for the current operation. */
  function setupContextHelpers(span: Span) {
    // Prepare context for cross-service propagation
    const carrier = serializeContextIntoCarrier();

    const { actionName } = getRuntimeActionMetadata();
    const { tracer, meter } = getGlobalTelemetryApi();
    const logger = getLogger(`${actionName}/${spanName}`, {
      logSourceAction: false,
      level: process.env.__LOG_LEVEL,
    });

    return {
      currentSpan: span,
      logger,
      tracer,
      meter,
      contextCarrier: carrier,
    } satisfies InstrumentationHelpers;
  }

  /** Sets up the span data (given to the tracer) for the current operation. */
  function setupSpanData(...args: Parameters<T>) {
    const { actionName } = getRuntimeActionMetadata();
    const { tracer } = getGlobalTelemetryApi();
    const currentCtx = getBaseContext?.(...args) ?? context.active();

    const spanCfg = {
      ...spanOptions,
      attributes: {
        "self.name": spanName,
        "action.name": actionName,
        ...spanOptions.attributes,
      },
    };

    return {
      currentCtx,
      spanConfig: spanCfg,
      tracer,
    };
  }

  /** Invokes the wrapped function and handles the result or error. */
  function runHandler(span: Span, ...args: Parameters<T>) {
    try {
      const ctx = setupContextHelpers(span);
      return __getHelpersStorage().run(ctx, () => {
        const result = fn(...args);

        if (result instanceof Promise) {
          return result
            .then((r) => Promise.resolve(handleResult(r, span)))
            .catch((e) => Promise.reject(handleError(e, span)))
            .finally(() => span.end());
        }

        const handledResult = handleResult(result, span);
        span.end();

        return handledResult;
      });
    } catch (error) {
      handleError(error, span);
      span.end();

      throw error;
    }
  }

  return (...args) => {
    if (!isTelemetryEnabled()) {
      return fn(...args);
    }

    ensureSdkInitialized();

    const { currentCtx, spanConfig: spanCfg, tracer } = setupSpanData(...args);
    const handler = (span: Span) => runHandler(span, ...args);

    return tracer.startActiveSpan(spanName, spanCfg, currentCtx, handler);
  };
}

/**
 * Instruments the entrypoint of a runtime action.
 * Needs to be used ONLY with the `main` function of a runtime action.
 *
 * @param fn - The entrypoint function to instrument.
 * @param config - The configuration for the entrypoint instrumentation.
 * @returns A wrapped function with the same signature as the original function, but with telemetry instrumentation.
 *
 * @throws {Error} If the instrumentation or the execution of the entrypoint fails.
 *
 * @since 0.1.0
 * @example
 * ```ts
 * import { telemetryConfig } from "../telemetry";
 *
 * const instrumentedEntrypoint = instrumentEntrypoint(main, {
 *   ...telemetryConfig,
 *   // Optional configuration
 * });
 * ```
 */
export function instrumentEntrypoint<
  // biome-ignore lint/suspicious/noExplicitAny: generic wrapper.
  T extends (params: Record<string, unknown>) => any,
>(fn: T, config: EntrypointInstrumentationConfig<T>) {
  /** Sets a global process.env.ENABLE_TELEMETRY variable. */
  function setTelemetryEnv(params: Record<string, unknown>) {
    const { ENABLE_TELEMETRY = false } = params;
    const enableTelemetry = `${ENABLE_TELEMETRY}`.toLowerCase();
    process.env = {
      ...process.env,

      // Setting process.env.ENABLE_TELEMETRY directly won't work.
      // This is due to to webpack automatic env inline replacement.
      __ENABLE_TELEMETRY: enableTelemetry,
      __LOG_LEVEL: `${params.LOG_LEVEL ?? (isDevelopment() ? "debug" : "info")}`,

      // Disable automatic resource detection to avoid leaking
      // information about the runtime environment by default.
      OTEL_NODE_RESOURCE_DETECTORS: "none",
    };
  }

  /** Callback that will be used to retrieve the base context for the entrypoint. */
  function getPropagatedContext(params: Record<string, unknown>) {
    function inferContextCarrier() {
      // Try to infer the parent context from the following (in order):
      // 1. A `x-telemetry-context` header.
      // 2. A `__telemetryContext` input parameter.
      // 3. A `__telemetryContext` property in `params.data`.
      const headers = (params.__ow_headers as Record<string, string>) ?? {};
      const telemetryContext =
        headers["x-telemetry-context"] ??
        params.__telemetryContext ??
        (params.data as Record<string, unknown>)?.__telemetryContext ??
        null;

      return {
        baseCtx: context.active(),
        carrier:
          typeof telemetryContext === "string"
            ? JSON.parse(telemetryContext)
            : telemetryContext,
      };
    }

    const {
      skip: skipPropagation = false,
      getContextCarrier = inferContextCarrier,
    } = config.propagation ?? {};

    if (skipPropagation) {
      return context.active();
    }

    const { carrier, baseCtx } = getContextCarrier();
    let currentCtx = baseCtx ?? context.active();

    if (carrier) {
      currentCtx = deserializeContextFromCarrier(carrier, currentCtx);
    }

    return currentCtx;
  }

  /** Initializes the Telemetry SDK and API. */
  function setupTelemetry(params: Record<string, unknown>) {
    const { initializeTelemetry, ...instrumentationConfig } = config;

    const { isDevelopment: isDev } = getRuntimeActionMetadata();
    const { sdkConfig, tracer, meter, diagnostics } = initializeTelemetry(
      params,
      isDev,
    );

    if (diagnostics) {
      // Diagnostics only work if initialized before the telemetry SDK.
      initializeDiagnostics(diagnostics);
    }

    // Internal calls to initialize the Telemetry SDK.
    initializeSdk(sdkConfig);
    initializeGlobalTelemetryApi({ tracer, meter });

    return {
      ...instrumentationConfig,
      spanConfig: {
        getBaseContext: getPropagatedContext,
        ...instrumentationConfig.spanConfig,
      },
    };
  }

  /** Instruments the given entrypoint handler. */
  function instrumentHandler(
    handler: T,
    { spanConfig, ...instrumentationConfig }: InstrumentationConfig<T> = {},
  ) {
    const { actionName } = getRuntimeActionMetadata();
    return instrument(handler, {
      ...instrumentationConfig,
      spanConfig: {
        spanName: `${actionName}/${fn.name || "entrypoint"}`,
        ...spanConfig,
      },
    }) as T;
  }

  return (params: Record<string, unknown>): ReturnType<T> => {
    let instrumentedHandler: T;
    setTelemetryEnv(params);

    if (!isTelemetryEnabled()) {
      // Passthrough if instrumentation is not enabled.
      return fn(params);
    }

    try {
      // Instrumentation of the entrypoint (and telemetry setup) needs to happen at runtime (inside the wrapper).
      // Otherwise we can't access runtime metadata or the received parameters.
      const instrumentConfig = setupTelemetry(params);
      instrumentedHandler = instrumentHandler(fn, instrumentConfig);
    } catch (error) {
      throw new Error(
        `Failed to instrument entrypoint: ${error instanceof Error ? error.message : error}`,
        {
          cause: error,
        },
      );
    }

    // If there's an error during execution, it will just bubble up.
    return instrumentedHandler(params);
  };
}
