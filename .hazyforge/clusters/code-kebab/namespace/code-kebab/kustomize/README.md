# `kustomize`

This folder is reserved for app-specific Kustomize material that should live
inside the repo-local `.hazyforge` deployment layer.

Use it for small deployment customizations that belong with this app's
cluster-aware handoff surface rather than the shared repo bootstrap assets.

Typical examples:

- a `kustomization.yaml` that composes extra namespaced resources
- patches that are specific to this deployed app
- generated or hand-authored manifests that should travel with the app's
  `.hazyforge` contract

Current app deploy contract:

- `../deploy.yaml` remains the primary Helm values entrypoint
- `../helm/` holds values for supporting Helm releases that should travel with
  the `.hazyforge` contract
- `kustomize/` is the optional Kustomize companion layer

Resulting shape:

```text
.hazyforge/clusters/code-kebab/namespace/code-kebab/
  deploy.yaml
  helm/
  kustomize/
```
