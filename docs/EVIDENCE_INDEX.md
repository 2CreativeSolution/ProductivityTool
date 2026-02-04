# EVIDENCE_INDEX

| ID | Artifact | Description | Evidence |
| --- | --- | --- | --- |
| E-001 | docs/PLAN.md | Evidence-based plan document | docs/PLAN.md |
| E-002 | docs/PROJECT_NOTES.md | Project-specific notes (cleaned auth references) | docs/PROJECT_NOTES.md |
| E-003 | package.json | Dependency cleanup removing Supabase/Azure | package.json |
| E-004 | api/package.json | API dependency cleanup removing Supabase auth | api/package.json |
| E-005 | web/package.json | Web dependency cleanup removing Supabase auth | web/package.json |
| E-006 | redwood.toml | Env var exposure cleanup | redwood.toml |
| E-007 | docs/archive/check-auth-config.md | Archived legacy Supabase/Azure checklist | docs/archive/check-auth-config.md |
| E-008 | api/src/functions/debug.js | Debug auth token handling cleaned | api/src/functions/debug.js |
| E-009 | api/src/functions/auth-test.js | Auth test handler cleaned | api/src/functions/auth-test.js |
| E-010 | docs/TECHNICAL_CHALLENGES.md | Challenges log created | docs/TECHNICAL_CHALLENGES.md |
| E-011 | docs/TODO.md | Open SMTP verification item and auth checklist status | docs/TODO.md |
| E-012 | web/src/pages/DashboardPage/DashboardPage.jsx | Attendance/Vacation review surface | web/src/pages/DashboardPage/DashboardPage.jsx |
| E-013 | docs/ENVIRONMENT.md | Environment variable reference | docs/ENVIRONMENT.md |
| E-014 | README.md | README link to environment doc and PBI files | README.md |
| E-015 | docs/PBI-Shekhar.md | Shekhar PBI list | docs/PBI-Shekhar.md |
| E-016 | docs/PBI-Sarath.md | Sarath PBI list | docs/PBI-Sarath.md |
| E-017 | .nvmrc | Node version update | .nvmrc |
| E-018 | netlify.toml | Netlify Node version update | netlify.toml |
| E-019 | package.json | RedwoodJS upgrades + Node engine update | package.json |
| E-020 | api/package.json | RedwoodJS API upgrades | api/package.json |
| E-021 | web/package.json | RedwoodJS web upgrades | web/package.json |
| E-022 | yarn.lock | Updated lockfile after installs | yarn.lock |
| E-023 | web/src/components/OfficeSupply/CategoryManager/CategoryManager.jsx | Unique GraphQL operation names | web/src/components/OfficeSupply/CategoryManager/CategoryManager.jsx |
| E-024 | web/src/components/OfficeSupply/OfficeSupplyForm/OfficeSupplyForm.jsx | Unique GraphQL operation names | web/src/components/OfficeSupply/OfficeSupplyForm/OfficeSupplyForm.jsx |
| E-025 | web/src/components/OfficeSupply/SupplyInventory/SupplyInventory.jsx | Unique GraphQL operation names | web/src/components/OfficeSupply/SupplyInventory/SupplyInventory.jsx |
| E-026 | web/src/components/OfficeSupply/SupplyRequestManager/SupplyRequestManager.jsx | Unique GraphQL operation names | web/src/components/OfficeSupply/SupplyRequestManager/SupplyRequestManager.jsx |
| E-027 | web/src/components/Booking/BookingForm/BookingForm.jsx | Availability query aligned with schema | web/src/components/Booking/BookingForm/BookingForm.jsx |
| E-028 | api/src/graphql/bookings.sdl.js | Removed meeting room queries from bookings SDL | api/src/graphql/bookings.sdl.js |
| E-029 | api/src/graphql/supplyRequests.sdl.js | Removed unimplemented fulfill mutation | api/src/graphql/supplyRequests.sdl.js |
| E-030 | redwood.toml | Exposed SMTP_USER to web env | redwood.toml |
| E-031 | .env.defaults | Added NODE_ENV default | .env.defaults |
| E-032 | docs/GETTING_STARTED.md | New hire setup guide | docs/GETTING_STARTED.md |
| E-033 | docs/CONTRIBUTING.md | Contributing guide | docs/CONTRIBUTING.md |
| E-034 | .gitignore | Ignore local HOME cache folder | .gitignore |
| E-035 | scripts/seed.js | Standard seed now invokes office supplies seed | scripts/seed.js |
| E-036 | docs/GETTING_STARTED.md | Added warning that office supplies seed is destructive | docs/GETTING_STARTED.md |
| E-037 | web/src/pages/SignupPage/SignupPage.jsx | DbAuth signup uses correct username field | web/src/pages/SignupPage/SignupPage.jsx |
| E-038 | web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx | DbAuth forgot-password submits email correctly | web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx |
| E-039 | docs/PLAN.md | Feature inventory with evidence links | docs/PLAN.md |
| E-040 | api/db/schema.prisma; api/db/migrations | Verified schema aligns with migration history | api/db/schema.prisma; api/db/migrations |
| E-041 | web/src/Routes.jsx | Private/admin route gating with DbAuth roles | web/src/Routes.jsx |
| E-042 | api/src/services/officeSupplies/officeSupplies.js; api/src/services/officeSupplyCategories/officeSupplyCategories.js; api/src/services/assetAssignments/assetAssignments.js; api/src/lib/auth.js | Service-level role checks and auth helpers | api/src/services/officeSupplies/officeSupplies.js; api/src/services/officeSupplyCategories/officeSupplyCategories.js; api/src/services/assetAssignments/assetAssignments.js; api/src/lib/auth.js |
| E-043 | web/src/Routes.jsx; api/src/services/officeSupplies/officeSupplies.js; api/src/services/officeSupplyCategories/officeSupplyCategories.js; api/src/services/supplyRequests/supplyRequests.js; api/db/schema.prisma | Office supplies workflows validated end-to-end (routes, services, schema) | web/src/Routes.jsx; api/src/services/officeSupplies/officeSupplies.js; api/src/services/officeSupplyCategories/officeSupplyCategories.js; api/src/services/supplyRequests/supplyRequests.js; api/db/schema.prisma |
| E-044 | web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx; api/src/services/assets/assets.js; api/src/services/assetCategories/assetCategories.js; api/src/services/assetAssignments/assetAssignments.js; api/src/services/assetRequests/assetRequests.js; api/db/schema.prisma | Asset tracker workflows validated end-to-end (routes/pages, services, schema, role checks) | web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx; api/src/services/assets/assets.js; api/src/services/assetCategories/assetCategories.js; api/src/services/assetAssignments/assetAssignments.js; api/src/services/assetRequests/assetRequests.js; api/db/schema.prisma |
| E-045 | applywise Postgres validation | Migrations deployed, seeds run, and asset request→assign→return flow exercised via Prisma script | docs/WORK_LOG.md |
| E-046 | web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx; web/src/components/ProjectTracker/ProjectTracker.jsx; api/src/services/projects/projects.js; api/src/services/projectAllocations/projectAllocations.js; api/src/services/projectMeetings/projectMeetings.js; api/src/services/dailyProjectUpdates/dailyProjectUpdates.js; api/db/schema.prisma | Project tracker workflows validated end-to-end (routes/pages, services, schema) | web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx; web/src/components/ProjectTracker/ProjectTracker.jsx; api/src/services/projects/projects.js; api/src/services/projectAllocations/projectAllocations.js; api/src/services/projectMeetings/projectMeetings.js; api/src/services/dailyProjectUpdates/dailyProjectUpdates.js; api/db/schema.prisma |
| E-047 | applywise Postgres project tracker flow | Created project (code PT-E2E-1769623994190), allocation, meeting, and daily update via Prisma against applywise DB to exercise project tracker services | docs/WORK_LOG.md |
| E-048 | api/src/services/projectAllocations/projectAllocations.js | Fix deleteProjectAllocation to return pre-deletion data and avoid non-null user resolver errors; resolvers now use parent data | api/src/services/projectAllocations/projectAllocations.js |
| E-049 | web/src/pages/DashboardPage/DashboardPage.jsx; web/src/components/Attendance/Attendance.jsx; web/src/components/VacationPlanner/VacationPlanner.jsx; api/src/services/attendances/attendances.js; api/src/services/attendanceBreaks/attendanceBreaks.js; api/src/services/overtimeAttendances/overtimeAttendances.js; api/src/services/vacationRequests/vacationRequests.js; api/src/services/exceptionRequests/exceptionRequests.js; api/db/schema.prisma | Attendance and vacation workflows validated (pages/components, services, schema) | web/src/pages/DashboardPage/DashboardPage.jsx; web/src/components/Attendance/Attendance.jsx; web/src/components/VacationPlanner/VacationPlanner.jsx; api/src/services/attendances/attendances.js; api/src/services/attendanceBreaks/attendanceBreaks.js; api/src/services/overtimeAttendances/overtimeAttendances.js; api/src/services/vacationRequests/vacationRequests.js; api/src/services/exceptionRequests/exceptionRequests.js; api/db/schema.prisma |
| E-050 | api/src/services/projectAllocations/projectAllocations.js | Delete mutation now strips dailyUpdates before returning to avoid resolver errors on deleted rows | api/src/services/projectAllocations/projectAllocations.js |
| E-051 | web/src/pages/SignupPage/SignupPage.jsx | Signup label wired to username field (fixes label/input/error association) | web/src/pages/SignupPage/SignupPage.jsx |
| E-052 | api/src/services/projectAllocations/projectAllocations.js | DailyUpdates returned payload hardened to avoid resolver errors after allocation delete | api/src/services/projectAllocations/projectAllocations.js |
| E-053 | scripts/seed.js | Seed script cleaned up existing-asset log branch | scripts/seed.js |
| E-054 | web/src/components/ProjectTracker/ProjectManagement.jsx; web/src/components/Dialog/ProjectDetailsDialog.jsx | Project dialogs derive data by projectId to stay in sync with refetches | web/src/components/ProjectTracker/ProjectManagement.jsx; web/src/components/Dialog/ProjectDetailsDialog.jsx |
| E-055 | package.json; web/package.json; yarn.lock; docs/PROJECT_NOTES.md | Removed unused Capacitor dependencies and references | package.json; web/package.json; yarn.lock; docs/PROJECT_NOTES.md |
| E-056 | AGENTS.md | Added instruction to avoid unsolicited dependency warning commentary | AGENTS.md |
| E-057 | scripts/seed.js; docs/ENVIRONMENT.md; docs/GETTING_STARTED.md | Added default admin seed with env overrides for first-run setup | scripts/seed.js; docs/ENVIRONMENT.md; docs/GETTING_STARTED.md |
| E-058 | scripts/seedOfficeSupplies.js | Fixed office supplies seed to align with SupplyRequest schema fields | scripts/seedOfficeSupplies.js |
| E-059 | scripts/seed.js | Highlighted default admin seed log output | scripts/seed.js |
| E-060 | scripts/seed.js | Added divider lines around admin seed log output | scripts/seed.js |
| E-061 | scripts/seed.js | Removed unused variable in asset seed loop | scripts/seed.js |
| E-062 | scripts/seed.js; scripts/seedOfficeSupplies.js | Added blank lines between seed sections for readability | scripts/seed.js; scripts/seedOfficeSupplies.js |
| E-063 | scripts/seed.js | JSON-driven seed for users/projects/allocations/meetings/daily updates with sequence reset and default password env | scripts/seed.js |
| E-064 | scripts/seed_data_2creative.json | Source JSON dataset for project-tracker seeding | scripts/seed_data_2creative.json |
| E-065 | docs/TECHNICAL_CHALLENGES.md | Recorded Yarn build failure due to missing @2c/pd-root workspace package (resolved by yarn install) | docs/TECHNICAL_CHALLENGES.md |
| E-066 | api/src/services/projects/projects.js | `activeProjects` filter uses Title Case statuses so seeded projects display | api/src/services/projects/projects.js |
| E-067 | api/src/services/projectAllocations/projectAllocations.js | dailyAllocations accepts Title/upper-case statuses to return allocations for seeded projects | api/src/services/projectAllocations/projectAllocations.js |
| E-068 | web/src/components/ProjectTracker/EmployeeManagement.jsx | Active project counts and hours/day calculated with case-insensitive status match | web/src/components/ProjectTracker/EmployeeManagement.jsx |
| E-069 | scripts/seed.js | Seed assigns default `hoursAllocated` (8h) when JSON allocations omit hours | scripts/seed.js |
