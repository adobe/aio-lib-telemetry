# `getAioRuntimeAttributes()`

```ts
function getAioRuntimeAttributes(): {
  action.activation_id: string;
  action.deadline?: string;
  action.namespace: string;
  action.package_name: string;
  action.transaction_id: string;
  deployment.cloud: string;
  deployment.environment: string;
  deployment.region: string;
  service.name: string;
  service.version: string;
};
```

Defined in: [api/attributes.ts:27](https://github.com/adobe/aio-lib-telemetry/blob/ff54ba0c9f0266286f4859c4aab049b808a70c73/source/api/attributes.ts#L27)

Infers some useful attributes for the current action from the Adobe I/O Runtime
and returns them as a record of key-value pairs.

## Returns

```ts
{
  action.activation_id: string;
  action.deadline?: string;
  action.namespace: string;
  action.package_name: string;
  action.transaction_id: string;
  deployment.cloud: string;
  deployment.environment: string;
  deployment.region: string;
  service.name: string;
  service.version: string;
}
```

#### action.activation_id

```ts
activation_id: string = meta.activationId;
```

#### action.deadline?

```ts
optional deadline: string;
```

#### action.namespace

```ts
namespace: string = meta.namespace;
```

#### action.package_name

```ts
package_name: string = meta.packageName;
```

#### action.transaction_id

```ts
transaction_id: string = meta.transactionId;
```

#### deployment.cloud

```ts
cloud: string = meta.cloud;
```

#### deployment.environment

```ts
environment: string;
```

#### deployment.region

```ts
region: string = meta.region;
```

#### service.name

```ts
name: string = serviceName;
```

#### service.version

```ts
version: string = meta.actionVersion;
```

## Example

```ts
const attributes = getAioRuntimeAttributes();
// attributes = { action.namespace: "my-namespace", action.name: "my-action", ... }
```
