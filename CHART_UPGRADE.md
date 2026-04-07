# Chart Upgrade

This repo upgrades the application with the Helm chart in `charts/code-kebab`
using the repo-local values file:

- `.hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml`

## Upgrade Command

```bash
KUBECONFIG=/home/palehazy/CodingFiles/HAZYFORGE/anvil-primaris/secrets/code-kebab-kubeconfig.yaml \
helm upgrade --install code-kebab ./charts/code-kebab \
  --namespace code-kebab \
  --create-namespace \
  -f .hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml \
  --take-ownership
```

## What This Values File Currently Does

- deploys image `ghcr.io/jazz23/code-kebab:v0.0.1`
- enables the app Gateway on hostname `code-kebab.dev`
- sets Hetzner load balancer annotations under `spec.infrastructure.annotations`
- enables CNPG and expects the generated secret `code-kebab-db-app`
- loads extra app env from `code-kebab-env`

## Database Env Mapping

The chart now maps these keys from the database secret into the app container:

- `DATABASE_URL` from `uri`
- `DATABASE_DBNAME` from `dbname`
- `DATABASE_FQDN_JDBC_URI` from `fqdn-jdbc-uri`
- `DATABASE_FQDN_URI` from `fqdn-uri`
- `DATABASE_HOST` from `host`
- `DATABASE_JDBC_URI` from `jdbc-uri`
- `DATABASE_PASSWORD` from `password`
- `DATABASE_PGPASS` from `pgpass`
- `DATABASE_PORT` from `port`
- `DATABASE_URI` from `uri`
- `DATABASE_USER` from `user`
- `DATABASE_USERNAME` from `username`

## Prerequisites

Before the chart can become fully healthy, the cluster needs:

- `GatewayClass/cilium`
- a working Cilium Gateway controller
- `ClusterIssuer/letsencrypt-prod` if TLS issuance is enabled
- `cert-manager/cloudflare-token` synced through External Secrets
- a healthy CNPG cluster and generated app secret
- `code-kebab-env` present in namespace `code-kebab`

## Quick Checks

```bash
kubectl get deploy,pods -n code-kebab
kubectl get gateway,httproute,certificate -n code-kebab
kubectl get secret code-kebab-env code-kebab-db-app -n code-kebab
kubectl get externalsecret -n cert-manager cloudflare-token
kubectl get gatewayclass
```

## Notes

- If the app image changes, update `image.repository` and `image.tag` in
  `.hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml`.
- If the Gateway updates but never gets an address, that is usually a cluster
  controller problem, not a chart rendering problem.
