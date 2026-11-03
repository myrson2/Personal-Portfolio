# Specification: Dedicated Project Details Modal / Deep Dive Routes
- **Feature ID**: `FEAT-M2-PROJECT-DEEP-DIVE`
- **Milestone**: Milestone 2 (`specs/roadmap.md`)
- **Status**: Completed & Verified
- **Completed At**: 2026-11-03T20:43:00+08:00
- **Author / Lead**: Jose Myrson O. Beros

---

## 1. Context & Motivation

Rooted in `specs/roadmap.md` Milestone 2 Workstream 2 and `specs/mission.md`. While Milestone 1 introduced hero preview cards and tabular summary rows in [`ProjectsSection.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Projects/ProjectsSection.jsx), recruiters and technical hiring managers need more than short blurbs to evaluate senior engineering ability.

This feature introduces **Dedicated Interactive Project Case Studies**:
1. Deep-dive architectural breakdowns for featured systems:
   - **`smartstock-ai`**: Autonomous inventory optimization system (Python, FastAPI, Gemini AI, React, vector search).
   - **`depths-descents`**: High-performance game engine and multiplayer networking (Lua, custom physics, netcode sync).
2. Deep linking via URL hash (`#project/smartstock-ai`, `#project/depths-descents`) allowing direct sharing while retaining single-page editorial navigation.
3. Interactive retro simulated sandbox terminal for live demo inspection without security risks or heavy iframe dependencies.
4. Robust FastAPI data gateway (`GET /api/projects` and `GET /api/projects/{slug}`) backed by deterministic fixtures and client-side offline fallbacks.

---

## 2. User Stories

### US-1: Opening a Project Deep Dive Case Study
```
GIVEN a visitor is exploring the Projects section on the portfolio
WHEN they click on a featured project card or a "Case Study ->" button
THEN an interactive modal opens displaying the comprehensive architectural deep dive
 AND the browser URL hash updates to `#project/{slug}` without triggering a page reload
 AND the modal presents:
     - Architecture overview & ASCII/SVG system flow diagram
     - Key technical challenges & engineered solutions
     - Tech stack rationale (why specific technologies were selected)
     - Quantifiable impact metrics (e.g. -40% stockout risk, 60 FPS tickrate)
     - Interactive retro simulated sandbox demo widget
```

### US-2: Shareable Direct Link & Deep Link Navigation
```
GIVEN a recruiter visits the direct link `https://portfolio.dev/#project/smartstock-ai`
WHEN the page loads
THEN the application automatically opens the SmartStock AI deep dive modal
 AND when the user clicks the close button, presses Esc, or clicks the backdrop,
     the modal closes and the URL hash cleanly reverts to `#projects`
```

### US-3: Unknown or Unimplemented Project Slugs
```
GIVEN a visitor accesses an invalid or not-yet-implemented slug (e.g. `#project/non-existent-project`)
WHEN the modal attempts to load the project
THEN the modal displays a clear notification:
     "This project case study is not yet implemented or does not exist."
 AND after a brief delay (or via an explicit "Back to Projects" button),
     gracefully exits the modal and returns the URL hash to `#projects`
```

### US-4: Offline Upstream Resilience
```
GIVEN the FastAPI backend is temporarily offline or unreachable
WHEN a visitor opens any project deep dive
THEN the frontend seamlessly falls back to bundled client fixtures in `api.js`
 AND renders the complete case study without throwing unhandled exceptions or blank screens
```

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Backend exposes `GET /api/projects` returning an array of project overview models |
| FR-2 | Backend exposes `GET /api/projects/{slug}` returning full case study details for a given slug |
| FR-3 | If `{slug}` does not exist, backend returns HTTP 404 with `{"detail": "Project not found"}` |
| FR-4 | Case study model includes: `slug`, `title`, `tagline`, `tags`, `metrics`, `architecture_overview`, `challenges_and_solutions`, `tech_stack_rationale`, `demo_type`, `demo_payload`, `github_url`, `live_url` |
| FR-5 | Backend stores case studies in deterministic JSON fixtures ([`backend/app/fixtures/projects_data.json`](file:///c:/Users/merss/Personal-Portfolio/backend/app/fixtures/projects_data.json)) |
| FR-6 | Frontend [`ProjectsSection.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Projects/ProjectsSection.jsx) adds "Case Study" trigger buttons to featured project cards |
| FR-7 | Frontend implements [`ProjectDeepDiveModal.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/ProjectDeepDiveModal.jsx) with tabs/sections for Architecture, Engineering Challenges, Tech Rationale, and Interactive Demo |
| FR-8 | Deep link listener synchronizes URL hash (`#project/:slug`) with the active modal state on mount and hash changes |
| FR-9 | Invalid slug handling: displays "Project not yet implemented or found", then gracefully exits back to `#projects` |
| FR-10 | Simulated Sandbox Widget: includes an interactive retro command/output preview demonstrating real terminal inputs (e.g. running predictive model queries or physics tick commands) |
| FR-11 | Client fallback: [`api.js`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/services/api.js) contains bundled fallbacks for `smartstock-ai` and `depths-descents` if backend is unreachable |
| FR-12 | Keyboard navigation: modal closes on `Escape` key press, traps focus, and respects ARIA dialog roles |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Design System (70/30/20)**: Retains crisp white base, dark borders, pastel blue badges/accents, monospace code and stats |
| NFR-2 | **WCAG 2.1 AA Compliance**: High-contrast typography, accessible color ratios on all badges and diagram blocks |
| NFR-3 | **Mobile Responsive Collapse**: Modal adapts smoothly to viewport widths down to 320px; tab headers scroll horizontally if needed; diagrams stack cleanly |
| NFR-4 | **Async & Zero Blocking**: FastAPI route handlers are fully async and serve cached/in-memory fixtures without database or disk stalls |
| NFR-5 | **Zero Secret Leakage**: No internal tokens or keys exposed |

---

## 5. Acceptance Criteria Checklist

- [ ] `GET /api/projects` returns HTTP 200 with all project summaries
- [ ] `GET /api/projects/smartstock-ai` returns HTTP 200 with full architecture case study
- [ ] `GET /api/projects/depths-descents` returns HTTP 200 with full game engine case study
- [ ] `GET /api/projects/unknown-slug` returns HTTP 404 with structured JSON
- [ ] Clicking a featured card in [`ProjectsSection.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Projects/ProjectsSection.jsx) opens the modal and updates hash to `#project/{slug}`
- [ ] Visiting direct link with hash `#project/smartstock-ai` automatically loads and opens the modal
- [ ] Unknown hash `#project/invalid` displays not found notice and gracefully exits back to `#projects`
- [ ] Interactive simulated demo widget accepts interactive button/run trigger and renders realistic simulated outputs
- [ ] When backend is down, modal loads client fallback data without errors
- [ ] Modal closes cleanly via close button, backdrop click, or `Escape` key, resetting hash to `#projects`
- [ ] All automated tests pass (backend pytest + frontend vitest) and clean `npm run build` succeeds
