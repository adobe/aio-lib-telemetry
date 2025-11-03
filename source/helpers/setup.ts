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

import { isDevelopment } from "./runtime";

/**
 * Sets global environment variables for the telemetry module.
 * @param params - The parameters of the action.
 */
export function setTelemetryEnv(params: Record<string, unknown>) {
  const { ENABLE_TELEMETRY = false } = params;
  const enableTelemetry = `${ENABLE_TELEMETRY}`.toLowerCase();
  process.env = {
    // Disable automatic resource detection to avoid leaking
    // information about the runtime environment by default.
    OTEL_NODE_RESOURCE_DETECTORS: "none",

    ...process.env,

    // Setting process.env.ENABLE_TELEMETRY directly won't work.
    // This is due to webpack automatic env inline replacement.
    __AIO_LIB_TELEMETRY_ENABLE_TELEMETRY: enableTelemetry,
    __AIO_LIB_TELEMETRY_LOG_LEVEL: `${params.LOG_LEVEL ?? (isDevelopment() ? "debug" : "info")}`,
  };
}
