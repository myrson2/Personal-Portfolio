# implementation.md
## FEAT-PROJECTS-OWNED-REPOS — GitHub-Sourced Projects Backend (Owned Repos Only)

- **Feature ID**: `FEAT-PROJECTS-OWNED-REPOS`
- **Milestone**: Post-M2 maintenance
- **Date**: 2026-11-25

---

## Architectural Overview

```
Frontend ──GET /api/projects──▶ FastAPI projects router
                                     │
                                     ▼
                          project service: get_projects()
                                     │
                     ┌── TTL cache hit? ──yes──▶ return cached envelope
                     │no
                     ▼
            GITHUB_TOKEN set? ──no──────────────────────┐
                     │yes                               │
                     ▼                                  │
   GET /user/repos?affiliation=owner&visibility=all     │
        (Bearer token, server-side, paginated)          │
                     │                                  │
         200 + list? ──no / 401 / 403 / 429 / timeout ──┤
                     │yes                               ▼
                     ▼                          snapshot valid? ──yes──▶ source=snapshot, is_mock=true
    select_projects(): owner==myrson2,                  │no
    public, !fork, !archived → sort stars↓,             ▼
    pushed_at↓ → top 5 → 4 fields               fixture [] ─────────▶ source=fixture, is_mock=true
                     │
                     ▼
    atomic write snapshot → source=live, is_mock=false
                     │
                     ▼
          set TTL cache (live and fallback alike)
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `backend/app/models/project.py` | Rewrite | `ProjectItem` + `ProjectsResponse`, strict (`extra="forbid"`) |
| `backend/app/services/project_service.py` | Rewrite | Live fetch → filter/sort/limit → snapshot → fallback chain |
| `backend/app/api/endpoints/projects.py` | Rewrite | Single `GET /api/projects`; detail route removed |
| `backend/app/core/config.py` | Edit | Add `PROJECTS_SNAPSHOT_PATH` (default `data/projects_snapshot.json`) |
| `backend/app/fixtures/projects_fallback.json` | Create | Committed static fallback: `[]` |
| `backend/app/fixtures/projects_data.json` | Delete | Invented case-study content |
| `backend/app/services/github_service.py` | Edit | Remove now-unused `fetch_repo_meta` |
| `backend/tests/test_projects.py` | Rewrite | Offline endpoint tests via `httpx.MockTransport` |
| `.gitignore` | Edit | Ignore `backend/data/` (runtime snapshot) |

---

## Endpoint Contract

**Before**
```
GET /api/projects         -> [ {slug, title, tagline, category, tags[], github_url, demo_url,
                                stars, forks, language, pushed_at}, ... ]
GET /api/projects/{slug}  -> ProjectDetailResponse (case study) | 404
```

**After**
```json
GET /api/projects -> 200
{
  "projects": [
    {
      "name": "eMSME",
      "language": "Python",
      "description": "...",
      "html_url": "https://github.com/myrson2/eMSME"
    }
  ],
  "is_mock": false,
  "source": "live",
  "cached_at": "2026-11-25T04:40:00+00:00"
}
```
`GET /api/projects/{slug}` → 404 (route removed).

---

## Key Logic

- **Filter**: `owner.login.lower() == GITHUB_USERNAME.lower()`, `not private`, `not fork`, `not archived`, `name` and `html_url` present.
- **Sort**: Stable two-pass sort: first by `pushed_at` descending, then by `stargazers_count` descending. Truncate to `MAX_PROJECTS = 5`.
- **Snapshot write**: `mkdir -p` the parent, write `<path>.tmp`, then `os.replace` it over the snapshot. `OSError` is logged and swallowed.
- **Snapshot/fixture read**: Parse JSON and validate every item via `ProjectItem`. On any exception, log it and treat the file as missing.
- **Errors**: All exceptions from the live path are caught and lead to the fallback chain. The endpoint never returns 5xx because of GitHub.

---

## Downstream Frontend Impact (for the follow-up feature)

Current state: `ProjectsSection` is hardcoded (`FEATURED_PROJECTS`) and `fetchProjects()` is unused, so the list contract change breaks nothing today. Only `ProjectDeepDiveModal` calls the removed detail route, and it degrades to the client fallback. The hardcoded non-GitHub projects remain visible until the follow-up:

- Wire `ProjectsSection` to `fetchProjects()`. Read `res.projects` and map `name/language/description/html_url`.
- `ProjectDeepDiveModal`, `fetchProjectDetails()`, `#project/{slug}` hash routing and `FALLBACK_PROJECTS` become dead code and should be removed.
- The UI should handle an empty `projects` list (`source="fixture"`) with a placeholder state, and may show a subtle "cached" hint when `source="snapshot"`.
