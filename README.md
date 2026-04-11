# code-kebab

A social platform for developers to share posts, collaborate on projects, and connect with each other.

**Live site: [code-kebab.dev](https://code-kebab.dev)**

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Database:** PostgreSQL 18 via [Drizzle ORM](https://orm.drizzle.team)
- **Auth:** [Auth.js](https://authjs.dev) with ZITADEL OIDC
- **Runtime:** [Bun](https://bun.sh)

## Local Development

### Prerequisites

- [Bun](https://bun.sh)
- [Docker](https://www.docker.com) (for Postgres)

### Setup

1. Start the database:

```bash
docker compose up -d
```

2. Copy and fill in environment variables (all unfilled env vars are optional):

```bash
cp .env.example .env
```

3. Run migrations and seed the database:

```bash
bun run db:reset
```

4. Start the dev server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local credentials

All test users use the password `password`. Example user:

```
email=alex@example.com
password=password
```

### Database

pgAdmin is available at `http://localhost:5050`.

## License

[MIT](LICENSE)
