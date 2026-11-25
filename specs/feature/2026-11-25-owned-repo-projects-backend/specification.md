# specification.md
## FEAT-PROJECTS-OWNED-REPOS — GitHub-Sourced Projects Backend (Owned Repos Only)

- **Feature ID**: `FEAT-PROJECTS-OWNED-REPOS`
- **Milestone**: Post-M2 maintenance (backend half of the Projects section refactor; the frontend half is a follow-up feature)
- **Status**: Implemented — backend complete 2026-11-25 (38/38 pytest); frontend consumption pending follow-up feature
- **Author / Lead**: Jose Myrson O. Beros
- **Date**: 2026-11-25

---

## Problem Statement

The Projects section currently shows data that does not reflect the owner's real GitHub account:

1. **Inaccurate tech stacks**: Project tags, architecture text, metrics, challenges and simulated sandbox steps are hand-written in a curated fixture. The listed stacks (e.g. "Python, FastAPI, React, PostgreSQL") are invented and do not match the repositories.
2. **Projects not in the owner's GitHub**: The showcase is driven by a hardcoded curated list and slug-to-repo mapping, not by what actually exists under the `myrson2` account.

Most of the owner's projects are not full-stack and have no live pages, so rich case studies are not possible. Visitors need a plain, accurate list instead.

## Solution

The Projects backend becomes a thin, strict proxy over the owner's own GitHub repositories:

- Repositories are discovered only through the authenticated "my repos" endpoint, filtered to repos **owned by `myrson2`** that are public, non-fork and non-archived.
- Each project exposes only four GitHub-derived fields: `name`, `language`, `description`, `html_url`. The stack signal is GitHub's single derived primary `language`. When GitHub reports none, the backend returns `null` and does not guess.
- The list shows the **top 5 by star count**, with ties broken by most recent push.
- **Resilience (last-known-good snapshot)**: The backend first checks whether the live GitHub API call succeeds. If it does, it serves that data and overwrites an on-disk snapshot. If it doesn't (no token, 401/403/429, timeout, network error, bad payload), it serves the snapshot. If no snapshot exists yet, it serves a committed, empty static fixture.
- The case-study detail endpoint, its models and the invented fixture are deleted.

---

## User Stories

1. As a recruiter, I want every listed project to be a real repository in the owner's GitHub account, so that I can trust the portfolio.
2. As a recruiter, I want each project's language to come from GitHub itself, so that the stated tech stack is accurate.
3. As a recruiter, I want a project with no detectable language to show no language rather than a guessed one, so that nothing is misrepresented.
4. As a recruiter, I want each project to link directly to its GitHub repository, so that I can inspect the code.
5. As a recruiter, I want to see the repository description, so that I understand what the project does at a glance.
6. As a recruiter, I want to see the owner's most-starred projects first, so that the strongest work is surfaced.
7. As a recruiter, I want a short list (at most 5), so that the section stays scannable.
8. As a visitor, I never want to click a project link that 404s, so that private repositories are never listed.
9. As a visitor, I don't want forks shown as the owner's work, so that the list reflects original projects.
10. As a visitor, I don't want archived or abandoned repositories in the showcase, so that the list feels current.
11. As a visitor, I want the Projects section to keep working when GitHub is down or rate-limited, so that the page never breaks.
12. As the portfolio owner, I want the last successful GitHub result saved automatically, so that an expired or revoked token doesn't wipe the section without me noticing.
13. As the portfolio owner, I want the API to tell the frontend whether the data is live, a snapshot or the fixture, so that the UI can show an honest freshness state.
14. As the portfolio owner, I want new repos, description edits and language changes on GitHub to appear automatically after the cache TTL, so that I never edit fixtures by hand.
15. As the portfolio owner, I want my GitHub token to stay server-side, so that it can never leak through the frontend bundle.
16. As the portfolio owner, I want the backend to only query my own account, never third-party users or pinned repos, so that the data source stays tightly scoped.
17. As the portfolio owner, I want the backend not to crawl repository contents, READMEs, manifests or commits, so that refreshes stay cheap and predictable.
18. As the portfolio owner, I want GitHub responses cached in memory with the existing TTL, so that the GitHub rate limit is never exhausted.
19. As the portfolio owner, I want failed GitHub calls cached too, so that an outage isn't amplified into one slow upstream call per visitor.
20. As the portfolio owner, I want a corrupt snapshot file to be ignored safely, so that a bad write never crashes the endpoint.
21. As the portfolio owner, I want snapshot writes to be atomic, so that a crash mid-write never leaves a half-written file.
22. As the portfolio owner, I want the snapshot file to be gitignored, so that runtime data never pollutes commits.
23. As the portfolio owner, I want the committed fallback fixture to be empty rather than invented, so that the "no invented data" rule holds even offline.
24. As a frontend developer, I want a strict response schema that rejects extra fields, so that GitHub payload fields can never leak into the contract.
25. As a frontend developer, I want the removed detail endpoint to return 404, so that stale callers fail predictably.
26. As a CI maintainer, I want the backend test suite to run fully offline with GitHub mocked, so that CI never depends on network access or real secrets.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | `GET /api/projects` returns the `ProjectsResponse` envelope (see Implementation Decisions). |
| FR-2 | Discovery uses only `GET https://api.github.com/user/repos?affiliation=owner&visibility=all` (paginated, `per_page=100`, safety cap of 10 pages), authenticated with the backend `GITHUB_TOKEN`. |
| FR-3 | Repos are kept only if `owner.login` equals `GITHUB_USERNAME` (case-insensitive), `private` is false, `fork` is false and `archived` is false. |
| FR-4 | Kept repos are sorted by `stargazers_count` descending, ties broken by `pushed_at` descending, then truncated to 5. |
| FR-5 | Each project item contains exactly `name`, `language`, `description`, `html_url`, read straight from the `/user/repos` payload. `language` and `description` may be `null`. |
| FR-6 | No calls to `/users/{other}`, pinned-repo GraphQL, repo contents, READMEs, languages breakdown, commits or manifests. |
| FR-7 | On a successful live fetch: respond with `source="live"`, `is_mock=false`, and overwrite the snapshot file atomically. |
| FR-8 | On any failure (missing token, non-200 including 401/403/429/5xx, timeout, network error, non-list payload): respond with the snapshot (`source="snapshot"`, `is_mock=true`). If there is no valid snapshot, respond with the committed fixture (`source="fixture"`, `is_mock=true`, empty list). |
| FR-9 | Every response, live or fallback, is stored in the in-memory TTL cache (`CACHE_TTL_SECONDS`). |
| FR-10 | `GET /api/projects/{slug}` is removed. The case-study models, curated order, slug map and invented fixture are deleted. |
| FR-11 | The snapshot path is configurable through the `PROJECTS_SNAPSHOT_PATH` setting (default `data/projects_snapshot.json`, relative to the backend directory) and is gitignored. |

---

## Non-Functional Requirements

- **Security**: `GITHUB_TOKEN` is read only from the backend environment and sent only as a server-side `Authorization` header.
- **Resilience**: The endpoint always returns HTTP 200 with a valid envelope. Snapshot write failures are logged, never raised.
- **Performance**: At most one GitHub request per page per TTL window (typically 1 request per 30 minutes).
- **Scope**: No database, ORM or new dependency. The snapshot is a plain JSON file, consistent with the M1/M2 "in-memory cache + JSON" rule.

---

## Implementation Decisions

- **Modules modified**:
  - *Project models*: Replace the summary/detail/case-study models with two strict models (`extra="forbid"`):
    ```text
    ProjectItem      { name: str, language: str | null, description: str | null, html_url: str }
    ProjectsResponse { projects: ProjectItem[], is_mock: bool,
                       source: "live" | "snapshot" | "fixture", cached_at: ISO-8601 str }
    ```
  - *Project service*: Rewritten as module-level functions. Its public interface is `get_projects() -> ProjectsResponse` plus a pure `select_projects(repos, owner)` (filter, sort, limit, map). It reuses the GitHub service's API base URL and header builder.
  - *Projects router*: A single list route. The detail route is removed.
  - *Settings*: Add `PROJECTS_SNAPSHOT_PATH`.
  - *Fixtures*: Delete the curated case-study fixture and add an empty static fallback fixture (`[]`).
  - *GitHub service*: Leave untouched except that the per-repo meta helper used by the old project service becomes unused (removed if nothing else references it).
- **Language source**: Read `language` from the `/user/repos` list payload instead of calling `GET /repos/myrson2/{repo}` per repo. It is the same GitHub-derived field, it avoids about 40 extra calls per refresh, and it avoids partial-failure handling. (Developer decision, grilling Q5.)
- **Envelope over bare list**: Freshness flags (`is_mock`, `source`, `cached_at`) live at the envelope level, so items stay exactly 4 fields. This matches the `/api/github/overview` pattern. `source` was added beyond `is_mock` so the UI can tell a real-but-stale snapshot apart from the empty fixture. (Grilling Q3.)
- **Fallback order**: live → snapshot → empty fixture. The live result is always tried first when a token exists and the cache is cold. (Grilling Q2.)
- **Fallback caching**: Fallback responses share the normal TTL. Recovery after a GitHub outage can therefore lag by up to one TTL window. This is accepted in exchange for not hammering a failing upstream.
- **Owner check**: `affiliation=owner` already scopes results to the token owner. The explicit `owner.login == GITHUB_USERNAME` check also guards against a token issued for a different account.
- **Atomic snapshot write**: Write to a temp file, then rename it over the snapshot path.

## Testing Decisions

- **Seam**: A single, highest-level seam. Tests drive `GET /api/projects` through FastAPI's `TestClient`, with GitHub replaced by an `httpx.MockTransport` injected into the project service's HTTP client. No test asserts on internal helpers, call counts or cache internals.
- **Good tests** assert only externally observable behaviour: response status, envelope fields, item field set, ordering, the request GitHub would have received (path, `affiliation`, `visibility`, bearer header), and the snapshot file contents.
- **Isolation**: Each test clears the TTL cache, blanks `GITHUB_TOKEN` (unless it mocks GitHub) and points `PROJECTS_SNAPSHOT_PATH` at a pytest `tmp_path`, so the suite is offline and order-independent even when a local `.env` holds a real token.
- **Cases covered**: no token + no snapshot → empty fixture. Live success → filtered, sorted, limited, 4-field items, `null` language passthrough, snapshot written. 401/403/429/500 → snapshot served. Timeout + no snapshot → fixture. Corrupt snapshot → fixture. Detail route → 404.
- **Prior art**: `test_github_overview.py` / `test_github_live.py` (offline fallback assertions with `is_mock`) and the existing `test_projects.py` autouse fixture that disables the token.

## Out of Scope

- Any frontend change (`ProjectsSection`, `ProjectDeepDiveModal`, the `api.js` client fallback, Vitest tests). These are covered by the follow-up frontend refactor.
- Frontend-side caching (e.g. localStorage) for when the backend itself is down.
- Exposing stars, forks, topics, homepage or `pushed_at` in the response.
- Multi-language breakdowns (`/languages`), README parsing, or any repository-content inspection.
- Pinned repositories, curated ordering, or manual overrides.
- Updating `specs/constitution.md` / `roadmap.md` / `tech-stack.md` wording about "hero cards + compact rows" and case-study modals (handled with the frontend feature).

## Further Notes

- **Downstream frontend impact**: `GET /api/projects` changes from a bare array of `{slug, title, tagline, tags, ...}` to the envelope above, and `GET /api/projects/{slug}` is gone. In practice the current frontend does **not** call the list endpoint: `ProjectsSection` renders a hardcoded `FEATURED_PROJECTS` array and `fetchProjects()` in the API client is unused. Only `ProjectDeepDiveModal` calls the removed detail route, and it now falls back to its client-side `FALLBACK_PROJECTS`. **The non-GitHub, hardcoded projects therefore stay visible until the frontend refactor consumes the new endpoint.**
- **Token scope**: A fine-grained PAT with "All repositories" + Metadata (read-only), the same one already documented in the backend `.env.example`, is enough.
- **Deployment**: On Render the snapshot lives on the container's ephemeral disk. It survives process restarts within a deploy but resets on redeploy. That's acceptable because the first successful fetch after a deploy recreates it.
