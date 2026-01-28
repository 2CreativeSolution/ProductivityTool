# PBI-Sarath

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

## PT-013 ⬜ Review admin/role gating coverage
- Owner: Sarath
- Scope: Web/API
- Problem: Role-based routes may not reflect actual role checks in services.
- Acceptance Criteria:
  - [ ] Routes and services role checks documented or aligned.
- Dependencies: PT-002
- Evidence: web/src/Routes.jsx, api/src/lib/auth.js
- Size: M

## PT-014 ⬜ Verify office supplies workflows end-to-end
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Office supplies module should align UI, services, and schema.
- Acceptance Criteria:
  - [ ] Routes, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/Routes.jsx, api/src/services/officeSupplies, api/db/schema.prisma
- Size: M

## PT-015 ⬜ Verify asset tracker workflows end-to-end
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Asset tracker module should align UI, services, and schema.
- Acceptance Criteria:
  - [ ] Routes/pages, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/pages/AssetTrackerPage, api/src/services/assets, api/db/schema.prisma
- Size: M

## PT-016 ⬜ Verify project tracker workflows end-to-end
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Project tracker module should align UI, services, and schema.
- Acceptance Criteria:
  - [ ] Routes/pages, services, and schema validated.
- Dependencies: PT-002
- Evidence: web/src/pages/ProjectTrackerPage, api/src/services/projects, api/db/schema.prisma
- Size: M

## PT-017 ⬜ Verify attendance and vacation workflows
- Owner: Sarath
- Scope: Web/API/DB
- Problem: Attendance/vacation modules should align UI, services, and schema.
- Acceptance Criteria:
  - [ ] Routes/pages, services, and schema validated.
- Dependencies: PT-002
- Evidence: api/src/services/attendances, api/src/services/vacationRequests, api/db/schema.prisma
- Size: M
