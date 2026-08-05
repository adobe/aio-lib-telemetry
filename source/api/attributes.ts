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

import { resourceFromAttributes } from "@opentelemetry/resources";

import {
  getRuntimeInvocationAttributes,
  inferTelemetryAttributesFromRuntimeMetadata,
} from "#helpers/runtime";

/**
 * Infers attributes for the current action and invocation from the Adobe I/O Runtime
 * and returns them as a record of key-value pairs.
 *
 * @deprecated Use {@link getAioRuntimeResourceAttributes} for stable attributes or
 * {@link getAioRuntimeInvocationAttributes} for invocation-specific attributes.
 * Do not use this combined output to construct an OpenTelemetry resource because
 * invocation-specific values become stale when a warm container is reused and add
 * high-cardinality dimensions to metrics.
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const attributes = getAioRuntimeAttributes();
 * // attributes = { action.namespace: "my-namespace", action.name: "my-action", ... }
 * ```
 */
export function getAioRuntimeAttributes() {
  return {
    ...getAioRuntimeResourceAttributes(),
    ...getAioRuntimeInvocationAttributes(),
  };
}

/**
 * Infers stable attributes for the current action from the Adobe I/O Runtime.
 * The result is safe to use as an OpenTelemetry resource across warm container
 * invocations.
 *
 * @since 1.3.0
 * @example
 * ```ts
 * const attributes = getAioRuntimeResourceAttributes();
 * // attributes = { action.namespace: "my-namespace", action.name: "my-action", ... }
 * ```
 */
export function getAioRuntimeResourceAttributes() {
  return inferTelemetryAttributesFromRuntimeMetadata();
}

/**
 * Returns attributes for the current Adobe I/O Runtime invocation. Call this
 * during each invocation so warm containers use the current values.
 *
 * @since 1.3.0
 * @example
 * ```ts
 * const attributes = getAioRuntimeInvocationAttributes();
 * // attributes = { action.activation_id: "activation-id", action.region: "region", ... }
 * ```
 */
export function getAioRuntimeInvocationAttributes() {
  return getRuntimeInvocationAttributes();
}

/**
 * Creates a [resource](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.resources.Resource.html)
 * from stable attributes inferred from the Adobe I/O Runtime and returns it as an OpenTelemetry Resource object.
 *
 * @see https://opentelemetry.io/docs/languages/js/resources/
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const resource = getAioRuntimeResource();
 * // use this resource in your OpenTelemetry configuration
 * ```
 */
export function getAioRuntimeResource() {
  return resourceFromAttributes(getAioRuntimeResourceAttributes());
}

/**
 * Creates a [resource](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.resources.Resource.html)
 * that combines stable attributes inferred from the Adobe I/O Runtime with the provided attributes.
 * @param attributes - The attributes to combine with the stable attributes inferred from the Adobe I/O Runtime.
 *
 * @see https://opentelemetry.io/docs/languages/js/resources/
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const resource = getAioRuntimeResourceWithAttributes({ foo: "bar" });
 * // resource = { action.namespace: "my-namespace", action.name: "my-action", foo: "bar", ... }
 * // use this resource in your OpenTelemetry configuration
 * ```
 */
export function getAioRuntimeResourceWithAttributes(
  attributes: Record<string, string>,
) {
  return resourceFromAttributes({
    ...getAioRuntimeResourceAttributes(),
    ...attributes,
  });
}
