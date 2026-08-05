# `getAioRuntimeResourceAttributes()`

```ts
function getAioRuntimeResourceAttributes(): {
  action.name: string;
  action.namespace: string;
  environment: string;
  service.name: string;
};
```

Defined in: [api/attributes.ts:56](https://github.com/adobe/aio-lib-telemetry/blob/41c5ec13ca6d2cc9f732e352a472d47c3a0d240c/source/api/attributes.ts#L56)

Infers stable attributes for the current action from the Adobe I/O Runtime.
The result is safe to use as an OpenTelemetry resource across warm container
invocations.

## Returns

```ts
{
  action.name: string;
  action.namespace: string;
  environment: string;
  service.name: string;
}
```

#### action.name

```ts
action.name: string = meta.actionName;
```

#### action.namespace

```ts
action.namespace: string = meta.namespace;
```

### environment

```ts
environment: string;
```

#### service.name

```ts
service.name: string;
```

## Since

1.3.0

## Example

```ts
const attributes = getAioRuntimeResourceAttributes();
// attributes = { action.namespace: "my-namespace", action.name: "my-action", ... }
```
