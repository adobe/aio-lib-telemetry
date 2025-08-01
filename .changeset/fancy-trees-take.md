---
"@adobe/aio-lib-telemetry": major
---

Removed attributes that exposed runtime environment information. These include the following: `deployment.region`, `deployment.cloud`, plus all the `host`, `os` and `process` attributes.

It also renames `deployment.environment` to `environment`.

Finally, attributes like `action.package_name` and `action.transaction_id` are now not added if they are `unknown`. `action.version` is also not included in `development`, as the value was always fixed to `0.0.0 (development)`, which is not much useful and there's already the `environment` attribute.

You should not need to update your code, but acknowledge that some attributes are now missing. If you want them you should add them manually.
