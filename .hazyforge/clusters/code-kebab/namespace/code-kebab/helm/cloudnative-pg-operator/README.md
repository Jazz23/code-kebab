# CloudNativePG operator

This repo keeps the CloudNativePG operator install separate from the
`code-kebab` application chart.

That is the safer default:

- the operator is a shared cluster-level controller
- the `code-kebab` chart should only own this app and its database cluster
- operator upgrades should be deliberate and pinned independently from app rollouts

## Install with Helm

Add the upstream chart repo:

```bash
helm repo add cloudnative-pg https://cloudnative-pg.github.io/charts
helm repo update
```

Install the operator into `cnpg-system` using the app-local `.hazyforge`
values file:

```bash
helm upgrade --install cnpg-operator cloudnative-pg/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace \
  -f .hazyforge/clusters/code-kebab/namespace/code-kebab/helm/cloudnative-pg-operator/values.yaml
```

For GitOps, pin the operator chart version in your Argo CD or Helm release
definition instead of letting application changes move the controller version.
