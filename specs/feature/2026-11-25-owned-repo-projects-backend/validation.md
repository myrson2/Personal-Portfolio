# validation.md
## FEAT-PROJECTS-OWNED-REPOS — GitHub-Sourced Projects Backend (Owned Repos Only)

- **Feature ID**: `FEAT-PROJECTS-OWNED-REPOS`
- **Milestone**: Post-M2 maintenance
- **Date**: 2026-11-25
- **Status**: Approved — Implemented (backend). `pytest tests -q` → **38 passed** (2026-11-25). Live/deployed manual QA pending.

---

## Automated Test Matrix

All tests drive `GET /api/projects` through `TestClient`, with GitHub mocked by `httpx.MockTransport`. They run offline.

| # | Test | Scenario | Pass Criteria |
|---|------|----------|--------------|
| 1 | `test_no_token_without_snapshot_returns_empty_fixture` | No token, no snapshot | 200, `projects == []`, `is_mock=true`, `source="fixture"` |
| 2 | `test_live_fetch_filters_sorts_limits_and_writes_snapshot` | Mixed repos incl. fork/private/archived/third-party | Request hits `/user/repos` with `affiliation=owner`, `visibility=all`, bearer token. Result order `c,b,d,e,a` (stars↓, push↓ tie-break, limit 5). Items have exactly 4 keys. `null` language preserved. Snapshot written with the same 5. |
| 3 | `test_upstream_error_serves_snapshot[401/403/429/500]` | GitHub error with snapshot present | `source="snapshot"`, `is_mock=true`, snapshot items returned |
| 4 | `test_timeout_without_snapshot_serves_fixture` | `ConnectTimeout`, no snapshot | `source="fixture"`, empty list |
| 5 | `test_corrupt_snapshot_falls_back_to_fixture` | Invalid JSON snapshot | `source="fixture"` |
| 6 | `test_detail_endpoint_removed` | `GET /api/projects/eMSME` | 404 |
| 7 | `test_live_fetch_follows_pagination` | Page 1 = 100 repos, page 2 = 1 starred repo | Pages `[1, 2]` requested. Page-2 repo ranks first. 5 items returned. |
| 8 | `test_failure_on_second_page_serves_fallback` | Page 1 OK, page 2 → 429 | No partial list. `source="fixture"`, `is_mock=true` |
| 9 | Full backend suite | `cd backend && uv run pytest tests -q` | ✅ 38/38 passed. No regressions in overview/calendar/contact/CORS. |

---

## Constitution Compliance Matrix

| Constitutional Rule | Status | Evidence / Verification |
|--------------------|--------|------------------------|
| **Zero client secret leakage** | ✅ COMPLIANT | Token is only used in the backend `_headers()`. No frontend files change. |
| **Backend as gateway** | ✅ COMPLIANT | The only GitHub call is FastAPI → `/user/repos`. |
| **Resilience over external dependencies** | ✅ COMPLIANT | Live → snapshot → fixture chain. Endpoint always returns 200 (tests 1, 3–5). |
| **In-memory TTL cache (15–60 min)** | ✅ COMPLIANT | Existing `TTLCache` / `CACHE_TTL_SECONDS` reused for live and fallback responses. |
| **Strict Pydantic models** | ✅ COMPLIANT | `extra="forbid"` on both models. Test 2 asserts the exact key set. |
| **CORS invariants** | ✅ COMPLIANT | `app/main.py` untouched. `test_cors.py` still passes. |
| **No DB / ORM** | ✅ COMPLIANT | Snapshot is a plain JSON file. No new dependencies. |

---

## Manual QA Runbook

1. **Live path** (local `.env` with a valid `GITHUB_TOKEN`):
   `cd backend && uv run uvicorn app.main:app --port 8001`, then `curl http://localhost:8001/api/projects`
   → `source="live"`, ≤ 5 public owned repos, and `backend/data/projects_snapshot.json` is created.
2. **Snapshot path**: Set `GITHUB_TOKEN=invalid` and restart → `source="snapshot"`, same projects as step 1.
3. **Fixture path**: Delete `backend/data/` and keep the invalid token → `source="fixture"`, `projects: []`.
4. **Removed route**: `curl -i http://localhost:8001/api/projects/eMSME` → 404.
5. **Docs**: `/docs` shows a single Projects route with the `ProjectsResponse` schema.

---

## Known Limitations & Deferred Items

| Item | Disposition |
|------|------------|
| Fallback responses are cached for a full TTL, so recovery can lag up to `CACHE_TTL_SECONDS` | Accepted trade-off (avoids hammering GitHub) |
| Snapshot resets on Render redeploy (ephemeral disk) | Accepted. It is recreated on the first successful fetch |
| Frontend still renders hardcoded `FEATURED_PROJECTS` (list endpoint unused); the modal's detail call now 404s and uses the client fallback | Non-GitHub projects remain visible until the follow-up frontend refactor consumes `GET /api/projects` |
| Only one primary language per repo | By design. GitHub's derived `language` is the only stack signal |
