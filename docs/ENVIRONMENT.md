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
| SMTP_HOST | SMTP host (required). | api/src/functions/auth.js; api/src/lib/emailService.js |
| SMTP_PORT | SMTP port (required). | api/src/functions/auth.js; api/src/lib/emailService.js |
| SMTP_USER | SMTP username (required). | api/src/functions/auth.js; api/src/lib/emailService.js |
| SMTP_PASS | SMTP password (required). | api/src/functions/auth.js; api/src/lib/emailService.js |
| SMTP_FROM | Fallback From/Reply-To address if FROM_EMAIL is not set. | api/src/lib/emailService.js |
| FROM_NAME | Display name used in outbound emails. | api/src/functions/auth.js; api/src/lib/smtpConfig.js |
| FROM_EMAIL | Primary From/Reply-To email used in outbound emails. | api/src/functions/auth.js; api/src/lib/smtpConfig.js |
| WEB_APP_URL | Base URL used in password reset and welcome emails (required). | api/src/functions/auth.js |
| WELCOME_EMAIL_ENABLED | If `true`, send a welcome email on successful signup (works in any env). | api/src/lib/emailService.js |

## Optional / Tooling

| Variable | Purpose | Evidence |
| --- | --- | --- |
| PRISMA_HIDE_UPDATE_MESSAGE | Suppress Prisma CLI update notification. | .env.defaults#L13-L14 |
| LOG_LEVEL | API-side logger verbosity. | .env.defaults#L16-L19 |
| TEST_DATABASE_URL | Test database connection string for scenarios. | .env.defaults#L11-L12 |
| NODE_ENV | Runtime environment (default set for local development). | .env.defaults#L20-L22 |

## Seed (first-run admin)

| Variable | Purpose | Evidence |
| --- | --- | --- |
| SEED_ADMIN_ENABLED | Enable default admin seed on `yarn rw prisma db seed` (default true). | scripts/seed.js |
| SEED_ADMIN_EMAIL | Admin email for seed user (default `admin@example.com`). | scripts/seed.js |
| SEED_ADMIN_PASSWORD | Admin password for seed user (default `test_password`). | scripts/seed.js |
