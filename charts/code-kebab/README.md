# code-kebab Helm chart

This chart deploys the `code-kebab` app, can create a dedicated CloudNativePG
`Cluster` for the app database, and can expose the service through Gateway API.

## Recommended layout

Keep the CloudNativePG operator lifecycle separate from the app release:

- install or upgrade the operator once per cluster
- let this app chart own only the `Cluster` resource for its database

That matches the split already used in `anvil-primaris`: the operator is shared
infrastructure, while the cluster object is application state.

The bootstrap script keeps that split in the script rather than in chart
feature flags. It renders and applies the CNPG `Cluster` first, verifies it,
and only then performs the full Helm release install for the application.

## Database modes

The chart supports three modes:

1. `cnpg.enabled=true`
   The chart creates a CNPG `Cluster` and wires `DATABASE_URL` from the
   generated `<cluster-name>-app` secret.
2. `database.existingSecret.name=<secret>`
   The chart reads `DATABASE_URL` from an existing Kubernetes secret.
3. `database.url=<postgres-uri>`
   Useful for quick testing, but not recommended for production.

When the app is backed by a database secret, the chart also maps these secret
fields into the container environment:

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

These mappings are controlled by `database.secretEnvMappings`.

## Migration Job

The chart can also render a Helm-hooked migration `Job` using the dedicated
`-migrate` image.

- enable it with `migration.enabled=true`
- by default it runs as Helm hooks on `pre-install,pre-upgrade`
- the default image repository is derived from `image.repository` with
  `-migrate` appended
- the default image tag follows `migration.image.tag`, then `image.tag`, then
  `appVersion`

The migrator image is CloudNativePG-compatible. The Job can work with:

- `DATABASE_URL`
- CNPG secret key `uri`
- CNPG component fields such as `host`, `port`, `dbname`, `user`, and `password`

Important assumption:

- the migration hook expects the database to already exist before the Helm
  install or upgrade step
- that matches this repo's rollout flow, where the CNPG cluster is created and
  verified before the full app release install
- if you try to use `migration.enabled=true` with a first-time standalone Helm
  install where the database does not already exist, the pre-install hook can
  fail before the app chart creates the database cluster

## Gateway API

The chart does not use `Ingress`. If you enable `gateway.enabled`, it renders:

- a `Gateway`
- an `HTTPRoute`
- an optional app-specific `ClusterIssuer` using Cloudflare DNS-01
- an optional `Certificate` for the HTTPS listener

This assumes the cluster already has:

- Gateway API CRDs installed
- Cilium configured with Gateway API support
- cert-manager installed with `enableGatewayAPI: true`

If you enable `gateway.clusterIssuer.create`, the Cloudflare API token secret
must already exist in the cert-manager cluster resource namespace. With the
current cluster chart defaults, that namespace is `cert-manager`.

If your Gateway controller supports infrastructure-specific settings, you can
set them with `gateway.infrastructure`. For Cilium on Hetzner this is where
load balancer annotations belong.

## Install

```bash
helm upgrade --install code-kebab ./charts/code-kebab \
  --namespace code-kebab \
  --create-namespace \
  -f .hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.example.yaml
```

## Auth Secrets

Provide the Auth.js secret plus the ZITADEL OIDC settings in your app env
secret:

- `AUTH_SECRET`
- `AUTH_ZITADEL_ISSUER`
- `AUTH_ZITADEL_ID`
- `AUTH_ZITADEL_SECRET`

If you want the user-facing login page to live at a branded hostname such as
`auth.hazyforge.io`, that hostname must be configured as a ZITADEL custom
domain and used as `AUTH_ZITADEL_ISSUER`.

When using the chart-managed auth `ExternalSecret`, keep `AUTH_SECRET` on
`auth.externalSecret.secretKey`/`remoteRef` and add other Vault-backed env vars
such as `AUTH_ZITADEL_ISSUER` and `AUTH_ZITADEL_ID` under
`auth.externalSecret.extraData`.
