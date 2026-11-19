# Validation: Milestone 2 Closeout & Release Readiness

- **Feature ID**: `FEAT-M2-CLOSEOUT-RELEASE`
- **Milestone**: Milestone 2 (closeout) → Milestone 3 handoff
- **Date**: 2026-11-19
- **Status**: Implemented — Documentation Only
- **Local Verification:** All DOC-01…DOC-08 checks passed after generation. Deployed Render/Vercel checks remain **pending** until the user executes the blocker checklist.

---

## Automated Test Matrix (documentation-plane checks)

| ID | Check | Method | Expected | Result |
| :--- | :--- | :--- | :--- | :--- |
| DOC-01 | Folder + 3 files | file existence | pass | PASS |
| DOC-02 | No retired cache token in config snippets | grep `specs/` for the retired variable as a standalone token | matches only explanatory notes about the fix | PASS |
| DOC-03 | No stale statuses | grep `specs/` for the stale pending-approval phrase | zero matches | PASS |
| DOC-04 | No old slugs | grep `specs/feature/**/validation.md` for retired project slugs | zero matches | PASS |
| DOC-05 | No stale counts | grep `specs/feature/**/validation.md` for retired test counts and stat-bar copy | zero matches | PASS |
| DOC-06 | `file://` links resolve | read `context.md` | all paths valid | PASS |
| DOC-07 | Roadmap ↔ constitution consistency | read both | scheduler deferred beyond M2 | PASS |
| DOC-08 | Post-edit build/startup smoke | `npm run build`; `uvicorn app.main:app --port 8001` | no new errors (no code changed) | PASS |

Existing evidence carried forward from `specs/context.md §4`: backend 31/31, frontend 21/21, production build OK, live GitHub smoke 49 repos / 370 commits, secret audit clean. All deployed checks remain **pending** until the user executes FR-4.

## Constitution Compliance Matrix (repo-specific)

| Invariant (source) | Status | Evidence / Rationale |
| :--- | :--- | :--- |
| Zero client secret leakage (constitution:12) | PASS | Token only in Render; no client code touched |
| Backend as gateway (constitution:19) | PASS | No new direct frontend-to-upstream call |
| Environment isolation via `.env`/Pydantic (constitution:20) | PASS | No env files changed |
| Strict CORS (constitution:21) | PASS | Unchanged |
| TTL cache 15–60 min (constitution:22) | PASS | `CACHE_TTL_SECONDS: "900"` locked in FR-2 |
| Strict Pydantic validation (constitution:23) | PASS | No payload changes |
| Resilience / fallback fixtures (constitution:13) | PASS | Fixtures retained; live truth used for verification |
| M1 scope discipline — no DB/auth/3D (constitution:14, 39–41) | PASS | FR-8; docs-only |
| 70/30/20 + editorial layout + WCAG AA (constitution:11) | N/A (preserved) | No UI edits; layout checks recorded in FR-5 |
| Amendment sign-off (constitution:5) | PASS | FR-6 records date + developer sign-off |
| Single auth gateway `get_current_user` | N/A | No auth layer exists in this project |
| IDOR masking 404 | N/A | No user-owned resources |
| Hashed cookies / no JWT | N/A | No sessions |
| Worker threadpool for crypto | N/A | No crypto |
| Alembic batch migration / FK cascade | N/A | No database |

> Generic matrix items that do not apply to this repository are retained as N/A with rationale so `CHECKCODE` can distinguish "not applicable" from "violated".

## Manual QA & Exploratory Runbook

1. Merge `main` into `Milestone2Branch`; resolve conflicts per FR-2; confirm CI green.
2. Revoke exposed PAT; issue all-repository read token; set only in Render; redeploy.
3. Redeploy Vercel; run the `context.md §5` curl set; record actual responses.
4. Open deployed site at 375px and 1200px; confirm two-column collapse and modal tabs.
5. Only then tick the deployed checkboxes in `context.md` and the validation files.
6. Confirm relabel of `Schedule meeting` CTA is logged as deferred, not implemented.
7. Measure Lighthouse ≥ 95 and WCAG 2.1 AA; record as M3 handoff evidence.
