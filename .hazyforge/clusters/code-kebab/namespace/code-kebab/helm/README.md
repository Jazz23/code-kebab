# `helm`

This folder is reserved for Helm release values that belong with the repo-local
`.hazyforge` deployment contract.

Use it for cluster-scoped or supporting Helm releases that must be installed
alongside this app but should not live inside the app chart itself.

Current shape:

```text
.hazyforge/clusters/code-kebab/namespace/code-kebab/
  deploy.yaml
  helm/
    external-secrets/values.yaml
    cloudnative-pg-operator/values.yaml
  kustomize/
```
