# `@adobe/aio-lib-telemetry`

- [`@adobe/aio-lib-telemetry`](#adobeaio-lib-telemetry)
  - [Installation](#installation)
  - [Versioning Policy](#versioning-policy)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)
  - [Governance](#governance)

A utility module for easy instrumentation of [Adobe App Builder](https://developer.adobe.com/app-builder/docs/overview/) runtime actions via OpenTelemetry.

## Installation

```shell
npm install @adobe/aio-lib-telemetry
```

## Versioning Policy

This library follows [semantic versioning](https://semver.org/) with one important exception: **breaking changes to the `otel` entrypoint do not trigger major version releases**.

The [`otel` entrypoint](./docs/api-reference/README.md#opentelemetry-api) re-exports OpenTelemetry APIs, which remain experimental and receive frequent updates that may include breaking changes. Strictly adhering to semantic versioning would require releasing a new major version with each OpenTelemetry update, which would be disruptive given their rapid release cadence.

**Our versioning approach:**

- **Major versions** are reserved for breaking changes to our library's own API
- **Minor/patch versions** may include breaking changes to the `otel` entrypoint
- All breaking changes, including those in `otel`, are documented in release notes with a `[BREAKING]` label

**Recommendation:** Always review release notes before upgrading, especially if you use the `otel` entrypoint directly.

## Usage

See the [Usage Guide](./docs/usage.md) for more information.

## Contributing

See the [Contributing Guide](https://github.com/adobe/aio-commerce-sdk/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

## Governance

This project adheres to the Adobe [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Security

Security issues shouldn't be reported on the issue tracker. Instead, [file an issue to our security experts](https://helpx.adobe.com/security/alertus.html).
