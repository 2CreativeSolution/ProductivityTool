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

## Sarath

| Date | Work Item | Summary | Evidence |
| --- | --- | --- | --- |
