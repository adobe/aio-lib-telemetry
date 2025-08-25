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

/** biome-ignore-all lint/performance/noBarrelFile: This is the import entrypoint for the public API. */
// This file collects and exports all the public API of the telemetry module.

export {
  getAioRuntimeAttributes,
  getAioRuntimeResource,
  getAioRuntimeResourceWithAttributes,
} from "./api/attributes";
export {
  addEventToActiveSpan,
  getActiveSpan,
  tryAddEventToActiveSpan,
  tryGetActiveSpan,
} from "./api/global";
export { getPresetInstrumentations } from "./api/presets";
export {
  deserializeContextFromCarrier,
  serializeContextIntoCarrier,
} from "./api/propagation";
export { defineTelemetryConfig } from "./core/config";
export {
  getInstrumentationHelpers,
  instrument,
  instrumentEntrypoint,
} from "./core/instrumentation";
export { getLogger } from "./core/logging";
export { defineMetrics } from "./core/metrics";
export { getGlobalTelemetryApi } from "./core/telemetry-api";
export * from "./types";
