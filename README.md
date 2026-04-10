This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Postgres

This repo includes a `compose.yml` for PostgreSQL 18.

Start it with:

```bash
docker compose up -d
```

Default connection settings:

```text
host=localhost
port=5432
database=ckebab
user=kebab
password=7b992bb4c32ef2bf8ec30818f7e75e02c34756120cc38011
```

App connection string:

```text
DATABASE_URL=postgresql://kebab:7b992bb4c32ef2bf8ec30818f7e75e02c34756120cc38011@localhost:5432/ckebab
```

## Authentication

The app now uses ZITADEL OIDC through Auth.js.

Required env vars:

```text
AUTH_SECRET=...
AUTH_ZITADEL_ISSUER=https://hazyforge1-azsbgb.us1.zitadel.cloud
AUTH_ZITADEL_ID=...
```

Optional env var for confidential clients (not needed for PKCE flows):

```text
AUTH_ZITADEL_SECRET=...
```

Important issuer rule:

- `AUTH_ZITADEL_ISSUER` should point at the ZITADEL issuer domain that serves discovery and the authorization flow
- the Auth.js callback still lives on this app at `https://<your-app-domain>/api/auth/callback/zitadel`
- if users should see `auth.hazyforge.io` during sign-in, configure `auth.hazyforge.io` as the ZITADEL custom domain and use that as `AUTH_ZITADEL_ISSUER`

External login apps can start the Zitadel flow by redirecting into this app at:

```text
https://<your-app-domain>/api/auth/start?callbackUrl=https://<your-app-domain>/
```

This will forward the request to the built-in NextAuth Zitadel sign-in route and preserve the callback URL.

For local development, if the ZITADEL vars are omitted, the app falls back to
the seeded credentials login:

```text
email=alex@example.com
password=password
```

pgAdmin runs at `http://localhost:5050` by default with:

```text
email=admin@local.com
password=admin
```

The host ports are configurable with `POSTGRES_PORT` and `PGADMIN_PORT`.

## Kubernetes

This repo now includes a Helm chart at `charts/code-kebab`.

There are also cluster install assets under `kustomize/cluster` for Gateway API
CRDs, cert-manager, Hetzner CCM, and Hetzner CSI. External Secrets and the
CloudNativePG operator are installed directly with Helm using values files that
live under the app-local `.hazyforge` contract.

Recommended split:

- keep the CloudNativePG operator installation separate from the app chart
- let the app chart own this app and, optionally, its CNPG `Cluster` resource
- keep Hetzner CCM, Hetzner CSI, Gateway API CRDs, cert-manager, and external-secrets out of the app chart

The operator install assets live in
`.hazyforge/clusters/code-kebab/namespace/code-kebab/helm/cloudnative-pg-operator/`.

External Secrets Helm values live at
`.hazyforge/clusters/code-kebab/namespace/code-kebab/helm/external-secrets/values.yaml`.

App-specific deployment customization follows the HazyForge convention under
`.hazyforge/clusters/code-kebab/namespace/code-kebab/`.

That app-local deployment layer can include:

- `deploy.yaml` for the Helm-driven entrypoint
- `helm/` for values files used by supporting Helm releases installed by the
  bootstrap flow
- `kustomize/` for app-specific Kustomize material that should travel with the
  `.hazyforge` contract

Quick path:

```bash
./scripts/apply-k8s.sh
```

To continue through the database and application layers, pass a real values
file:

```bash
./scripts/apply-k8s.sh .hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml
```

The script applies, in order:

1. core CRDs
2. core controllers: cert-manager, Hetzner CCM, and Hetzner CSI
3. secret plumbing: external-secrets, `external-secrets/azurekv-sp-secret`, and `azurekv-cluster-secret-store`
4. CloudNativePG operator
5. CloudNativePG database cluster for the app
6. optional app-local `.hazyforge/.../kustomize`
7. the application release

The script waits for each layer to become ready before advancing. The layering
stays in the script; the chart itself is kept simple.

By default the chart can create a dedicated CloudNativePG `Cluster` for this app
and wire `DATABASE_URL` from the generated application secret. If you already
have a database provisioned elsewhere, disable `cnpg.enabled` and point the chart
at an existing secret containing `DATABASE_URL`.

A repo-local app values file with sane defaults lives at

`.hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml`. It assumes:

- hostname `code-kebab.dev`
- existing `ClusterIssuer` named `letsencrypt-prod`
- optional `ExternalSecret` can create `cert-manager/cloudflare-token` from Azure Key Vault
- existing app env secret named `code-kebab-env`

Optional app-local Kustomize customizations can live alongside it at

`.hazyforge/clusters/code-kebab/namespace/code-kebab/kustomize/`

Use that folder for namespaced, app-specific overlays or extra manifests that
belong in the `.hazyforge` deployment layer instead of the shared
`kustomize/cluster` bootstrap assets.

`scripts/apply-k8s.sh` will create or update `external-secrets/azurekv-sp-secret`
from terminal input. The Entra client secret is always entered interactively;
it is not loaded from `.env`. You can still preseed the non-secret client ID
with `AZUREKV_CLIENT_ID` or `ENTRA_CLIENT_ID`, or force replacement with
`FORCE_AZUREKV_SECRET=1`.

The Azure Key Vault secret chain matters:

- `external-secrets/azurekv-sp-secret` authenticates to Azure Key Vault
- `azurekv-cluster-secret-store` depends on that secret
- the app-level Cloudflare `ExternalSecret` depends on that store
- cert-manager DNS-01 depends on the resulting `cert-manager/cloudflare-token`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
