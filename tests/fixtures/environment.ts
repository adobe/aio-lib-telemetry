import { vi } from "vitest";

/**
 * Sets up a fake environment used within `aio app dev` runs.
 * The environment mimics the environment used since `aio-app-plugin-app-dev@2.1.1`
 *
 * @see https://github.com/adobe/aio-cli-plugin-app-dev/releases/tag/2.1.1
 */
export function setupDevelopmentEnv() {
  // All the "legacy" env vars
  setupLegacyDevelopmentEnv();

  // Plus some overrides that start since v2.1.1:
  vi.stubEnv("AIO_DEV", "true");
  vi.stubEnv(
    "__OW_ACTION_NAME",
    `/${process.env.__OW_NAMESPACE}/test-dev-package-name/test-dev-action-name`,
  );
}

/** Sets up a fake environment used within `aio app dev` runs. */
export function setupLegacyDevelopmentEnv() {
  // In older versions of the AIO runtime, the AIO_DEV environment variable was not set
  // This "legacy" fixture is used to test the behavior of the library in these older versions
  vi.stubEnv("__OW_API_KEY", "test-dev-api-key");
  vi.stubEnv("__OW_NAMESPACE", "test-dev-namespace");
  vi.stubEnv("__OW_API_HOST", "test-dev-api-host");
  vi.stubEnv("__OW_ACTIVATION_ID", "test-dev-activation-id");
  vi.stubEnv("__OW_ACTION_NAME", "test-dev-action-name");
}

/** Sets up a fake environment used within deployed runtime action runs. */
export function setupProductionEnv() {
  vi.stubEnv("__OW_API_KEY", "test-prod-api-key");
  vi.stubEnv("__OW_NAMESPACE", "test-prod-namespace");
  vi.stubEnv("__OW_API_HOST", "test-prod-api-host");
  vi.stubEnv("__OW_ACTIVATION_ID", "test-prod-activation-id");
  vi.stubEnv("__OW_REGION", "test-prod-region");
  vi.stubEnv("__OW_CLOUD", "test-prod-cloud");
  vi.stubEnv("__OW_TRANSACTION_ID", "test-prod-transaction-id");
  vi.stubEnv("__OW_ACTION_VERSION", "1.0.0");
  vi.stubEnv(
    "__OW_ACTION_NAME",
    "/test-prod-namespace/test-prod-package-name/test-prod-action-name",
  );

  // The `__OW_DEADLINE` env var represents the timestamp (in ms)
  // by which the action execution must be completed.
  const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;
  vi.stubEnv("__OW_DEADLINE", `${Date.now() + oneMonthInMilliseconds}`);
}
