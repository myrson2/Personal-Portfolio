# Validation: Dedicated Project Details Modal / Deep Dive Routes
- **Feature ID**: `FEAT-M2-PROJECT-DEEP-DIVE`
- **Milestone**: Milestone 2 (`specs/roadmap.md`)
- **Status**: Approved — Pending Implementation

---

## 1. Automated Test Matrix

| Test ID | Type | File | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| TC-01 | Integration | `test_projects.py` | `GET /api/projects` returns list | HTTP 200, array of ≥ 2 project summaries |
| TC-02 | Integration | `test_projects.py` | `GET /api/projects/smartstock-ai` | HTTP 200, complete architecture & challenges |
| TC-03 | Integration | `test_projects.py` | `GET /api/projects/depths-descents` | HTTP 200, complete game engine architecture |
| TC-04 | Unit | `test_projects.py` | `GET /api/projects/unknown-slug` | HTTP 404, `{"detail": "Project not found"}` |
| TC-05 | Unit | `ProjectDeepDiveModal.test.jsx` | Modal renders case study content | Architecture, metrics, and tags visible in DOM |
| TC-06 | Unit | `ProjectDeepDiveModal.test.jsx` | Tab navigation | Clicking "Challenges" shows challenge items |
| TC-07 | Unit | `ProjectDeepDiveModal.test.jsx` | Interactive sandbox widget | Clicking run displays simulated terminal output |
| TC-08 | Unit | `ProjectDeepDiveModal.test.jsx` | Invalid slug notice & exit | Shows "not yet implemented or found" notice |
| TC-09 | Build | `npm run build` | Clean production build | Compiles with zero errors and zero leaked tokens |

---

## 2. Constitution Compliance Matrix

Cross-referenced against `specs/constitution.md` architectural invariants:

| Constitutional Invariant | Compliant? | Implementation Detail |
|---|---|---|
| **Zero Client Secret Leakage** | ✅ | No secret tokens or keys in project fixtures or client code |
| **Resilience Over Dependencies** | ✅ | Bundled fallback fixtures in `api.js` guarantee deep dive renders even if backend is offline |
| **Scope Discipline (M2)** | ✅ | In-memory JSON fixtures; no database cluster or heavy 3D canvas libraries introduced |
| **70/30/20 Palette & Retro Design** | ✅ | Stepped pixel borders, monospace stat counters, tactile buttons, simulated terminal widget |
| **WCAG 2.1 AA Readability** | ✅ | High-contrast typography, clear headings, focus traps, Esc key handling, and ARIA modal roles |
| **Async Discipline** | ✅ | FastAPI endpoint uses async handlers reading cached memory structures |

---

## 3. Manual QA Runbook

### Prerequisites
```powershell
# Backend
cd backend
uv run uvicorn app.main:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
npm.cmd run dev
```

---

### Test Case QA-1: Happy Path (Modal & Tabs)
1. Navigate to `http://localhost:5173/#projects`
2. Click **"Case Study ->"** on SmartStock AI card
3. **VERIFY**: Modal opens, URL hash updates to `#project/smartstock-ai`
4. **VERIFY**: Metrics bar renders (e.g. `-40% Stockout Reduction`)
5. **VERIFY**: Tab switching works: Overview → Architecture → Engineering Challenges → Tech Rationale → Live Sandbox
6. Click **"Run Simulation"** in the Sandbox tab
7. **VERIFY**: Simulated command output renders with realistic log stream

---

### Test Case QA-2: Direct Link Sharing
1. Open a fresh browser tab and visit `http://localhost:5173/#project/depths-descents`
2. **VERIFY**: Modal opens directly with Depths Descents case study loaded without any extra clicks

---

### Test Case QA-3: Invalid Slug Handling
1. Visit `http://localhost:5173/#project/non-existent-project`
2. **VERIFY**: Modal displays: *"This project case study is not yet implemented or does not exist."*
3. **VERIFY**: Modal exits gracefully back to `#projects`

---

### Test Case QA-4: Offline Fallback Verification
1. Stop backend server (`Ctrl+C` in backend terminal)
2. In browser, click **"Case Study ->"** on SmartStock AI
3. **VERIFY**: Modal renders seamlessly from client fallback data without blank screen or console crashes

---

### Test Case QA-5: Close Actions & Responsive Viewports
1. Press `Escape` key → **VERIFY**: Modal closes and hash reverts to `#projects`
2. Click modal backdrop → **VERIFY**: Modal closes
3. Open DevTools → set viewport to `375px` width
4. **VERIFY**: Tabs scroll horizontally with touch swipe; diagrams and text stack cleanly without overflow

---

## 4. Automated Test Execution Commands

```powershell
# Backend test suite
cd backend
uv run pytest tests/test_projects.py -v

# Full backend suite
uv run pytest tests -v

# Frontend test suite
cd ..\frontend
npm.cmd test -- --run

# Frontend build verification
npm.cmd run build
```
