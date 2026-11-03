# specification.md
## FEAT-M2-CICD — Automated CI/CD & Production Deployment

- **Feature ID**: `FEAT-M2-CICD`
- **Milestone**: Milestone 2, Workstream 3 (`specs/roadmap.md`)
- **Status**: Planned
- **Author / Lead**: Jose Myrson O. Beros
- **Date**: 2026-11-03

---

## Context & Motivation

Per `specs/roadmap.md` Milestone 2, Workstream 3: with the Live Contact Gateway (`FEAT-M2-LIVE-CONTACT-GATEWAY`) and Project Deep Dive Modals (`FEAT-M2-PROJECT-DEEP-DIVE`) fully delivered and verified, the final Milestone 2 deliverable is an automated CI/CD pipeline. The pipeline must run linting, automated tests, and a production build check on every push and PR, and automatically deploy the portfolio to production on every successful `main` push — zero manual steps.

**Deployment targets:**
- **Frontend**: Vercel (zero-config Vite support, preview deploys on PRs)
- **Backend**: Render (free tier, Docker-compatible, health-check gated traffic)

---

## User Stories

**Story 1 — Continuous Deployment on Main**  
GIVEN a developer pushes code to the `main` branch,  
WHEN the GitHub Actions workflow triggers,  
THEN it must sequentially: lint the frontend (ESLint), run all 19 backend pytest tests, run all 20 frontend Vitest tests, execute a Vite production build check, and — only if all steps pass — deploy the frontend to Vercel and trigger a Render backend re-deploy.

**Story 2 — PR CI Gate**  
GIVEN a developer opens a Pull Request against `main`,  
WHEN CI runs on the PR,  
THEN it must run lint + tests + build check and report pass/fail as a required PR status check. The deploy job must be skipped entirely on PR events.

**Story 3 — Failure Halts Pipeline**  
GIVEN any CI step fails (lint error, pytest failure, Vitest failure, or Vite build error),  
WHEN GitHub Actions processes the failure,  
THEN the pipeline must halt immediately, report the failing step clearly in the Actions log, and skip all downstream deployment steps without corrupting the live environment.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | A `.github/workflows/ci-cd.yml` workflow must exist at the repository root. |
| FR-2 | CI must trigger on: `push` to `main` and `pull_request` targeting `main`. |
| FR-3 | Backend tests: `cd backend && uv run pytest tests -v` on `ubuntu-latest` (19 tests). |
| FR-4 | Frontend lint: `cd frontend && npm run lint` (ESLint — 0 errors required). |
| FR-5 | Frontend tests: `cd frontend && npm test -- --run` (Vitest — 20 tests must pass). |
| FR-6 | Frontend build: `cd frontend && npm run build` must produce `dist/` with 0 errors. |
| FR-7 | On `push` to `main` only: deploy frontend to Vercel via `amondnet/vercel-action@v25`. |
| FR-8 | On `push` to `main` only: trigger Render backend re-deploy via deploy hook `curl POST`. |
| FR-9 | Secrets `RESEND_API_KEY`, `GITHUB_USERNAME`, `CACHE_TTL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK_URL` must be stored as GitHub Actions repository secrets — never hard-coded. |
| FR-10 | A `backend/Dockerfile` must exist for Render container compatibility. |
| FR-11 | A `render.yaml` IaC file must exist at the repository root documenting the backend service spec. |

---

## Non-Functional Requirements

- **Speed**: CI pipeline must complete in under 5 minutes for a standard run.
- **Security**: Zero secrets committed to source code; all sensitive values via GitHub Secrets and Render environment variables.
- **Idempotency**: Re-running a failed or re-triggered deploy must not corrupt the live environment.
- **Constitution Compliance**: Zero client secrets in the Vite bundle (verified by secret grep audit on `dist/`).
- **Upstream Resilience**: Render health-check path (`/api/health`) gates traffic routing — broken deploys never reach users.

---

## Acceptance Criteria

- [ ] Push to `main` triggers the full CI + CD pipeline automatically.
- [ ] PR against `main` triggers CI-only (`deploy` job is skipped).
- [ ] A failing pytest test blocks deployment.
- [ ] A failing Vitest test blocks deployment.
- [ ] A failing `npm run build` blocks deployment.
- [ ] Frontend is live and accessible at the Vercel URL after a successful `main` push.
- [ ] Backend is live and reachable at the Render URL after a successful `main` push.
- [ ] `GET https://<render-url>/api/health` returns `{"status": "ok"}`.
- [ ] All GitHub Actions secrets are documented; none are hard-coded in any committed file.
- [ ] `grep -r "RESEND_API_KEY" frontend/dist/` returns 0 matches.

