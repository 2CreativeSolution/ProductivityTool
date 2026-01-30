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
