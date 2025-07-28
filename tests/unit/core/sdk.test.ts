import { diag } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { beforeEach, describe, expect, test, vi } from "vitest";

import * as loggingModule from "~/core/logging";
import {
  ensureSdkInitialized,
  initializeDiagnostics,
  initializeSdk,
} from "~/core/sdk";

vi.mock("@opentelemetry/api", () => ({
  diag: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@opentelemetry/sdk-node", () => ({
  NodeSDK: vi.fn(),
}));

vi.mock("~/core/logging", () => ({
  setOtelDiagLogger: vi.fn(),
}));

function clearGlobalState() {
  globalThis.__OTEL_SDK__ = null;
}

function mockShutdown(signal: "SIGTERM" | "SIGINT" | "beforeExit") {
  // Shutdown is not allowed to be called directly.
  // It only executes when the process exits on some signals.
  const processOnSpy = vi.spyOn(process, "on");
  const getShutdownHandler = () =>
    processOnSpy.mock.calls.find((call) => call[0] === signal)?.[1] as
      | (() => Promise<void>)
      | undefined;

  return [getShutdownHandler, () => processOnSpy.mockRestore()] as const;
}

describe("core/sdk", () => {
  let mockSdkInstance: Partial<NodeSDK>;

  beforeEach(() => {
    vi.clearAllMocks();
    clearGlobalState();

    // Setup mock SDK instance
    mockSdkInstance = {
      start: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(NodeSDK).mockImplementation((_) => mockSdkInstance as NodeSDK);
  });

  describe("ensureSdkInitialized", () => {
    test("should throw error if SDK is not initialized", () => {
      expect(() => ensureSdkInitialized()).toThrow(
        "Telemetry SDK not initialized",
      );
    });

    test("should not throw if SDK is initialized", () => {
      globalThis.__OTEL_SDK__ = mockSdkInstance as NodeSDK;
      expect(() => ensureSdkInitialized()).not.toThrow();
    });
  });

  describe("initializeDiagnostics", () => {
    test("should initialize diagnostics when SDK is not initialized", () => {
      const diagnosticsConfig = {
        logLevel: "debug",
        loggerName: "test-logger",
        exportLogs: true,
      } as const;

      initializeDiagnostics(diagnosticsConfig);

      expect(diag.warn).not.toHaveBeenCalled();
      expect(loggingModule.setOtelDiagLogger).toHaveBeenCalledWith(
        diagnosticsConfig,
      );
    });

    test("should skip initialization and warn when SDK is already initialized", () => {
      const diagnosticsConfig = {
        logLevel: "info",
      } as const;

      globalThis.__OTEL_SDK__ = mockSdkInstance as NodeSDK;
      initializeDiagnostics(diagnosticsConfig);

      expect(loggingModule.setOtelDiagLogger).not.toHaveBeenCalled();
      expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry SDK already initialized, skipping diagnostics initialization",
      );
    });
  });

  describe("initializeSdk", () => {
    test("should initialize SDK with default config", () => {
      initializeSdk();

      expect(NodeSDK).toHaveBeenCalledWith(undefined);
      expect(mockSdkInstance.start).toHaveBeenCalled();
      expect(globalThis.__OTEL_SDK__).toBe(mockSdkInstance);
      expect(diag.info).toHaveBeenCalledWith(
        "OpenTelemetry automatic instrumentation started successfully",
      );
    });

    test("should initialize SDK with custom config", () => {
      const customConfig = {
        instrumentations: [],
        serviceName: "test-service",
      };

      initializeSdk(customConfig);

      expect(NodeSDK).toHaveBeenCalledWith(customConfig);
      expect(mockSdkInstance.start).toHaveBeenCalled();
      expect(globalThis.__OTEL_SDK__).toBe(mockSdkInstance);
    });

    test("should skip initialization and warn when SDK is already initialized", () => {
      globalThis.__OTEL_SDK__ = mockSdkInstance as NodeSDK;
      initializeSdk();

      expect(NodeSDK).not.toHaveBeenCalled();
      expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry SDK already initialized, skipping telemetry initialization",
      );
    });

    test("should handle SDK start errors", () => {
      const error = new Error("Failed to start SDK");
      mockSdkInstance.start = vi.fn().mockImplementation(() => {
        throw error;
      });

      initializeSdk();
      expect(diag.error).toHaveBeenCalledWith(
        "Failed to start the telemetry SDK, your application won't emit telemetry data",
        error,
      );

      expect(globalThis.__OTEL_SDK__).toBe(mockSdkInstance);
    });

    test("should register shutdown handlers for process signals", () => {
      const processOnSpy = vi.spyOn(process, "on");
      initializeSdk();

      expect(processOnSpy).toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function),
      );

      expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith(
        "beforeExit",
        expect.any(Function),
      );

      processOnSpy.mockRestore();
    });

    test.each(["SIGTERM", "SIGINT", "beforeExit"] as const)(
      "should shutdown SDK on %s",
      async (signal) => {
        const [getShutdownHandler, restoreShutdownMock] = mockShutdown(signal);

        // We need to initialize the SDK to register the handlers.
        initializeSdk();

        const shutdownHandler = getShutdownHandler();
        expect(shutdownHandler).toBeDefined();

        // Simulate the process exiting.
        await shutdownHandler?.();

        expect(mockSdkInstance.shutdown).toHaveBeenCalled();
        expect(diag.info).toHaveBeenCalledWith(
          "Shutting down the telemetry SDK. No more telemetry data will be emitted",
        );

        expect(diag.info).toHaveBeenCalledWith(
          `Telemetry SDK shutdown reason: Terminating process: ${signal}`,
        );

        expect(diag.info).toHaveBeenCalledWith(
          "OpenTelemetry automatic instrumentation shutdown successful",
        );

        restoreShutdownMock();
      },
    );

    test("should handle shutdown errors gracefully", async () => {
      const shutdownError = new Error("Shutdown failed");
      mockSdkInstance.shutdown = vi.fn().mockRejectedValue(shutdownError);

      const [getShutdownHandler, restoreShutdownMock] = mockShutdown("SIGINT");
      initializeSdk();

      const shutdownHandler = getShutdownHandler();
      expect(shutdownHandler).toBeDefined();

      await shutdownHandler?.();
      expect(diag.error).toHaveBeenCalledWith(
        "Failed to shutdown the telemetry SDK, telemetry data may not be flushed",
        shutdownError,
      );

      restoreShutdownMock();
    });

    test("should not shutdown if SDK is not initialized", async () => {
      const [getShutdownHandler, restoreShutdownMock] =
        mockShutdown("beforeExit");

      // We need to initialize the SDK to register the handlers.
      initializeSdk();

      const shutdownHandler = getShutdownHandler();
      expect(shutdownHandler).toBeDefined();

      // But before shutting down, clear the initialized state
      // To simulate it has not been initialized.
      globalThis.__OTEL_SDK__ = null;
      await shutdownHandler?.();

      expect(mockSdkInstance.shutdown).not.toHaveBeenCalled();

      // TODO: The current logic of shutdown makes it impossible for this diagnostic
      // to be logged. We need to refactor it to allow for this. Uncomment when fixed.
      /* expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry SDK not initialized, skipping telemetry shutdown",
      ); */

      restoreShutdownMock();
    });
  });
});
