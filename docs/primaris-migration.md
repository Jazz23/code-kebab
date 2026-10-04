# Code Kebab: Primaris migration

The destination contract is `.hazyforge/clusters/anvil-primaris/namespace/code-kebab/deploy.yaml`; `manifests/` owns its HTTPRoute and database ExternalSecret. It uses the existing `charts/code-kebab` chart. The source contract remains unchanged. The target was verified before DNS promotion; public DNS reconciliation and source retirement remain separate operator steps.

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
kubectl apply --dry-run=server --validate=strict -f .hazyforge/clusters/anvil-primaris/namespace/code-kebab/manifests/
```

Before activation, the operator must provide the target namespace, the dedicated ClusterSecretStore and its existing identity Secret, ESO namespace authorization, and the shared TLS listener `gateway/gateway: https-code-kebab` for `code-kebab.dev`. This repository is under `Jazz23`, so verify the GitHub App/repository discovery grant or create the explicit Argo chart/manifests Applications in infrastructure. The two source Secrets were present with the expected key names; target synchronization must prove the existing alias values are accessible.

Run strict server dry-run against the actual namespace once those prerequisites exist. After merge and reconciliation, verify the exact pod imageID, Secret readiness, database access from the new node egress, and existing login/API behavior. Exercise authentication through the public identity provider without creating or resetting database state. The source/target rendered container configuration and service ports/selectors were compared; this is configuration evidence, not database or login proof.

The HTTPRoute is bound to `gateway/gateway`. During preflight it used `external-dns.alpha.kubernetes.io/controller: migration-preflight` to hold DNS. After the following target proof, the promotion change removes that annotation so the installed DNS controller can publish `code-kebab.dev` from the Primaris Gateway. Verify authoritative DNS and normal public HTTPS after reconciliation, then retire the source in its own reviewed change. The source remains at one replica during promotion.

## Verified target before DNS promotion, 2026-10-04

Source and target database/auth Secret values and loaded environment values were compared without exposing credentials and matched. The target initially returned SQLSTATE `28000`: the existing external PostgreSQL host rejected the encrypted connection from its new worker address. The reviewed [Primaris access procedure](https://github.com/HazyForge/anvil-primaris/blob/master/docs/code-kebab-postgres-migration.md) added one marked TLS/SCRAM `/32` rule for the same existing database and role, retaining all old source rules, file ownership and mode. PostgreSQL parser validation passed before reload.

At 07:19:59 UTC, the same original target Pod `code-kebab-56fb5f7dbc-nmqgq` on `anvil-primaris-worker-nbg1-2` passed its native read-only `SELECT 1`. At 07:20:44 UTC, trusted-TLS `curl --disable --noproxy '*' --resolve` probes for `code-kebab.dev` confirmed the actual source Gateway IP `49.13.40.142` and target Gateway IP `5.161.160.74`; all six responses were HTTP 200 with TLS verification result zero. Source and target bodies matched exactly:

| Path | Bytes | SHA256 |
| --- | ---: | --- |
| `/` | 37,326 | `c9053640bc918fce9728ab5ea388ce39a70574e37f726dc58c1711a40a254366` |
| `/_next/static/chunks/06bk-uq27qp8g.css` | 66,045 | `2e96a04e5758d2ab4930ec829f55d8b6f2d7605db1c3f3e4e237e5a0d0e82acb` |
| `/_next/static/chunks/0wd199q_ifsey.js` | 33,059 | `854045fc642c452aec029a5f8479689b100d9616ea4dd0c9455c88d457fdb1f8` |

This proves target database connectivity and the recorded public page/assets. It does not establish a completed identity-provider login or public DNS cutover. The target's node selector includes the verified `anvil-primaris-worker-nbg1-2` hostname, as well as its NBG site label, so a future reschedule cannot silently select a worker whose database egress has not been authorized. A later move requires its own verified database source-address policy before relaxing this restriction. The migration retains the pinned artifact and does not run database schema hooks.

The PostgreSQL access helper checks the current ready Pod and its recorded node address at plan/apply time. That check describes current execution; the hostname selector preserves the constraint across later reschedules. Keep both checks. A hostname selector change triggers a Deployment rollout, whose surge Pod still needs sufficient request capacity on this one worker before it can start; verify that slot before reconciling the placement change.

## Later releases

Use the existing tagged artifact workflow when a release is explicitly requested. Once the artifact exists, update the Primaris contract's `image.tag` and immutable `image.digest` together. The chart uses `repository@digest` whenever the digest is populated. A tag-only edit will not replace the pinned runtime. A migration image/schema hook requires its own authorized database change; keep it disabled for this cluster adoption.
