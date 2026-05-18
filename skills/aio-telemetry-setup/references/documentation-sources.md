# Documentation Sources

Use these sources when the skill needs to confirm library behavior, API options, or OpenTelemetry internals.

## Library documentation

Base URL: `https://raw.githubusercontent.com/adobe/aio-lib-telemetry/refs/heads/main/docs/`

| Doc               | Path                                     | Covers                                                                  |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Usage guide       | `usage.md`                               | Main guide — config, instrumentation, signals, propagation              |
| API reference     | `api-reference/README.md`                | Full API surface (query subdirs for specific functions/types as needed) |
| OTel concepts     | `concepts/open-telemetry.md`             | Library's relationship to OpenTelemetry                                 |
| Grafana setup     | `use-cases/grafana.md`                   | Grafana backend configuration                                           |
| New Relic setup   | `use-cases/new-relic.md`                 | New Relic backend configuration                                         |
| Integrations      | `use-cases/integrations/README.md`       | Commerce Events/Webhooks integrations                                   |
| Tunnel forwarding | `use-cases/support/tunnel-forwarding.md` | Local dev tunneling setup                                               |

## OpenTelemetry JS documentation

URL: `https://opentelemetry.io/docs/languages/js/`

Use for SDK internals, exporter options, instrumentation libraries, propagation protocol, and SDK lifecycle details beyond the library wrapper API.
