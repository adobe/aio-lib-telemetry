# Customize Span Status

By default, the library considers a function successful if it doesn't throw an error. You can customize this behavior using the [`isSuccessful`](../api-reference/type-aliases/InstrumentationConfig.md#issuccessful) option.

- This option accepts a function that receives the result and returns a boolean indicating whether the operation succeeded.
- The success/failure state may not be relevant to your use case. Internally, it determines when to trigger the [`onError`](../api-reference/type-aliases/InstrumentationConfig.md#onerror) and [`onResult`](../api-reference/type-aliases/InstrumentationConfig.md#onresult) hooks, and whether to [set the span status](https://opentelemetry.io/docs/concepts/signals/traces/#span-status) to `OK` or `ERROR`. Different observability backends may interpret these statuses differently.

## Runtime Action Success/Failure

App Builder determines action failure by looking for an `error` property in the result (see [unsuccessful responses](https://developer.adobe.com/app-builder/docs/guides/runtime_guides/creating-actions#unsuccessful-response)). When using `instrumentEntrypoint`, this behavior is replicated to evaluate the root span's success or failure. The helper reads the response object and provides a default [`isSuccessful`](../api-reference/type-aliases/InstrumentationConfig.md#issuccessful) implementation that performs this `error` property check. You can override the behavior by providing a custom `isSuccessful` function.
