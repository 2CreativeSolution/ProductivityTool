# PLAN

## Current State
- Redwood app configured with web title, ports, and Netlify functions API URL. (evidence: redwood.toml#L8-L14)
- Netlify build uses `yarn rw build`, outputs `web/dist` and `api/dist/functions`, and pins Node 25; Netlify dev proxies web on 8910. (evidence: netlify.toml#L1-L26)
- Workspace setup uses Node 25.x and Yarn 4.6.0 with Redwood 8.9.0 packages. (evidence: package.json#L1-L47, api/package.json#L1-L13, web/package.json#L1-L35)
- Web routing covers signin/signup/forgot-password/reset-password plus dashboard, bookings CRUD, asset tracker, project tracker, office supplies, and admin routes with role gating. (evidence: web/src/Routes.jsx#L18-L54)
- Settings now includes account profile and password-change routes under `/settings/*`, with sidebar access for authenticated users. (evidence: web/src/Routes.jsx#L50-L52, web/src/components/AppSidebar/AppSidebar.jsx#L86-L105)
- DbAuth is wired for web auth and used by the login form. (evidence: web/src/auth.js#L1-L5, web/src/pages/LoginPage/LoginPage.jsx#L15-L35)
- API uses DbAuth handler and SMTP for password reset emails. (evidence: api/src/functions/auth.js#L1-L208)
- Account emails (reset/welcome/password-changed confirmation) now share a reusable template and centralized delivery helpers. (evidence: api/src/lib/emailService.js#L124-L249, api/src/lib/emailService.js#L1302-L1337)
- Prisma schema targets PostgreSQL and defines models for users/roles, bookings, attendance, vacation, assets, projects, and office supplies. (evidence: api/db/schema.prisma#L7-L449)
- Seed scripts cover assets, office supplies, and JSON-imported users/projects/allocations/meetings/daily updates with sequence reset and configurable seeded-user password. (evidence: scripts/seed.js#L1-L320, scripts/seed_data_2creative.json)
- Status casing is normalized in project/allocations UI and services so seeded statuses (e.g., "Active", "On Hold") display correctly; allocations seeded without hours default to 8h. (evidence: api/src/services/projects/projects.js; api/src/services/projectAllocations/projectAllocations.js; web/src/components/ProjectTracker/EmployeeManagement.jsx; scripts/seed.js)
- Attendance, vacations, and exception requests are now seeded for the past year to populate dashboard widgets. (evidence: scripts/seed.js)

## Feature Inventory (with evidence)
- Authentication: DbAuth login/signup/forgot/reset wired via web auth client and auth pages; server handled by DbAuth function. (evidence: web/src/auth.js#L1-L5, web/src/pages/LoginPage/LoginPage.jsx#L15-L71, web/src/pages/SignupPage/SignupPage.jsx#L15-L118, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx#L11-L84, api/src/functions/auth.js#L1-L208)
- Account security settings: authenticated users can change password from Settings; API validates current password and rotates stored hash+salt on success. (evidence: web/src/pages/User/ChangePasswordPage/ChangePasswordPage.jsx#L1-L27, web/src/components/Settings/ChangePasswordForm/ChangePasswordForm.jsx#L8-L285, api/src/graphql/users.sdl.js#L99-L119, api/src/services/users/users.js#L207-L275)
- Dashboard: consolidated view for attendance/vacation summaries and shortcuts. (evidence: web/src/pages/DashboardPage/DashboardPage.jsx#L1-L210)
- Meeting room bookings: CRUD pages and API services for bookings/rooms. (evidence: web/src/pages/Booking/BookingsPage/BookingsPage.jsx#L1-L115, web/src/pages/Booking/NewBookingPage/NewBookingPage.jsx#L1-L42, api/src/services/bookings/bookings.js#L1-L140, api/src/services/meetingRooms/meetingRooms.js#L1-L77)
- Asset tracker: asset list and category management with services. (evidence: web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx#L1-L155, api/src/services/assets/assets.js#L1-L150, api/src/services/assetCategories/assetCategories.js#L1-L118)
- Office supplies: inventory, requests, and admin review flows. (evidence: web/src/pages/OfficeSupply/OfficeSupplyInventoryPage/OfficeSupplyInventoryPage.jsx#L1-L120, web/src/pages/OfficeSupply/SupplyRequestsPage/SupplyRequestsPage.jsx#L1-L108, web/src/pages/OfficeSupply/AdminSupplyRequestsPage/AdminSupplyRequestsPage.jsx#L1-L86, api/src/services/officeSupplies/officeSupplies.js#L1-L138, api/src/services/supplyRequests/supplyRequests.js#L1-L152)
- Project tracker: project list and allocation/meeting services. (evidence: web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx#L1-L160, api/src/services/projects/projects.js#L1-L152, api/src/services/projectAllocations/projectAllocations.js#L1-L126, api/src/services/projectMeetings/projectMeetings.js#L1-L120)
- Attendance & overtime: tracking services with breaks support; surfaced on dashboard. (evidence: api/src/services/attendances/attendances.js#L1-L152, api/src/services/attendanceBreaks/attendanceBreaks.js#L1-L102, api/src/services/overtimeAttendances/overtimeAttendances.js#L1-L144)
- Vacation and exceptions: vacation request CRUD and exception requests. (evidence: api/src/services/vacationRequests/vacationRequests.js#L1-L146, api/src/services/exceptionRequests/exceptionRequests.js#L1-L112)
- Admin/role panels: role-specific panels and role helper logic. (evidence: web/src/pages/AdminPanelPage/AdminPanelPage.jsx#L1-L120, web/src/pages/ManagerPanelPage/ManagerPanelPage.jsx#L1-L118, web/src/pages/HRPanelPage/HRPanelPage.jsx#L1-L118, api/src/lib/auth.js#L1-L95)

## Unknowns / Gaps
- Whether SMTP credentials are available/required for password reset flows in production. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27, docs/TODO.md#L1)
- Purpose and current validity of archived Supabase/Azure checklist (contains production URLs that are not currently verified). (evidence: docs/archive/check-auth-config.md#L1-L49, docs/TODO.md#L2)
- Yarn workspace missing package (@2c/pd-root) previously blocked `yarn rw build`; resolved via `yarn install`. (evidence: docs/TECHNICAL_CHALLENGES.md#L1-L22)

## Decisions (Recorded)
- Auth source of truth: DbAuth; Supabase/Azure artifacts removed. (evidence: web/src/auth.js#L1-L5, redwood.toml#L8-L11, package.json#L9-L47)
- Preserve provided JSON IDs when seeding project-tracker data and reset Postgres sequences after manual inserts. (evidence: scripts/seed.js#L90-L203)

## Risks
- Password reset depends on SMTP env vars; missing credentials will cause runtime failures. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27)
- Office supplies seed script deletes existing data before reseeding, which could wipe production data if run against a shared DB. (evidence: scripts/seedOfficeSupplies.js#L7-L15)
- Redwood quick start lists Node 20.x while the project standard is 25.x; monitor compatibility. (evidence: package.json#L22-L24, docs/PROJECT_NOTES.md#L183-L186)
- Manual ID seeding requires sequence reset; skipping that step would break future inserts due to duplicate key errors. (evidence: scripts/seed.js#L198-L245)
- Build currently succeeds after lockfile repair (`yarn install`). (evidence: yarn rw build, docs/TECHNICAL_CHALLENGES.md#L1-L22)
- Status value casing differs between data and UI; normalized handling is now in place but regressions could hide allocations if new statuses are added without casing coverage. (evidence: api/src/services/projectAllocations/projectAllocations.js; web/src/components/ProjectTracker/EmployeeManagement.jsx)
- Seeded attendance/vacation data is synthetic; ensure production seeds align with real HR data before deploying to prod DBs. (evidence: scripts/seed.js)

## Production Readiness Checklist
- [ ] Confirm Node 25.x and Yarn 4.6.0 toolchain alignment. (evidence: package.json#L23-L30, netlify.toml#L6-L8)
- [ ] Verify PostgreSQL `DATABASE_URL` is set and reachable. (evidence: api/db/schema.prisma#L7-L11)
- [ ] Apply Prisma migrations and generate client. (evidence: api/db/schema.prisma#L1-L5)
- [ ] Validate DbAuth login flow. (evidence: web/src/auth.js#L1-L5, web/src/pages/LoginPage/LoginPage.jsx#L15-L35)
- [ ] Validate SMTP setup for password reset flow. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27)
- [x] Seed baseline data for assets, office supplies, and JSON project-tracker dataset; confirm sequences reset. (evidence: scripts/seed.js#L1-L320, scripts/seed_data_2creative.json)
- [x] Run `yarn rw build` to confirm production build. (evidence: netlify.toml#L1-L4)

## Milestones
1) Baseline audit + environment confirmation (toolchain, DB, build). (evidence: package.json#L23-L30, api/db/schema.prisma#L7-L11, netlify.toml#L1-L4)
2) Auth alignment (DbAuth only; Supabase/Azure removed). (evidence: web/src/auth.js#L1-L5, redwood.toml#L8-L11, package.json#L9-L47)
3) Production data + review flow hardening (seed assets/office supplies, validate routes). (evidence: scripts/seed.js#L1-L112, scripts/seedOfficeSupplies.js#L1-L120, web/src/Routes.jsx#L18-L54)

## Dependencies
- PostgreSQL database reachable via `DATABASE_URL`. (evidence: api/db/schema.prisma#L7-L11)
- Node 25.x + Yarn 4.6.0 for local and Netlify builds. (evidence: package.json#L23-L30, netlify.toml#L6-L8)
- Netlify build/deploy configuration. (evidence: netlify.toml#L1-L26)
- SMTP service credentials for email workflows. (evidence: api/src/functions/auth.js#L27-L46, .env.example#L7-L27)
