#!/bin/sh
set -eu

DEFAULT_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"

if [ "${DATABASE_URL:-}" = "${DEFAULT_DATABASE_URL}" ]; then
  unset DATABASE_URL
fi

if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${DATABASE_URI:-}" ]; then
    export DATABASE_URL="${DATABASE_URI}"
  elif [ -n "${uri:-}" ]; then
    export DATABASE_URL="${uri}"
  elif [ -n "${DATABASE_FQDN_URI:-}" ]; then
    export DATABASE_URL="${DATABASE_FQDN_URI}"
  elif [ -n "${fqdn_uri:-}" ]; then
    export DATABASE_URL="${fqdn_uri}"
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  DB_HOST="${DATABASE_HOST:-${host:-}}"
  DB_PORT="${DATABASE_PORT:-${port:-}}"
  DB_NAME="${DATABASE_DBNAME:-${dbname:-}}"
  DB_USER="${DATABASE_USERNAME:-${DATABASE_USER:-${username:-${user:-}}}}"
  DB_PASSWORD="${DATABASE_PASSWORD:-${password:-}}"

  if [ -n "${DB_HOST}" ] && [ -n "${DB_PORT}" ] && [ -n "${DB_NAME}" ] && [ -n "${DB_USER}" ] && [ -n "${DB_PASSWORD}" ]; then
    export DATABASE_URL="$(DB_HOST="${DB_HOST}" DB_PORT="${DB_PORT}" DB_NAME="${DB_NAME}" DB_USER="${DB_USER}" DB_PASSWORD="${DB_PASSWORD}" bun -e 'const enc = encodeURIComponent; console.log(`postgresql://${enc(process.env.DB_USER)}:${enc(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)')"
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set and no compatible CloudNativePG env was found" >&2
  exit 1
fi

exec "$@"
