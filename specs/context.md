# Implementation Context & Historical Record

- **Current Milestone**: Milestone 2 (`specs/roadmap.md`)
- **Active Feature ID**: `FEAT-M2-PROJECT-DEEP-DIVE`
- **Previous Features**: `FEAT-M1-CORE-SHOWCASE`, `FEAT-M2-LIVE-CONTACT-GATEWAY`
- **Status**: Completed & Fully Verified
- **Completed At**: 2026-11-03T20:45:00+08:00
- **Author / Lead**: Jose Myrson O. Beros

---

## 1. Executive Summary

Milestone 1 established the foundational monorepo (`/frontend` and `/backend`) delivering an interactive retro developer portfolio. Grounded in `specs/constitution.md`, the platform integrates an asymmetrical two-column layout, retro pixel-art aesthetic (70/30/20 palette rule), stat counters, project cards, an RTL infinite certifications carousel, an interactive 53-week GitHub contribution heat map, and a FastAPI caching proxy.

**Milestone 2 Delivery Overview**:
1. **Feature 1: Live Contact Gateway (`FEAT-M2-LIVE-CONTACT-GATEWAY`)**:
   - Replaced placeholder endpoint with live Resend transactional email delivery (`POST /api/contact/send`).
   - Implemented threadpool async execution (`asyncio.to_thread`) and in-memory IP rate limiting (`IPRateLimiter`: max 3 submissions / 15 min / IP).
   - Designed 5-state UI state machine with fallback contact links and zero client secret leakage.
2. **Feature 2: Dedicated Project Details Modal / Deep Dive Routes (`FEAT-M2-PROJECT-DEEP-DIVE`)**:
   - Built interactive architectural case studies for featured systems:
     - **`smartstock-ai`**: Autonomous inventory optimization system (Python, FastAPI, Gemini AI, React, vector search).
     - **`depths-descents`**: High-performance multiplayer game engine (Lua, custom physics, procedural cave generation, netcode sync).
   - Implemented bidirectional URL hash synchronization (`#project/:slug`) enabling direct shareable links and deep linking.
   - Built a 5-tab modal interface ([`ProjectDeepDiveModal.jsx`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/ProjectDeepDiveModal.jsx)): Overview & Metrics, Subsystem Architecture, Engineering Challenges & Solutions, Technology Rationale, and an Interactive Simulated Sandbox Terminal.
   - Added robust FastAPI data endpoints (`GET /api/projects` and `GET /api/projects/{slug}`) backed by deterministic fixtures and client-side offline fallbacks in [`api.js`](file:///C:/Users/merss/Personal-Portfolio/frontend/src/services/api.js).
   - Provided graceful invalid slug handling: displays "This project case study is not yet implemented or does not exist." with automatic exit back to `#projects`.

---

## 2. Implementation Inventory

### Ground-Truth Specifications
- [`specs/constitution.md`](file:///c:/Users/merss/Personal-Portfolio/specs/constitution.md): Architectural non-negotiables & 70/30/20 design system rules.
- [`specs/mission.md`](file:///c:/Users/merss/Personal-Portfolio/specs/mission.md): Product charter, persona workflows, and KPIs.
- [`specs/tech-stack.md`](file:///c:/Users/merss/Personal-Portfolio/specs/tech-stack.md): Stack matrix, boundary diagrams, and component tree.
- [`specs/roadmap.md`](file:///c:/Users/merss/Personal-Portfolio/specs/roadmap.md): Phased roadmap across Milestones 1, 2, and 3.

### Feature Specification Triads
- **Milestone 1 Core Showcase**:
  - [`specs/feature/2026-11-03-milestone-1-core-showcase/specification.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/specification.md)
  - [`specs/feature/2026-11-03-milestone-1-core-showcase/implementation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/implementation.md)
  - [`specs/feature/2026-11-03-milestone-1-core-showcase/validation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/validation.md)
- **Milestone 2 Live Contact Gateway**:
  - [`specs/feature/2026-11-03-live-contact-gateway/specification.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-live-contact-gateway/specification.md)
  - [`specs/feature/2026-11-03-live-contact-gateway/implementation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-live-contact-gateway/implementation.md)
  - [`specs/feature/2026-11-03-live-contact-gateway/validation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-live-contact-gateway/validation.md)
- **Milestone 2 Project Deep Dive Modals**:
  - [`specs/feature/2026-11-03-project-deep-dive-modals/specification.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-project-deep-dive-modals/specification.md)
  - [`specs/feature/2026-11-03-project-deep-dive-modals/implementation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-project-deep-dive-modals/implementation.md)
  - [`specs/feature/2026-11-03-project-deep-dive-modals/validation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-project-deep-dive-modals/validation.md)

### Backend Gateway (`/backend`)
- [`backend/app/models/project.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/models/project.py): Pydantic models for project summary, metrics, architecture components, challenges, tech rationale, and simulated demo steps.
- [`backend/app/fixtures/projects_data.json`](file:///c:/Users/merss/Personal-Portfolio/backend/app/fixtures/projects_data.json): Comprehensive architectural case study datasets for `smartstock-ai` and `depths-descents`.
- [`backend/app/services/project_service.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/services/project_service.py): In-memory fixture cache and query service indexing projects by slug.
- [`backend/app/api/endpoints/projects.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/projects.py): `GET /api/projects` and `GET /api/projects/{slug}` endpoints with HTTP 404 error handling.
- [`backend/app/api/router.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/router.py): Registered `projects.router`.
- [`backend/tests/test_projects.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_projects.py): 4 automated tests verifying project listing, detail resolution, and 404 behavior.
- [`backend/app/core/rate_limiter.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/core/rate_limiter.py): In-memory per-IP rate limiter.
- [`backend/app/services/email_service.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/services/email_service.py): Transactional email delivery service via Resend.
- [`backend/app/api/endpoints/contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/contact.py): `POST /api/contact/send` route.
- [`backend/tests/test_contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_contact.py): 8 automated tests for email delivery and rate limiting.

### Frontend Application (`/frontend`)
- [`frontend/src/services/api.js`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/services/api.js): Added `fetchProjects()` and `fetchProjectDetails(slug)` with complete client fallback fixtures.
- [`frontend/src/components/Modals/ProjectDeepDiveModal.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/ProjectDeepDiveModal.jsx): Tabbed deep dive modal with responsive layout, keyboard accessibility (Escape), and simulated sandbox terminal.
- [`frontend/src/components/Projects/ProjectsSection.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Projects/ProjectsSection.jsx): Added "Case Study ->" triggers to featured cards and window `hashchange` listener.
- [`frontend/src/styles/retro-pixel.css`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/styles/retro-pixel.css): Added CSS tokens for deep dive modals, tabs, metric cards, and retro terminal.
- [`frontend/src/__tests__/ProjectDeepDiveModal.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ProjectDeepDiveModal.test.jsx): 5 test cases verifying render, tab navigation, simulated sandbox, and 404 auto-exit.
- [`frontend/src/__tests__/ProjectsSection.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ProjectsSection.test.jsx): Verified 2 Case Study buttons exist and trigger deep dive flow.

---

## 3. Key Architectural & Design Decisions

1. **Bidirectional URL Hash Synchronization**:
   - Rather than forcing heavy multi-page client routers into a single-page editorial canvas, deep dives synchronize with standard URL hashes (`#project/smartstock-ai`, `#project/depths-descents`).
   - Enables recruiters to share direct links while allowing instant back/close operations without page reloads.
2. **Defensive Client-Side Fallback Tier**:
   - Both `smartstock-ai` and `depths-descents` case studies are bundled as static fallbacks inside `frontend/src/services/api.js`.
   - If the FastAPI gateway is unreachable or offline, the modal renders from cached fixtures without disruption.
3. **Interactive Simulated Sandbox Terminal**:
   - Instead of risky external iframe embeds or complex live server sandboxes, the modal provides an interactive retro command line interface (`SimulatedDemoStep`).
   - Users can execute sequential CLI commands (e.g. running predictive model evaluations or physics tick checks) and view realistic log streams with zero security or sandbox boundary concerns.
4. **Graceful Handling of Unimplemented Slugs**:
   - If an unrecognized project slug is opened, the modal displays a clear notice ("This project case study is not yet implemented or does not exist.") and automatically exits after 2.5 seconds back to `#projects`.
5. **Zero Client Secret Exposure & Performance**:
   - All backend project endpoints are asynchronous, fast (< 5ms response time), and strictly validated via Pydantic models. Client-side production builds contain 0 leaked tokens.

---

## 4. Verification & Test Evidence

### Backend Pytest Suite (19/19 PASSED in 3.07s)
Executed via `cd backend && uv run pytest tests -v`:
- `tests/test_projects.py::test_list_projects_returns_200_and_summaries`: **PASSED**
- `tests/test_projects.py::test_get_smartstock_ai_project_detail`: **PASSED**
- `tests/test_projects.py::test_get_depths_descents_project_detail`: **PASSED**
- `tests/test_projects.py::test_get_project_unknown_slug_returns_404`: **PASSED**
- `tests/test_contact.py` (8 tests): **PASSED**
- `tests/test_github_overview.py` (2 tests): **PASSED**
- `tests/test_github_calendar.py` (1 test): **PASSED**
- `tests/test_cors.py` (2 tests): **PASSED**
- `tests/test_health.py` (1 test): **PASSED**

### Frontend Vitest Suite (7/7 Files, 20/20 PASSED in 13.77s)
Executed via `npm.cmd test -- --run` inside `/frontend`:
- `ProjectDeepDiveModal.test.jsx`: **5 passed** (overview, architecture tab, challenges tab, simulated terminal, 404 notice)
- `ProjectsSection.test.jsx`: **2 passed** (render + case study triggers)
- `ScheduleMeetingModal.test.jsx`: **4 passed**
- `CertificationsCarousel.test.jsx`: **3 passed**
- `GitHubCalendarGrid.test.jsx`: **2 passed**
- `ProfileHeader.test.jsx`: **2 passed**
- `AboutSection.test.jsx`: **2 passed**

### Production Build & Secret Audit
Executed via `npm.cmd run build` inside `/frontend`:
```
✓ 1588 modules transformed.
dist/index.html                   0.85 kB │ gzip:  0.48 kB
dist/assets/index-LcWSM7UN.css  248.82 kB │ gzip: 34.80 kB
dist/assets/index-DW6GDRiC.js   200.18 kB │ gzip: 60.85 kB
✓ built in 5.83s
```
Secret bundle inspection verified **0 matches** for `RESEND_API_KEY`.

---

## 5. Operational Runbook

### Starting Backend:
```powershell
cd backend
uv run uvicorn app.main:app --reload --port 8001
```
- Interactive Swagger docs: `http://localhost:8001/docs`
- Projects list: `http://localhost:8001/api/projects`
- SmartStock AI detail: `http://localhost:8001/api/projects/smartstock-ai`
- Depths Descents detail: `http://localhost:8001/api/projects/depths-descents`

### Starting Frontend:
```powershell
cd frontend
npm.cmd run dev
```
Client application: `http://localhost:5173`.
- View SmartStock AI directly: `http://localhost:5173/#project/smartstock-ai`
- View Depths Descents directly: `http://localhost:5173/#project/depths-descents`

### Running All Tests:
```powershell
# Backend
cd backend && uv run pytest tests -v

# Frontend
cd ..\frontend && npm.cmd test -- --run
```

---

## 6. Next Roadmap Handoff (Milestone 2, Workstream 3)

With Workstreams 1 (Live Contact Gateway) and 2 (Dedicated Project Details Modal / Deep Dive Routes) fully delivered and verified, the final priority for Milestone 2 is:
- **Workstream 3: Automated CI/CD & Production Deployment**: GitHub Actions pipeline configuring linting, automated testing for both frontend and backend, and automated deployment configurations for Vercel/Cloudflare Pages (frontend) and Render/Railway (backend).
