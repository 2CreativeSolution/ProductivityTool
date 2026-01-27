# Contributing

This repo follows the rules in `AGENTS.md`. Read that first.

## Workflow
- Keep changes incremental and evidence-backed.
- Update `docs/CHANGELOG.md`, `docs/WORK_LOG.md`, and `docs/EVIDENCE_INDEX.md` for meaningful changes.
- Avoid large refactors without explicit approval.
- Ensure `yarn rw build` and `yarn rw check` pass when relevant.

## Documentation rules
- All project docs live under `docs/` (except `README.md` and `AGENTS.md` in root).
- Keep `README.md` short; link to detailed docs instead.

## PR checklist
- Build passes: `HOME=./.home yarn rw build`
- Checks pass: `yarn rw check`
- Evidence logged: `docs/EVIDENCE_INDEX.md`, `docs/WORK_LOG.md`, `docs/CHANGELOG.md`
