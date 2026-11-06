# validation.md — Live GitHub Telemetry + Showcase

- **Feature ID:** `FEAT-M1-GITHUB-LIVE`
- **Milestone:** M1
- **Date:** 2026-11-06
- **Local Verification:** Complete — 31/31 backend tests, 21/21 frontend tests, production build, live GitHub smoke (**49 total repos** / 370 public non-fork commits), secret audit. Deployed Render/Vercel checks pending.

---

## 1. Automated Test Matrix

| # | Test | Tool | Command | Pass Criteria |
|---|------|------|---------|---------------|
|1| backend overview live (mocked httpx) | pytest | `cd backend && uv run pytest tests/test_github_overview.py -v` | 200, `total_repos>0`, `total_commits>0`, `is_mock:false` (mocked GH) |
|1a| repo count includes private repos | pytest | `pytest tests/test_github_live.py -k owned_repo_count -v` | `GET /user/repos` Link-header count returned (49), public-only fallback documented |
|2| overview fallback no-token | pytest | same suite, unset `GITHUB_TOKEN` | 200, `is_mock:true`, fixture shape, cached |
|3| calendar live + fallback | pytest | `pytest tests/test_github_calendar.py -v` | 200, `weeks` array; fallback `is_mock:true` without token |
|4| commit-sum pagination | pytest (httpx mock, 2 pages) | `pytest tests/test_github_overview.py::test_commit_sum_paginates` | correct sum, dedupes forks, clamps `per_page=100` |
|5| background refresh does not block | pytest / timing | mocked slow commits (sleep 2s) | cached response <200ms, background task updates cache |
|6| projects list/detail (new slugs) | pytest | `pytest tests/test_projects.py -v` | `GET /api/projects` → `["eMSME","colorgame"]` only; detail 200 for both; `equiptrack` → 404; unknown → 404 |
|7| secret leak audit | grep | `grep -rE "GITHUB_TOKEN|RESEND_API_KEY|github_pat_|ghp_|gho_" frontend/dist/` | 0 matches |
|8| CORS preflight | pytest | `pytest tests/test_cors.py -v` | `OPTIONS /api/github/overview` with `Origin: http://localhost:5173` → `allow-origin` header |
|9| health gate live | curl | `curl https://<render>/api/health` | `{"status":"ok", "service":"personal-portfolio-backend"}` |
|10| live overview (deployed) | curl | `curl "https://<render>/api/github/overview?username=myrson2"` | 200 JSON, `total_repos` real, `is_mock:false` (token set) |
|11| live via Vercel rewrite | curl | `curl "https://<vercel>/api/github/overview?username=myrson2"` | identical to direct Render (proves `/api/$1` rewrite) |
|12| frontend modal | Vitest | `cd frontend && npm test -- --run ProjectDeepDiveModal` | `eMSME` modal renders 5 tabs with mocked `fetchProjectDetails`; `invalid-slug` → not-found notice |
|13| frontend build | Vite | `cd frontend && npm run build` | `dist/` created, exit 0, no TS/JSX errors |

**Fixtures/Try:** `projects_data.json` validation: `python -m json.tool app/fixtures/projects_data.json` exit 0; `ProjectDetailResponse` round-trip for `eMSME` in `test_projects.py`.

---

## 2. Constitution Compliance Matrix

Checked against `specs/constitution.md` (70/30/20 palette, two-column editorial, Zero Secret Leakage, Backend Gateway, CORS, TTL, Resilience, M1 Scope).

| Constitutional Rule | Status | Evidence / Verification |
|---|---|---|
| **Zero Client Secret Leakage** | ✅ COMPLIANT | `GITHUB_TOKEN` only in `app/core/config.py` Settings / Render env. CI audit `grep -r GITHUB_TOKEN frontend/dist/` → 0. `.env.example` placeholders only. |
| **Backend as Single Gateway** | ✅ COMPLIANT | Frontend `api.js` only calls `/api/...`; never `api.github.com` directly. `resend`/`httpx` server-side only. |
| **CORS Invariants** | ✅ COMPLIANT | `app/main.py:13-19` `CORSMiddleware` with `settings.cors_origins`. Render `ALLOWED_ORIGINS` includes `localhost:5173` + Vercel prod. `test_cors.py` passes. |
| **Input Validation (Pydantic)** | ✅ COMPLIANT | `GitHubOverviewResponse`, `GitHubCalendarResponse`, `ProjectDetailResponse` strict models; `ContactSendRequest` email regex unchanged. |
| **In-Memory TTL Cache (15–60 min)** | ✅ COMPLIANT | `app/core/cache.py:5 TTLCache(ttl=CACHE_TTL_SECONDS)`. Keys `overview_/calendar_/commits_total/repo_meta_`. `render.yaml` fixed to `CACHE_TTL_SECONDS=900`. |
| **Upstream Resilience / Fallbacks** | ✅ COMPLIANT | `github_service.py` fallback fixtures on 401/429/timeout, `is_mock:true`. `project_service.py` fixtures bundled; `Dockerfile` copies `app/fixtures/` via `COPY . .` (context `backend`). |
| **Scope Discipline M1** | ✅ COMPLIANT | No DB/ORM, no JWT/auth (no `get_current_user`), no Three.js, no calendar booking. `render.yaml` adds no `plan: database` service. |
| **70/30/20 + Two-Column Editorial** | ✅ COMPLIANT | No CSS changes in this feature; `ProfileHeader`/`ProjectsSection` layout untouched except slug titles. WCAG 2.1 AA preserved. |

**Additional invariants adapted for portfolio (from feature-spec-triad generic checklist):**
- Single auth gateway (`get_current_user`) — N/A, public portfolio, no user auth. All exposure is via unauthenticated proxy endpoints with Pydantic validation.
- IDOR masking (404 vs 403) — N/A, public data only; `GET /api/projects/{slug}` returns 404 for unknown slug (already compliant in `endpoints/projects.py:14-21`).
- Session token security — N/A, no sessions/cookies.
- Async discipline — `httpx.AsyncClient` awaited in `github_service.py:60,128`; `resend` offloaded via `asyncio.to_thread` in `email_service.py:40`.
- Batch migration / FK cascades — N/A (no DB).

---

## 3. Manual QA & Exploratory Testing Runbook

### Step 1 — Local verification
1. `cd backend && uv run uvicorn app.main:app --reload --port 8001` → docs at `/docs`.
2. `curl http://localhost:8001/api/health` → `{"status":"ok"}`.
3. `curl "http://localhost:8001/api/github/overview?username=myrson2"` → `total_repos: 49` (40 public + 9 private) when `GITHUB_TOKEN` can read all repositories, `is_mock:true` when removed. A public-only token reports 40.
4. `curl http://localhost:8001/api/projects` → `eMSME` + `colorgame`.
5. `cd frontend && npm run dev` → header numbers live, both cards open modal (5 tabs + sandbox runs), `#project/eMSME` deep-link works.

### Step 2 — Deployed verification (after Render + Vercel redeploy)
```bash
curl https://<render>/api/health
curl "https://<render>/api/github/overview?username=myrson2"
curl "https://<render>/api/github/calendar?username=myrson2"
curl https://<render>/api/projects
curl https://<render>/api/projects/eMSME
curl https://<render>/api/projects/colorgame
curl https://<render>/api/projects/equiptrack  # expect 404

curl "https://<vercel>/api/health"
curl "https://<vercel>/api/github/overview?username=myrson2"  # identical to Render direct
```
Verify `is_mock` flag, `total_commits` not hardcoded 5240, calendar `weeks` non-empty.

### Step 3 — Regression
1. Remove token in Render (temporarily) → redeploy → curl shows `is_mock:true`, frontend shows cached Offline indicator, no crash.
2. Add token back → redeploy → `is_mock:false` within 30-min cache window (or wait TTL).
3. Submit contact form via live site → expect `sent` (if Resend vars set) or `mock` (if not), not `503` from rewrite bug; confirm no `GITHUB_TOKEN` in browser DevTools → Sources search.

### Step 4 — Responsive & Accessibility
- Mobile 375px: stat bar wraps, cards stack, modal scrollable.
- Desktop 1200px+: two-column editorial intact.
- Lighthouse / keyboard Esc on modal.

---

## 4. Known Limitations & Deferred Items

| Item | Disposition |
|---|---|
| Commit-sum across all repos is expensive (37 public non-fork repos × pagination) | Background refresh + 30-min TTL; consider GraphQL `contributionsCollection` total as alternate metric in M3 |
| Render free cold start 30–50s | Acceptable M1; M3 can add uptime pinger; frontend shows skeleton |
| eMSME README copy may drift from GitHub | Fixture is snapshot; re-sync on README change is manual in M1 |
| `equiptrack` removal breaks old deep links `#project/equiptrack` | Intentional; 404 + not-found notice is acceptable per spec (slug retired) |
| No E2E (Playwright) | Deferred to M3; Vitest + curl matrix sufficient for M1 |
