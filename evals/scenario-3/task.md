# Audit and Fix the Fulfillment Service Telemetry

## Problem Description

A new developer set up telemetry for the fulfillment service last week, but no data has ever shown up in New Relic despite the actions running successfully. The developer exported telemetry from a previous project and adapted it manually, but they're not sure if they got everything right.

The telemetry configuration is in `inputs/telemetry.js` and the deployment config is in `inputs/app.config.yaml`. Both were written without IDE type-checking support, so errors could have crept in silently.

Review the configuration files for correctness against the `@adobe/aio-lib-telemetry` library and identify all problems. Then produce a fixed version of both files.

## Output Specification

Produce the following files:

- `validation-report.md` — a list of every issue found in the original files, with an explanation of why each is wrong and what the correct value/structure should be
- `telemetry.js` — a corrected version of the telemetry configuration
- `app.config.yaml` — a corrected version of the deployment configuration
