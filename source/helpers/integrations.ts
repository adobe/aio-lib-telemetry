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

import deepmerge from "deepmerge";

import type {
  EntrypointInstrumentationConfig,
  TelemetryIntegration,
} from "~/types";

/**
 * Applies the instrumentation integration patches to the given instrumentation configuration.
 *
 * @param integrations - The integrations to apply.
 * @param initialInstrumentationConfig - The initial instrumentation configuration.
 * @param params - The parameters of the action.
 */
export function applyInstrumentationIntegrationPatches(
  integrations: TelemetryIntegration[],
  initialInstrumentationConfig: Omit<
    EntrypointInstrumentationConfig,
    "initializeTelemetry" | "integrations"
  >,
  params: Record<string, unknown>,
) {
  let currentIntegration: string | null = null;
  let currentInstrumentationConfig = initialInstrumentationConfig;

  const updateInstrumentationConfigHandler = (
    config: Partial<EntrypointInstrumentationConfig>,
  ) => {
    currentInstrumentationConfig = deepmerge(
      currentInstrumentationConfig,
      config,
    );
  };

  try {
    for (const integration of integrations) {
      currentIntegration = integration.name;
      integration.patchInstrumentationConfig?.({
        params,
        instrumentationConfig: initialInstrumentationConfig,
        updateInstrumentationConfig: updateInstrumentationConfigHandler,
      });
    }
  } catch (error) {
    throw new Error(
      `Failed to apply integration "${currentIntegration ?? "unknown"}" to the telemetry configuration: ${error instanceof Error ? error.message : error}`,
      {
        cause: error,
      },
    );
  }

  return currentInstrumentationConfig;
}
