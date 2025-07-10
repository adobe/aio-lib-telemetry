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

import type { NodeSDK } from "@opentelemetry/sdk-node";
import type { TelemetryApi } from "~/types";

// These need to be globals, so they can survive across the hot reloads of `aio app dev`.
// Otherwise their values are lost, and the underlying OpenTelemetry singletons are initialized twice (which leads to errors).
declare global {
  /** The global OpenTelemetry SDK instance. */
  var __OTEL_SDK__: NodeSDK | null;

  /** The global OpenTelemetry telemetry API instance. */
  var __OTEL_TELEMETRY_API__: TelemetryApi | null;
}
