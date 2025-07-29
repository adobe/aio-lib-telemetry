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

import { diag } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";

import { setOtelDiagLogger } from "~/core/logging";

import type { NodeSDKConfiguration } from "@opentelemetry/sdk-node";
import type { TelemetryDiagnosticsConfig } from "~/types";

/**
 * Set the global SDK instance.
 * @param sdkInstance - The SDK instance to set.
 */
function setGlobalSdk(sdkInstance: NodeSDK | null) {
  global.__OTEL_SDK__ = sdkInstance;
}

/**
 * Ensure the telemetry SDK is initialized.
 * @throws {Error} An error if the telemetry SDK is not initialized.
 */
export function ensureSdkInitialized() {
  if (!global.__OTEL_SDK__) {
    throw new Error("Telemetry SDK not initialized");
  }
}

/**
 * Initialize the diagnostics logger.
 * @param config - The configuration for the diagnostics logger.
 */
export function initializeDiagnostics(config: TelemetryDiagnosticsConfig) {
  if (global.__OTEL_SDK__) {
    // Diagnostics can only be initialized before the telemetry SDK (otherwise they won't work).
    // If it's already initialized, we skip it.
    diag.warn(
      "Telemetry SDK already initialized, skipping diagnostics initialization",
    );

    return;
  }

  setOtelDiagLogger(config);
}

/**
 * Initialize the telemetry SDK.
 * @param config - The configuration for the telemetry SDK.
 */
export function initializeSdk(config?: Partial<NodeSDKConfiguration>) {
  if (global.__OTEL_SDK__) {
    diag.warn(
      "Telemetry SDK already initialized, skipping telemetry initialization",
    );

    return;
  }

  try {
    const sdk = new NodeSDK(config);
    setGlobalSdk(sdk);
    sdk.start();

    diag.info("OpenTelemetry automatic instrumentation started successfully");
  } catch (error) {
    // Don't set the global SDK instance if the `start` failed.
    // Currently the library doesn't support a way to recover from this error
    // but it doesn't make sense to keep an instance to an SDK that couldn't initialize.
    setGlobalSdk(null);

    diag.error(
      "Failed to start the telemetry SDK, your application won't emit telemetry data",
      error,
    );
  }

  for (const signal of ["SIGTERM", "SIGINT", "beforeExit"]) {
    process.on(signal, async () => {
      await shutdownSdk(`Terminating process: ${signal}`);
    });
  }
}

/**
 * Shutdown the telemetry SDK.
 * @param reason - The reason for the shutdown.
 */
async function shutdownSdk(reason?: string) {
  if (!global.__OTEL_SDK__) {
    diag.warn("Telemetry SDK not initialized, skipping telemetry shutdown");
    return;
  }

  try {
    diag.info(
      "Shutting down the telemetry SDK. No more telemetry data will be emitted",
    );

    if (reason) {
      diag.info(`Telemetry SDK shutdown reason -> "${reason}"`);
    }

    await global.__OTEL_SDK__.shutdown();
    diag.info("OpenTelemetry automatic instrumentation shutdown successful");
  } catch (error) {
    diag.error(
      "Failed to shutdown the telemetry SDK, telemetry data may not be flushed",
      error,
    );
  }
}
