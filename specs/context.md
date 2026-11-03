# Implementation Context & Historical Record

- **Current Milestone**: Milestone 2 (`specs/roadmap.md`)
- **Active Feature ID**: `FEAT-M2-LIVE-CONTACT-GATEWAY`
- **Status**: Completed & Fully Verified
- **Completed At**: 2026-11-03T19:20:00+08:00
- **Author / Lead**: Jose Myrson O. Beros

---

## 1. Executive Summary

Milestone 1 established the foundational monorepo (`/frontend` and `/backend`) delivering an interactive retro developer portfolio. Grounded in `specs/constitution.md`, the platform integrates an asymmetrical two-column layout, retro pixel-art aesthetic (70/30/20 palette rule), stat counters, project cards, an RTL infinite certifications carousel, an interactive 53-week GitHub contribution heat map, and a FastAPI caching proxy.

**Milestone 2 (Feature 1: Live Contact Gateway)** elevated the portfolio from static placeholder interactions to a live transactional communication channel:
1. Upgraded the contact infrastructure from mock recording (`/api/contact/placeholder`) to a live delivery channel via **Resend** (`POST /api/contact/send`).
2. Implemented defensive in-memory IP rate limiting (`IPRateLimiter` with `TTLCache`: 3 submissions per 15 minutes per IP) to prevent spam without database overhead.
3. Added threadpool delegation (`asyncio.to_thread`) for the synchronous Resend client to maintain strict non-blocking async event loop discipline.
4. Maintained zero client secret leakage: `RESEND_API_KEY` and `RESEND_TO_EMAIL` are managed strictly in `backend/.env`.
5. Upgraded `ScheduleMeetingModal.jsx` with an explicit state machine (`idle` → `loading` → `success` | `error` | `rateLimit`), responsive styling (16px input font size to prevent iOS zoom, ≥ 44px touch targets), and direct fallback mailto link.
6. Maintained upstream resilience: if no `RESEND_API_KEY` is provided, the backend falls back gracefully to `status: "mock"`, ensuring local development and preview deployments never break.

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

### Backend Gateway (`/backend`)
- [`backend/requirements.txt`](file:///c:/Users/merss/Personal-Portfolio/backend/requirements.txt): Added `resend>=2.0.0`.
- [`backend/.env.example`](file:///c:/Users/merss/Personal-Portfolio/backend/.env.example): Added `RESEND_API_KEY` and `RESEND_TO_EMAIL`.
- [`backend/.env`](file:///c:/Users/merss/Personal-Portfolio/backend/.env): Local configuration for Resend credentials.
- [`backend/app/core/config.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/core/config.py): Pydantic settings loading `RESEND_API_KEY` and `RESEND_TO_EMAIL`.
- [`backend/app/core/rate_limiter.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/core/rate_limiter.py): In-memory per-IP rate limiter using `TTLCache(maxsize=1000, ttl=900)`.
- [`backend/app/models/contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/models/contact.py): Added `ContactSendRequest` and `ContactSendResponse` with regex email validation.
- [`backend/app/services/email_service.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/services/email_service.py): Transactional email delivery service via Resend with async threadpool execution.
- [`backend/app/api/endpoints/contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/contact.py): Implemented `POST /api/contact/send` route with rate limiting.
- [`backend/tests/test_contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_contact.py): 8 automated tests for send success, mock mode, validation, 429 rate limit, 503 error handling, and secret masking.

### Frontend Application (`/frontend`)
- [`frontend/src/services/api.js`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/services/api.js): Added `sendContact(payload)` client fetch wrapper with network resilience.
- [`frontend/src/components/Modals/ScheduleMeetingModal.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/ScheduleMeetingModal.jsx): State-driven contact form with inline error alerts, rate limit notices, and mobile input optimizations.
- [`frontend/src/components/Certifications/CertificationsCarousel.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Certifications/CertificationsCarousel.jsx): Restored step counter badge (`1/4`) and pause-on-hover indicator badge.
- [`frontend/src/__tests__/ScheduleMeetingModal.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ScheduleMeetingModal.test.jsx): 4 test cases for modal visibility, successful submission, rate limit handling, and failure fallback.

---

## 3. Key Architectural & Design Decisions

1. **Async Event Loop Discipline via Threadpool**:
   - The official Python `resend` SDK uses synchronous HTTP requests (`requests` library). To comply with `specs/constitution.md` ("No blocking calls on event loop"), calls are executed via `await asyncio.to_thread(resend.Emails.send, params)`.
2. **In-Memory IP Rate Limiting**:
   - To adhere to Scope Discipline (no PostgreSQL/ORM in M1/M2), rate limiting is implemented via `IPRateLimiter` utilizing `cachetools.TTLCache` with a 15-minute sliding TTL. Any IP making more than 3 submissions within 15 minutes receives HTTP 429.
3. **Deterministic Mock Mode**:
   - If `RESEND_API_KEY` is empty, `EmailService` logs a warning and returns `ContactSendResponse(status="mock", message="Email delivery skipped (no API key configured)")` with HTTP 200. This ensures developers and CI runners without API keys can test forms without breakage.
4. **Zero Client Secret Exposure**:
   - All Resend operations are isolated behind the FastAPI backend proxy. Neither `RESEND_API_KEY` nor private tokens exist in client-side code. An automated bundle audit (`Select-String -Path "frontend/dist/assets/*.js" -Pattern "RESEND_API_KEY"`) confirmed zero occurrences.
5. **Fail-Safe UI State Machine & Mobile UX**:
   - `ScheduleMeetingModal.jsx` manages distinct states: `idle`, `loading`, `success`, `error`, and `rateLimit`.
   - On submission errors, the user is provided a fallback email address link (`mailto:contact@joseberos.dev`).
   - Form inputs enforce `font-size: 16px` on all viewports, preventing automatic zooming on mobile iOS WebKit browsers.

---

## 4. Verification & Test Evidence

### Backend Pytest Suite (via `uv run`)
Executed via `cd backend && uv run pytest tests -v`:
```
tests/test_contact.py::test_contact_send_success PASSED                  [  6%]
tests/test_contact.py::test_contact_send_mock_mode PASSED                [ 13%]
tests/test_contact.py::test_contact_send_invalid_email PASSED            [ 20%]
tests/test_contact.py::test_contact_send_missing_name PASSED             [ 26%]
tests/test_contact.py::test_contact_send_notes_too_long PASSED           [ 33%]
tests/test_contact.py::test_contact_send_rate_limit PASSED               [ 40%]
tests/test_contact.py::test_contact_send_resend_failure PASSED           [ 46%]
tests/test_contact.py::test_api_key_not_in_response PASSED               [ 53%]
tests/test_contact.py::test_contact_placeholder_valid_submission PASSED  [ 60%]
tests/test_cors.py::test_cors_allowed_origin PASSED                      [ 66%]
tests/test_cors.py::test_cors_disallowed_origin PASSED                   [ 73%]
tests/test_github_calendar.py::test_calendar_fallback_mode PASSED        [ 80%]
tests/test_github_overview.py::test_overview_fallback_mode PASSED        [ 86%]
tests/test_github_overview.py::test_overview_caching_behavior PASSED     [ 93%]
tests/test_health.py::test_health_returns_200_ok PASSED                  [100%]

======================= 15 passed in 2.48s =======================
```

### Frontend Vitest Suite
Executed via `npm.cmd test -- --run` inside `/frontend`:
```
 ✓ src/__tests__/AboutSection.test.jsx (2 tests)
 ✓ src/__tests__/ProjectsSection.test.jsx (1 test)
 ✓ src/__tests__/GitHubCalendarGrid.test.jsx (2 tests)
 ✓ src/__tests__/ProfileHeader.test.jsx (2 tests)
 ✓ src/__tests__/CertificationsCarousel.test.jsx (3 tests)
 ✓ src/__tests__/ScheduleMeetingModal.test.jsx (4 tests)

 Test Files  6 passed (6)
      Tests  14 passed (14)
   Duration  8.78s
```

### Production Build & Secret Audit
Executed via `npm.cmd run build` inside `/frontend`:
```
✓ 1587 modules transformed.
dist/index.html                   0.85 kB │ gzip:  0.47 kB
dist/assets/index-DJUIBCMN.css  246.86 kB │ gzip: 34.45 kB
dist/assets/index-DZTTpR0O.js   178.39 kB │ gzip: 54.88 kB
✓ built in 8.10s
```
Secret bundle inspection verified **0 matches** for `RESEND_API_KEY`.

---

## 5. Operational Runbook

### Starting Backend (with `uv`):
```powershell
cd backend
uv run uvicorn app.main:app --reload --port 8001
```
- Interactive Swagger docs: `http://localhost:8001/docs`
- Contact send endpoint: `http://localhost:8001/api/contact/send`

### Running Backend Tests:
```powershell
cd backend
uv run pytest tests -v
```

### Starting Frontend:
```powershell
cd frontend
npm.cmd run dev
```
Client application: `http://localhost:5173`.

### Running Frontend Tests & Production Build:
```powershell
cd frontend
npm.cmd test -- --run
npm.cmd run build
```

---

## 6. Next Roadmap Handoff (Milestone 2, Workstream 2 & 3)

With the Live Contact Gateway fully operational, the remaining Milestone 2 priorities are:
1. **Dedicated Project Details Modal / Deep Dive Routes**: Interactive technical case studies for featured projects (architecture diagrams, tech stack breakdowns, and problem/solution walkthroughs).
2. **Automated CI/CD & Production Deployment**: GitHub Actions pipeline configuring linting, testing, and production deployment to Vercel/Cloudflare Pages (frontend) and Render/Railway (backend).
