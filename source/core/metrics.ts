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

import { getGlobalTelemetryApi } from "~/core/telemetry-api";

import type {
  Attributes,
  Counter,
  Gauge,
  Histogram,
  Meter,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
} from "@opentelemetry/api";

/** The different types of metrics you can create with the OpenTelemetry API. */
export type MetricTypes =
  | Counter<Attributes>
  | UpDownCounter<Attributes>
  | Gauge<Attributes>
  | Histogram<Attributes>
  | ObservableCounter<Attributes>
  | ObservableUpDownCounter<Attributes>
  | ObservableGauge<Attributes>;

/**
 * Helper to define a record of metrics.
 * @see https://opentelemetry.io/docs/concepts/signals/metrics/
 *
 * @since 0.1.0
 * @example
 * ```ts
 * const metrics = defineMetrics((meter) => {
 *   return {
 *     myMetric: meter.createCounter("my-metric", { description: "My metric" }),
 *   };
 * });
 * ```
 * @param createMetrics - A function that receives a meter which can be used to create the metrics.
 */
export function defineMetrics<T extends Record<PropertyKey, MetricTypes>>(
  createMetrics: (meter: Meter) => T,
): T {
  let initializedMetrics: T | null = null;
  let isInitializing = false;

  // Return a proxy that will lazy-initialize the metrics when accessed.
  // This way we can defer the initialization of the metrics until the telemetry API (meter) is initialized.
  return new Proxy({} as T, {
    get(_, prop: PropertyKey) {
      // biome-ignore lint/nursery/noUnnecessaryConditions: False positive
      if (isInitializing) {
        // Would happen if using a metric inside the `defineMetrics` function.
        throw new Error(
          `Circular dependency detected: Do not access metrics inside the defineMetrics function. Only create and return metrics objects. Attempted to access "${String(prop)}"`,
        );
      }

      // The proxy has already been initialized, just return the asked metric.
      if (initializedMetrics) {
        return initializedMetrics[prop as keyof T];
      }

      try {
        const { meter } = getGlobalTelemetryApi();
        isInitializing = true;

        initializedMetrics = createMetrics(meter) as T;
        isInitializing = false;

        return initializedMetrics[prop as keyof T];
      } catch (error) {
        isInitializing = false;
        throw new Error(
          `Failed to initialize metrics: ${error instanceof Error ? error.message : error}`,
          { cause: error },
        );
      }
    },
  });
}
