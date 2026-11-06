# specification.md — Live GitHub Telemetry + Showcase

- **Feature ID:** `FEAT-M1-GITHUB-LIVE`
- **Milestone:** Milestone 1 (per `specs/roadmap.md` Workstream 2 & 3) — refreshed live metrics; not M2 CI/CD, not M3 AI sandbox
- **Date:** 2026-11-06
- **Status:** Implemented & verified locally (2026-11-06); deployment verification pending
- **Decisions locked:**
  - Showcase slugs: `eMSME` (`myrson2/eMSME`) + `colorgame` (`myrson2/ColorGame`)
  - Content: eMSME case-study drafted from GitHub README (like `colorgame` fixture)
  - Token: Backend env only, Render + local `.env`
  - Commits: Sum all public repos, background-refresh cached
  - Cleanup: Delete `equiptrack` from fixtures and tests (and frontend fallback)

---

## 1. Context & Motivation

**Mission (`specs/mission.md`):** Portfolio must surface *engineered live metrics* so hiring managers and hackathon judges can verify proof-of-work without stale manual numbers. KPIs: Lighthouse ≥95, WCAG 2.1 AA, cache hit ≥90%.

**Roadmap (`specs/roadmap.md` M1 Exit Criteria):** `GET /api/github/overview` and `/api/github/calendar` via FastAPI caching proxy with offline fallbacks; ProfileHeader stat bar; Projects showcase (2 hero cards + case-study modal).

**Bug today:**
- `backend/app/services/github_service.py:71,98` hardcodes `total_commits=5240` and `total_repos=data.get("public_repos",40)`.
- `frontend/src/components/Projects/ProjectsSection.jsx:5-24` hardcodes `smartstock-ai` / `depths-descents`; `backend/app/fixtures/projects_data.json` only serves `colorgame`/`equiptrack` → click → `GET /api/projects/smartstock-ai` → `404` → modal shows “Project Not Found” and auto-closes (`ProjectDeepDiveModal.jsx:72-80`).
- `frontend/vercel.json` rewrite currently `https://...onrender.com` without `/api/$1` → all `/api/*` hit `GET /` on Render (root JSON / `405` for POST). Prerequisite fix: preserve `/api`.

**Constitution (`specs/constitution.md`):** Zero Client Secret Leakage, Backend as Gateway, CORS Invariants, In-Memory TTL, Resilience, Scope Discipline (no DB/auth/3D).

---

## 2. User Stories

- **US-1 (Header live):** GIVEN visitor lands on `/`, WHEN header loads, THEN stat bar shows live `total_repos` and `total_commits` (or cached last-good with `is_mock:true` if GitHub down) and `Online ●` indicator.
- **US-2 (Case-study):** GIVEN 2 featured cards (eMSME, ColorGame), WHEN recruiter clicks “Case Study”, THEN `ProjectDeepDiveModal` opens with 5 tabs (Overview & Metrics, Architecture, Challenges, Rationale, Sandbox) from merged GitHub metadata + case-study fixture.
- **US-3 (Resilience):** GIVEN GitHub REST/GraphQL returns 429/timeout, WHEN visitor hits `/api/github/overview`, THEN backend returns HTTP 200 cached/fixture, never 500, frontend never crashes.
- **US-4 (Deep link):** GIVEN user visits `/#project/eMSME`, WHEN hash changes, THEN modal for `eMSME` opens automatically.

---

## 3. Functional Requirements

- **FR-1 — Live overview:** `GET /api/github/overview?username=myrson2` returns `total_repos` from `GET /users/{u}` and `total_commits` as **sum of all public repos** (paginated `per_page=100`, `Link` header). `is_mock:false` on live success.
- **FR-2 — Live calendar:** `GET /api/github/calendar?username=myrson2` remains GraphQL live (requires `GITHUB_TOKEN`), fallback to `github_calendar_fallback.json` on 401/429/error.
- **FR-3 — Projects list:** `GET /api/projects` returns enriched summaries for curated slugs `eMSME` + `colorgame` only (each: `slug, title, tagline, category, tags, github_url, demo_url, stars, forks, language, pushed_at`). Stars/forks/language from `GET /repos/myrson2/{slug}` merged with fixture copy.
- **FR-4 — Project detail:** `GET /api/projects/{slug}` returns full detail for `eMSME` (new fixture drafted from README) and `colorgame` (existing). Unknown slug → `404` `{"detail":"Project not found"}`.
- **FR-5 — Slug alignment:** `ProjectsSection.jsx` FEATURED_PROJECTS becomes `eMSME` + `colorgame`; remove `smartstock-ai`/`depths-descents` references. `frontend/src/services/api.js` `FALLBACK_PROJECTS` gains `eMSME`, removes `equiptrack` (and any stale `smartstock` if present).
- **FR-6 — Caching:** In-memory TTL (default 1800s, target 900s via `CACHE_TTL_SECONDS`) for `overview_*`, `calendar_*`, `commits_total`, `repo_meta_*`. Commit-sum recompute runs as `BackgroundTasks` after response (return stale immediately).
- **FR-7 — Secrets:** `GITHUB_TOKEN` via `app/core/config.py` Settings only from local `.env` / Render env vars. Never bundled to `dist/`. `.env.example` files remain placeholders (`GITHUB_TOKEN=`).

---

## 4. Non-Functional Requirements

- **NFR-1 Security:** No token in frontend bundle, no `GITHUB_TOKEN` in `frontend/src/`, `dist/`, `vercel.json`. `ALLOWED_ORIGINS` in Render must include `http://localhost:5173` and Vercel prod domain.
- **NFR-2 Performance:** Cached p95 <200ms. Live commit-sum may take 3–8s on miss — never block user; serve cached value.
- **NFR-3 Resilience:** Per-call timeouts 5s REST / 6s GraphQL. On `401/403/429/timeout` return cached or fixture with `is_mock:true`.
- **NFR-4 Scope:** No DB, no auth/JWT/cookies, no Three.js/Canvas, no live calendar booking. Complies with M1 scope discipline.
- **NFR-5 Accessibility:** Stat bar monospace numbers, no layout-shift when `is_mock` toggles; modal keyboard Esc + ARIA.

---

## 5. Acceptance Criteria

- [ ] `curl https://<render>/api/github/overview` shows real `total_repos` and non-hardcoded `total_commits`, `is_mock:false` with token set; `is_mock:true` without.
- [ ] `curl /api/projects` contains only `eMSME` + `colorgame`; `curl /api/projects/eMSME` → 200 full detail; `curl /api/projects/equiptrack` → 404.
- [ ] Clicking both hero cards opens modal with 5 tabs populated (no “Not Found” auto-close).
- [ ] `grep -r GITHUB_TOKEN frontend/dist/` → 0 matches.
- [ ] `frontend/vercel.json` rewrite is `https://personal-portfolio-c6mp.onrender.com/api/$1` and `curl https://<vercel>/api/health` returns `{"status":"ok"...}`.
- [ ] Backend tests updated: `colorgame` + `eMSME` pass; `equiptrack` assertions removed.

---

## 6. Out of Scope

- Live “total commits” via GitHub Apps / `/search/commits` (rate-limited) — use REST pagination + cache.
- AI sandbox (M3), full contact delivery domain verification (M2), DB/ORM persistence.
- Preview deploys per PR (Vercel auto handles).
