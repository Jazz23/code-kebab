# Code Kebab: staged Primaris migration

The destination contract is `.hazyforge/clusters/anvil-primaris/namespace/code-kebab/deploy.yaml`; `manifests/` owns its HTTPRoute and database ExternalSecret. It uses the existing `charts/code-kebab` chart. The source contract remains unchanged. This change prepares desired state and does not establish a deployed or publicly cut-over site.

## Recorded source, 2026-10-04

The Hazy Sites `code-kebab` container was running:

```text
ghcr.io/jazz23/code-kebab@sha256:255b597198de55bfa00d6802f2a9dc6e9dbb8c759102c22b00a0c1d80e971f31
```

The source tag is `hardware-accel-20260601-0858`. Public URLs, production env, port 3000, probes, security settings, image pull policy, and the 100m/256Mi request plus 1 CPU/1Gi limit are preserved. The target release name changes to the existing Primaris ApplicationSet convention, `code-kebab-chart`; its Service selector follows that release label and still exposes port 80 to container port `http`.

`DATABASE_URL` continues to come from `code-kebab-postgres:uri`. The source Secret is owned by ExternalSecret `code-kebab-postgres`, using provider alias `secret/code-kebab-postgres-uri`. Authentication continues to use `envFrom: code-kebab-authjs`, whose source owner is the same-named ExternalSecret. Its provider aliases remain `secret/authjs-secret`, `secret/auth-zitadel-issuer`, `secret/auth-zitadel-id`, `secret/auth-github-id`, and `secret/auth-github-secret`. Only provider references are tracked here. Both target ExternalSecrets preserve `code-kebab-cluster-secret-store`, which points to the existing `https://code-kebab.vault.azure.net/` vault and is restricted to namespace `code-kebab`. Infrastructure must adopt its source spec and preserve identity Secret `external-secrets/azurekv-sp-secret-code-kebab` (keys `ClientID` and `ClientSecret`) through a secret-safe transfer and durable provider-backed identity reference. The source identity Secret has no ownerReferences; it is a manual infrastructure Secret with those two keys. Metadata-only inspection found enabled aliases `code-kebab-reader-client-id` and `code-kebab-reader-client-secret` in `anvil-primaris-eastus`; these can provide durable infrastructure identity references only after the operator verifies they equal the preserved source identity. The shared Anvil vault is a different provider and must not substitute for the application source store. No manual application Secret dependency was found in the recorded container.

The destination deliberately disables CNPG, chart-created Gateway/Cloudflare credentials, and migration hooks. It connects to the existing database and does not recreate or reset it. `database.secretEnvMappings` is empty to preserve the live container's single database URL injection. No new database or load balancer is requested.

## Review and activation

Render with:

```bash
helm lint charts/code-kebab -f .hazyforge/clusters/anvil-primaris/namespace/code-kebab/deploy.yaml
helm template code-kebab-chart charts/code-kebab --namespace code-kebab -f .hazyforge/clusters/anvil-primaris/namespace/code-kebab/deploy.yaml --skip-tests
kubectl kustomize .hazyforge/clusters/anvil-primaris/namespace/code-kebab
```

Before activation, the operator must provide the target namespace, the dedicated ClusterSecretStore and its existing identity Secret, ESO namespace authorization, and the shared TLS listener `gateway/gateway: https-code-kebab` for `code-kebab.dev`. This repository is under `Jazz23`, so verify the GitHub App/repository discovery grant or create the explicit Argo chart/manifests Applications in infrastructure. The two source Secrets were present with the expected key names; target synchronization must prove the existing alias values are accessible.

Run strict server dry-run against the actual namespace once those prerequisites exist. After merge and reconciliation, verify the exact pod imageID, Secret readiness, database access from the new node egress, and existing login/API behavior. Exercise authentication through the public identity provider without creating or resetting database state. The source/target rendered container configuration and service ports/selectors were compared; this is configuration evidence, not database or login proof.

The HTTPRoute is bound to `gateway/gateway` with `external-dns.alpha.kubernetes.io/controller: migration-preflight`; the installed DNS controller ignores that mismatched controller value. Retain it while testing TLS and routing directly against the destination. DNS promotion and source retirement follow the operator's live verification.

## Later releases

Use the existing tagged artifact workflow when a release is explicitly requested. Once the artifact exists, update the Primaris contract's `image.tag` and immutable `image.digest` together. The chart uses `repository@digest` whenever the digest is populated. A tag-only edit will not replace the pinned runtime. A migration image/schema hook requires its own authorized database change; keep it disabled for this cluster adoption.
