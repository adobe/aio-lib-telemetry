# Error Message Reference

Every known error message from `@adobe/aio-lib-telemetry`, its cause, and how to fix it.

## SDK / Initialization Errors

### "You're trying to perform an operation that requires the telemetry SDK to be initialized..."

**Full message:** "...Ensure the `ENABLE_TELEMETRY` environment variable is set to `true` and that you instrumented your entrypoint function."

**Source:** `source/core/sdk.ts` (ensureSdkInitialized)

**Cause:** Code that needs an active SDK ran before `instrumentEntrypoint()` executed, or `ENABLE_TELEMETRY` is not set.

**Fix:**

1. Verify `ENABLE_TELEMETRY: true` in `app.config.yaml` inputs
2. Ensure the action's `main` is wrapped with `instrumentEntrypoint()`
3. Don't call SDK-dependent APIs at module top level (they run before the entrypoint)

---

### "You're trying to perform an operation that requires the telemetry API to be initialized..."

**Source:** `source/core/telemetry-api.ts` (ensureTelemetryApiInitialized)

**Cause:** `getGlobalTelemetryApi()` called before SDK initialization.

**Fix:** Same as above. Only access the global API inside instrumented functions or after the entrypoint has run.

---

### "Failed to start the telemetry SDK, your application won't emit telemetry data"

**Source:** `source/core/sdk.ts` (initializeSdk) - `diag.error` level

**Cause:** The NodeSDK constructor or `.start()` threw. Common reasons:

- Invalid exporter configuration (wrong URL format, missing required fields)
- Conflicting OpenTelemetry packages (version mismatches)
- Resource detector failure

**Fix:**

1. Enable diagnostics at `"debug"` level to see the underlying error
2. Check exporter URLs and authentication headers
3. Verify no duplicate `@opentelemetry/*` packages in `node_modules`

---

### "Telemetry SDK already initialized, skipping telemetry initialization"

**Source:** `source/core/sdk.ts` - `diag.warn` level

**Cause:** `initializeSdk()` called more than once. Happens during hot reload in `aio app dev`.

**Not an error** in dev mode. In production, indicates something unusual — possibly two entrypoints initializing in the same process.

---

### "Telemetry SDK already initialized, skipping diagnostics initialization"

**Source:** `source/core/sdk.ts` (initializeDiagnostics) - `diag.warn` level

**Cause:** Diagnostics must be configured BEFORE the SDK starts. This means the SDK was already running when diagnostics tried to initialize.

**Fix:** This is handled automatically by the library. If seen repeatedly, restart the dev server.

---

## Instrumentation Errors

### "getInstrumentationHelpers has been called in a runtime action that has not telemetry enabled..."

**Source:** `source/core/instrumentation.ts`

**Cause:** `getInstrumentationHelpers()` called but `ENABLE_TELEMETRY` is not `true`.

**Fix:** Set `ENABLE_TELEMETRY: true` in `app.config.yaml` inputs for this action.

---

### "getInstrumentationHelpers can only be called from within an instrumented function"

**Source:** `source/core/instrumentation.ts`

**Cause:** Called outside the execution context of a function wrapped with `instrument()` or `instrumentEntrypoint()`. The AsyncLocalStorage context is missing.

**Fix:**

1. Ensure the calling code runs inside an `instrument()`-wrapped function
2. Don't call from `setTimeout`, `setInterval`, or other contexts that break AsyncLocalStorage chain
3. Don't call at module top level

---

### "Span name is required. Either provide a name or use a named function."

**Source:** `source/core/instrumentation.ts`

**Cause:** `instrument()` was called with an anonymous/arrow function and no `spanConfig.spanName`.

**Fix:** Either use a named function or provide a span name:

```ts
// Option A: named function
instrument(function processOrder() { ... });

// Option B: explicit span name
instrument(() => { ... }, { spanConfig: { spanName: "processOrder" } });
```

---

### "No active span found"

**Source:** `source/api/global.ts` (getActiveSpan)

**Cause:** `getActiveSpan()` called when no span is active in the current context.

**Fix:** Use `tryGetActiveSpan()` instead (returns `undefined` instead of throwing), or ensure you're inside an instrumented function.

---

## Metrics Errors

### "Circular dependency detected: Do not access metrics inside the defineMetrics function..."

**Source:** `source/core/metrics.ts`

**Cause:** Inside `defineMetrics()`, the callback tried to access one of the metrics it's defining.

**Fix:** Only create and return metric objects in the callback. Use them outside:

```ts
// Wrong
const metrics = defineMetrics((meter) => {
  const counter = meter.createCounter("my_counter");
  counter.add(1); // circular!
  return { counter };
});

// Right
const metrics = defineMetrics((meter) => ({
  counter: meter.createCounter("my_counter"),
}));
metrics.counter.add(1); // use outside
```

---

### "Failed to initialize metrics: ..."

**Source:** `source/core/metrics.ts`

**Cause:** The lazy initialization of the metrics proxy failed, usually because the telemetry API isn't initialized yet.

**Fix:** Don't access metrics at module top level. Access them only during action execution (inside instrumented functions).

---

## Integration Errors

### "Failed to apply integration '...' to the telemetry configuration: ..."

**Source:** `source/helpers/integrations.ts`

**Cause:** An integration's `patchConfig` function threw an error.

**Fix:** Check the integration-specific configuration. For built-in integrations (`commerceEvents`, `commerceWebhooks`), ensure you're passing valid options.

---

## Preset Errors

### "Unknown instrumentation preset: ..."

**Source:** `source/api/presets.ts`

**Cause:** `getPresetInstrumentations()` called with a value other than `"simple"` or `"full"`.

**Fix:** Use one of the two valid presets:

```ts
getPresetInstrumentations("simple"); // HTTP + Undici + GraphQL
getPresetInstrumentations("full"); // All auto-instrumentations
```
