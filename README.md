# 2Creative Productivity Tool

Internal productivity platform built with **RedwoodJS** (web + API) and deployed on **Netlify**.
This README is intentionally **short and factual** to support a Canadian technical review and production readiness review.

Generic Redwood framework notes are preserved separately to avoid loss of knowledge.

---

## What this system does
Confirmed functional areas (based on codebase):
- Authentication
- Bookings
- Attendance
- Vacation / leave management
- Admin / role-based access (if enabled)

---

## Review flow (use this order)
1. Login
2. Create or view a booking
3. Attendance check-in / history
4. Vacation request / approval
5. Admin or role-based screen (if applicable)

---

## Local setup (reproducible)
Use the single source of truth setup guide:
- [GETTING STARTED](docs/GETTING_STARTED.md)
- [ENVIRONMENT](docs/ENVIRONMENT.md) (all required env vars)

---

## Deployment (Netlify)
- Publish directory: `web/dist`
- Functions directory: `api/dist/functions`
(Verify values against `netlify.toml`.)

## Versioning
- This repo is currently tagged as a pre-release via package versions: `1.0.0-beta` in `package.json`, `api/package.json`, and `web/package.json`.
- These packages are `private` (not published to npm). The version is primarily an internal release label; bump it when cutting beta releases (e.g. `1.0.0-beta.1`).

---

## Review / evidence documents
These files support the technical review. Keep them factual and evidence-linked.

- `docs/CONTRIBUTING.md`
- `docs/TECHNICAL_CHALLENGES.md`
- `docs/WORK_LOG.md`
- `docs/EVIDENCE_INDEX.md`
- `DESIGN_ITERATIONS/`
- `docs/PBI-Shekhar.md`
- `docs/PBI-Sarath.md`
- `docs/CHANGELOG.md`

---

## Knowledge transfer (not part of review)
Project-specific context moved to:
- `docs/PROJECT_NOTES.md`

Generic Redwood framework material moved to:
- `docs/REDWOOD_TUTORIAL_NOTES.md`
