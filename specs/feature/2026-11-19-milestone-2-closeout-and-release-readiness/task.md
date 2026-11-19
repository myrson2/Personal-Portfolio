# Task Breakdown: Milestone 2 Closeout & Release Readiness

- **Feature ID**: `FEAT-M2-CLOSEOUT-RELEASE`
- **Location**: `specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/`
- **Status**: IN PROGRESS
- **Created**: 2026-11-19
- **Goal**: Chunk the Milestone 2 closeout, release readiness verification, and Milestone 3 handoff into discrete subagent tasks, followed by compiling the unified feature context.

---

## Task Matrix & Subagent Allocation

| Task ID | Task Description | Target Artifact / Area | Assigned To | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TASK-1** | **Documentation-Plane & Spec Audit**<br>Execute DOC-01 through DOC-08 checks. Verify no retired tokens (`CACHE_TTL`), stale statuses ("Pending Implementation"), old slugs (`equiptrack`, `smartstock`), or outdated test counts remain across `specs/`. | `specs/feature/**/validation.md`, `specs/roadmap.md`, `specs/constitution.md` | `Subagent: Doc-Auditor` | ✅ PASSED (DOC 1-7 verified) |
| **TASK-2** | **Secret Leakage & Security Audit**<br>Scan `frontend/dist`, `frontend/src`, `backend/.env.example`, `.github/workflows/ci-cd.yml`, and `render.yaml` for exposed PATs, keys, or credentials. Verify compliance with Zero Client Secret Leakage. | `frontend/`, `backend/`, `.github/` | `Subagent: Security-Auditor` | ✅ PASSED (4/4 checks clean) |
| **TASK-3** | **Git Merge Conflict & CI Resolution Blueprint**<br>Analyze diff between `Milestone2Branch` and `main` across `.github/workflows/ci-cd.yml` and `frontend/vercel.json`. Formulate exact conflict resolutions adhering to FR-2. | `.github/workflows/ci-cd.yml`, `frontend/vercel.json` | `Subagent: Merge-Analyst` | ✅ PASSED (Resolution blueprint complete) |
| **TASK-4** | **Test Suite & Build Verification**<br>Execute 31/31 backend pytest tests, 21/21 frontend Vitest component tests, and Vite production bundle generation. | `backend/tests/`, `frontend/src/__tests__/` | Coordinator | ✅ PASSED (31/31 py, 21/21 vi, build OK) |
| **TASK-5** | **Live Deployment & Release Blocker Checklist**<br>Formulate explicit runbook for token rotation in Render dashboard, backend/frontend redeploy order, curl smoke assertions, and responsive layout verification. | `specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/context.md` | Coordinator | ✅ PASSED (Documented in context.md) |
| **TASK-6** | **Milestone 3 Entry Sign-Off & Context Compilation**<br>Synthesize subagent findings into `specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/context.md` with complete evidence and handoff instructions. | `specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/context.md` | Coordinator | ✅ COMPLETED |

---

## Detailed Task Workflows

### TASK-1: Documentation-Plane & Spec Audit
- **Check 1 (DOC-01)**: Confirm presence and completeness of `specification.md`, `implementation.md`, and `validation.md` in this directory.
- **Check 2 (DOC-02)**: Grep for standalone `CACHE_TTL` in `specs/` (only explanatory notes about the migration to `CACHE_TTL_SECONDS` permitted).
- **Check 3 (DOC-03)**: Grep for `Approved — Pending Implementation` in all feature validation files (should be zero matches).
- **Check 4 (DOC-04)**: Grep for retired slugs (`equiptrack`, `smartstock-ai`, `depths-descents`) as active featured projects.
- **Check 5 (DOC-05)**: Verify test counts across all validation files match 31 backend / 21 frontend.
- **Check 6 (DOC-06)**: Validate all `file://` links in `specs/context.md`.
- **Check 7 (DOC-07)**: Verify roadmap and constitution agreement on deferred live meeting scheduler.

### TASK-2: Secret Leakage & Security Audit
- Execute regex grep over `frontend/src` and `frontend/dist` for `GITHUB_TOKEN`, `RESEND_API_KEY`, `ghp_`, `github_pat_`, and `gho_`.
- Verify `backend/.env.example` has only empty placeholders.
- Verify `render.yaml` does not hardcode any sensitive token.

### TASK-3: Git Merge Conflict & CI Resolution Blueprint
- Inspect merge base between `Milestone2Branch` and `main`.
- Synthesize exact conflict resolution:
  - Keep `CACHE_TTL_SECONDS: "900"`.
  - Adopt main's Render deploy-hook HTTPS and non-empty safety validation check.
  - Keep branch's `working-directory: ./frontend` for Vercel CLI steps.
  - Retain trailing newline in `frontend/vercel.json`.

### TASK-4 to TASK-6: Verification & Compilation
- Run test suites and verify exit codes.
- Compile findings into `context.md` in the current feature directory.
