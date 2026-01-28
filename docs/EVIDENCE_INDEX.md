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
