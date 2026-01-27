# PLAN

## Current State
- Redwood app configured with web title, ports, and Netlify functions API URL. (evidence: redwood.toml#L8-L14)
- Netlify build uses `yarn rw build`, outputs `web/dist` and `api/dist/functions`, and pins Node 25; Netlify dev proxies web on 8910. (evidence: netlify.toml#L1-L26)
- Workspace setup uses Node 25.x and Yarn 4.6.0 with Redwood 8.9.0 packages. (evidence: package.json#L1-L47, api/package.json#L1-L13, web/package.json#L1-L35)
- Web routing covers login/signup/reset-password plus dashboard, bookings CRUD, asset tracker, project tracker, office supplies, and admin routes with role gating. (evidence: web/src/Routes.jsx#L18-L54)
- DbAuth is wired for web auth and used by the login form. (evidence: web/src/auth.js#L1-L5, web/src/pages/LoginPage/LoginPage.jsx#L15-L35)
- API uses DbAuth handler and SMTP for password reset emails. (evidence: api/src/functions/auth.js#L1-L208)
- Prisma schema targets PostgreSQL and defines models for users/roles, bookings, attendance, vacation, assets, projects, and office supplies. (evidence: api/db/schema.prisma#L7-L449)
- Seed scripts exist for asset data and office supply data. (evidence: scripts/seed.js#L1-L112, scripts/seedOfficeSupplies.js#L1-L120)

## Unknowns / Gaps
- Office supplies seed should be included in default seed flow; pending implementation (PT-006). (evidence: docs/PBI-Sarath.md#L1-L13, package.json#L25-L27, scripts/seedOfficeSupplies.js#L1-L120)
- Whether SMTP credentials are available/required for password reset flows in production. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27, docs/TODO.md#L1)
- Purpose and current validity of archived Supabase/Azure checklist (contains production URLs that are not currently verified). (evidence: docs/archive/check-auth-config.md#L1-L49, docs/TODO.md#L2)

## Decisions (Recorded)
- Auth source of truth: DbAuth; Supabase/Azure artifacts removed. (evidence: web/src/auth.js#L1-L5, redwood.toml#L8-L11, package.json#L9-L47)

## Risks
- Password reset depends on SMTP env vars; missing credentials will cause runtime failures. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27)
- Office supplies seed script deletes existing data before reseeding, which could wipe production data if run against a shared DB. (evidence: scripts/seedOfficeSupplies.js#L7-L15)
- Redwood quick start lists Node 20.x while the project standard is 25.x; monitor compatibility. (evidence: package.json#L22-L24, docs/PROJECT_NOTES.md#L183-L186)

## Production Readiness Checklist
- [ ] Confirm Node 25.x and Yarn 4.6.0 toolchain alignment. (evidence: package.json#L23-L30, netlify.toml#L6-L8)
- [ ] Verify PostgreSQL `DATABASE_URL` is set and reachable. (evidence: api/db/schema.prisma#L7-L11)
- [ ] Apply Prisma migrations and generate client. (evidence: api/db/schema.prisma#L1-L5)
- [ ] Validate DbAuth login flow. (evidence: web/src/auth.js#L1-L5, web/src/pages/LoginPage/LoginPage.jsx#L15-L35)
- [ ] Validate SMTP setup for password reset flow. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27)
- [ ] Seed baseline data for assets and office supplies as needed. (evidence: scripts/seed.js#L1-L112, scripts/seedOfficeSupplies.js#L1-L120)
- [ ] Run `yarn rw build` to confirm production build. (evidence: netlify.toml#L1-L4)

## Milestones
1) Baseline audit + environment confirmation (toolchain, DB, build). (evidence: package.json#L23-L30, api/db/schema.prisma#L7-L11, netlify.toml#L1-L4)
2) Auth alignment (DbAuth only; Supabase/Azure removed). (evidence: web/src/auth.js#L1-L5, redwood.toml#L8-L11, package.json#L9-L47)
3) Production data + review flow hardening (seed assets/office supplies, validate routes). (evidence: scripts/seed.js#L1-L112, scripts/seedOfficeSupplies.js#L1-L120, web/src/Routes.jsx#L18-L54)

## Dependencies
- PostgreSQL database reachable via `DATABASE_URL`. (evidence: api/db/schema.prisma#L7-L11)
- Node 25.x + Yarn 4.6.0 for local and Netlify builds. (evidence: package.json#L23-L30, netlify.toml#L6-L8)
- Netlify build/deploy configuration. (evidence: netlify.toml#L1-L26)
- SMTP service credentials for email workflows. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27)
