# PLAN (to be generated from codebase)

## Purpose
This file intentionally starts minimal.
Codex must inspect the **actual repository** and generate the real plan and PBIs from evidence.

No assumptions. No invented history.

---

## Codex mandate (do this in order)

### 1. Read the repository
Inspect at minimum:
- `redwood.toml`
- `netlify.toml`
- `package.json` (root, api, web)
- `api/db/schema.prisma`
- `api/db/migrations/**`
- `api/db/seed.*` or `scripts/**`
- `api/src/**`
- `web/src/**`
- current `README.md`
- any existing docs/

### 2. Produce / update these files
Create or overwrite as needed:
- `docs/PLAN.md` (replace this stub with real content)
- `docs/PBI-Shekhar.md` and `docs/PBI-Sarath.md`
- `docs/CHANGELOG.md`
- `docs/EVIDENCE_INDEX.md`
- `docs/WORK_LOG.md`

### 3. Required structure for the real PLAN
The generated PLAN **must include**:
- Current state (what actually exists)
- Unknowns / gaps
- Risks
- Production readiness checklist
- Milestones
- Dependencies

Each statement must reference a file path or artifact.

---

## PBI system (mandatory)
- ID format: `PT-###`
- Status: ⬜ planned | 🟦 in-progress | ✅ done | 🟥 blocked
- Each PBI must include:
  - Title
  - Owner (Shekhar | Sarath)
  - Scope (Docs / Web / API / DB / Infra)
  - Problem
  - Acceptance criteria (checkboxes)
  - Dependencies
  - Evidence to attach
  - Size (S / M / L)

---

## Delegation rule
- Junior tasks must be isolated and low-risk (docs, UI polish, copy, verification).
- Core auth, DB, or infra changes require explicit approval.

---

## Constraints
- Do not delete knowledge; move it to docs/.
- Do not invent requirements or history.
- Prefer minimal, production-safe changes.
