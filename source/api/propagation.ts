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

import { context, propagation } from "@opentelemetry/api";

import type { TelemetryPropagationConfig } from "~/types";

/**
 * Serializes the current context into a carrier.
 *
 * @param carrier - The carrier object to inject the context into.
 * @param ctx - The context to serialize. Defaults to the active context.
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const carrier = serializeContextIntoCarrier();
 * // carrier is now a record with the context data
 * ```
 *
 * @example
 * ```ts
 * const myCarrier = { more: 'data' };
 * const carrier = serializeContextIntoCarrier(myCarrier);
 * // carrier now contains both the existing data and the context data
 * // carrier = { more: 'data', ...contextData }
 * ```
 */
export function serializeContextIntoCarrier<
  Carrier extends Record<PropertyKey, string>,
>(carrier?: Carrier, ctx = context.active()) {
  const carrierObject = carrier ?? {};
  propagation.inject(ctx, carrierObject);

  return carrierObject as Carrier;
}

/**
 * Deserializes the context from a carrier and augments the given base context with it.
 *
 * @param carrier - The carrier object to extract the context from.
 * @param baseCtx - The base context to augment. Defaults to the active context.
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const carrier = { traceparent: "...00-069ea333a3d430..." };
 * const ctx = deserializeContextFromCarrier(carrier);
 * // ctx now contains the context data from the carrier
 * ```
 */
export function deserializeContextFromCarrier<
  Carrier extends Record<PropertyKey, string>,
>(carrier: Carrier, baseCtx = context.active()) {
  return propagation.extract(baseCtx, carrier);
}

/**
 * Infers the context carrier from the given parameters.
 * @param params - The parameters of the action.
 */
function inferContextCarrier(params: Record<string, unknown>) {
  // Try to infer the parent context from the following (in order):
  // 1. A `x-telemetry-context` header.
  // 2. A `__telemetryContext` input parameter.
  // 3. A `__telemetryContext` property in `params.data`.
  const headers = params.__ow_headers as Record<string, string>;
  const telemetryContext =
    // @deprecated: Remove custom __telemetryContext lookups in a future major release.
    headers?.["x-telemetry-context"] ??
    params.__telemetryContext ??
    (params.data as Record<string, unknown>)?.__telemetryContext ??
    null;

  // If the telemetry context is not found among all the above lookups,
  // default to the OpenWhisk headers (received when invoking via HTTP requests).
  // OpenTelemetry will pick the correct W3C context info automatically.
  const w3cContext = telemetryContext ?? headers ?? null;
  return {
    baseCtx: context.active(),
    carrier:
      typeof w3cContext === "string" ? JSON.parse(w3cContext) : w3cContext,
  };
}

/**
 * Retrieves the base context for the entrypoint.
 * @param params - The parameters of the action.
 * @param propagationConfig - The propagation configuration.
 */
export function getPropagatedContext(
  params: Record<string, unknown>,
  { skip, getContextCarrier = inferContextCarrier }: TelemetryPropagationConfig,
) {
  if (skip) {
    return context.active();
  }

  const { carrier, baseCtx } = getContextCarrier(params);
  let currentCtx = baseCtx ?? context.active();

  if (carrier) {
    currentCtx = deserializeContextFromCarrier(carrier, currentCtx);
  }

  return currentCtx;
}
