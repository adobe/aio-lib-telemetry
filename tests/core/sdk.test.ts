import { diag } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as loggingModule from "~/core/logging";
import {
  ensureSdkInitialized,
  initializeDiagnostics,
  initializeSdk,
} from "~/core/sdk";

// Mock dependencies
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

describe("core/sdk", () => {
  let mockSdkInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global state
    (global as any).__OTEL_SDK__ = null;

    // Setup mock SDK instance
    mockSdkInstance = {
      start: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(NodeSDK).mockImplementation(() => mockSdkInstance);
  });

  describe("ensureSdkInitialized", () => {
    it("should throw error if SDK is not initialized", () => {
      expect(() => ensureSdkInitialized()).toThrow(
        "Telemetry SDK not initialized",
      );
    });

    it("should not throw if SDK is initialized", () => {
      (global as any).__OTEL_SDK__ = mockSdkInstance;
      expect(() => ensureSdkInitialized()).not.toThrow();
    });
  });

  describe("initializeDiagnostics", () => {
    it("should initialize diagnostics when SDK is not initialized", () => {
      const diagnosticsConfig = {
        logLevel: "debug" as const,
        loggerName: "test-logger",
        exportLogs: true,
      };

      initializeDiagnostics(diagnosticsConfig);

      expect(loggingModule.setOtelDiagLogger).toHaveBeenCalledWith(
        diagnosticsConfig,
      );
      expect(diag.warn).not.toHaveBeenCalled();
    });

    it("should skip initialization and warn when SDK is already initialized", () => {
      (global as any).__OTEL_SDK__ = mockSdkInstance;

      const diagnosticsConfig = {
        logLevel: "info" as const,
      };

      initializeDiagnostics(diagnosticsConfig);

      expect(loggingModule.setOtelDiagLogger).not.toHaveBeenCalled();
      expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry SDK already initialized, skipping diagnostics initialization",
      );
    });
  });

  describe("initializeSdk", () => {
    it("should initialize SDK with default config", () => {
      initializeSdk();

      expect(NodeSDK).toHaveBeenCalledWith(undefined);
      expect(mockSdkInstance.start).toHaveBeenCalled();
      expect((global as any).__OTEL_SDK__).toBe(mockSdkInstance);
      expect(diag.info).toHaveBeenCalledWith(
        "OpenTelemetry automatic instrumentation started successfully",
      );
    });

    it("should initialize SDK with custom config", () => {
      const customConfig = {
        resource: { attributes: { foo: "bar" } },
        instrumentations: [],
      };

      initializeSdk(customConfig);

      expect(NodeSDK).toHaveBeenCalledWith(customConfig);
      expect(mockSdkInstance.start).toHaveBeenCalled();
      expect((global as any).__OTEL_SDK__).toBe(mockSdkInstance);
    });

    it("should skip initialization and warn when SDK is already initialized", () => {
      (global as any).__OTEL_SDK__ = mockSdkInstance;

      initializeSdk();

      expect(NodeSDK).not.toHaveBeenCalled();
      expect(diag.warn).toHaveBeenCalledWith(
        "Telemetry SDK already initialized, skipping telemetry initialization",
      );
    });

    it("should handle SDK start errors", () => {
      const error = new Error("Failed to start SDK");
      mockSdkInstance.start.mockImplementation(() => {
        throw error;
      });

      initializeSdk();

      expect(diag.error).toHaveBeenCalledWith(
        "Failed to start the telemetry SDK, your application won't emit telemetry data",
        error,
      );
      // SDK should still be set even if start fails
      expect((global as any).__OTEL_SDK__).toBe(mockSdkInstance);
    });

    it("should register shutdown handlers for process signals", () => {
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

    it("should shutdown SDK on SIGTERM", async () => {
      const processOnSpy = vi.spyOn(process, "on");

      initializeSdk();

      // Get the SIGTERM handler
      const sigtermHandler = processOnSpy.mock.calls.find(
        (call) => call[0] === "SIGTERM",
      )?.[1] as Function;

      expect(sigtermHandler).toBeDefined();

      // Trigger the handler
      await sigtermHandler();

      expect(mockSdkInstance.shutdown).toHaveBeenCalled();
      expect(diag.info).toHaveBeenCalledWith(
        "Shutting down the telemetry SDK. No more telemetry data will be emitted",
      );
      expect(diag.info).toHaveBeenCalledWith(
        "Telemetry SDK shutdown reason: Terminating process: SIGTERM",
      );
      expect(diag.info).toHaveBeenCalledWith(
        "OpenTelemetry automatic instrumentation shutdown successful",
      );

      processOnSpy.mockRestore();
    });

    it("should handle shutdown errors gracefully", async () => {
      const processOnSpy = vi.spyOn(process, "on");
      const shutdownError = new Error("Shutdown failed");
      mockSdkInstance.shutdown.mockRejectedValue(shutdownError);

      initializeSdk();

      // Get the SIGINT handler
      const sigintHandler = processOnSpy.mock.calls.find(
        (call) => call[0] === "SIGINT",
      )?.[1] as Function;

      // Trigger the handler
      await sigintHandler();

      expect(diag.error).toHaveBeenCalledWith(
        "Failed to shutdown the telemetry SDK, telemetry data may not be flushed",
        shutdownError,
      );

      processOnSpy.mockRestore();
    });

    it("should not shutdown if SDK is not initialized", async () => {
      const processOnSpy = vi.spyOn(process, "on");

      initializeSdk();

      // Clear the SDK
      (global as any).__OTEL_SDK__ = null;

      // Get the beforeExit handler
      const beforeExitHandler = processOnSpy.mock.calls.find(
        (call) => call[0] === "beforeExit",
      )?.[1] as Function;

      // Trigger the handler
      await beforeExitHandler();

      expect(mockSdkInstance.shutdown).not.toHaveBeenCalled();

      processOnSpy.mockRestore();
    });
  });

  describe("shutdown behavior", () => {
    it("should warn when trying to shutdown uninitialized SDK", async () => {
      // This test ensures the internal shutdownSdk function handles null SDK gracefully
      const processOnSpy = vi.spyOn(process, "on");

      // Initialize SDK first to register handlers
      initializeSdk();

      // Then clear it
      (global as any).__OTEL_SDK__ = null;

      // Get a handler and trigger it
      const handler = processOnSpy.mock.calls[0][1] as Function;
      await handler();

      expect(diag.warn).not.toHaveBeenCalledWith(
        "Telemetry SDK not initialized, skipping telemetry shutdown",
      );
      expect(mockSdkInstance.shutdown).not.toHaveBeenCalled();

      processOnSpy.mockRestore();
    });
  });
});
