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

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";

import type { Instrumentation } from "@opentelemetry/instrumentation";
import type { HttpInstrumentationConfig } from "@opentelemetry/instrumentation-http";
import type { UndiciInstrumentationConfig } from "@opentelemetry/instrumentation-undici";
import type { TelemetryInstrumentationPreset } from "~/types";

const httpInstrumentationConfig = {
  // Prevent traces from being created by the un-managed logic of `aio app dev`.
  requireParentforIncomingSpans: true,
  disableIncomingRequestInstrumentation: true,
} satisfies HttpInstrumentationConfig;

const undiciInstrumentationConfig = {
  // Prevent traces from being created by the un-managed logic of `aio app dev`.
  requireParentforSpans: true,
} satisfies UndiciInstrumentationConfig;

/**
 * Gets the instrumentations for a given preset.
 *
 * @param preset - The preset to get the instrumentations for. *
 * @returns The instrumentations for the given preset:
 * - `full`: All the Node.js [auto-instrumentations](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
 * - `simple`: Instrumentations for:
 *     - [Http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http),
 *     - [GraphQL](https://www.npmjs.com/package/@opentelemetry/instrumentation-graphql)
 *     - [Undici](https://www.npmjs.com/package/@opentelemetry/instrumentation-undici)
 *
 * @throws {Error} If the preset is unknown.
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const instrumentations = getPresetInstrumentations("simple");
 * // instrumentations = [HttpInstrumentation, GraphQLInstrumentation, UndiciInstrumentation]
 * ```
 */
export function getPresetInstrumentations(
  preset: TelemetryInstrumentationPreset,
): Instrumentation[] {
  switch (preset) {
    case "simple": {
      return [
        new HttpInstrumentation(httpInstrumentationConfig),
        new GraphQLInstrumentation(),
        new UndiciInstrumentation(undiciInstrumentationConfig),
      ];
    }

    case "full": {
      return getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-http": httpInstrumentationConfig,
        "@opentelemetry/instrumentation-undici": undiciInstrumentationConfig,
      });
    }

    default: {
      throw new Error(`Unknown instrumentation preset: ${preset}`);
    }
  }
}
