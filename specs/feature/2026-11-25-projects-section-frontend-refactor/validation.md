# validation.md
## FEAT-PROJECTS-FRONTEND-REFACTOR — Clean Tabular Projects List & Live Backend Wiring

- **Feature ID**: `FEAT-PROJECTS-FRONTEND-REFACTOR`
- **Milestone**: Post-M2 maintenance
- **Date**: 2026-11-25
- **Status**: Approved — Implemented (18/18 Vitest passed, clean Vite build, zero ESLint errors, 2026-11-25)

---

## Automated Test Matrix

| # | Test | Tool | Pass Criteria |
|---|------|------|--------------|
| 1 | Live rows render accurately | Vitest | Renders `name`, italic `description`, `language` badge below description, right-side GitHub link (`target="_blank"`, `rel="noopener noreferrer"`), and `"All Projects →"` link. |
| 2 | Null description & null language | Vitest | Omits `.compact-project-desc` when `description: null`; omits `.project-tag` when `language: null` (zero filler/guessed values). |
| 3 | `localStorage` cache fallback | Vitest | Successful fetch populates `portfolio_projects_cache`; subsequent failed fetch or empty fixture serves cached rows. |
| 4 | Honest empty state | Vitest | Failed fetch or empty fixture with empty `localStorage` renders clean empty placeholder + `"All Projects →"` link (zero invented projects). |
| 5 | Loading skeleton | Vitest | Shows loading state while `/api/projects` promise is pending. |
| 6 | Frontend lint | ESLint | `cd frontend && npm run lint` → 0 errors. |
| 7 | Full frontend test suite | Vitest | `cd frontend && npm test -- --run` → all test suites pass. |
| 8 | Production build | Vite | `cd frontend && npm run build` → clean `dist/` bundle with 0 errors. |

---

## Constitution Compliance Matrix

| Rule | Status | Verification |
|------|--------|--------------|
| **70/30/20 Design System & WCAG AA** | ✅ COMPLIANT | White canvas, `#111827` headings/borders, pastel blue hover accent on GitHub icon button, monospace language badge. |
| **Two-column editorial layout** | ✅ COMPLIANT | Left `Projects` label + right tabular row list; collapses cleanly below 768px. |
| **Zero client secret leakage** | ✅ COMPLIANT | Client calls `/api/projects` only; no GitHub tokens or invented stack fixtures in bundle. |
| **Upstream & backend resilience** | ✅ COMPLIANT | Backend snapshot + browser `localStorage` + graceful empty state ensure zero crashes. |
