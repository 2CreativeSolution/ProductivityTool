# WORK_LOG

## Shekhar

| Date | Work Item | Summary | Evidence |
| --- | --- | --- | --- |
| 2026-01-27 | PT-005 | Removed Supabase/Azure artifacts and cleaned docs/config | package.json; web/package.json; api/package.json; redwood.toml; docs/PROJECT_NOTES.md |
| 2026-01-27 | PT-007 | Recorded SMTP verification gap for reset flow | docs/TODO.md; docs/TECHNICAL_CHALLENGES.md |
| 2026-01-27 | PT-003 | Split PBIs into owner-specific files | docs/PBI-Shekhar.md; docs/PBI-Sarath.md |
| 2026-01-27 | PT-009 | Validated review flow against dashboard/routes | web/src/Routes.jsx; web/src/pages/DashboardPage/DashboardPage.jsx |
| 2026-01-27 | PT-012 | Documented environment variables and linked from README | docs/ENVIRONMENT.md; README.md |
| 2026-01-27 | PT-019 | Attempted build; failed due to Node 20.x requirement | docs/TECHNICAL_CHALLENGES.md |
| 2026-01-27 | PT-021 | Updated Node/Redwood versions and installed deps | .nvmrc; package.json; api/package.json; web/package.json; netlify.toml; yarn.lock |
| 2026-01-27 | PT-021 | Ran `yarn rw dev`; API port detection failed | docs/TECHNICAL_CHALLENGES.md |
| 2026-01-27 | PT-021 | Fixed GraphQL codegen errors and verified dev server start | web/src/components/OfficeSupply/CategoryManager/CategoryManager.jsx; web/src/components/OfficeSupply/OfficeSupplyForm/OfficeSupplyForm.jsx; web/src/components/OfficeSupply/SupplyInventory/SupplyInventory.jsx; web/src/components/OfficeSupply/SupplyRequestManager/SupplyRequestManager.jsx; web/src/components/Booking/BookingForm/BookingForm.jsx |
| 2026-01-27 | PT-021 | `yarn rw build` succeeded with writable HOME override | docs/TECHNICAL_CHALLENGES.md |
| 2026-01-27 | PT-021 | Documented Node 25.x standard vs Redwood quick start 20.x | README.md; docs/PROJECT_NOTES.md; docs/PLAN.md |
| 2026-01-27 | PT-021 | Fixed `yarn rw check` blockers (SDL cleanup + env config) | api/src/graphql/bookings.sdl.js; api/src/graphql/supplyRequests.sdl.js; .env.defaults; redwood.toml |
| 2026-01-27 | PT-021 | `yarn rw check` now passes cleanly | docs/TECHNICAL_CHALLENGES.md |
| 2026-01-27 | PT-021 | Added new hire setup + contributing docs; updated README | docs/GETTING_STARTED.md; docs/CONTRIBUTING.md; README.md |
| 2026-01-27 | PT-021 | Ignored local cache folders in git | .gitignore |
| 2026-01-30 | PT-022 | Removed unused Capacitor dependencies and references | package.json; web/package.json; yarn.lock; docs/PROJECT_NOTES.md |
| 2026-01-30 | PT-023 | Added rule to avoid unsolicited dependency warning commentary | AGENTS.md |
| 2026-01-30 | PT-024 | Added default admin seed with env overrides for first-run setup | scripts/seed.js; docs/ENVIRONMENT.md; docs/GETTING_STARTED.md |
| 2026-01-31 | PT-025 | Fixed office supplies seed to align with SupplyRequest fields | scripts/seedOfficeSupplies.js; docs/TECHNICAL_CHALLENGES.md |
| 2026-01-31 | PT-026 | Highlighted default admin seed log output | scripts/seed.js |
| 2026-01-31 | PT-027 | Added divider lines around admin seed log output | scripts/seed.js |
| 2026-01-31 | PT-028 | Removed unused variable in asset seed loop | scripts/seed.js |
| 2026-01-31 | PT-029 | Added blank lines between seed sections for readability | scripts/seed.js; scripts/seedOfficeSupplies.js |
| 2026-02-04 | PT-030 | Upgraded Tailwind to v4.1 with Vite plugin, updated CSS import, removed PostCSS/autoprefixer, fixed scaffold Tailwind reference, and removed Prettier Tailwind config | web/package.json; web/vite.config.js; web/src/index.css; web/src/scaffold.css; prettier.config.js |
| 2026-02-04 | PT-031 | Fixed AdminPanelPage gql import to prevent runtime load failure | web/src/pages/AdminPanelPage/AdminPanelPage.jsx |
| 2026-02-04 | PT-032 | Removed unused browserslist from web package config | web/package.json |
| 2026-02-04 | PT-033 | Updated user dropdown to show full name and email | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-034 | Left-aligned main nav and removed button-like styles | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-035 | Simplified mobile nav styling to plain list with separators | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-035 | Mobile nav now fills viewport height with root padding 4 | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-035 | Increased mobile nav item padding | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-035 | Reverted padding increase for nested resource items | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-036 | Added right chevron icons to nested resource items | web/src/components/Header/Header.jsx |
| 2026-02-04 | PT-037 | Added Remixicon npm package and local stylesheet import | web/package.json; web/src/index.css |
| 2026-02-04 | PT-038 | Moved react-icons dependency to web workspace | package.json; web/package.json; yarn.lock |
| 2026-02-04 | PT-039 | Redesigned login page layout with reusable brand styles and illustration | web/src/pages/LoginPage/LoginPage.jsx; web/src/styles/brand-nxa.css; web/public/login-illustration.svg |
| 2026-02-04 | PT-040 | Applied NXA auth styling to signup/forgot pages and added normal-case auth error styling | web/src/pages/SignupPage/SignupPage.jsx; web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx; web/src/styles/brand-nxa.css |
| 2026-02-04 | PT-040 | Added reusable NXA link styling with dashed hover treatment for auth links | web/src/styles/brand-nxa.css; web/src/pages/LoginPage/LoginPage.jsx; web/src/pages/SignupPage/SignupPage.jsx; web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx |
| 2026-02-05 | PT-040 | Swapped auth illustration to auth-banner.webp and removed legacy SVG | web/src/pages/LoginPage/LoginPage.jsx; web/src/pages/SignupPage/SignupPage.jsx; web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx; web/public/auth-banner.webp |
| 2026-02-05 | PT-040 | Updated auth illustration to fill panel using object-cover | web/src/styles/brand-nxa.css |
| 2026-02-05 | PT-040 | Prevented layout shift on NXA links by reserving underline space | web/src/styles/brand-nxa.css |
| 2026-02-05 | PT-040 | Restored inline login validation errors using NXA error styling | web/src/pages/LoginPage/LoginPage.jsx |
| 2026-02-05 | PT-040 | Tuned auth error spacing and color to sit closer to inputs | web/src/styles/brand-nxa.css |
| 2026-02-05 | PT-041 | Normalized auth routes to /signin and /signup; kept legacy reset/forgot routes | web/src/Routes.jsx |
| 2026-02-05 | PT-042 | Wired “Remember me” to store and restore sign-in email locally | web/src/pages/LoginPage/LoginPage.jsx |
| 2026-02-05 | PT-042 | Standardized remember-email storage key with @2CPD prefix | web/src/pages/LoginPage/LoginPage.jsx |
| 2026-02-05 | PT-042 | Centralized storage key prefixing for reuse across web app | web/src/lib/storageKeys.js; web/src/pages/LoginPage/LoginPage.jsx |
| 2026-02-05 | PT-042 | Made sign-in email field controlled to show remembered email | web/src/pages/LoginPage/LoginPage.jsx |

## Sarath

| Date | Work Item | Summary | Evidence |
| --- | --- | --- | --- |
| 2026-01-28 | PT-006 | Wired office supplies seed into standard seed flow; documented destructive warning; installed Yarn 4.6.0 via Corepack and `yarn rw build` now passes | scripts/seed.js; docs/GETTING_STARTED.md; docs/TECHNICAL_CHALLENGES.md |
| 2026-02-05 | (untracked) | Separated SMTP auth vs From addressing for SendGrid and added reset URL base env + SMTP validation | api/src/lib/emailService.js; api/src/functions/auth.js |
| 2026-02-05 | (untracked) | Branded forgot-password email with CTA link, dark CTA contrast, and expiry note; require WEB_APP_URL in prod | api/src/functions/auth.js; docs/ENVIRONMENT.md |
| 2026-02-05 | (untracked) | Restyled reset password page to match branded auth layout | web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx |
| 2026-02-05 | (untracked) | Added welcome email on signup (flag-gated), reusing SMTP/brand templates | api/src/lib/emailService.js; api/src/functions/auth.js |
| 2026-02-05 | (note) | Recorded TLS configurability gap (currently permissive STARTTLS for SendGrid) for future PT-043 work | docs/TECHNICAL_CHALLENGES.md; api/src/lib/emailService.js |
| 2026-01-28 | PT-008 | Audited DbAuth flows; fixed signup username field and forgot-password email submission; re-verified `yarn rw build` | web/src/pages/SignupPage/SignupPage.jsx; web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx |
| 2026-01-28 | PT-010 | Added feature inventory with evidence links to PLAN | docs/PLAN.md |
| 2026-01-28 | PT-011 | Reviewed Prisma schema vs migrations; no drift identified; migrations cover current models | api/db/schema.prisma; api/db/migrations |
| 2026-01-28 | PT-013 | Reviewed role gating: private routes use DbAuth; admin routes require ADMIN; services enforce requireAuth with admin checks | web/src/Routes.jsx; api/src/services/officeSupplies/officeSupplies.js; api/src/services/officeSupplyCategories/officeSupplyCategories.js; api/src/services/assetAssignments/assetAssignments.js; api/src/lib/auth.js |
| 2026-01-28 | PT-014 | Validated office supplies routes/services/schema; confirmed admin gating and request flows | web/src/Routes.jsx; api/src/services/officeSupplies/officeSupplies.js; api/src/services/officeSupplyCategories/officeSupplyCategories.js; api/src/services/supplyRequests/supplyRequests.js; api/db/schema.prisma |
| 2026-01-28 | PT-015 | Validated asset tracker routes/pages, services, and schema; checked role gating and assignment/request flows; `yarn rw build` clean; applied migrations to applywise Postgres, ran seeds, executed request→approve/assign→return flow | web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx; api/src/services/assets/assets.js; api/src/services/assetCategories/assetCategories.js; api/src/services/assetAssignments/assetAssignments.js; api/src/services/assetRequests/assetRequests.js; api/db/schema.prisma; docs/WORK_LOG.md |
| 2026-01-28 | PT-016 | Validated project tracker routes/pages, services, and schema; reviewed allocations/meetings/daily updates alignment; `yarn rw build` clean; executed live applywise DB flow (project create, allocation, meeting, daily update) | web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx; web/src/components/ProjectTracker/ProjectTracker.jsx; api/src/services/projects/projects.js; api/src/services/projectAllocations/projectAllocations.js; api/src/services/projectMeetings/projectMeetings.js; api/src/services/dailyProjectUpdates/dailyProjectUpdates.js; api/db/schema.prisma; docs/WORK_LOG.md |
| 2026-01-28 | Bugfix | Fixed deleteProjectAllocation null user error by returning pre-delete allocation data and using parent data in resolvers; `yarn rw build` clean | api/src/services/projectAllocations/projectAllocations.js |
| 2026-01-28 | Bugfix | deleteProjectAllocation now strips dailyUpdates before returning, preventing nested resolver errors when selection requests deleted child rows | api/src/services/projectAllocations/projectAllocations.js |
| 2026-01-29 | Bugfix | Signup label wired to username field to restore focus/error association | web/src/pages/SignupPage/SignupPage.jsx |
| 2026-01-29 | Bugfix | deleteProjectAllocation hardened to avoid dailyUpdates resolver errors on deleted rows | api/src/services/projectAllocations/projectAllocations.js |
| 2026-01-29 | Chore | Seed script existing-asset branch logs cleanly | scripts/seed.js |
| 2026-01-29 | Chore | Project dialogs derive data by projectId to stay in sync with refetches (allocation/details dialogs) | web/src/components/ProjectTracker/ProjectManagement.jsx; web/src/components/Dialog/ProjectDetailsDialog.jsx |
| 2026-01-28 | PT-017 | Validated attendance and vacation workflows (dashboard components, attendance/overtime/exception/vacation services, Prisma schema); `yarn rw build` clean | web/src/pages/DashboardPage/DashboardPage.jsx; web/src/components/Attendance/Attendance.jsx; web/src/components/VacationPlanner/VacationPlanner.jsx; api/src/services/attendances/attendances.js; api/src/services/attendanceBreaks/attendanceBreaks.js; api/src/services/overtimeAttendances/overtimeAttendances.js; api/src/services/vacationRequests/vacationRequests.js; api/src/services/exceptionRequests/exceptionRequests.js; api/db/schema.prisma |
| 2026-02-04 | PT-030 | Added JSON-driven seed for users/projects/allocations/meetings/daily updates with sequence reset; ran migrations and seed successfully; `yarn rw build` passes | scripts/seed.js; scripts/seed_data_2creative.json; yarn rw prisma migrate deploy; yarn rw prisma db seed; yarn rw build |
| 2026-02-04 | Bugfix | `activeProjects` filter now matches Title Case statuses so seeded projects appear in UI; reran `yarn rw build` | api/src/services/projects/projects.js; yarn rw build |
| 2026-02-04 | Bugfix | Allocation queries and Employee Management cards now treat statuses case-insensitively; hours/day seeded with default 8h to avoid zero totals | api/src/services/projectAllocations/projectAllocations.js; web/src/components/ProjectTracker/EmployeeManagement.jsx; scripts/seed.js; yarn rw prisma db seed; yarn rw build |
| 2026-02-04 | Seed | Added historical attendance (workdays past year), vacations, and exception requests for seeded users; reran seeds and build | scripts/seed.js; yarn rw prisma db seed; yarn rw build |
| 2026-02-05 | Seed | Clear attendance/vacation/exception tables before seeding to prevent duplicate inflation; reseeded successfully | scripts/seed.js; yarn rw prisma db seed |
| 2026-02-05 | Bugfix | Normalized status casing in seeds and switched project/allocation queries to case-insensitive filters; build passing after yarn install | scripts/seed.js; api/src/services/projects/projects.js; api/src/services/projectAllocations/projectAllocations.js; yarn rw build |
| 2026-02-05 | PT-012 | Added root `.env` with required DB, session, SMTP, and seed variables aligned to ENVIRONMENT.md | .env; docs/ENVIRONMENT.md; docs/CHANGELOG.md |
| 2026-02-06 | PT-043 | Centralized SMTP config (auth user vs from), fixed test-email sender, and reran `yarn rw build` successfully | api/src/lib/smtpConfig.js; api/src/lib/emailService.js; docs/CHANGELOG.md; yarn rw build |
