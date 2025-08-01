import { beforeEach, describe, expect, test, vi } from "vitest";

import type { NodeSDK } from "@opentelemetry/sdk-node";

async function simulateShutdown(
  sdk: typeof import("~/core/sdk"),
  signal: "SIGTERM" | "SIGINT" | "beforeExit",
  onBeforeShutdown?: () => void,
) {
  // Shutdown is not allowed to be called directly.
  // It only executes when the process exits.
  // Mock process.on so we can get the shutdown handler.
  const processOnSpy = vi.spyOn(process, "on");

  // Initialize SDK first
  sdk.initializeSdk();
  const shutdownHandler = processOnSpy.mock.calls.find(
    (call) => call[0] === signal,
  )?.[1] as (() => Promise<void>) | undefined;

  // biome-ignore lint/suspicious/noMisplacedAssertion: for easy testing
  expect(shutdownHandler).toBeDefined();
  onBeforeShutdown?.();
  await shutdownHandler?.();

  processOnSpy.mockRestore();
  return { processOnSpy };
}

describe("core/sdk", () => {
  let coreSdk: typeof import("~/core/sdk");

  const startSdk = vi.fn();
  const shutdownSdk = vi.fn();

  const diagWarn = vi.fn();
  const diagInfo = vi.fn();
  const diagError = vi.fn();
  const setOtelDiagLogger = vi.fn();

  const mockNodeSdk = {
    start: startSdk,
    shutdown: shutdownSdk,
  };

  const NodeSdk = vi.fn().mockImplementation(() => mockNodeSdk);

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    // Clear any previous SDK instance
    globalThis.__OTEL_SDK__ = null;

    vi.doMock("@opentelemetry/api", () => ({
      diag: {
        warn: diagWarn,
        info: diagInfo,
        error: diagError,
      },
    }));

    vi.doMock("@opentelemetry/sdk-node", () => ({
      NodeSDK: NodeSdk,
    }));

    vi.doMock("~/core/logging", () => ({
      setOtelDiagLogger,
    }));

    coreSdk = await import("~/core/sdk");
  });

  describe("ensureSdkInitialized", () => {
    test("should throw error if SDK is not initialized", () => {
      expect(() => coreSdk.ensureSdkInitialized()).toThrow();
    });

    test("should not throw if SDK is initialized", () => {
      vi.stubGlobal("__OTEL_SDK__", {} as NodeSDK);
      expect(() => coreSdk.ensureSdkInitialized()).not.toThrow();
    });
  });

  describe("initializeDiagnostics", () => {
    test("should initialize diagnostics when SDK is not initialized", () => {
      const diagnosticsConfig = {
        logLevel: "debug",
        loggerName: "test-logger",
        exportLogs: true,
      } as const;

      coreSdk.initializeDiagnostics(diagnosticsConfig);

      expect(diagWarn).not.toHaveBeenCalled();
      expect(setOtelDiagLogger).toHaveBeenCalledWith(diagnosticsConfig);
    });

    test("should skip initialization and warn when SDK is already initialized", () => {
      const diagnosticsConfig = {
        logLevel: "info",
      } as const;

      vi.stubGlobal("__OTEL_SDK__", mockNodeSdk);
      coreSdk.initializeDiagnostics(diagnosticsConfig);

      expect(setOtelDiagLogger).not.toHaveBeenCalled();
      expect(diagWarn).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe("initializeSdk", () => {
    test("should initialize SDK with default config", () => {
      coreSdk.initializeSdk();
      expect(globalThis.__OTEL_SDK__).toBe(mockNodeSdk);

      expect(NodeSdk).toHaveBeenCalledWith(undefined);
      expect(startSdk).toHaveBeenCalled();
      expect(diagInfo).toHaveBeenCalledWith(expect.any(String));
    });

    test("should initialize SDK with custom config", () => {
      const customConfig = {
        instrumentations: [],
        serviceName: "test-service",
      };

      coreSdk.initializeSdk(customConfig);
      expect(globalThis.__OTEL_SDK__).toBe(mockNodeSdk);

      expect(NodeSdk).toHaveBeenCalledWith(customConfig);
      expect(startSdk).toHaveBeenCalled();
    });

    test("should skip initialization and warn when SDK is already initialized", () => {
      vi.stubGlobal("__OTEL_SDK__", mockNodeSdk);
      coreSdk.initializeSdk();

      expect(NodeSdk).not.toHaveBeenCalled();
      expect(diagWarn).toHaveBeenCalledWith(expect.any(String));
    });

    test("should handle SDK start errors", () => {
      const error = new Error("Failed to start SDK");
      startSdk.mockImplementationOnce(() => {
        throw error;
      });

      coreSdk.initializeSdk();

      // The SDK should be nullified after the error
      expect(globalThis.__OTEL_SDK__).toBeNull();
      expect(diagError).toHaveBeenCalledWith(expect.any(String), error);
    });

    test("should register shutdown handlers for process signals", () => {
      const processOnSpy = vi.spyOn(process, "on");
      coreSdk.initializeSdk();

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
        await simulateShutdown(coreSdk, signal);

        expect(shutdownSdk).toHaveBeenCalled();
        expect(diagInfo).toHaveBeenCalledWith(expect.stringContaining(signal));
      },
    );

    test("should log error if shutdown fails", async () => {
      const shutdownError = new Error("Shutdown failed");
      shutdownSdk.mockImplementationOnce(() => {
        throw shutdownError;
      });

      await simulateShutdown(coreSdk, "SIGINT");
      expect(diagError).toHaveBeenCalledWith(expect.any(String), shutdownError);
    });

    test("should not shutdown if SDK is not initialized and log warning", async () => {
      // First shutdown to get the handler
      await simulateShutdown(coreSdk, "beforeExit", () => {
        // Simulate a non initialized SDK
        vi.stubGlobal("__OTEL_SDK__", null);
      });

      expect(shutdownSdk).not.toHaveBeenCalled();
      expect(diagWarn).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
