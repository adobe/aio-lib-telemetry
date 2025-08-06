# @adobe/aio-lib-telemetry

## 1.0.0

### Major Changes

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Removed attributes that exposed runtime environment information. These include the following: `deployment.region`, `deployment.cloud`, plus all the `host`, `os` and `process` attributes.

  It also renames `deployment.environment` to `environment`.

  Finally, attributes like `action.package_name` and `action.transaction_id` are now not added if they are `unknown`. `action.version` is also not included in `development`, as the value was always fixed to `0.0.0 (development)`, which is not much useful and there's already the `environment` attribute.

  You should not need to update your code, but acknowledge that some attributes are now missing. If you want them you should add them manually.

- [`0bc0a0e`](https://github.com/adobe/aio-lib-telemetry/commit/0bc0a0e481156051cdf141b07486500fd1cd1aba) Thanks [@renovate[bot]](https://github.com/renovate%5Bbot%5D)! - The `LogRecord` type (exported from the `otel` entrypoint) has been renamed to `SdkLogRecord` and it's no longer a class but a TypeScript interface.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - [`getPresetInstrumentations`](../docs/api-reference/functions/getPresetInstrumentations.md) now throws an `Error` if the given `preset` is unknown. This change has been made to prevent silent failures.

  There's no need to update your code if you're using correctly the presets provided by the library. At most you may want to add a `try`/`catch` block to handle the error.

### Minor Changes

- [`0bc0a0e`](https://github.com/adobe/aio-lib-telemetry/commit/0bc0a0e481156051cdf141b07486500fd1cd1aba) Thanks [@renovate[bot]](https://github.com/renovate%5Bbot%5D)! - Update OpenTelemetry dependencies (see the [Renovate PR](https://github.com/adobe/aio-lib-telemetry/pull/10) for the full list).

- [`e490daf`](https://github.com/adobe/aio-lib-telemetry/commit/e490daf053388e66e4d0650795dd55abde76d3c2) Thanks [@renovate[bot]](https://github.com/renovate%5Bbot%5D)! - Update OpenTelemetry Contrib dependencies (see the [Renovate PR](https://github.com/adobe/aio-lib-telemetry/pull/11) for the full list).

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Use `Error.captureStackTrace` native API if available on unhandled errors in instrumented functions.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Add a `action.name` resource attribute in the default inferred telemetry attributes.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Add a `self.name` attribute in instrumented functions with the name of the span.

### Patch Changes

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fix action deadline calculation to correctly use `__OW_DEADLINE` as epoch milliseconds.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Remove trailing slash in inferred `serviceName` when `packageName` is not known.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fixes logging on shutdown which was throwing if the SDK was not initialized, instead of just reporting a warning.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fix misrepresented `params` type, as it can also contain non-string values.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Add default span name to the entrypoint if the function name is not available.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fix `Carrier` generic type in [`serializeContextIntoCarrier`](../docs/api-reference/functions/serializeContextIntoCarrier.md) and [`deserializeContextFromCarrier`](../docs/api-reference/functions/deserializeContextFromCarrier.md) to use `PropertyKey` as the `Record` key.

  Applies this change also in the `carrier` return type of [`getContextCarrier`](../docs/api-reference/interfaces/TelemetryPropagationConfig.md#getcontextcarrier) and the `contextCarrier` parameter of [`InstrumentationContext`](../docs/api-reference/interfaces/InstrumentationContext.md#contextcarrier).

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fix error handling in entrypoint by letting runtime errors bubble up and only throwing if the error happens during instrumentation wrapping.

- [#21](https://github.com/adobe/aio-lib-telemetry/pull/21) [`dc9bd69`](https://github.com/adobe/aio-lib-telemetry/commit/dc9bd691f66036279af5cf3c0e3273be07ad3c7c) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fixes a bug where the runtime action `params` weren't being forwarded to the `getContextCarrier` helper of the `instrumentEntrypoint` configuration.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fix action name parsing for default inferred telemetry attributes.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Don't keep a reference to the `NodeSDK` if it couldn't initialize.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Fix `defineMetrics` generic definition to accept `PropertyKey` as the `Record` key.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Improved error logging on uninitialized SDK and uninitialized telemetry API.

- [#16](https://github.com/adobe/aio-lib-telemetry/pull/16) [`efae3f9`](https://github.com/adobe/aio-lib-telemetry/commit/efae3f97cea34a6199241e1e7e64bc072707607b) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - [Automatic instrumentation for the Winston logger provider](https://www.npmjs.com/package/@opentelemetry/instrumentation-winston) has been removed from the `simple` preset. It's not needed because the OpenTelemetry transport added by that instrumentation is already added manually.

## 0.1.0

### Minor Changes

- [#3](https://github.com/adobe/aio-lib-telemetry/pull/3) [`5cecb35`](https://github.com/adobe/aio-lib-telemetry/commit/5cecb35aa14702d3058b58a2738c6d20db1b5e83) Thanks [@iivvaannxx](https://github.com/iivvaannxx)! - Initial release. This version includes the code that was previously (but temporarily) published as a workspace package in the [adobe/commerce-integration-starter-kit](https://github.com/adobe/commerce-integration-starter-kit/pull/42).
