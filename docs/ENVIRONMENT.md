# Environment Variables

## Required (local/dev)

| Variable | Purpose | Evidence |
| --- | --- | --- |
| DATABASE_URL | Primary database connection string. | api/db/schema.prisma#L7-L11, .env.defaults#L8-L9 |

## Auth / Sessions (defaults provided)

| Variable | Purpose | Evidence |
| --- | --- | --- |
| SESSION_SECRET | Default session secret exists in `.env.defaults`; override in `.env` if needed. | .env.defaults#L20-L21 |

## Email (password reset)

| Variable | Purpose | Evidence |
| --- | --- | --- |
| SMTP_HOST | SMTP host for password reset emails. | api/src/functions/auth.js#L29-L36, .env.example#L7-L12 |
| SMTP_PORT | SMTP port for password reset emails. | api/src/functions/auth.js#L29-L36, .env.example#L7-L12 |
| SMTP_USER | SMTP username for password reset emails. | api/src/functions/auth.js#L29-L36, .env.example#L7-L12 |
| SMTP_PASS | SMTP password for password reset emails. | api/src/functions/auth.js#L29-L36, .env.example#L7-L12 |

## Optional / Tooling

| Variable | Purpose | Evidence |
| --- | --- | --- |
| PRISMA_HIDE_UPDATE_MESSAGE | Suppress Prisma CLI update notification. | .env.defaults#L13-L14 |
| LOG_LEVEL | API-side logger verbosity. | .env.defaults#L16-L19 |
| TEST_DATABASE_URL | Test database connection string for scenarios. | .env.defaults#L11-L12 |
| NODE_ENV | Runtime environment (default set for local development). | .env.defaults#L20-L22 |
