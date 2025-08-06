# `getAioRuntimeAttributes()`

```ts
function getAioRuntimeAttributes(): {
  action.activation_id: string;
  action.name: string;
  action.namespace: string;
  environment: string;
  service.name: string;
};
```

Defined in: [api/attributes.ts:28](https://github.com/adobe/aio-lib-telemetry/blob/8f52cfa8868b711535e2b8726ef8da98982edbdf/source/api/attributes.ts#L28)

Infers some useful attributes for the current action from the Adobe I/O Runtime
and returns them as a record of key-value pairs.

## Returns

```ts
{
  action.activation_id: string;
  action.name: string;
  action.namespace: string;
  environment: string;
  service.name: string;
}
```

#### action.activation_id

```ts
action.activation_id: string = meta.activationId;
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

0.1.0

## Example

```ts
const attributes = getAioRuntimeAttributes();
// attributes = { action.namespace: "my-namespace", action.name: "my-action", ... }
```
