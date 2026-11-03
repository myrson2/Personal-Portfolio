# validation.md
## FEAT-M2-CICD — Automated CI/CD & Production Deployment

- **Feature ID**: `FEAT-M2-CICD`
- **Milestone**: Milestone 2, Workstream 3
- **Date**: 2026-11-03

---

## Automated Test Matrix

| # | Test | Tool | Command | Pass Criteria |
|---|------|------|---------|--------------|
| 1 | Backend unit + integration suite | pytest | `cd backend && uv run pytest tests -v` | 19/19 passed |
| 2 | Frontend component test suite | Vitest | `cd frontend && npm test -- --run` | 20/20 passed |
| 3 | Frontend lint | ESLint | `cd frontend && npm run lint` | 0 errors, 0 warnings |
| 4 | Frontend production build | Vite | `cd frontend && npm run build` | `dist/` created, exit code 0 |
| 5 | Secret bundle audit | grep | `grep -r "RESEND_API_KEY" frontend/dist/` | 0 matches |
| 6 | Backend health-check (live) | curl | `curl https://<render-url>/api/health` | `{"status": "ok"}` |
| 7 | Projects list endpoint (live) | curl | `curl https://<render-url>/api/projects` | HTTP 200, JSON array |
| 8 | GitHub calendar endpoint (live) | curl | `curl https://<render-url>/api/github/calendar` | HTTP 200, `weeks` array |
| 9 | PR deploy-skip assertion | GitHub Actions | Open test PR → inspect jobs | `deploy` job shows "skipped" |
| 10 | Frontend live smoke test | Browser | Open Vercel URL | Portfolio renders all 6 sections |

---

## Constitution Compliance Matrix

Checked against `specs/constitution.md` invariants:

| Constitutional Rule | Status | Evidence / Verification |
|--------------------|--------|------------------------|
| **Zero client secret leakage** — No tokens, API keys, or PATs in the frontend bundle | ✅ COMPLIANT | CI step: `grep -r "RESEND_API_KEY" frontend/dist/` must return 0 matches. All secrets injected via GitHub Secrets → Render env vars only. `RESEND_API_KEY` is never imported in any frontend file. |
| **No PostgreSQL / SQLite / ORM in M2** | ✅ COMPLIANT | Pipeline deploys existing architecture with no new persistence layer. `render.yaml` introduces no database service. |
| **No Multi-user Auth / JWT / Cookies** | ✅ COMPLIANT | No auth layer introduced. CI only runs existing tests which verify no auth endpoints exist. |
| **No Three.js / Babylon.js / Heavy 3D** | ✅ COMPLIANT | No new frontend dependencies added. Vite build audit (`npm run build`) would flag any unexpected large dependency. |
| **FastAPI + Uvicorn only backend runtime** | ✅ COMPLIANT | `backend/Dockerfile` CMD: `uvicorn app.main:app --host 0.0.0.0 --port 8000`. No alternative ASGI server. |
| **In-memory TTL cache preserved** | ✅ COMPLIANT | `render.yaml` passes `CACHE_TTL=900` env var; `cachetools.TTLCache` initializes from this value in `core/cache.py`. |
| **CORS middleware intact** | ✅ COMPLIANT | No changes to `app/main.py`. CI runs `test_cors.py` (2 tests) which verify allowed/disallowed origins. |
| **Upstream resilience & mock fallbacks** | ✅ COMPLIANT | `render.yaml` sets `healthCheckPath: /api/health`. Render withholds traffic until the endpoint confirms `{"status":"ok"}`. Fallback fixtures remain bundled in the backend. |
| **Scope Discipline — M2 scope only** | ✅ COMPLIANT | CI/CD is the final M2 workstream. Pipeline introduces 0 M3 features (no AI demos, analytics, or terminal mode). |

---

## Manual QA Runbook (Post-Deploy Verification)

Execute the following steps after every successful `main` push:

### Step 1 — Verify CI Actions Log
1. Navigate to the repository on GitHub → **Actions** tab.
2. Click the latest workflow run triggered by the `main` push.
3. Confirm every step in the `ci` job shows a green ✅.
4. Confirm the `deploy` job shows green ✅ with Vercel URL and Render hook confirmation.

### Step 2 — Verify Vercel Frontend
1. Open the Vercel project URL in a browser.
2. Verify all 6 portfolio sections render: Hero, About, Projects, Certifications, GitHub Calendar, Footer.
3. Verify the floating pill navigation scrolls to each section correctly.
4. Verify the hero typewriter cursor animates.

### Step 3 — Verify Deep Dive Modal (Critical Path)
1. On the Projects section, click **"Case Study →"** on the SmartStock AI card.
2. Confirm the `ProjectDeepDiveModal` opens and all 5 tabs are accessible: Overview & Metrics, Architecture, Engineering Challenges, Tech Rationale, Live Sandbox.
3. In the Simulated Sandbox terminal, type a command and verify the output renders correctly.
4. Press **Escape** to close the modal. Confirm URL hash clears back to `#projects`.

### Step 4 — Verify Render Backend (Live Endpoints)
```bash
# Health check
curl https://<render-url>/api/health
# Expected: {"status":"ok"}

# GitHub overview (or mock fallback)
curl https://<render-url>/api/github/overview
# Expected: HTTP 200, JSON with is_mock true/false

# Projects list
curl https://<render-url>/api/projects
# Expected: HTTP 200, array with smartstock-ai and depths-descents

# Project detail
curl https://<render-url>/api/projects/smartstock-ai
# Expected: HTTP 200, full case study JSON

# Invalid slug
curl https://<render-url>/api/projects/does-not-exist
# Expected: HTTP 404
```

### Step 5 — Verify Contact Form (Live Email)
1. Open the Schedule Meeting modal (click the "Schedule meeting" CTA in the hero).
2. Fill in: Name, a valid email, a preferred date, and a topic.
3. Submit the form.
4. Verify the success state appears (5-state UI machine transitions to success).
5. Check the inbox of `RESEND_FROM_EMAIL` for the forwarded notification.

### Step 6 — Verify PR CI-Only Gate
1. Create a test branch: `git checkout -b test/ci-gate-check`.
2. Make a trivial change (e.g., add a comment to `README.md`).
3. Open a PR targeting `main`.
4. In the **Actions** tab, verify the `ci` job runs and the `deploy` job shows as **Skipped**.

### Step 7 — Secret Bundle Audit
1. In the browser, open DevTools → Sources panel.
2. Search (`Ctrl+Shift+F`) across all loaded JS files for: `RESEND_API_KEY`.
3. **Expected result**: 0 matches found.

### Step 8 — Responsive Verification
1. Open DevTools → Toggle device toolbar.
2. Test at 375px (mobile): all sections collapse to single column, pill nav scrolls horizontally, deep dive modal is scrollable.
3. Test at 768px (tablet): two-column editorial grid activates.
4. Test at 1280px (desktop): full layout with proper sidebar label alignment.

---

## Known Limitations & Deferred Items

| Item | Disposition |
|------|------------|
| Render free tier may spin down after 15 min inactivity (cold start ~30s) | Acceptable for M2; Milestone 3 can add an uptime pinger |
| No automated end-to-end (E2E) Playwright/Cypress tests | Deferred to Milestone 3 — Vitest component tests provide sufficient M2 coverage |
| Preview deploy URLs for Vercel PRs | Enabled automatically by Vercel; no extra config needed |
| Docker image build caching on Render | Render free tier rebuilds from scratch; acceptable for portfolio scale |

