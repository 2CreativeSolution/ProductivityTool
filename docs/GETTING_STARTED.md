# Getting Started

This guide gets a new developer from zero to a running app on Node 25.x and local Postgres.

## 1) Node + Yarn

```bash
nvm install
nvm use
node -v   # should be v25.x
corepack enable
```

Yarn is pinned via `packageManager` in `package.json`. Use:

```bash
yarn --version
```

If `corepack` isn’t available (got error `command not found`?), install and enable it:

```bash
npm i -g corepack
corepack enable
corepack prepare yarn@4.12.0 --activate
exec $SHELL -l // or simply restart your terminal
yarn --version
```

If you see an older Yarn (e.g., 1.22), update the project pin:

```bash
yarn set version 4.12.0
```

## 2) Install dependencies

```bash
yarn install
```

## 3) Postgres setup (local)

Create a user and database (example uses user `productivity` and db `productivity_db`):

```bash
psql postgres
```

```sql
CREATE USER productivity WITH PASSWORD 'productivity_password';
CREATE DATABASE productivity_db OWNER productivity;
GRANT ALL PRIVILEGES ON DATABASE productivity_db TO productivity;
\q
```

## 4) Environment variables

Create `.env` in repo root:

```env
DATABASE_URL="postgresql://productivity:productivity_password@localhost:5432/productivity_db"
```

Defaults (like `SESSION_SECRET` and `NODE_ENV`) are already provided in `.env.defaults`.
See `docs/ENVIRONMENT.md` for the full list.

## 5) Prisma / DB setup

```bash
yarn rw prisma migrate dev
yarn rw prisma generate
yarn rw prisma db seed   # seeds assets, office supplies, and default admin (if enabled)
```

> Warning: the office supplies seed clears existing supply tables before reloading sample data. Do not run against shared/production databases.
>
> Default admin seed is enabled by default when no users exist. Override with:
> `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, or disable with `SEED_ADMIN_ENABLED=false`.

## 6) Run the app

```bash
yarn rw dev
```

- Web: http://localhost:8910
- API (GraphQL): http://localhost:8911/graphql

### If Prisma download fails (permissions)

Run with a writable HOME (local cache under the repo):

```bash
HOME=./.home yarn rw build
```

## 7) Build / checks

```bash
HOME=./.home yarn rw build
yarn rw check
```
