# PBI-Shekhar

## PT-001 ✅ Documentation split (REDWOOD_NOTES -> docs)
- Owner: Shekhar
- Scope: Docs
- Problem: Redwood tutorial and project-specific notes were mixed together.
- Acceptance Criteria:
  - [ ] `docs/PROJECT_NOTES.md` contains project-specific content moved from old notes.
  - [ ] `docs/REDWOOD_TUTORIAL_NOTES.md` contains generic Redwood tutorial content.
  - [ ] README links to both docs.
- Dependencies: None
- Evidence: docs/PROJECT_NOTES.md, docs/REDWOOD_TUTORIAL_NOTES.md, README.md
- Size: S

## PT-002 ✅ Replace plan stub with evidence-based plan
- Owner: Shekhar
- Scope: Docs
- Problem: Plan stub does not reflect repository reality.
- Acceptance Criteria:
  - [ ] `docs/PLAN.md` includes current state, unknowns, risks, readiness checklist, milestones, dependencies with evidence.
- Dependencies: None
- Evidence: docs/PLAN.md
- Size: S

## PT-003 ✅ Create execution tracking files
- Owner: Shekhar
- Scope: Docs
- Problem: Project lacks tracking artifacts for review/audit.
- Acceptance Criteria:
  - [ ] `docs/PBI-Shekhar.md`, `docs/PBI-Sarath.md`, `docs/CHANGELOG.md`, `docs/EVIDENCE_INDEX.md`, `docs/WORK_LOG.md` exist with required structure.
- Dependencies: PT-002
- Evidence: docs/PBI-Shekhar.md, docs/PBI-Sarath.md, docs/CHANGELOG.md, docs/EVIDENCE_INDEX.md, docs/WORK_LOG.md
- Size: S

## PT-004 ✅ Move planning artifacts into docs/
- Owner: Shekhar
- Scope: Docs
- Problem: Planning artifacts are in root instead of docs.
- Acceptance Criteria:
  - [ ] `docs/PLAN.md`, `docs/Planning Guide.md`, and `docs/TODO.md` exist.
  - [ ] `docs/README.md` removed if unused.
- Dependencies: PT-002
- Evidence: docs/PLAN.md, docs/Planning Guide.md, docs/TODO.md
- Size: S

## PT-005 ✅ Remove Supabase/Azure auth artifacts and dependencies
- Owner: Shekhar
- Scope: Web/API/Docs
- Problem: DbAuth is the chosen auth path; Supabase/Azure artifacts are unused.
- Acceptance Criteria:
  - [ ] Supabase/Azure config, client code, and docs removed or archived.
  - [ ] Dependency cleanup in root/api/web package.json.
  - [ ] App still builds and DbAuth login works.
- Dependencies: PT-002
- Evidence: package.json, api/package.json, web/package.json, redwood.toml, docs/archive/check-auth-config.md
- Size: M

## PT-007 ✅ Verify SMTP configuration requirements
- Owner: Shekhar
- Scope: API/Docs
- Problem: Password reset depends on SMTP, availability unknown.
- Acceptance Criteria:
  - [ ] Determine if SMTP creds exist for prod or document gap.
  - [ ] Update docs/TODO.md or docs/PLAN.md with verified status.
- Dependencies: PT-002
- Evidence: api/src/functions/auth.js, docs/TODO.md
- Size: S

## PT-009 ✅ Review flow verification checklist
- Owner: Shekhar
- Scope: Docs
- Problem: Review flow exists but needs verification against current routes/features.
- Acceptance Criteria:
  - [ ] Review steps validated against existing routes.
  - [ ] Gaps captured in docs/TODO.md.
- Dependencies: PT-002
- Evidence: web/src/Routes.jsx, README.md
- Size: S

## PT-012 ✅ Standardize environment variable documentation
- Owner: Shekhar
- Scope: Docs
- Problem: Env vars scattered across files.
- Acceptance Criteria:
  - [ ] Single doc lists required env vars and their use.
- Dependencies: PT-002
- Evidence: docs/ENVIRONMENT.md, README.md
- Size: S

## PT-018 ⬜ Establish production data creation guide (manual)
- Owner: Shekhar
- Scope: Docs
- Problem: Production data will be created manually; needs a repeatable checklist.
- Acceptance Criteria:
  - [ ] Simple guide lists required records and order.
- Dependencies: PT-002
- Evidence: README.md, web/src/Routes.jsx
- Size: S

## PT-019 ✅ Review build status and document baseline
- Owner: Shekhar
- Scope: Docs
- Problem: Build must pass and baseline should be documented.
- Acceptance Criteria:
  - [ ] `yarn rw build` run status recorded with evidence.
- Dependencies: PT-002
- Evidence: docs/TECHNICAL_CHALLENGES.md
- Size: S

## PT-020 ⬜ Local setup verification (ELI11)
- Owner: Shekhar
- Scope: Docs
- Problem: Local setup steps need validation against current repo.
- Acceptance Criteria:
  - [ ] ELI11 steps updated after verifying toolchain and DB.
- Dependencies: PT-002
- Evidence: package.json, api/db/schema.prisma
- Size: S

## PT-021 ✅ Upgrade Node + RedwoodJS versions
- Owner: Shekhar
- Scope: Infra/Deps/Docs
- Problem: Project needs to run on latest Node and updated RedwoodJS.
- Acceptance Criteria:
  - [ ] Node version updated in `.nvmrc`, `package.json` engines, and Netlify config.
  - [ ] RedwoodJS packages updated to latest version.
  - [ ] README updated with getting-started guidance for new Node version.
  - [ ] App run attempted and any errors captured/fixed.
- Dependencies: PT-002
- Evidence: .nvmrc, package.json, api/package.json, web/package.json, netlify.toml, README.md, docs/TECHNICAL_CHALLENGES.md
- Size: M

## PT-022 ✅ Remove unused Capacitor setup
- Owner: Shekhar
- Scope: Web/Docs/Deps
- Problem: Capacitor config and dependencies exist without native projects; dead weight.
- Acceptance Criteria:
  - [ ] Capacitor config and packages removed.
  - [ ] Docs updated to remove Capacitor references.
  - [ ] Evidence recorded in changelog and work log.
- Tech Notes:
  - Remove `capacitor.config.ts`, `@capacitor/*` deps, and lockfile entries.
- Estimation: S
- Evidence: package.json, web/package.json, yarn.lock, docs/PROJECT_NOTES.md, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-023 ✅ Add instruction to avoid warning complaints
- Owner: Shekhar
- Scope: Docs/Process
- Problem: Guidance needed to avoid unsolicited warning commentary during support.
- Acceptance Criteria:
  - [ ] AGENTS.md includes rule to not complain about dependency warnings unless asked.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Add a single non-negotiable line to AGENTS.md.
- Estimation: S
- Evidence: AGENTS.md, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-024 ✅ Add default admin seed (first-run)
- Owner: Shekhar
- Scope: DB/Seed/Docs
- Problem: No default user/admin exists after seeding, blocking first-run access to admin routes.
- Acceptance Criteria:
  - [ ] Seed script can create a default admin when explicitly enabled (e.g., env flag).
  - [ ] Credentials or setup instructions documented without hardcoding secrets.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use env vars to avoid committing credentials; keep off by default.
- Estimation: M
- Evidence: scripts/seed.js, docs/ENVIRONMENT.md, docs/GETTING_STARTED.md, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-025 ✅ Fix office supplies seed request fields
- Owner: Shekhar
- Scope: DB/Seed
- Problem: Seed script uses legacy `quantity`/`reason` fields and fails against current schema.
- Acceptance Criteria:
  - [ ] Seed uses `quantityRequested` and `justification` with current status values.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Align seed data to `SupplyRequest` model field names.
- Estimation: S
- Evidence: scripts/seedOfficeSupplies.js, docs/CHANGELOG.md, docs/WORK_LOG.md, docs/TECHNICAL_CHALLENGES.md

## PT-026 ✅ Highlight default admin seed log
- Owner: Shekhar
- Scope: Seed/UX
- Problem: Default admin seed log is easy to miss during setup.
- Acceptance Criteria:
  - [ ] Seeded admin log is visually highlighted in terminal output.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use ANSI colors with a clear emoji prefix.
- Estimation: S
- Evidence: scripts/seed.js, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-027 ✅ Add divider lines around admin seed log
- Owner: Shekhar
- Scope: Seed/UX
- Problem: Highlight needs clear top/bottom separators in terminal output.
- Acceptance Criteria:
  - [ ] Seeded admin log is wrapped with divider lines matching message width.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use a computed divider based on message length.
- Estimation: S
- Evidence: scripts/seed.js, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-028 ✅ Remove unused seed variable
- Owner: Shekhar
- Scope: Seed/Quality
- Problem: Seed script has an unused variable flagged by lint/TS.
- Acceptance Criteria:
  - [ ] Unused variable removed from seed script.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Remove unused `created` in asset seed loop.
- Estimation: S
- Evidence: scripts/seed.js, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-029 ✅ Add spacing between seed sections
- Owner: Shekhar
- Scope: Seed/UX
- Problem: Seed output is hard to read without visual separation.
- Acceptance Criteria:
  - [ ] Seed logs include blank lines before major sections.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Add empty log lines in seed scripts around section boundaries.
- Estimation: S
- Evidence: scripts/seed.js, scripts/seedOfficeSupplies.js, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-030 ✅ Upgrade Tailwind to v4.1 (Vite)
- Owner: Shekhar
- Scope: Web/Styling
- Problem: Web uses Tailwind v3; upgrade needed to stay current with v4.
- Acceptance Criteria:
  - [ ] Tailwind upgraded to v4.1 with Vite plugin per official docs.
  - [ ] CSS entry updated for v4 import style.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use `@tailwindcss/vite` and update `web/src/index.css`.
- Estimation: M
- Evidence: web/package.json, web/vite.config.js, web/src/index.css, web/src/scaffold.css, prettier.config.js, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-031 ✅ Fix AdminPanelPage gql import
- Owner: Shekhar
- Scope: Web
- Problem: Admin panel page uses `gql` without importing it, causing runtime load failure.
- Acceptance Criteria:
  - [ ] AdminPanelPage imports `gql` from `@redwoodjs/web`.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep change minimal to avoid broader refactors.
- Estimation: S
- Evidence: web/src/pages/AdminPanelPage/AdminPanelPage.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md, docs/TECHNICAL_CHALLENGES.md

## PT-032 ✅ Remove unused browserslist config
- Owner: Shekhar
- Scope: Web/Config
- Problem: `browserslist` remains in web/package.json but no longer used after removing PostCSS/autoprefixer.
- Acceptance Criteria:
  - [ ] `browserslist` removed from web/package.json.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep change limited to web/package.json.
- Estimation: S
- Evidence: web/package.json, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-033 ✅ Improve user dropdown identity display
- Owner: Shekhar
- Scope: Web/UI
- Problem: User dropdown shows only email; full name should be visible.
- Acceptance Criteria:
  - [ ] Dropdown shows full user name under “Signed in as”.
  - [ ] Email displayed in smaller, muted text.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Update header dropdown markup only.
- Estimation: S
- Evidence: web/src/components/Header/Header.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-034 ✅ Simplify main nav layout and styles
- Owner: Shekhar
- Scope: Web/UI
- Problem: Main nav is centered with button-like styles; needs left alignment and plain styling.
- Acceptance Criteria:
  - [ ] Main nav items are positioned left with the logo.
  - [ ] Main nav items have no hover/colorful button styles.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep dropdown menu styling unchanged.
- Estimation: S
- Evidence: web/src/components/Header/Header.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-035 ✅ Simplify mobile nav styling
- Owner: Shekhar
- Scope: Web/UI
- Problem: Mobile nav uses colorful tiles and heavy styling; needs minimal list styling.
- Acceptance Criteria:
  - [ ] Remove colorful tile backgrounds in mobile nav.
  - [ ] Reduce padding/radius and remove shadows.
  - [ ] Use bottom borders as separators.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep structure intact; adjust classes only.
- Estimation: S
- Evidence: web/src/components/Header/Header.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-036 ✅ Add chevrons to mobile submenu items
- Owner: Shekhar
- Scope: Web/UI
- Problem: Nested resource links lack visual affordance.
- Acceptance Criteria:
  - [ ] Add right chevron icon before nested resource item text.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use existing Remix icon class.
- Estimation: S
- Evidence: web/src/components/Header/Header.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-037 ✅ Restore Remix Icon styles
- Owner: Shekhar
- Scope: Web/UI
- Problem: Remix icon classes render as missing because the CSS is not loaded.
- Acceptance Criteria:
  - [ ] Remixicon package installed in web.
  - [ ] Remixicon CSS imported in web entry stylesheet.
- [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Import `remixicon/fonts/remixicon.css` from local package.
- Estimation: S
- Evidence: web/package.json, web/src/index.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-038 ✅ Move react-icons to web workspace
- Owner: Shekhar
- Scope: Web/Deps
- Problem: `react-icons` is used in web but declared at root.
- Acceptance Criteria:
  - [ ] Remove `react-icons` from root package.json.
  - [ ] Add `react-icons` to web/package.json.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Run yarn install to update lockfile.
- Estimation: S
- Evidence: package.json, web/package.json, yarn.lock, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-039 ✅ Redesign login page (NXA)
- Owner: Shekhar
- Scope: Web/UI
- Problem: Login page uses default scaffold; needs branded layout to match new design.
- Acceptance Criteria:
  - [ ] Login page matches NX-style layout with split form + illustration.
  - [ ] Uses `brand-nxa.css` classes for inputs/buttons.
  - [ ] Logo displayed without navigation menu.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Add `web/src/styles/brand-nxa.css` and use in LoginPage.
- Estimation: M
- Evidence: web/src/pages/LoginPage/LoginPage.jsx, web/src/styles/brand-nxa.css, web/public/login-illustration.svg, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-040 ✅ Apply NXA auth styling to signup/forgot pages
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth pages beyond login lack the new branded layout and show uppercase errors.
- Acceptance Criteria:
  - [ ] Signup and forgot-password pages use NXA layout and illustration.
  - [ ] Auth field errors render in normal case.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Add shared error style in `brand-nxa.css` and update FieldError classes.
- Estimation: S
- Evidence: web/src/pages/SignupPage/SignupPage.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx, web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-041 ✅ Normalize auth routes to signin/signup with legacy reset/forgot paths
- Owner: Shekhar
- Scope: Web/Routes
- Problem: Auth routes are inconsistent (`/login`, `/signup`, `/forgot-password`).
- Acceptance Criteria:
  - [ ] Auth routes use `/signin` and `/signup`.
  - [ ] Forgot/reset routes remain `/forgot-password` and `/reset-password`.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep route names intact so existing `routes.*` helpers remain valid.
- Estimation: S
- Evidence: web/src/Routes.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-042 ✅ Remember email on sign-in (local storage)
- Owner: Shekhar
- Scope: Web/Auth UX
- Problem: “Remember me” checkbox did nothing.
- Acceptance Criteria:
  - [ ] Checkbox stores email locally when enabled.
  - [ ] Stored email pre-fills the sign-in field on next visit.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use `localStorage` only; no server-side changes.
- Estimation: S
- Evidence: web/src/pages/LoginPage/LoginPage.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-045 ✅ Document Yarn 4.12.0 setup steps
- Owner: Shekhar
- Scope: Docs
- Problem: New contributors hit corepack/Yarn version mismatch after upgrading to Yarn 4.12.0.
- Acceptance Criteria:
  - [ ] Getting started includes Corepack install/enable and Yarn 4.12.0 pin steps.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep steps short; include shell reload and version verification.
- Estimation: S
- Evidence: docs/GETTING_STARTED.md, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-046 ✅ Link setup guide from README
- Owner: Shekhar
- Scope: Docs
- Problem: Setup steps were duplicated and easy to miss in README.
- Acceptance Criteria:
  - [ ] README local setup points to `docs/GETTING_STARTED.md` and `docs/ENVIRONMENT.md`.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Keep README short and factual.
- Estimation: S
- Evidence: README.md, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-047 ✅ Add global auth footer (sign-in/up/reset)
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth pages lack a consistent footer with company copyright.
- Acceptance Criteria:
  - [ ] Footer appears on sign-in, sign-up, forgot-password, and reset-password.
  - [ ] Footer uses shared styling.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use shared class in `brand-nxa.css`.
- Estimation: S
- Evidence: web/src/pages/LoginPage/LoginPage.jsx, web/src/pages/SignupPage/SignupPage.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx, web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx, web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-048 ✅ Factor auth footer into shared component
- Owner: Shekhar
- Scope: Web/UI
- Problem: Footer text duplicated across auth pages and not year-aware.
- Acceptance Criteria:
  - [ ] Shared AuthFooter component renders © 2024 - {currentYear}.
  - [ ] Auth pages use the shared component.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use `new Date().getFullYear()` to render the current year.
- Estimation: S
- Evidence: web/src/components/AuthFooter/AuthFooter.jsx, web/src/pages/LoginPage/LoginPage.jsx, web/src/pages/SignupPage/SignupPage.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx, web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-049 ✅ Push auth footer to page bottom
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth footer was rendering inline with the card instead of bottom page edge.
- Acceptance Criteria:
  - [ ] Auth card stays centered.
  - [ ] Footer sits at bottom without fixed positioning.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use flex column layout and a centered card wrapper.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, web/src/pages/LoginPage/LoginPage.jsx, web/src/pages/SignupPage/SignupPage.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx, web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-050 ✅ Match reset password styling to auth pages
- Owner: Shekhar
- Scope: Web/UI
- Problem: Reset password page still used scaffold styles.
- Acceptance Criteria:
  - [ ] Reset password page uses NXA auth layout and styles.
  - [ ] Uses shared footer and illustration panel.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Align with ForgotPasswordPage layout.
- Estimation: S
- Evidence: web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-051 ✅ Centralize company links/config for web + api
- Owner: Shekhar
- Scope: Web/API/Config
- Problem: Company links and names were hardcoded and duplicated.
- Acceptance Criteria:
  - [ ] Company site link and name stored in shared config files (not env).
  - [ ] Auth footer links to the company site in a new tab.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Create matching config modules for web and api.
- Estimation: S
- Evidence: web/src/lib/appConfig.js, api/src/lib/appConfig.js, web/src/components/AuthFooter/AuthFooter.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-052 ✅ Add disabled styles for auth inputs/buttons
- Owner: Shekhar
- Scope: Web/UI
- Problem: Disabled fields and buttons had no visual affordance.
- Acceptance Criteria:
  - [ ] Disabled inputs show muted styling and not-allowed cursor.
  - [ ] Disabled buttons show muted styling and not-allowed cursor.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Update `brand-nxa.css` only.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-055 ✅ Add auth nav to auth pages
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth pages lacked a consistent nav for sign-in/sign-up links.
- Acceptance Criteria:
  - [ ] Auth pages show logo at left and sign-in/sign-up links at right.
  - [ ] Sign-in page shows only sign-up; sign-up page shows only sign-in.
  - [ ] Forgot/reset pages show both links.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use a shared `AuthNav` component and brand styles.
- Estimation: S
- Evidence: web/src/components/AuthNav/AuthNav.jsx, web/src/pages/LoginPage/LoginPage.jsx, web/src/pages/SignupPage/SignupPage.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx, web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx, web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-056 ✅ Place auth nav at top of page
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth nav was rendered inside the card instead of page header.
- Acceptance Criteria:
  - [ ] Auth nav appears at top of auth pages.
  - [ ] Card content stays unchanged.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Place AuthNav inside `nxa-page` before the centered card.
- Estimation: S
- Evidence: web/src/pages/LoginPage/LoginPage.jsx, web/src/pages/SignupPage/SignupPage.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx, web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-057 ✅ Pin auth card footer to bottom
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth card footer floats above bottom of the card.
- Acceptance Criteria:
  - [ ] Footer aligns to bottom edge of auth card.
  - [ ] Section padding remains unchanged.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Make `nxa-section` a flex column and use `mt-auto` on footer.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-058 ✅ Add small button variant for auth actions
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth pages need a compact button variant for small actions.
- Acceptance Criteria:
  - [ ] Logo has a subtle 2px radius.
  - [ ] Small button class uses reduced padding/radius and normal font weight.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Update `brand-nxa.css` only.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-059 ✅ Use small button variant on auth nav links
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth nav links needed compact button styling.
- Acceptance Criteria:
  - [ ] Sign-in and sign-up links use the small button class.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Apply `nxa-button--sm` in `AuthNav`.
- Estimation: S
- Evidence: web/src/components/AuthNav/AuthNav.jsx, web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-060 ✅ Apply primary button styling to auth nav buttons
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth nav buttons were styled as plain text instead of primary.
- Acceptance Criteria:
  - [ ] Auth nav buttons use primary button styling with small variant.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Combine `nxa-button` with `nxa-button--sm` and `nxa-button--inline`.
- Estimation: S
- Evidence: web/src/components/AuthNav/AuthNav.jsx, web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-061 ✅ Mobile auth layout tweaks
- Owner: Shekhar
- Scope: Web/UI
- Problem: Mobile auth padding and radius were too large; unused auth link style remained.
- Acceptance Criteria:
  - [ ] Mobile padding for auth sections is reduced by ~50%.
  - [ ] Mobile auth card radius set to 8px.
  - [ ] Unused auth link style removed.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use a max-width media query (mobile) in `brand-nxa.css`.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-062 ✅ Reduce auth title size on mobile
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth titles were oversized on small screens.
- Acceptance Criteria:
  - [ ] Auth title renders at 2xl on mobile.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Use a mobile media query in `brand-nxa.css`.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-053 ✅ Add hover/active states for auth buttons
- Owner: Shekhar
- Scope: Web/UI
- Problem: Auth buttons lacked hover/pressed feedback.
- Acceptance Criteria:
  - [ ] Buttons show pointer cursor, hover, and pressed animation.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Update `brand-nxa.css` only.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-054 ✅ Prevent hover effects on disabled auth buttons
- Owner: Shekhar
- Scope: Web/UI
- Problem: Disabled buttons still respond to hover/active styles.
- Acceptance Criteria:
  - [ ] Hover/active effects apply only when button is enabled.
  - [ ] Evidence captured in changelog and work log.
- Tech Notes:
  - Scope hover/active with `:not(:disabled)`.
- Estimation: S
- Evidence: web/src/styles/brand-nxa.css, docs/CHANGELOG.md, docs/WORK_LOG.md

## PT-063 ✅ Sidebar navigation redesign and hardening (consolidated)
- Owner: Shekhar
- Scope: Web/UI
- Problem: Top navigation no longer scaled with app scope; sidebar work was split into too many micro-PBIs and logs.
- Acceptance Criteria:
  - [ ] Single `AppSidebar` replaces runtime header nav and works across desktop/mobile.
  - [ ] Navigation IA supports grouped sections, nested Home anchors, role-aware Settings/Admin, and quick Sign out.
  - [ ] Admin Settings submenu includes admin-relevant UI routes (`/users`, `/users/new`, `/admin-panel`, `/admin/supply-requests`, `/admin/supply-categories`).
  - [ ] Admin namespace is normalized under `/admin` (`/admin`, `/admin/users*`, `/admin/supply-*`) while self account settings stays on a non-admin route.
  - [ ] Self account settings save flow redirects to an authorized non-admin route.
  - [ ] Main content shell styling and layout offsets are consistent across sidebar-driven pages.
  - [ ] Sidebar supports compact/collapsible mode with persisted state and accessible compact submenu popouts.
  - [ ] Compact dropdowns render correctly (no clipping behind main content).
  - [ ] Sidebar labels use clear business terminology (e.g., `Office Supplies`).
  - [ ] Build passes after updates.
  - [ ] Evidence captured in changelog, work log, and evidence index as a single consolidated sidebar entry.
- Tech Notes:
  - `AppSidebar` is the single source of nav behavior; compact mode uses popout menus and conditional overflow handling.
  - Layout offset uses shared `--app-sidebar-width` with storage-backed state (`@2CPD/sidebar_expanded`).
- Estimation: M
- Evidence: web/src/components/AppSidebar/AppSidebar.jsx, web/src/components/Header/Header.jsx, web/src/components/Header/Header.test.jsx, web/src/components/Header/Header.stories.jsx, web/src/index.css, web/src/lib/storageKeys.js, web/src/pages/DashboardPage/DashboardPage.jsx, web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx, web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx, web/src/pages/AdminPanelPage/AdminPanelPage.jsx, web/src/components/OfficeSupply/SupplyInventory/SupplyInventory.jsx, web/src/components/OfficeSupply/SupplyRequestManager/SupplyRequestManager.jsx, web/src/Routes.jsx, web/src/pages/User/EditUserPage/EditUserPage.jsx, web/src/components/User/EditUserCell/EditUserCell.jsx, docs/CHANGELOG.md, docs/WORK_LOG.md, docs/EVIDENCE_INDEX.md
