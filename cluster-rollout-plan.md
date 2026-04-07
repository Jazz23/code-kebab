# Cluster Rollout Plan

Bring this repo up in layers and verify each layer before moving on.

The working bootstrap contract in this repo is:

- app values: `.hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml`
- cluster bootstrap Kustomize: `.hazyforge/clusters/code-kebab/namespace/code-kebab/kustomize/`
- External Secrets Helm values:
  `.hazyforge/clusters/code-kebab/namespace/code-kebab/helm/external-secrets/values.yaml`
- CloudNativePG operator Helm values:
  `.hazyforge/clusters/code-kebab/namespace/code-kebab/helm/cloudnative-pg-operator/values.yaml`

`scripts/apply-k8s.sh` is the orchestration layer. Keep the sequencing there
instead of pushing rollout control into the chart.

## Layer 1: Core CRDs

- apply `crds/` from the resolved cluster Kustomize directory
- verify Gateway API CRDs are established
- verify cert-manager CRDs are established

This gives later controllers their API surface before workloads start.

Gateway API compatibility note:

- the repo pins Gateway API CRDs to the `v1.5.1` standard bundle
- the bootstrap Kustomize layer explicitly patches the `TLSRoute` CRD so
  `v1alpha2` stays served alongside `v1`
- Cilium `1.19.x` still expects `TLSRoute` to be served at
  `gateway.networking.k8s.io/v1alpha2`
- if the cluster already has a newer Gateway API bundle where the `TLSRoute`
  CRD only serves `v1`, Cilium's Gateway controller can fail to start even
  though `GatewayClass/cilium` exists
- the practical recovery is to serve `v1alpha2` again on the live
  `tlsroutes.gateway.networking.k8s.io` CRD, then restart
  `deployment/cilium-operator` and `ds/cilium`

## Layer 2: Core Controllers

- apply `cert-manager/`
- apply `hcloud-controller/`
- apply `hcloud-csi/`
- wait for cert-manager deployments to become ready
- wait for Hetzner cloud controller deployment to become ready
- wait for Hetzner CSI controller deployment and node daemonset to become ready

This is the shared cluster substrate. Do not mix it with database or
application rollout.

What mattered in practice:

- the single node stayed tainted with
  `node.cloudprovider.kubernetes.io/uninitialized=true:NoSchedule` until the
  Hetzner cloud controller could start successfully
- if `kube-system/hcloud` contains an invalid token, the cloud controller and
  CSI controller both fail and later layers stall behind scheduling or volume
  provisioning

## Layer 3: Secret Plumbing

- install the `external-secrets` Helm release with the repo-local values file
- verify the External Secrets CRDs and deployments are ready
- create or update `external-secrets/azurekv-sp-secret`
- apply `external-secrets-store/`
- verify `ClusterSecretStore/azurekv-cluster-secret-store` is `Ready`

Required secret chain:

1. `external-secrets/azurekv-sp-secret`
   Contains the Entra client ID and client secret used to authenticate to Azure
   Key Vault.
2. `ClusterSecretStore/azurekv-cluster-secret-store`
   Uses that Azure secret to reach Key Vault.
3. downstream `ExternalSecret` resources
   Pull concrete secrets such as the Hetzner token and Cloudflare token.
4. runtime `Secret` resources
   Materialized Kubernetes secrets consumed by controllers and the app.

Working configuration from this rollout:

- `azurekv-cluster-secret-store` must allow these namespaces:
  `kube-system`, `cert-manager`, `external-secrets`, `code-kebab`
- the live vault URL that worked is `https://code-kebab.vault.azure.net/`
- the Hetzner token `ExternalSecret` should target `kube-system/hcloud`
- the Key Vault remote key for that secret is `secret/hetzner-token`
- the Cloudflare token remote key is `secret/cloudflare-api`

Important implication:

- cert-manager DNS-01 can only work after External Secrets is healthy, the Azure
  auth secret exists, the ClusterSecretStore is ready, and
  `cert-manager/cloudflare-token` has been materialized
- Hetzner infrastructure can only recover after `kube-system/hcloud` has been
  refreshed with a valid token

If the Hetzner token is fixed via External Secrets after the controllers have
already started with a bad value, restart these deployments so they pick up the
new secret:

- `deployment/hcloud-cloud-controller-manager` in `kube-system`
- `deployment/hcloud-csi-controller` in `kube-system`

## Layer 4: CloudNativePG Operator

- install the `cnpg-operator` Helm release
- verify the `clusters.postgresql.cnpg.io` CRD exists
- verify the operator deployment is ready

The operator is cluster infrastructure. Install it before any app database
objects are created.

## Layer 5: Application Database Cluster

- render `templates/cnpg-cluster.yaml` from the chart and apply only that
- wait for the CNPG cluster `Ready` condition
- wait for the generated `<cluster-name>-app` secret

This stage proves storage, operator reconciliation, and database bootstrap
before the application is introduced.

What mattered in practice:

- the CNPG cluster object can be created before storage is healthy
- the real gate is PVC provisioning on `hcloud-volumes`
- if the Hetzner CSI controller still has a bad token, PVCs remain `Pending`,
  the CNPG init pod remains `Pending`, and the generated app secret never
  appears

## Layer 6: App-Local HazyForge Kustomize

- if `.hazyforge/clusters/code-kebab/namespace/code-kebab/kustomize/kustomization.yaml`
  exists, apply it

Use this only for repo-local namespaced material that belongs with the app
handoff surface. Do not duplicate shared bootstrap assets here.

## Layer 7: Application

- verify required app secrets already exist
- run the full Helm install or upgrade only after the database layer is working
- wait for the application deployment to be ready
- if rendered, wait for app-level `ExternalSecret` resources
- if rendered, wait for app-level `ClusterIssuer` resources
- if rendered, wait for app-level `Certificate` resources

The application is always the last layer.

## App Secrets To Account For

Current `code-kebab` deployment expectations:

- `code-kebab-env`
  Required by `envFromSecrets` in the app values file.
- generated CNPG app secret
  Produced by CloudNativePG after the database cluster is ready and consumed as
  `DATABASE_URL` when `cnpg.enabled=true`.
- `cert-manager/cloudflare-token`
  Materialized by External Secrets from Azure Key Vault and consumed by
  cert-manager DNS-01.

## Known Recovery Points

- If the cluster bootstrap Kustomize assets are not present under
  `kustomize/cluster`, use the app-local `.hazyforge/.../kustomize/` path.
  `scripts/apply-k8s.sh` now resolves that automatically.
- If the node is blocked on the cloud-provider initialization taint and you are
  diagnosing a single-node bootstrap failure, a temporary untaint can let
  non-cloud workloads schedule, but the real fix is still a valid Hetzner token
  and healthy Hetzner controllers.
- If an `ExternalSecret` reports `SecretSyncedError`, inspect both the
  `ExternalSecret` events and the `external-secrets` controller logs. In this
  rollout the useful failures were:
  `ForbiddenByRbac` from Azure Key Vault and wrong vault URL / wrong remote key
  configuration.

## Working Rule

Do not install everything at once.

The correct sequence is:

1. shared cluster infrastructure
2. secret plumbing
3. database operator
4. database cluster
5. optional app-local Kustomize
6. application
