# syntax=docker/dockerfile:1.7

FROM oven/bun:1-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


# DEPENDENCIES ---------------------------------------------------------------

FROM base AS deps
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile


# BUILDER --------------------------------------------------------------------

FROM base AS builder
ARG DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build


# MIGRATOR -------------------------------------------------------------------

FROM base AS migrator
ARG DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock drizzle.config.ts tsconfig.json ./
COPY drizzle ./drizzle
COPY docker/migrator-entrypoint.sh ./docker/migrator-entrypoint.sh
COPY src ./src
RUN chmod +x ./docker/migrator-entrypoint.sh

ENTRYPOINT ["./docker/migrator-entrypoint.sh"]
CMD ["bun", "run", "db:migrate"]


# RUNTIME --------------------------------------------------------------------

FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
