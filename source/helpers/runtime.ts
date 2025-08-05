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

import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

/** Metadata associated with a runtime action. */
type RuntimeMetadata = {
  activationId: string;
  namespace: string;
  apiHost: string;
  apiKey: string;
  isDevelopment: boolean;

  region: string;
  cloud: string;
  transactionId: string;
  actionVersion: string;
  deadline: Date | null;

  packageName: string;
  actionName: string;
};

/** The runtime metadata for the action. */
let runtimeMetadata: RuntimeMetadata | null = null;

/** Checks if the runtime is in development mode. */
export function isDevelopment() {
  // Principal way to check is using AIO_DEV, but this is only available in latest versions of the AIO CLI.
  // As a fallback, check the action version, which is (as of now) only set in production.
  return (
    process.env.AIO_DEV !== undefined ||
    process.env.__OW_ACTION_VERSION === undefined
  );
}

/** Checks if telemetry is enabled. */
export function isTelemetryEnabled() {
  if (process.env.__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY) {
    return process.env.__AIO_LIB_TELEMETRY_ENABLE_TELEMETRY === "true";
  }

  // If it's not set, then we assume it's disabled.
  return false;
}

/** Retrieves basic metadata from the runtime environment. */
function retrieveBasicMetadata() {
  return {
    activationId: process.env.__OW_ACTIVATION_ID as string,
    namespace: process.env.__OW_NAMESPACE as string,
    apiHost: process.env.__OW_API_HOST as string,
    apiKey: process.env.__OW_API_KEY as string,
    isDevelopment: isDevelopment(),

    // The following are only set on production
    // We provide some arbitrary values for local development
    region: process.env.__OW_REGION ?? "local",
    cloud: process.env.__OW_CLOUD ?? "local",
    transactionId: process.env.__OW_TRANSACTION_ID ?? "unknown",
    actionVersion: process.env.__OW_ACTION_VERSION ?? "0.0.0 (development)",
    deadline: process.env.__OW_DEADLINE
      ? new Date(Number(process.env.__OW_DEADLINE))
      : null,
  };
}

/** Parses the action name from the runtime environment. */
function parseActionName() {
  const actionName = process.env.__OW_ACTION_NAME;

  if (!actionName) {
    return {
      packageName: "unknown",
      actionName: "unknown",
    };
  }

  if (actionName.includes("/")) {
    const [, _, packageName, ...action] = actionName.split("/");
    return {
      packageName,
      actionName: action.join("/"),
    };
  }

  return {
    // Old installations of AIO CLI, might use a version `aio app dev`
    // where ACTION_NAME doesn't include a package name.
    packageName: "unknown",
    actionName: process.env.__OW_ACTION_NAME as string,
  };
}

/** Gets the runtime metadata for the currently running action. */
export function getRuntimeActionMetadata() {
  if (!runtimeMetadata) {
    runtimeMetadata = {
      ...retrieveBasicMetadata(),
      ...parseActionName(),
    };
  }

  return runtimeMetadata;
}

/** Creates the service name based on environment and metadata. */
function createServiceName(meta: RuntimeMetadata) {
  if (meta.isDevelopment) {
    // The package name is not (always) available in development
    const packageSuffix =
      meta.packageName !== "unknown" ? `/${meta.packageName}` : "";

    return `${meta.namespace}-local-development${packageSuffix}`;
  }

  return `${meta.namespace}/${meta.packageName}`;
}

/** Creates core telemetry attributes that are always present. */
function createCoreAttributes(meta: RuntimeMetadata) {
  return {
    [ATTR_SERVICE_NAME]: createServiceName(meta),
    environment: meta.isDevelopment ? "development" : "production",

    "action.name": meta.actionName,
    "action.namespace": meta.namespace,
    "action.activation_id": meta.activationId,
  };
}

/** Adds conditional attributes that may not always be present. */
function addConditionalAttributes(
  attributes: Record<string, string>,
  meta: RuntimeMetadata,
) {
  // Only add service version if not in development
  const isProductionVersion = meta.actionVersion !== "0.0.0 (development)";
  if (isProductionVersion) {
    attributes[ATTR_SERVICE_VERSION] = meta.actionVersion;
  }

  // Add deadline if present
  if (meta.deadline) {
    attributes["action.deadline"] = meta.deadline.toISOString();
  }
}

/** Adds attributes that should be excluded if they have "unknown" values. */
function addKnownValueAttributes(
  attributes: Record<string, string>,
  meta: RuntimeMetadata,
) {
  const potentiallyUnknownAttributes = {
    "action.transaction_id": meta.transactionId,
    "action.package_name": meta.packageName,
  };

  for (const [name, value] of Object.entries(potentiallyUnknownAttributes)) {
    if (value !== "unknown") {
      attributes[name] = value;
    }
  }
}

/** Tries to infer the telemetry attributes from the runtime metadata. */
export function inferTelemetryAttributesFromRuntimeMetadata() {
  const meta = getRuntimeActionMetadata();
  const attributes = createCoreAttributes(meta);

  addConditionalAttributes(attributes, meta);
  addKnownValueAttributes(attributes, meta);

  return attributes;
}
