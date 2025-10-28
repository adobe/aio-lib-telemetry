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
    if (currentIntegration) {
      throw new Error(
        `Failed to apply integration "${currentIntegration}" to the telemetry configuration: ${error instanceof Error ? error.message : error}`,
        {
          cause: error,
        },
      );
    }

    throw error;
  }

  return currentInstrumentationConfig;
}
