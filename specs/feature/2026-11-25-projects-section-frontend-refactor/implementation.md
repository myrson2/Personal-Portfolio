# implementation.md
## FEAT-PROJECTS-FRONTEND-REFACTOR — Clean Tabular Projects List & Live Backend Wiring

- **Feature ID**: `FEAT-PROJECTS-FRONTEND-REFACTOR`
- **Milestone**: Post-M2 maintenance
- **Date**: 2026-11-25

---

## Architectural & Visual Overview

### Desktop Row Layout (≥ 768px)
```
Projects     ┌────────────────────────────────────────────────────────────────────────┐
(left col)   │ eMSME                AI-powered enterprise inventory and         [GH]  │
             │                      operations platform with real-time                │
             │                      monitoring and predictive insights.               │
             │                      [ Python ]                                        │
             ├────────────────────────────────────────────────────────────────────────┤
             │ ColorGame            Interactive web simulation of the           [GH]  │
             │                      traditional carnival Color Betting Game.          │
             │                      [ JavaScript ]                                    │
             └────────────────────────────────────────────────────────────────────────┘
                                                                        All Projects →
```

### Mobile Row Layout (< 768px)
```
Projects
──
┌──────────────────────────────────────┐
│ eMSME                          [GH]  │
│ AI-powered enterprise inventory and  │
│ operations platform...               │
│ [ Python ]                           │
├──────────────────────────────────────┤
```

### Data & Fallback Flow
```
ProjectsSection mount
        │
        ▼
  fetchProjects() ──▶ GET /api/projects
        │
        ├── 200 + projects.length > 0 ──▶ write localStorage('portfolio_projects_cache') ──▶ render rows
        │
        └── network error / non-200 / empty fixture []
                │
                ├── localStorage has cached array? ──yes──▶ render cached rows
                └── no ───────────────────────────────────▶ render clean empty state + All Projects →
```

---

## Files to Modify / Delete

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/services/api.js` | Edit | Rewrite `fetchProjects()` for `{ projects }` envelope + `localStorage` fallback; delete `FALLBACK_PROJECTS` and `fetchProjectDetails()`. |
| `frontend/src/components/Projects/ProjectsSection.jsx` | Rewrite | Async `fetchProjects()` hook, loading skeleton, empty state, uniform 3-part tabular rows (name, optional italic description + optional language badge, right-side GitHub icon button), `"All Projects →"` link. |
| `frontend/src/styles/layout.css` | Edit | 3-column `.compact-project-row` (`190px 1fr auto`), `.compact-project-body`, `.compact-project-github-btn` hover/focus/active states, mobile `1fr auto` grid; remove `.featured-projects-grid` & `.featured-card-*`. |
| `frontend/src/styles/retro-pixel.css` | Edit | Remove unused `.deep-dive-*`, `.simulated-terminal`, `.terminal-*`, `.case-study-section` styles. |
| `frontend/src/components/Modals/ProjectDeepDiveModal.jsx` | Delete | Dead case-study modal component. |
| `frontend/src/__tests__/ProjectDeepDiveModal.test.jsx` | Delete | Test file for deleted modal component. |
| `frontend/src/__tests__/ProjectsSection.test.jsx` | Rewrite | Cover live rendering, null description/language omission, `localStorage` offline fallback, empty state, and loading state. |
