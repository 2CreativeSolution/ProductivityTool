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
