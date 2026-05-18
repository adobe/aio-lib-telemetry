# Action Patterns

Common App Builder runtime action patterns and their typical instrumentation profiles. Use these as starting points during Phase 3 — the user's observability goals from Phase 2 may override these defaults.

## Auto-Instrumentation Awareness

Before proposing child spans for outbound calls, check if a preset is configured:

- **"simple"** preset: HTTP (`http`/`https` module), GraphQL, and Undici (`fetch`) calls are automatically instrumented. You get spans with `http.request.method`, `http.response.status_code`, `url.full`, etc.
- **"full"** preset: All Node.js auto-instrumentations (DNS, FS, gRPC, etc.). Not all work reliably in App Builder runtime.

If auto-instrumentation already covers an outbound call, wrapping it with `instrument()` adds a semantic name but not new timing data. Still useful if you want to add custom attributes via hooks.

## API Proxy

**Pattern**: Receives a request, calls an external API, transforms the response, returns it.

```
main(params) -> validateInput() -> callExternalApi() -> transformResponse() -> return
```

| Depth         | What                     | Signal                      | Rationale                                                                                         |
| ------------- | ------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------- |
| Essential     | Request type/entity ID   | Span attribute on root      | Context for filtering traces                                                                      |
| Standard      | `callExternalApi`        | Child span (`instrument`)   | See external call duration separately (skip if auto-instrumented and no custom attributes needed) |
| Standard      | HTTP response status     | Span attribute on call span | Filter traces by external API success/failure                                                     |
| Standard      | Response payload size    | Span attribute or histogram | Spot unexpectedly large/small responses                                                           |
| Comprehensive | Input validation failure | Span event + log            | Debug bad requests                                                                                |
| Comprehensive | Requests by endpoint     | Counter metric              | Track volume over time                                                                            |

## Event Handler

**Pattern**: Receives an event (Commerce Event, IO Event), processes it, may trigger side effects.

```
main(params) -> parseEvent() -> processEvent() -> [triggerSideEffect()] -> return
```

**Integration awareness**: If this handles Commerce webhooks, suggest `commerceWebhooks()`. If it processes Commerce events, suggest `commerceEvents()`. These integrations handle incoming trace extraction and linkage, but outbound calls still need `contextCarrier` when you want downstream trace continuity.

| Depth         | What                     | Signal                                  | Rationale                               |
| ------------- | ------------------------ | --------------------------------------- | --------------------------------------- |
| Essential     | Event type               | Span attribute on root                  | Filter traces by event type             |
| Essential     | Processing outcome       | Span attribute (success/skipped/failed) | Understand outcomes at a glance         |
| Standard      | `processEvent`           | Child span                              | See processing time separate from total |
| Standard      | Side effect calls        | Child spans                             | Track outbound calls triggered by event |
| Standard      | Events by type           | Counter metric                          | Track volume over time                  |
| Comprehensive | Event payload details    | Span attributes                         | Entity IDs, sizes for debugging         |
| Comprehensive | Conditional skip reasons | Span event                              | Why an event was not processed          |

## Data Pipeline

**Pattern**: Fetches data from sources, transforms/aggregates, stores or returns results.

```
main(params) -> fetchData() -> transform() -> [store()] -> return
```

| Depth         | What                 | Signal                                                  | Rationale                                                                |
| ------------- | -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Essential     | Record count         | Span attribute on root                                  | Explains why an action was slow                                          |
| Standard      | `fetchData`          | Child span                                              | See fetch duration vs transform duration                                 |
| Standard      | `store`              | Child span                                              | Track write latency separately                                           |
| Standard      | Records processed    | Histogram metric                                        | Distribution of batch sizes                                              |
| Comprehensive | `transform`          | Child span when it performs I/O or expensive async work | Isolate transformation performance without wrapping trivial pure helpers |
| Comprehensive | Data quality issues  | Span events                                             | Schema violations, null values                                           |
| Comprehensive | Pipeline stage sizes | Span attributes per stage                               | Track data shape through pipeline                                        |

## Orchestrator

**Pattern**: Coordinates multiple external calls, possibly in parallel, aggregates results.

```
main(params) -> [callA(), callB(), callC()] -> aggregate() -> return
```

| Depth         | What                       | Signal                             | Rationale                                  |
| ------------- | -------------------------- | ---------------------------------- | ------------------------------------------ |
| Essential     | Call count / success count | Span attributes on root            | "3/4 calls succeeded"                      |
| Standard      | Each external call         | Child span                         | See which call is the bottleneck           |
| Standard      | Individual failures        | Exception recording                | Track partial failures                     |
| Standard      | Parallel vs sequential     | Span attribute                     | Know execution strategy                    |
| Comprehensive | Per-call response details  | Span attributes per child          | Response codes, sizes                      |
| Comprehensive | Orchestration metrics      | Counter/histogram                  | Success rates, total durations             |
| Comprehensive | Context propagation        | `contextCarrier` in outbound calls | Distributed tracing to downstream services |

## CRUD Handler

**Pattern**: Reads from or writes to a data store (usually behind an SDK/API).

```
main(params) -> validateInput() -> performDatabaseOp() -> formatResponse() -> return
```

| Depth         | What                    | Signal                     | Rationale                 |
| ------------- | ----------------------- | -------------------------- | ------------------------- |
| Essential     | Operation type + entity | Span attributes on root    | "Updated product P-12345" |
| Standard      | Database operation      | Child span                 | See DB latency separately |
| Standard      | Operation failure       | Exception recording (auto) | Stack trace on DB errors  |
| Comprehensive | Operations by type      | Counter metric             | Track CRUD distribution   |
| Comprehensive | Query/payload size      | Histogram metric           | Spot expensive operations |
| Comprehensive | Validation failures     | Span event + log           | Debug bad input           |

## Trivial Action

If the action is very simple (single external call, no transformation, health check):

The root span from `instrumentEntrypoint` plus auto-instrumentation (if preset configured) is likely sufficient.

Suggest:

- 1-2 span attributes on the root span for context
- A structured log for unexpected but non-fatal situations
- Nothing more unless specific needs are identified in Phase 2

Being honest about this is valuable — telling the user "you don't need more" prevents unnecessary complexity.
