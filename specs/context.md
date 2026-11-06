# Implementation Context & Historical Record

- **Current Milestone**: Milestone 2 branch (includes the Milestone 1 telemetry/showcase backfill defined in `specs/roadmap.md`)
- **Active Feature ID**: `FEAT-M1-GITHUB-LIVE`
- **Previous Features**: `FEAT-M1-CORE-SHOWCASE`, `FEAT-M2-LIVE-CONTACT-GATEWAY`, `FEAT-M2-PROJECT-DEEP-DIVE`
- **Status**: Implemented & verified locally; Render/Vercel redeploy pending
- **Completed At**: 2026-11-06T14:40:00+08:00
- **Author / Lead**: Jose Myrson O. Beros

---

## 1. Executive Summary

Milestone 1 established the foundational monorepo (`/frontend` and `/backend`) delivering an interactive retro developer portfolio. Grounded in `specs/constitution.md`, the platform integrates an asymmetrical two-column layout, retro pixel-art aesthetic (70/30/20 palette rule), stat counters, project cards, an RTL infinite certifications carousel, an interactive 53-week GitHub contribution heat map, and a FastAPI caching proxy.

Milestone 2 added live Resend contact delivery (`FEAT-M2-LIVE-CONTACT-GATEWAY`) and the five-tab project case-study modal (`FEAT-M2-PROJECT-DEEP-DIVE`).

**Latest Delivery — Live GitHub Telemetry + Showcase (`FEAT-M1-GITHUB-LIVE`):**
1. **Live overview telemetry**: `GET /api/github/overview` now reads `total_repos` from `GET /users/{username}` and computes `total_commits` as the sum of all non-fork public repositories. `is_mock` is `false` on a live GitHub response.
2. **Background commit refresh**: the expensive commit scan runs in FastAPI `BackgroundTasks` after the response. The first uncached request serves the last-known fixture value immediately; the recomputed total is cached and patched into the overview cache for subsequent requests. A per-username lock prevents duplicate concurrent scans, and commit pages are fetched with bounded concurrency (`5`).
3. **Resilient fallback**: missing token, `401/403/429`, timeout, malformed JSON, or a failed upstream call returns the deterministic fixture with `is_mock: true`, HTTP `200`, and a cached result.
4. **Curated showcase corrected**: featured projects are now **eMSME** (`myrson2/eMSME`) and **ColorGame** (`myrson2/ColorGame`). The retired `smartstock-ai`, `depths-descents`, and `equiptrack` references were removed from backend fixtures, backend tests, frontend fallbacks, and project UI tests.
5. **eMSME case study**: added the full five-tab fixture (overview/metrics, architecture, challenges, rationale, simulated sandbox) alongside the existing ColorGame case study.
6. **Deployment fixes**: `frontend/vercel.json` now preserves the `/api` prefix (`https://personal-portfolio-c6mp.onrender.com/api/$1`), and `render.yaml` uses the actual `CACHE_TTL_SECONDS` setting and declares `GITHUB_TOKEN` as a dashboard-injected secret.
7. **Verified live snapshot (2026-11-06)**: 40 public repos, **370 total commits**, `is_mock: false`, first live scan `7.15s`, cached read `0.05ms`.

---

## 2. Implementation Inventory

### Ground-Truth Specifications
- [`specs/constitution.md`](file:///C:/Users/merss/Personal-Portfolio/specs/constitution.md): Architectural non-negotiables & 70/30/20 design system rules.
- [`specs/mission.md`](file:///C:/Users/merss/Personal-Portfolio/specs/mission.md): Product charter, persona workflows, and KPIs.
- [`specs/tech-stack.md`](file:///C:/Users/merss/Personal-Portfolio/specs/tech-stack.md): Stack matrix, boundary diagrams, and component tree.
- [`specs/roadmap.md`](file:///C:/Users/merss/Personal-Portfolio/specs/roadmap.md): Phased roadmap across Milestones 1, 2, and 3.

### Feature Specification Triads
- **Milestone 1 Core Showcase**:
  - [`specs/feature/2026-11-03-milestone-1-core-showcase/specification.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/specification.md)
  - [`specs/feature/2026-11-03-milestone-1-core-showcase/implementation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/implementation.md)
  - [`specs/feature/2026-11-03-milestone-1-core-showcase/validation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/validation.md)
- **Milestone 2 Live Contact Gateway**:
  - [`specs/feature/2026-11-03-live-contact-gateway/specification.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-live-contact-gateway/specification.md)
  - [`specs/feature/2026-11-03-live-contact-gateway/implementation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-live-contact-gateway/implementation.md)
  - [`specs/feature/2026-11-03-live-contact-gateway/validation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-live-contact-gateway/validation.md)
- **Milestone 2 Project Deep Dive Modals**:
  - [`specs/feature/2026-11-03-project-deep-dive-modals/specification.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-project-deep-dive-modals/specification.md)
  - [`specs/feature/2026-11-03-project-deep-dive-modals/implementation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-project-deep-dive-modals/implementation.md)
  - [`specs/feature/2026-11-03-project-deep-dive-modals/validation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-project-deep-dive-modals/validation.md)
- **Live GitHub Telemetry + Showcase (current)**:
  - [`specs/feature/2026-11-06-live-github-telemetry-showcase/specification.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-06-live-github-telemetry-showcase/specification.md)
  - [`specs/feature/2026-11-06-live-github-telemetry-showcase/implementation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-06-live-github-telemetry-showcase/implementation.md)
  - [`specs/feature/2026-11-06-live-github-telemetry-showcase/validation.md`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-06-live-github-telemetry-showcase/validation.md)

### Backend Gateway (`/backend`)
- [`backend/app/services/github_service.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/services/github_service.py): Live GitHub REST/GraphQL client, fixture fallback, `overview_*`/`calendar_*`/`commits_total_*` TTL cache keys, bounded parallel commit counting, and background refresh with a duplicate-scan guard.
- [`backend/app/services/project_service.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/services/project_service.py): Curated `eMSME` + `colorgame` fixture loader, deterministic ordering, async GitHub metadata enrichment, and `repo_meta_*` TTL caching.
- [`backend/app/models/project.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/models/project.py): `stars`, `forks`, `language`, and `pushed_at` added to `ProjectSummaryResponse`; detail model inherits the extended summary.
- [`backend/app/api/endpoints/github.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/github.py): Injects `BackgroundTasks` into the overview endpoint.
- [`backend/app/api/endpoints/projects.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/projects.py): Async list/detail handlers using metadata-enriched service methods.
- [`backend/app/fixtures/projects_data.json`](file:///C:/Users/merss/Personal-Portfolio/backend/app/fixtures/projects_data.json): Full `colorgame` + new `eMSME` case studies; `equiptrack` removed.
- [`backend/app/fixtures/github_overview_fallback.json`](file:///C:/Users/merss/Personal-Portfolio/backend/app/fixtures/github_overview_fallback.json): Deterministic fallback aligned to the verified live snapshot (40 repos / 370 commits).
- [`backend/app/core/config.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/core/config.py): `GITHUB_TOKEN`, `GITHUB_USERNAME`, `CACHE_TTL_SECONDS` settings.
- [`backend/app/core/cache.py`](file:///C:/Users/merss/Personal-Portfolio/backend/app/core/cache.py): In-memory `TTLCache` shared by GitHub and project metadata services.
- [`backend/tests/test_projects.py`](file:///C:/Users/merss/Personal-Portfolio/backend/tests/test_projects.py): Asserts exactly `eMSME` + `colorgame`, curated order, full eMSME detail, and 404 for unknown slugs.
- [`backend/tests/test_github_live.py`](file:///C:/Users/merss/Personal-Portfolio/backend/tests/test_github_live.py): Deterministic pagination/commit-sum tests, live overview cache test, background-deferral test, and background cache-patch test.
- [`backend/tests/test_github_overview.py`](file:///C:/Users/merss/Personal-Portfolio/backend/tests/test_github_overview.py): Forces fixture mode even when a local token is present; verifies fallback shape and cache stability.
- [`backend/tests/test_github_calendar.py`](file:///C:/Users/merss/Personal-Portfolio/backend/tests/test_github_calendar.py): Forces deterministic fallback for calendar tests.
- [`backend/.env.example`](file:///C:/Users/merss/Personal-Portfolio/backend/.env.example): Placeholder-only `GITHUB_TOKEN=`, `CACHE_TTL_SECONDS`, and Resend keys.

### Frontend Application (`/frontend`)
- [`frontend/src/components/Projects/ProjectsSection.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/components/Projects/ProjectsSection.jsx): `FEATURED_PROJECTS` now renders eMSME and ColorGame; both open the existing five-tab modal via `#project/{slug}`.
- [`frontend/src/services/api.js`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/services/api.js): Client fallbacks now include full eMSME and ColorGame case studies; retired project entries removed; overview fallback reports 40 repos / 370 commits.
- [`frontend/src/components/About/AboutSection.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/components/About/AboutSection.jsx): Live counters; exact commit count is shown below 1,000 instead of rendering `0k+`.
- [`frontend/src/components/Modals/ProjectDeepDiveModal.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/ProjectDeepDiveModal.jsx): Existing tabbed modal, keyboard Escape close, hash deep-linking, and simulated terminal.
- [`frontend/src/__tests__/ProjectsSection.test.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ProjectsSection.test.jsx): Verifies eMSME + ColorGame cards and two Case Study buttons.
- [`frontend/src/__tests__/ProjectDeepDiveModal.test.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ProjectDeepDiveModal.test.jsx): Uses the eMSME slug for render, tab, sandbox, and not-found coverage.
- [`frontend/src/__tests__/AboutSection.test.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/__tests__/AboutSection.test.jsx): Verifies formatted `5k+` counters and exact sub-1,000 commit counts.

### Deployment & Configuration
- [`frontend/vercel.json`](file:///C:/Users/merss/Personal-Portfolio/frontend/vercel.json): Vite build settings plus `/api/(.*)` → `https://personal-portfolio-c6mp.onrender.com/api/$1` rewrite.
- [`render.yaml`](file:///C:/Users/merss/Personal-Portfolio/render.yaml): Docker web service, `GITHUB_USERNAME=myrson2`, dashboard-injected `GITHUB_TOKEN`/`RESEND_API_KEY`, `CACHE_TTL_SECONDS=900`, health check `/api/health`.
- [`.github/workflows/ci-cd.yml`](file:///C:/Users/merss/Personal-Portfolio/.github/workflows/ci-cd.yml): CI/CD workflow; backend test env now uses the static `CACHE_TTL_SECONDS: "900"` key instead of the retired `CACHE_TTL` secret.
- [`backend/Dockerfile`](file:///C:/Users/merss/Personal-Portfolio/backend/Dockerfile): Python 3.12 image, `uv` dependency install, Uvicorn on port 8000.
- [`backend/.dockerignore`](file:///C:/Users/merss/Personal-Portfolio/backend/.dockerignore): Excludes `.env*`, `.venv`, Python caches, and tests from the Docker build context so local secrets are never baked into an image.

---

## 3. Key Architectural & Design Decisions

1. **Live-first with snapshot fallback**:
   - GitHub is the source of truth when the token and network are healthy. Every failure path returns the same Pydantic contract with `is_mock: true`, so the React header never has to special-case offline data.
2. **Background commit aggregation**:
   - Commit totals require one or more paginated requests per repository. Blocking the overview response would add several seconds to every cold request. The endpoint therefore returns the last-known fixture value and schedules `refresh_commits_background`.
   - The background scan uses `asyncio.Semaphore(5)`, skips forks, paginates at `per_page=100`, and is guarded by a per-username `asyncio.Lock` so concurrent cold requests do not multiply GitHub traffic.
   - The refreshed total is written to `commits_total_{username}` and patched into the cached overview, so the next request returns live data with no extra cost.
3. **Curated showcase, not a repository dump**:
   - `CURATED_ORDER = ["eMSME", "colorgame"]` keeps the portfolio editorial. `GET /api/projects` returns only those two summaries; unknown or retired slugs return `404 {"detail":"Project not found"}`.
4. **Backend-only token**:
   - `GITHUB_TOKEN` is read by `app/core/config.py` from local `.env` or Render's dashboard. It is never referenced by `frontend/src` or emitted into `dist/`. The Vercel rewrite keeps all API traffic behind the FastAPI gateway.
5. **Metadata enrichment is cached separately**:
   - `repo_meta_{slug}` holds stars/forks/language/pushed_at for the shared cache TTL. Failed lookups cache defaults too, preventing a down GitHub from turning every project request into a timeout.
6. **Fallback parity with live data**:
   - The overview fallback was updated to the verified live snapshot (40 repos / 370 commits) so a cold/offline first load does not display stale inflated numbers.
7. **Human-readable small totals**:
   - The About stat bar uses `5k+` formatting above 1,000 and the exact number below it. This avoids a misleading `0k+` when the live total is under 1,000.

---

## 4. Verification & Test Evidence

### Backend Pytest Suite — 25/25 PASSED
Executed via `cd backend && .\.venv\Scripts\python.exe -m pytest -q`:
- `tests/test_projects.py`: curated list, eMSME detail, ColorGame detail, unknown-slug 404.
- `tests/test_github_live.py`: Link-header parsing, 2-page commit pagination (108 commits, fork skipped), upstream failure returns `None`, cached live overview, background deferral, background cache patch.
- `tests/test_github_overview.py`: fallback mode and cache stability.
- `tests/test_github_calendar.py`: fallback calendar shape.
- `tests/test_contact.py`, `tests/test_cors.py`, `tests/test_health.py`: unchanged and passing.

### Frontend Vitest Suite — 7 files / 21 tests PASSED
Executed via `cd frontend && npm test`:
- `ProjectDeepDiveModal.test.jsx`: 5 passed (eMSME render, architecture, challenges, sandbox, not-found).
- `ProjectsSection.test.jsx`: 2 passed (featured cards + two Case Study buttons).
- `AboutSection.test.jsx`: 3 passed (socials, formatted counters, exact sub-1,000 count).
- `ScheduleMeetingModal`, `CertificationsCarousel`, `GitHubCalendarGrid`, `ProfileHeader`: all passed.

### Production Build
Executed via `cd frontend && npm run build`:
```
✓ 1588 modules transformed.
dist/index.html                   0.87 kB │ gzip:  0.49 kB
dist/assets/index-3H1Amsas.css  248.89 kB │ gzip: 34.82 kB
dist/assets/index-D0Tl7wuW.js   200.17 kB │ gzip: 60.76 kB
✓ built in 8.45s
```

### Live GitHub & Endpoint Smoke Test
- Local token authenticated successfully: `GET /users/myrson2` → `200`, 40 public repos, rate limit remaining 4,991.
- `GitHubService.get_overview("myrson2")` → live `is_mock: false`, 40 repos, **370 commits**; first scan `7.15s`, cached second call `0.05ms`.
- `GET /api/github/overview` through `TestClient` → `200`, `is_mock: false`, 40 repos, 370 commits.
- `GET /api/projects` → only `eMSME` and `colorgame`, with live stars/forks/language metadata.
- `GET /api/projects/eMSME` → `200`, full detail with 4 metrics.
- `GET /api/projects/equiptrack` → `404 {"detail":"Project not found"}`.

### Secret Audit
- `grep` over `frontend/src` and `frontend/dist` for `GITHUB_TOKEN`, `RESEND_API_KEY`, `github_pat_`, `ghp_` → **0 matches**.
- `backend/.env.example` contains only empty placeholders.
- The real token remains in local `backend/.env` (git-ignored) and must be supplied through the Render dashboard in production.

---

## 5. Operational Runbook

### Local Backend
```powershell
cd backend
# backend/.env:
#   GITHUB_USERNAME=myrson2
#   GITHUB_TOKEN=<new fine-grained PAT, read-only public repo metadata>
#   CACHE_TTL_SECONDS=900
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```
- Swagger: `http://localhost:8001/docs`
- Health: `http://localhost:8001/api/health`
- Overview: `http://localhost:8001/api/github/overview?username=myrson2`
- Projects: `http://localhost:8001/api/projects`
- eMSME detail: `http://localhost:8001/api/projects/eMSME`

### Local Frontend
```powershell
cd frontend
npm run dev
```
- App: `http://localhost:5173`
- eMSME deep link: `http://localhost:5173/#project/eMSME`
- ColorGame deep link: `http://localhost:5173/#project/colorgame`

### Tests
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q

cd ..\frontend
npm test
npm run build
```

### Deployment Checklist
1. **Revoke the previously exposed GitHub PAT** and create a new fine-grained token with read-only access to public repository metadata (or classic `read:user` + `public_repo`).
2. In the Render dashboard, set `GITHUB_TOKEN` to the new value. Do **not** commit it to `render.yaml`, `.env.example`, or workflow files.
3. Confirm Render environment includes `GITHUB_USERNAME=myrson2`, `CACHE_TTL_SECONDS=900`, and the existing Resend variables. Redeploy the backend.
4. Redeploy the frontend so `frontend/vercel.json` applies the `/api/$1` rewrite.
5. Verify:
   ```bash
   curl https://personal-portfolio-c6mp.onrender.com/api/health
   curl "https://personal-portfolio-c6mp.onrender.com/api/github/overview?username=myrson2"
   curl https://personal-portfolio-c6mp.onrender.com/api/projects
   curl https://personal-portfolio-c6mp.onrender.com/api/projects/eMSME
   curl https://personal-portfolio-c6mp.onrender.com/api/projects/equiptrack   # expect 404
   curl "https://<vercel-domain>/api/github/overview?username=myrson2"          # identical through rewrite
   ```
6. Open the deployed site at 375px and 1200px+; confirm both Case Study buttons open populated five-tab modals and the stat bar shows live/fallback numbers without layout shift.

---

## 6. Known Limitations & Next Handoff

| Item | Disposition |
|---|---|
| First uncached request serves the last-known fixture total while the background scan runs | By design per the approved background-refresh pattern; the next request returns the live total. The fixture is kept aligned with the latest verified snapshot. |
| Commit totals count the default branch of each non-fork public repo | GitHub's commits API does not expose an all-branch total cheaply. Acceptable for M1; a GraphQL contribution-total metric can be considered in M3. |
| Safety caps: 1,000 repos and 5,000 commits per repo per scan | Bounds worst-case API usage on the free tier. The current account is far below both limits; an upstream failure returns `None` rather than a partial/undercounted total. |
| Render free-tier cold start (30–50s) | Accepted for M1. The frontend shows loading states and the backend returns fallbacks rather than errors. |
| GitHub rate limits | Token + 15-minute TTL + bounded concurrency + per-username lock keep usage low. `401/403/429` always degrade to cached/fixture data. |
| eMSME case-study copy is a repository snapshot | Manual re-sync when the upstream README materially changes. |
| Deployment is not yet live-verified | Complete the Render/Vercel redeploy checklist above, then flip the deployed acceptance boxes in `validation.md`. |

**Next roadmap item:** Milestone 2 Workstream 3 (Automated CI/CD & Production Deployment) in [`specs/feature/2026-11-03-cicd-deployment/`](file:///C:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-cicd-deployment/). The workflow secrets list must use `CACHE_TTL_SECONDS` (not the retired `CACHE_TTL`) and must **not** add `GITHUB_TOKEN`; the token belongs only in the Render dashboard.
