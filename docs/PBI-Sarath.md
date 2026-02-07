# PBI-Sarath

## PT-030 ✅ Seed JSON dataset across project tracker entities
- Owner: Sarath
- Scope: DB
- Problem: Provided JSON seed file is not ingested; users, projects, allocations, meetings, and daily updates are absent in new environments.
- Acceptance Criteria:
  - [x] JSON data file versioned under `scripts/seed_data_2creative.json`.
  - [x] `scripts/seed.js` imports users, projects, allocations, meetings, and daily updates idempotently.
  - [x] Reporting manager links and sequence counters are updated so follow-on inserts succeed.
  - [x] Default password for seeded users is configurable via `SEED_USER_PASSWORD` and documented in PLAN/CHANGELOG.
- Tech Notes: Use Prisma upserts with explicit IDs; reset Postgres sequences after manual inserts; keep default admin seed optional.
- Dependencies: PostgreSQL `DATABASE_URL`; Prisma client.
- Evidence: scripts/seed.js; scripts/seed_data_2creative.json
- Size: M

## PT-006 ✅ Add office supplies seed to standard seed flow
- Owner: Sarath
- Scope: DB
- Problem: Office supplies seed is not part of `yarn rw prisma db seed`.
- Acceptance Criteria:
  - [x] Standard seed invokes office supplies seed logic.
  - [x] Clear note on destructive behavior in docs.
- Dependencies: PT-002
- Evidence: package.json, scripts/seedOfficeSupplies.js
- Size: S

## PT-008 ✅ Audit auth flow consistency (DbAuth)
- Owner: Sarath
- Scope: Web/API
- Problem: Ensure DbAuth is consistently used end-to-end.
- Acceptance Criteria:
  - [x] Confirm web uses DbAuth provider and login/signup/reset.
  - [x] Confirm API auth handler and getCurrentUser are aligned.
- Dependencies: PT-005
- Evidence: web/src/auth.js, web/src/pages/LoginPage/LoginPage.jsx, api/src/functions/auth.js
- Size: S

## PT-010 ✅ Inventory key features from codebase
- Owner: Sarath
- Scope: Docs
- Problem: Feature inventory not traceable to code evidence.
- Acceptance Criteria:
  - [x] Project overview lists features with evidence links.
- Dependencies: PT-002
- Evidence: api/db/schema.prisma, web/src/pages
- Size: M

## PT-011 ✅ Validate Prisma migrations vs schema
- Owner: Sarath
- Scope: DB
- Problem: Migrations history must align with schema.
- Acceptance Criteria:
  - [x] Confirm migrations cover current schema models or document drift.
- Dependencies: PT-002
- Evidence: api/db/migrations, api/db/schema.prisma
- Size: M

## PT-013 ✅ Review admin/role gating coverage
- Owner: Sarath
- Scope: Web/API
- Problem: Role-based routes may not reflect actual role checks in services.
- Acceptance Criteria:
  - [x] Routes and services role checks documented or aligned.
- Dependencies: PT-002
- Evidence: web/src/Routes.jsx, api/src/lib/auth.js, api/src/services/officeSupplies/officeSupplies.js, api/src/services/officeSupplyCategories/officeSupplyCategories.js, api/src/services/assetAssignments/assetAssignments.js
- Size: M

## PT-014 ✅ Verify office supplies workflows end-to-end
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Office supplies module should align UI, services, and schema.
- Acceptance Criteria:
  - [x] Routes, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/Routes.jsx, api/src/services/officeSupplies/officeSupplies.js, api/src/services/officeSupplyCategories/officeSupplyCategories.js, api/src/services/supplyRequests/supplyRequests.js, api/db/schema.prisma
- Size: M

## PT-015 ✅ Verify asset tracker workflows end-to-end
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Asset tracker module should align UI, services, and schema.
- Acceptance Criteria:
  - [x] Routes/pages, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx, api/src/services/assets/assets.js, api/src/services/assetCategories/assetCategories.js, api/src/services/assetAssignments/assetAssignments.js, api/src/services/assetRequests/assetRequests.js, api/db/schema.prisma
- Size: M

## PT-016 ✅ Verify project tracker workflows end-to-end
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Project tracker module should align UI, services, and schema.
- Acceptance Criteria:
  - [x] Routes/pages, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx, web/src/components/ProjectTracker/ProjectTracker.jsx, api/src/services/projects/projects.js, api/src/services/projectAllocations/projectAllocations.js, api/src/services/projectMeetings/projectMeetings.js, api/src/services/dailyProjectUpdates/dailyProjectUpdates.js, api/db/schema.prisma
- Size: M

## PT-017 ✅ Verify attendance and vacation workflows
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Attendance/vacation modules should align UI, services, and schema.
- Acceptance Criteria:
  - [x] Routes/pages, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/pages/DashboardPage/DashboardPage.jsx; web/src/components/Attendance/Attendance.jsx; web/src/components/VacationPlanner/VacationPlanner.jsx; api/src/services/attendances/attendances.js; api/src/services/attendanceBreaks/attendanceBreaks.js; api/src/services/overtimeAttendances/overtimeAttendances.js; api/src/services/vacationRequests/vacationRequests.js; api/src/services/exceptionRequests/exceptionRequests.js; api/db/schema.prisma
- Size: M

## PT-043 ⬜ Harden SMTP/email delivery for production
- Owner: Sarath
- Scope: API/Infra/Docs
- Problem: Email delivery relies on SMTP settings that can break in production (From vs auth user mismatch, reset URL hardcoded, lax TLS).
- Acceptance Criteria:
  - [x] API email transport supports distinct auth user and From with required env validation.
  - [ ] Password reset links use env-configured base URL (no localhost in prod).
  - [ ] TLS mode is configurable with secure default for 465 or documented STARTTLS setting.
  - [ ] SendGrid (or chosen provider) tested end-to-end with evidence in WORK_LOG and logged message ID.
  - [x] Welcome email sent on successful signup using shared account-email template.
- Tech Notes:
  - Add `WEB_APP_URL` for reset links; consider `SMTP_SECURE`/port guard.
  - Keep `SMTP_FROM` required when `SMTP_USERNAME=apikey`.
- Notes:
  - TLS remains permissive for SendGrid STARTTLS; see TECHNICAL_CHALLENGES.md for follow-up.
- Dependencies: None
- Size: M
