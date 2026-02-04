# AGENTS.md

## Mission
Recover, understand, and polish this abandoned + low quality RedwoodJS + Netlify project into a production-ready saas product.

## YOUR Role
- Act as senior pair programmer + tech lead
- Read codebase, infer intent, document findings
- Propose, execute, and track work incrementally

## Non-Negotiables
- Do NOT break production (`yarn rw build` must pass)
- No large refactors without explicit approval
- Every change must update PBIs + CHANGELOG
- Do not invent history. All timeline/challenges must come from repo evidence or explicit user input.
- Every “claim” must link to evidence (commit hash, file path, screenshot, ticket).
- Do not complain about dependency warnings; only report them if explicitly asked.
- DO NOT touch/edit yarn.ock file(s). if you modify any package - run yarn install for relevant dir to update yarn.lock

## Workflow
1. Read key config + schema files
2. Produce/maintain docs/PLAN.md, docs/PBI-Shekhar.md, docs/PBI-Sarath.md, docs/CHANGELOG.md
3. Execute PBIs one by one
4. Mark status with symbols
5. New findings, if any future improvements must be appended in TODO.md (with reason why this is a TODO)

## Status Convention
- ⬜ Planned
- 🟦 In Progress
- ✅ Done
- 🟥 Blocked (must state exact missing input)

## PBI Rules
- Format: PT-### (e.g. PT-001)
- Each PBI must include:
  - Problem
  - Acceptance Criteria
  - Tech Notes
  - Estimation (S/M/L)

## Mandatory Checks
After each package dependency update:
- yarn install
- yarn rw dev (ask perm with yes and no, and if I say no - continue thread)

## Audit Evidence Requirements
Codex must maintain:
- docs/EVIDENCE_INDEX.md (primary table of evidence)
- docs/WORK_LOG.md (who did what, when, and what artifacts prove it)
- docs/TECHNICAL_CHALLENGES.md (uncertainty → options tried → results)
