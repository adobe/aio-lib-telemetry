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
    // This is due to to webpack automatic env inline replacement.
    __AIO_LIB_TELEMETRY_ENABLE_TELEMETRY: enableTelemetry,
    __AIO_LIB_TELEMETRY_LOG_LEVEL: `${params.LOG_LEVEL ?? (isDevelopment() ? "debug" : "info")}`,
  };
}
