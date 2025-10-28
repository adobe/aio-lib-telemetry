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

import { isSpanContextValid, TraceFlags, trace } from "@opentelemetry/api";

import { deserializeContextFromCarrier } from "~/api/propagation";

import type { Context } from "@opentelemetry/api";
import type { TelemetryIntegration } from "~/types";

/** Base configuration options for all Commerce integrations. */
export type CommerceWebhooksIntegrationConfig = {
  /**
   * Ensure runtime action traces are always created, regardless of Commerce's
   * subscription configuration.
   *
   * @remarks Commerce integrations can be configured with trace subscriptions
   * (full tracing) or log-only subscriptions (no traces). For example, if you're using Commerce
   * with a log-only subscription, it propagates trace context but marks it as non-sampled (for log correlation).
   *
   * With the default OpenTelemetry ParentBased sampler, this would cause runtime
   * action traces to also not be sampled, resulting in no trace data being exported.
   *
   * When `true` (default), runtime actions create their own trace when Commerce's
   * trace is non-sampled, while still linking to it for log correlation. When
   * Commerce's trace is sampled, the runtime action inherits it normally.
   *
   * Set to `false` only if you want runtime action tracing to be dependent on
   * Commerce's subscription configuration.
   *
   * @default true
   * @since 1.2.0
   */
  ensureSampling?: boolean;
};

/**
 * Determines if the carrier has a valid sampled trace.
 * @param carrier - The carrier to deserialize the context from.
 */
function tryExtractRemoteSpanContext(ctx: Context) {
  const span = trace.getSpan(ctx);
  if (!span) {
    return null;
  }

  const spanContext = span.spanContext();
  if (spanContext.isRemote && isSpanContextValid(spanContext)) {
    return spanContext;
  }
}

/**
 * An integration with Adobe Commerce Events.
 * @see https://developer.adobe.com/commerce/extensibility/events/
 *
 * @since 1.2.0
 */
export function commerceEvents(): TelemetryIntegration {
  return {
    name: "commerce-events",
    patchInstrumentationConfig: ({ updateInstrumentationConfig, params }) => {
      const typedParams = params as {
        data: { _metadata: Record<PropertyKey, string> };
      };

      const carrier = typedParams.data._metadata;
      const propagatedCtx = deserializeContextFromCarrier(carrier);
      const spanContext = tryExtractRemoteSpanContext(propagatedCtx) ?? null;

      updateInstrumentationConfig({
        propagation: {
          // We don't want to propagate the context from the Commerce Events integration.
          // As it the incoming trace comes from an async event (not part of the same execution trace)
          skip: true,
        },

        spanConfig: {
          links:
            spanContext !== null
              ? [
                  {
                    // Some backends still don't support span links, so we add the trace ID as an attribute.
                    attributes: { "commerce.traceid": spanContext.traceId },
                    context: spanContext,
                  },
                ]
              : [],
        },
      });
    },
  };
}

/**
 * An integration with Adobe Commerce Webhooks.
 * @see https://developer.adobe.com/commerce/extensibility/webhooks/
 *
 * @since 1.2.0
 */
export function commerceWebhooks({
  ensureSampling = true,
}: CommerceWebhooksIntegrationConfig = {}): TelemetryIntegration {
  return {
    name: "commerce-webhooks",
    patchInstrumentationConfig: ({ params, updateInstrumentationConfig }) => {
      const typedParams = params as {
        __ow_headers: Record<PropertyKey, string>;
      };

      const carrier = typedParams.__ow_headers;
      const propagatedCtx = deserializeContextFromCarrier(carrier);
      const spanContext = tryExtractRemoteSpanContext(propagatedCtx) ?? null;

      const isSampled =
        spanContext !== null &&
        // biome-ignore lint/suspicious/noBitwiseOperators: It's for a bitflag comparison.
        (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;

      const shouldCreateNewRoot =
        spanContext !== null && !isSampled && ensureSampling;

      updateInstrumentationConfig({
        propagation: {
          skip: shouldCreateNewRoot,
          getContextCarrier: () => ({ carrier, baseCtx: propagatedCtx }),
        },

        spanConfig: {
          // If we're starting a new trace, add a link to the incoming trace.
          links: shouldCreateNewRoot
            ? [
                {
                  // Some backends still don't support span links, so we add the trace ID as an attribute.
                  attributes: { "commerce.traceid": spanContext.traceId },
                  context: spanContext,
                },
              ]
            : [],
        },
      });
    },
  };
}
