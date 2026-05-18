# Code Analysis Guide

Systematic checklist for understanding a runtime action before proposing instrumentation.

## Step 1: Discover the Action

Read `app.config.yaml` (and any `ext.config.yaml` files) to find declared actions. Each action entry includes:

- The function path (e.g., `actions/my-action/index.js`)
- Input parameters and environment variables
- Whether `ENABLE_TELEMETRY: true` is set

Use this to locate the action's source file and understand its deployment context.

## Step 2: Find the Entrypoint

Search for `instrumentEntrypoint` in the action's directory. If found, the file containing it is the entrypoint. If not found, identify the action's main exported function — wrapping it with `instrumentEntrypoint` will be part of the instrumentation work.

When the entrypoint exists, identify:

- The `main` function (may be named differently internally)
- The telemetry config import (`defineTelemetryConfig`)
- Any integrations already applied (`commerceWebhooks`, `commerceEvents`)
- The preset in use (`getPresetInstrumentations("simple")` or `"full"`)

Also check whether `ENABLE_TELEMETRY: true` is set for this action in `app.config.yaml`. If not, add it during implementation — it's a one-line change in the config file.

## Step 3: Trace the Call Graph

From `main`, follow each function call:

1. Is it defined locally or imported from an external package?
2. If local: read it, note what it does, continue tracing
3. If external: note the package name and purpose (HTTP client, SDK, etc.). External functions can still be instrumented by wrapping them in a local function that uses `instrument()`. This is a user choice — suggest it when the external call is worth tracing.

Build a call tree:

```
main
├── validateInput (local)
├── fetchProductCatalog (local → calls Adobe Commerce SDK)
│   └── retryWithBackoff (local → wraps fetch)
├── transformProducts (local, pure computation)
└── publishResults (local → calls fetch to webhook URL)
```

## Step 4: Classify Each Function

| Classification                | Examples                                  | Typically worth instrumenting?           |
| ----------------------------- | ----------------------------------------- | ---------------------------------------- |
| External I/O                  | HTTP fetch, SDK call, DB query            | Yes — child span via `instrument()`      |
| Business logic with branching | Validation, routing, decisions            | Maybe — span attributes for branch taken |
| Data transformation           | Map, filter, format                       | Usually no, unless suspected bottleneck  |
| Pure utility                  | String formatting, math                   | No                                       |
| Error handling                | Try-catch, retry logic                    | Span events or exception recording       |
| Side effects                  | Writing to a store, sending notifications | Yes — child span via `instrument()`      |

## Step 5: Check Existing Instrumentation

Search the action's code for:

- `instrument(` — already-wrapped functions
- `getInstrumentationHelpers()` — places using the helpers API
- `getActiveSpan()` / `tryGetActiveSpan()` — manual span access
- `addEventToActiveSpan()` — existing span events
- `defineMetrics(` — existing metrics definitions
- `getLogger(` — existing OTel loggers
- `serializeContextIntoCarrier()` / `contextCarrier` — propagation already set up

Note what's covered to avoid duplicating instrumentation.

## Step 6: Check Auto-Instrumentation Coverage

If the telemetry config uses a preset:

- **"simple"**: HTTP (`http`/`https` module), GraphQL, and Undici (`fetch`) calls are automatically instrumented. Outbound HTTP requests already produce spans with `http.request.method`, `http.response.status_code`, `url.full`, etc.
- **"full"**: All Node.js auto-instrumentations (many may not work in App Builder runtime).

If a preset covers outbound HTTP calls, wrapping the function that makes the call with `instrument()` adds a semantic span name but not new timing data. It may still be valuable for adding attributes or hooks.

## Step 7: Identify Risk Areas

Look for:

- **Unhandled promise rejections**: `.then()` without `.catch()`, missing `await`
- **Silent failures**: Empty catch blocks, error swallowing
- **Conditional returns**: Early returns where the action "succeeds" but skips work
- **External calls without timeouts**: Fetches with no AbortController
- **Retry logic**: Retries that aren't observable

These are candidates for span events, logs, or error recording.

## Step 8: Assess Complexity

- **Simple** (1-2 external calls, linear flow): Root span + auto-instrumentation likely sufficient. 1-2 attributes.
- **Medium** (3-5 functions, some branching): 2-4 child spans + attributes.
- **Complex** (many external calls, parallel execution, retry logic): Full proposal with spans + metrics + logging.
