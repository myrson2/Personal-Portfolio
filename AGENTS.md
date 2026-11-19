# AGENTS.md — AI Agent Operating Instructions

> **Notice to AI Agents**: This repository is governed by strict architectural invariants and ground-truth specifications located in `specs/`. Before proposing, generating, or modifying any code, you must read and adhere to the guidelines set forth below.

---

## 1. Ground Truth & Mandatory Reading Order

When starting any task in this repository, always read the specifications in the following sequence:
1. `specs/constitution.md` — Core philosophies, security rules, and non-negotiable architectural invariants.
2. `specs/mission.md` — Product objectives, user personas, and target KPIs.
3. `specs/tech-stack.md` — Approved libraries, component hierarchy, and forbidden alternatives.
4. `specs/roadmap.md` — Current milestone scope, active workstreams, and exit criteria.

---

## 2. Core Architectural Non-Negotiables

### A. Design System & Palette (70 / 30 / 20 Rule)
- **70% White Canvas**: Clean, high-legibility backgrounds.
- **30% Black Structure**: Deep dark borders, primary text, prominent buttons.
- **20% Pastel Blue Accent**: Status indicators (e.g., `Online ●`), active hover states, and key highlights.
- **Subtle Retro Pixel-Art Integration**:
  - Incorporate subtle pixelated border-radius styles (`box-shadow` or stepped pixel borders) and pixel badges.
  - Tactile pressable buttons with active `:active` translation offsets.
  - Monospace font styling for numerical counters (`10`, `40`, `10x`, `5k+`).
  - **Never sacrifice WCAG 2.1 AA readability**: High contrast between text and background is mandatory.

### B. Two-Column Asymmetrical Editorial Layout
- Section titles (`About`, `Projects`, `Certifications`) sit in an anchored left column.
- Content, cards, and lists flow in the wider right column.
- On mobile viewports (< 768px), the layout must collapse gracefully into a single-column stacked view.

### C. Zero Client Secret Leakage
- **Never** include GitHub Personal Access Tokens (PATs), email API keys, or private tokens in client-side React code.
- All external data fetching must route through the **FastAPI backend caching proxy**.

### D. Upstream Resilience & Mock Fallbacks
- The frontend must never crash if the backend or GitHub API is offline or rate-limited.
- The FastAPI backend must provide in-memory TTL caching and deterministic fallback JSON fixtures when GitHub is unreachable or unauthenticated.

### E. Scope Discipline (Milestone 1)
- **Do not introduce**:
  - PostgreSQL / SQLite database setups or ORMs (M1 uses in-memory cache and JSON fixtures).
  - Multi-user authentication, JWT sessions, or cookies.
  - Heavy 3D canvas libraries (Three.js, Babylon.js).
  - Live third-party calendar booking APIs (M1 uses validated interactive placeholder modals).

---

## 3. Component & Structure Conventions

### Frontend (`/frontend`)
- Framework: React 18+ with Vite and Bootstrap 5.3 + custom CSS.
- Keep components modular, single-responsibility, and well-typed:
  - `ProfileHeader`: Banner, overlapping avatar, metadata badges, 3 CTAs (`Schedule meeting`, `Download CV`, `Join Community`).
  - `AboutSection`: Bio copy, inline socials (`github / linkedin / facebook / instagram`), 4-column proof-of-work stat bar.
  - `ProjectsSection`: 2 visual hero preview cards + 3 compact tabular row items + `All Projects ->` link.
  - `CertificationsSection`: Slideshow carousel with step controls + `Certifications ->` link.
  - `GitHubCalendarSection`: Activity contribution heat map rendered below certifications.
  - `PlaceholderModals`: Interactive feedback dialogs for header CTAs.
- Use `lucide-react` for vector icons.

### Backend (`/backend`)
- Framework: FastAPI with Uvicorn and HTTPX.
- Strict Pydantic models for all API responses.
- In-memory TTL cache (`cachetools` or similar) with 15–60 minute expiration.
- Endpoints:
  - `GET /api/health`
  - `GET /api/github/overview`
  - `GET /api/github/calendar`
  - `POST /api/contact/placeholder`

---

## 4. Verification & Testing Protocol

Before marking any task as complete or handing off to the user, execute these checks:
1. **Frontend Clean Build**:
   ```bash
   cd frontend
   npm run build
   ```
   Must compile without TypeScript/JSX syntax errors or missing asset references.
2. **Backend Startup**:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8001
   ```
   Verify endpoints return valid JSON and `/docs` is accessible. Port `8001` is the local convention and matches the Vite proxy; port `8000` may be occupied by PostgreSQL.
3. **Responsive Verification**:
   Verify layout integrity on both mobile (375px) and desktop (1200px+) viewports.

