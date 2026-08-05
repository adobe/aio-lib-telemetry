# ~~`getAioRuntimeAttributes()`~~

```ts
function getAioRuntimeAttributes(): {
  action.activation_id: string;
  action.deadline?: string;
  action.name: string;
  action.namespace: string;
  action.region: string;
  action.transaction_id?: string;
  environment: string;
  service.name: string;
};
```

Defined in: [api/attributes.ts:37](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/api/attributes.ts#L37)

Infers attributes for the current action and invocation from the Adobe I/O Runtime
and returns them as a record of key-value pairs.

## Returns

```ts
{
  action.activation_id: string;
  action.deadline?: string;
  action.name: string;
  action.namespace: string;
  action.region: string;
  action.transaction_id?: string;
  environment: string;
  service.name: string;
}
```

#### ~~action.activation\_id~~

```ts
action.activation_id: string;
```

#### ~~action.deadline?~~

```ts
optional action.deadline?: string;
```

#### ~~action.name~~

```ts
action.name: string = meta.actionName;
```

#### ~~action.namespace~~

```ts
action.namespace: string = meta.namespace;
```

#### ~~action.region~~

```ts
action.region: string;
```

#### ~~action.transaction\_id?~~

```ts
optional action.transaction_id?: string;
```

### ~~environment~~

```ts
environment: string;
```

#### ~~service.name~~

```ts
service.name: string;
```

## Deprecated

Use [getAioRuntimeResourceAttributes](getAioRuntimeResourceAttributes.md) for stable attributes or
[getAioRuntimeInvocationAttributes](getAioRuntimeInvocationAttributes.md) for invocation-specific attributes.
Do not use this combined output to construct an OpenTelemetry resource because
invocation-specific values become stale when a warm container is reused and add
high-cardinality dimensions to metrics.

## Since

0.1.0

## Example

```ts
const attributes = getAioRuntimeAttributes();
// attributes = { action.namespace: "my-namespace", action.name: "my-action", ... }
```
