# specification.md
## FEAT-PROJECTS-FRONTEND-REFACTOR — Clean Tabular Projects List & Live Backend Wiring

- **Feature ID**: `FEAT-PROJECTS-FRONTEND-REFACTOR`
- **Milestone**: Post-M2 maintenance (Frontend refactor of the Projects section)
- **Status**: Implemented — frontend complete 2026-11-25 (18/18 vitest, vite build clean)
- **Author / Lead**: Jose Myrson O. Beros
- **Date**: 2026-11-25

---

## Problem Statement

The current Projects section in the frontend presents several user experience, architectural, and data integrity problems:

1. **Cluttered & Inaccurate Hybrid Layout**: The section previously featured large cards with synthetic `[ Preview ]` placeholder boxes, buttons for removed "Case Study" modals, and a separate list of hardcoded project rows (`Personal Portfolio Architecture`, `GDG PUP Community Portal`, `AWS Cloud Club Assistant`) that do not exist as GitHub repositories under the owner's account.
2. **Disconnected from Backend**: `ProjectsSection.jsx` hardcoded project fixtures directly inside the component and never consumed `GET /api/projects`. In addition, `api.js` carried a large `FALLBACK_PROJECTS` object with invented tech stacks (`FastAPI`, `React`, `PostgreSQL`, `React 19`, `CSS Glassmorphism`).
3. **Heavy, Non-Uniform UI**: Since most of the owner's projects are code repositories rather than deployed full-stack web applications with visual landing pages, large card previews and five-tab case-study modals add unnecessary visual friction.

## Solution

Refactor the Projects section into a single, cohesive, highly scannable editorial tabular list wired to `GET /api/projects`:

- **Uniform Row Layout** (matching the compact editorial row reference):
  - **Left**: Project Title (`name`, bold `Space Grotesk` heading).
  - **Center / Main**: Italicized Repository Description (`description`, omitted cleanly when `null`/empty) with the GitHub-derived primary language badge (`[ language ]` in monospace) positioned immediately below the description (omitted when `null`).
  - **Right**: Minimal GitHub icon button redirecting users to inspect the repository (`html_url`) in a new tab, highlighting on hover with pastel blue / dark border while keeping row text selectable.
- **Dynamic Integration & Browser Resilience**:
  - `fetchProjects()` consumes the `{ projects, is_mock, source, cached_at }` envelope from `GET /api/projects`.
  - Every non-empty `projects` response is persisted to `localStorage` (`portfolio_projects_cache`).
  - If the backend itself is unreachable (e.g., Render cold start or outage) or returns an empty fixture (`source === "fixture"` and `projects.length === 0`), `fetchProjects()` serves the cached `localStorage` list first; if no browser cache exists yet, `ProjectsSection` renders a clean empty placeholder state with zero invented projects.
- **Retain Global Actions**: Maintain the `"All Projects →"` link pointing to `https://github.com/myrson2?tab=repositories` at the bottom right.
- **Complete Dead-Code Purge**: Delete `ProjectDeepDiveModal.jsx`, `ProjectDeepDiveModal.test.jsx`, `fetchProjectDetails()`, `FALLBACK_PROJECTS`, and unused `.deep-dive-*` / `.simulated-terminal` / `.featured-project-*` / `.featured-card-*` CSS rules.

---

## User Stories

1. As a recruiter, I want to see a clean, unified tabular list of the developer's real GitHub projects, so that I can scan their work quickly without clutter.
2. As a recruiter, I want each project row to display the repository name prominently on the left, so that project titles anchor each row visually.
3. As a recruiter, I want to read the repository's description in italic editorial style in the main column, so that I understand what each project does.
4. As a recruiter, I want a repository with no GitHub description to omit the description line cleanly instead of printing filler text, so that rows stay crisp.
5. As a recruiter, I want to see the GitHub-derived primary language badge right below the description, so that I know the real primary language used.
6. As a recruiter, I want a repository with `language: null` to omit the language badge rather than guessing, so that no inaccurate tech stack is shown.
7. As a recruiter, I want a minimal GitHub icon button on the right side of each row, so that I can jump straight to the repository while still being able to select and copy row text.
8. As a recruiter, I want repository links to open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`, so that I don't lose my place on the portfolio.
9. As a mobile visitor (< 768px), I want each project row to adapt cleanly so the title, GitHub icon button (≥ 36–44px tap target), description, and language badge remain legible without horizontal overflow.
10. As a visitor, I do not want to see `[ Preview ]` placeholder boxes or dead "Case Study" buttons, so that every element on the page is genuine and functional.
11. As a visitor, I want to click `"All Projects →"` at the bottom right of the section, so that I can browse all public repositories on GitHub.
12. As a visitor on a slow connection, I want to see a clean loading skeleton while `/api/projects` is in flight, so that the section doesn't jump abruptly.
13. As a repeat visitor when the backend is cold-starting or offline, I want the browser to display the last-known-good projects from `localStorage`, so that the showcase stays populated even during backend downtime.
14. As a first-time visitor when both the backend and `localStorage` have no project data, I want to see an honest, minimal empty state with the `"All Projects →"` GitHub link still accessible, rather than fabricated projects.
15. As the portfolio owner, I want all invented `FALLBACK_PROJECTS` and unused deep-dive modal files purged from the frontend bundle, so that inaccurate stack claims cannot resurface anywhere in client code.

---

## Implementation Decisions

1. **Row Structure & Null Handling (`ProjectsSection.jsx`)**:
   - Stateful hook calling `fetchProjects()` on mount with an `isMounted` guard.
   - Renders loading skeleton rows while `loading === true`.
   - Renders a subtle empty state message when `!loading && projects.length === 0`.
   - For each project in `projects`:
     - Left: `.compact-project-name` (`project.name`).
     - Center: `.compact-project-body` containing:
       - Optional `<p className="compact-project-desc">{project.description}</p>` (rendered only when `project.description` is truthy/non-whitespace, preserving italic styling).
       - Optional `<div className="project-tags"><span className="project-tag">{project.language}</span></div>` (rendered only when `project.language` is truthy).
     - Right: `.compact-project-actions` containing an `<a className="compact-project-github-btn">` with `<Github size={18} />`, `target="_blank"`, `rel="noopener noreferrer"`, and `aria-label={`View ${project.name} repository on GitHub`}`.

2. **API Client & `localStorage` Cache (`api.js`)**:
   - Storage key: `STORAGE_KEY = 'portfolio_projects_cache'`.
   - Helper reads/writes JSON safely inside `try/catch` (handling private-browsing `QuotaExceededError` / `SecurityError` or corrupt JSON).
   - `fetchProjects()`:
     - Calls `GET /api/projects`.
     - Extracts `projects = Array.isArray(body?.projects) ? body.projects : []`.
     - If `projects.length > 0`, saves `projects` to `localStorage` and returns `{ projects, is_mock: Boolean(body.is_mock), source: body.source || 'live' }`.
     - If `projects.length === 0` (e.g., cold backend `source: "fixture"`), checks `localStorage`; if cached items exist, returns `{ projects: cached, is_mock: true, source: 'local_cache' }`, else `{ projects: [], is_mock: true, source: 'fixture' }`.
     - On network/HTTP error, returns `localStorage` cache if non-empty (`source: 'local_cache'`), else `{ projects: [], is_mock: true, source: 'offline' }`.
   - Delete `FALLBACK_PROJECTS` and `fetchProjectDetails()`.

3. **CSS & Visual Polish (`layout.css` & `retro-pixel.css`)**:
   - `.compact-project-row`: 3-column grid `190px 1fr auto` on desktop (`gap: 1.5rem`, `align-items: start`, hairline top/bottom borders, subtle `#f9fafb` hover tint).
   - `.compact-project-desc`: keeps `font-style: italic`, `font-size: 0.85rem`, `color: #4b5563`, `line-height: 1.55`.
   - `.project-tags` inside `.compact-project-body`: `margin-top: 0.45rem`, `padding-top: 0` (tight spacing directly below description; `margin-top: 0` if description is absent).
   - `.compact-project-github-btn`: 34×34px inline-flex icon link (`border: 1px solid transparent`, `color: #111827`, hover `border-color: var(--border-dark)`, `background: rgba(147, 197, 253, 0.25)` pastel blue accent, subtle active press offset).
   - Mobile (`< 768px`): 2-column grid `1fr auto` where `.compact-project-name` sits top-left, `.compact-project-actions` sits top-right (40×40px touch target), and `.compact-project-body` spans full width (`grid-column: 1 / -1`) underneath.
   - Remove unused `.featured-projects-grid`, `.featured-project-card`, `.featured-card-*` from `layout.css` and `.deep-dive-*`, `.simulated-terminal`, `.terminal-*`, `.case-study-section` from `retro-pixel.css`.

4. **Dead Files Deleted**:
   - `frontend/src/components/Modals/ProjectDeepDiveModal.jsx`
   - `frontend/src/__tests__/ProjectDeepDiveModal.test.jsx`

---

## Testing Decisions

- **Seam**: Component & service integration tests in `frontend/src/__tests__/ProjectsSection.test.jsx` using `@testing-library/react` and Vitest, mocking `global.fetch` (or `api.fetchProjects`) and exercising real `localStorage`.
- **Test Cases**:
  1. Renders live project rows with title on left, italic description, derived language badge below description, GitHub icon link on right, and `"All Projects →"` link.
  2. Cleanly omits description element when `description: null` and omits language badge when `language: null`.
  3. Persists live projects to `localStorage` and serves them when a subsequent load fails (backend offline) or returns an empty fixture.
  4. Renders clean empty state when backend fails/returns `[]` and `localStorage` is empty (zero invented projects).
  5. Shows loading indicator while fetch is unresolved.

---

## Out of Scope

- Backend endpoint modifications (already completed in `FEAT-PROJECTS-OWNED-REPOS`, 38/38 pytest passing).
- Changes to `ProfileHeader`, `AboutSection`, `CertificationsCarousel`, or `GitHubCalendarGrid`.

---

## Further Notes

- Grilling decisions Q1–Q4 recorded 2026-11-25 with developer sign-off on all four recommended options.
