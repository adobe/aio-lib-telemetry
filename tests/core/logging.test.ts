import AioLogger from "@adobe/aio-lib-core-logging";
import { DiagLogLevel, diag } from "@opentelemetry/api";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLogger, setOtelDiagLogger } from "~/core/logging";
import * as sdkModule from "~/core/sdk";
import * as runtimeHelpers from "~/helpers/runtime";

// Mock dependencies
vi.mock("@adobe/aio-lib-core-logging", () => ({
  default: vi.fn(),
}));

vi.mock("@opentelemetry/winston-transport", () => ({
  OpenTelemetryTransportV3: vi.fn(),
}));

vi.mock("@opentelemetry/api", () => ({
  DiagLogLevel: {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    VERBOSE: 5,
    ALL: 6,
  },
  diag: {
    setLogger: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("~/helpers/runtime", () => ({
  getRuntimeActionMetadata: vi.fn(),
}));

vi.mock("~/core/sdk", () => ({
  ensureSdkInitialized: vi.fn(),
}));

describe("core/logging", () => {
  const mockLogger = {
    logger: {
      logger: {
        add: vi.fn(),
      },
    },
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AioLogger).mockReturnValue(mockLogger as any);
    vi.mocked(runtimeHelpers.getRuntimeActionMetadata).mockReturnValue({
      actionName: "test-action",
    } as any);
  });

  describe("getLogger", () => {
    it("should create a logger with default configuration", () => {
      const logger = getLogger("test-logger");

      expect(sdkModule.ensureSdkInitialized).toHaveBeenCalled();
      expect(AioLogger).toHaveBeenCalledWith("test-logger", {
        provider: "winston",
        level: "info",
      });
      expect(logger).toBe(mockLogger);
    });

    it("should create a logger with custom configuration", () => {
      const customConfig = {
        level: "debug",
        logSourceAction: false,
      };

      const logger = getLogger("custom-logger", customConfig);

      expect(AioLogger).toHaveBeenCalledWith("custom-logger", {
        ...customConfig,
        provider: "winston",
        level: "debug",
      });
      expect(logger).toBe(mockLogger);
    });

    it("should add OpenTelemetry transport to the logger", () => {
      const mockTransport = {};
      vi.mocked(OpenTelemetryTransportV3).mockReturnValue(mockTransport as any);

      getLogger("test-logger");

      expect(OpenTelemetryTransportV3).toHaveBeenCalledWith({
        level: "info",
      });
      expect(mockLogger.logger.logger.add).toHaveBeenCalledWith(mockTransport);
    });

    it("should use custom log level for transport", () => {
      const mockTransport = {};
      vi.mocked(OpenTelemetryTransportV3).mockReturnValue(mockTransport as any);

      getLogger("test-logger", { level: "warn" });

      expect(OpenTelemetryTransportV3).toHaveBeenCalledWith({
        level: "warn",
      });
    });

    it("should handle undefined log level", () => {
      getLogger("test-logger", { level: undefined });

      expect(AioLogger).toHaveBeenCalledWith("test-logger", {
        provider: "winston",
        level: "info",
      });
    });
  });

  describe("setOtelDiagLogger", () => {
    it("should set diagnostics logger with info level", () => {
      setOtelDiagLogger({
        logLevel: "info",
        exportLogs: true,
      });

      expect(AioLogger).toHaveBeenCalledWith("test-action/otel-diagnostics", {
        level: "info",
        logSourceAction: false,
        provider: "winston",
      });

      expect(diag.setLogger).toHaveBeenCalledWith(mockLogger, {
        logLevel: DiagLogLevel.INFO,
      });

      expect(diag.info).toHaveBeenCalledWith(
        "OpenTelemetry diagnostics logger set successfully",
      );
    });

    it("should use custom logger name", () => {
      setOtelDiagLogger({
        logLevel: "debug",
        loggerName: "custom-diag-logger",
        exportLogs: true,
      });

      expect(AioLogger).toHaveBeenCalledWith("custom-diag-logger", {
        level: "debug",
        logSourceAction: false,
        provider: "winston",
      });
    });

    it("should map log levels correctly", () => {
      const testCases = [
        { input: "none" as const, aioLevel: undefined, diagLevel: "NONE" },
        { input: "all" as const, aioLevel: "verbose", diagLevel: "ALL" },
        { input: "error" as const, aioLevel: "error", diagLevel: "ERROR" },
        { input: "warn" as const, aioLevel: "warn", diagLevel: "WARN" },
        { input: "info" as const, aioLevel: "info", diagLevel: "INFO" },
        { input: "debug" as const, aioLevel: "debug", diagLevel: "DEBUG" },
        {
          input: "verbose" as const,
          aioLevel: "verbose",
          diagLevel: "VERBOSE",
        },
      ];

      for (const { input, aioLevel, diagLevel } of testCases) {
        vi.clearAllMocks();

        setOtelDiagLogger({
          logLevel: input,
          exportLogs: true,
        });

        if (aioLevel) {
          expect(AioLogger).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ level: aioLevel }),
          );
        }

        expect(diag.setLogger).toHaveBeenCalledWith(expect.anything(), {
          logLevel: DiagLogLevel[diagLevel as keyof typeof DiagLogLevel],
        });
      }
    });

    it("should export logs only for info, warn, and error levels", () => {
      const mockTransport = {};
      vi.mocked(OpenTelemetryTransportV3).mockReturnValue(mockTransport as any);

      // Test info level - should export
      setOtelDiagLogger({
        logLevel: "info",
        exportLogs: true,
      });
      expect(OpenTelemetryTransportV3).toHaveBeenCalledWith({ level: "info" });
      expect(mockLogger.logger.logger.add).toHaveBeenCalled();

      vi.clearAllMocks();

      // Test debug level - should not export
      setOtelDiagLogger({
        logLevel: "debug",
        exportLogs: true,
      });
      expect(OpenTelemetryTransportV3).toHaveBeenCalledWith({ level: "info" });
      expect(mockLogger.logger.logger.add).toHaveBeenCalled();
    });

    it("should not add transport when exportLogs is false", () => {
      setOtelDiagLogger({
        logLevel: "info",
        exportLogs: false,
      });

      expect(mockLogger.logger.logger.add).not.toHaveBeenCalled();
    });

    it("should handle errors when setting logger", () => {
      vi.mocked(diag.setLogger).mockImplementation(() => {
        throw new Error("Failed to set logger");
      });

      setOtelDiagLogger({
        logLevel: "info",
        exportLogs: true,
      });

      expect(diag.error).toHaveBeenCalledWith(
        "Failed to set the telemetry diagnostics",
        expect.any(Error),
      );
    });

    it("should not call ensureSdkInitialized for diagnostics logger", () => {
      setOtelDiagLogger({
        logLevel: "info",
        exportLogs: true,
      });

      expect(sdkModule.ensureSdkInitialized).not.toHaveBeenCalled();
    });
  });
});
