# Agent Notes

## Stack And Layout
- Use Bun for all package scripts; this is a Next.js App Router app with React Compiler enabled in `next.config.ts`.
- Main app code is under `src/app`; server actions live in `src/app/actions`; shared UI is in `src/components`; DB schema, queries, seed, and wipe scripts are in `src/db`.
- The `@/*` import alias points at `src/*`.

## Local Setup
- Local database is `compose.yml`, not `docker-compose.yml`: run `docker compose up -d`.
- Copy `.env.example` to `.env.local`; Drizzle commands require `DATABASE_URL` and most DB scripts load `.env.local` explicitly.
- Reset local data with `bun run db:reset`; seeded users use password `password`, for example `alex@example.com`.

## Commands
- Install deps with `bun install --frozen-lockfile` when reproducing CI/container behavior.
- Dev server: `bun dev`.
- Production check/build: `bun run build`; there is no separate typecheck script.
- Lint: `bun run lint`; format/write fixes: `bun run format`.
- Full Playwright suite: `bun run test`; focused file: `bun run test tests/login.spec.ts`; focused test: `bun run test tests/login.spec.ts -g "logs in"`.
- Playwright starts `bun run build && bun run start` automatically, but it expects the local database to already be running and migrated/seeded.

## Database
- After changing `src/db/schema.ts`, run `bun run db:migrate`; this runs Drizzle generate and migrate, so keep the generated `drizzle/` SQL and metadata changes.
- `bun run db:reset` wipes, migrates, and seeds the local DB; do not use it casually against non-local `DATABASE_URL`.
- `db:migrate`, `db:generate`, `db:push`, and `db:studio` use `--env-file=.env.local`; keep `.env.local` current before running them.

## Auth And Tests
- Auth.js is configured in `src/auth.ts`; `/api/auth/start` redirects to ZITADEL only when `AUTH_ZITADEL_ISSUER` and `AUTH_ZITADEL_ID` are set.
- Local credential login is a fallback only when ZITADEL is not configured, except production can opt in with `AUTH_CREDENTIALS_FALLBACK=true`.
- Playwright helpers wait for React hydration before form interactions; use `waitForHydration` for new interactive tests to avoid native form submits before React attaches handlers.

## Deployment
- Docker builds use `output: "standalone"`; `bun run start` copies `public` and `.next/static` into `.next/standalone` before running the standalone server.
- Tagged pushes matching `v*` build and publish both app and `-migrate` images to GHCR.
- `bun run release:tag <version>` updates package/chart/deploy tags, commits, tags, and pushes; only run it when explicitly asked to perform a release.
- The Helm chart can run a pre-install/pre-upgrade migration hook, but first-time installs require the database to exist before enabling that hook.
