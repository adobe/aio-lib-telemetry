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

import type {
  Context,
  DiagLogLevel,
  Meter,
  Span,
  SpanOptions,
  Tracer,
} from "@opentelemetry/api";
import type { NodeSDKConfiguration } from "@opentelemetry/sdk-node";
import type { AnyFunction } from "~/core/instrumentation";
import type { getLogger } from "~/core/logging";

/**
 * Available log levels for the OpenTelemetry DiagLogger.
 * @since 0.1.0
 */
export type DiagnosticsLogLevel = Lowercase<keyof typeof DiagLogLevel>;

/**
 * Defines the names of available instrumentation presets.
 * @since 0.1.0
 */
export type TelemetryInstrumentationPreset = "simple" | "full";

/**
 * The configuration for the telemetry diagnostics.
 * @since 0.1.0
 */
export interface TelemetryDiagnosticsConfig {
  /**
   * The log level to use for the diagnostics.
   * @since 0.1.0
   */
  logLevel: DiagnosticsLogLevel;

  /**
   * The name of the logger to use for the diagnostics.
   *
   * @default `${actionName}/otel-diagnostics`
   * @since 0.1.0
   */
  loggerName?: string;

  /**
   * Whether to make OpenTelemetry also export the diagnostic logs to the configured exporters.
   * Set to `false` if you don't want to see diagnostic logs in your observability platform.
   *
   * @default true
   * @since 0.1.0
   */
  exportLogs?: boolean;
}

/**
 * Configuration related to context propagation (for distributed tracing).
 * @since 0.1.0
 */
export interface TelemetryPropagationConfig<T extends AnyFunction> {
  /**
   * By default, an instrumented entrypoint will try to automatically read (and use) the context from the incoming request.
   * Set to `true` if you want to skip this automatic context propagation.
   *
   * @default false
   * @since 0.1.0
   */
  skip?: boolean;

  /**
   * A function that returns the carrier for the current context.
   * Use it to specify where your carrier is located in the incoming parameters, when it's not one of the defaults.
   *
   * @since 0.1.0
   *
   * @param args - The arguments of the instrumented function.
   * @returns The carrier of the context to retrieve and an optional base context to use for the started span (defaults to the active context).
   */
  getContextCarrier?: (...args: Parameters<T>) => {
    carrier: Record<PropertyKey, string>;
    baseCtx?: Context;
  };
}

/**
 * The configuration for instrumentation.
 * @since 0.1.0
 */
export interface InstrumentationConfig<T extends AnyFunction> {
  /**
   * Configuration options related to the span started by the instrumented function.
   * See also the [SpanOptions](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.SpanOptions.html) interface.
   *
   * @since 0.1.0
   */
  spanConfig?: SpanOptions & {
    /**
     * The name of the span. Defaults to the name of given function.
     * You must use a named function or a provide a name here.
     *
     * @since 0.1.0
     */
    spanName?: string;

    /**
     * The base context to use for the started span.
     *
     * @since 0.1.0
     *
     * @param args - The arguments of the instrumented function.
     * @returns The base context to use for the started span.
     */
    getBaseContext?: (...args: Parameters<T>) => Context;
  };

  /**
   * A function that will be called to determine if the instrumented function was successful.
   * By default, the function is considered successful if it doesn't throw an error.
   *
   * @since 0.1.0
   *
   * @param result - The result of the instrumented function.
   * @returns Whether the instrumented function was successful.
   */
  isSuccessful?: (result: ReturnType<T>) => boolean;

  /** Hooks that can be used to act on a span depending on the result of the function. */
  hooks?: {
    /**
     * A function that will be called with the result of the instrumented function (if any, and no error was thrown).
     * You can use it to do something with the Span.
     *
     * @since 0.1.0
     *
     * @param result - The result of the instrumented function.
     * @param span - The span of the instrumented function.
     */
    onResult?: (result: ReturnType<T>, span: Span) => void;

    /**
     * A function that will be called when the instrumented function fails.
     * You can use it to do something with the Span.
     *
     * @since 0.1.0
     *
     * @param error - The error produced by the instrumented function.
     * @param span - The span of the instrumented function.
     */
    onError?: (error: unknown, span: Span) => Error | undefined;
  };
}

/**
 * The configuration options for the telemetry module.
 * @since 0.1.0
 */
export interface TelemetryConfig extends Partial<TelemetryApi> {
  /**
   * The configuration options for the OpenTelemetry SDK.
   * See the [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) interface.
   *
   * @since 0.1.0
   */
  sdkConfig: Partial<NodeSDKConfiguration>;

  /**
   * The configuration options for the telemetry diagnostics.
   * @since 0.1.0
   */
  diagnostics?: false | TelemetryDiagnosticsConfig;
}

/**
 * The configuration for entrypoint instrumentation.
 * @since 0.1.0
 */
export interface EntrypointInstrumentationConfig<
  T extends AnyFunction = AnyFunction,
> extends InstrumentationConfig<T> {
  /**
   * Configuration options related to context propagation.
   * See the {@link TelemetryPropagationConfig} for the interface.
   *
   * @since 0.1.0
   */
  propagation?: TelemetryPropagationConfig<T>;

  /**
   * This function is called at the start of the action.
   *
   * @since 0.1.0
   *
   * @param params - The parameters of the action.
   * @param isDevelopment - Whether the action is running in development mode.
   * @returns The telemetry configuration to use for the action.
   */
  initializeTelemetry: (
    params: Record<string, unknown>,
    isDevelopment: boolean,
  ) => TelemetryConfig;
}

/**
 * Defines the global telemetry API. These items should be set once per-application.
 * @since 0.1.0
 */
export interface TelemetryApi {
  /**
   * The tracer used to create spans.
   * @since 0.1.0
   */
  tracer: Tracer;

  /**
   * The meter used to create metrics.
   * @since 0.1.0
   */
  meter: Meter;
}

/**
 * The context for the current operation.
 * @since 0.1.0
 */
export interface InstrumentationContext {
  /**
   * The global (managed by the library) tracer instance used to create spans.
   * @since 0.1.0
   */
  tracer: Tracer;

  /**
   * The global (managed by the library) meter instance used to create metrics.
   * @since 0.1.0
   */
  meter: Meter;

  /**
   * The logger for the current operation.
   * @since 0.1.0
   */
  logger: ReturnType<typeof getLogger>;

  /**
   * The span of the current operation.
   * @since 0.1.0
   */
  currentSpan: Span;

  /**
   * Holds a carrier that can be used to propagate the active context.
   * @since 0.1.0
   */
  contextCarrier: Record<PropertyKey, string>;
}
