# Jose Myrson O. Beros — Personal Portfolio & Engineering Showcase

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

An interactive, high-performance personal portfolio for **Jose Myrson O. Beros** (Software & AI Engineer). Designed with an asymmetrical two-column editorial layout and subtle retro pixel-art accents, powered by a dedicated FastAPI backend caching proxy that surfaces live GitHub telemetry and contribution heat maps.

---

## Architecture Overview

```
+--------------------------------------------------------------------------+
|                              CLIENT BROWSER                              |
|   [ React + Vite App (Editorial Layout + Subtle Retro Pixel Accents) ]   |
+------------------------------------+-------------------------------------+
                                     |
                       REST API calls| (CORS: localhost:5173 + production domain)
                                     v
+--------------------------------------------------------------------------+
|                             FASTAPI BACKEND                              |
|  +--------------------+  +---------------------+  +--------------------+  |
|  |/api/github/overview|  |/api/github/calendar |  | /api/projects      |  |
|  +---------+----------+  +----------+----------+  | /api/projects/{s}  |  |
|            |                       |             +---------+----------+  |
|            v                       v                       v             |
|  [ In-Memory TTLCache ]   [ In-Memory TTLCache ]   [ In-Memory Cache ]    |
|            | (miss)                | (miss)                | (miss)      |
|            v                       v                       v             |
|  [ GitHub REST / GraphQL ] [ GitHub GraphQL ] [ GitHub metadata API ]     |
|  /api/health | /api/contact/send (Resend email; mock fallback)          |
|  Failures -> deterministic JSON fixtures (is_mock: true); commit totals  |
|  refresh via BackgroundTasks off the response path.                     |
+--------------------------------------------------------------------------+
```

### Key Differentiators
- **Editorial Asymmetry with Retro Charm**: Combines clean Swiss-style section headings with tactile pixel-art borders, pixel badges, tactile pressable buttons, and monospace counters in a strict **70/30/20** palette (70% white base, 30% black structure, 20% pastel blue accent).
- **Engineered Live Metrics**: Real-time repository counts, commit activity, and contribution graphs served through a cached backend proxy with instant fallback fixtures.
- **Zero Client Secret Leakage**: GitHub Personal Access Tokens and upstream credentials are never bundled into the client build.
- **Sub-Second Performance**: Instant HMR and lightweight bundle size using Vite and FastAPI.
- **Production Delivery**: Resend-backed contact requests with a mock fallback, five-tab project case studies via `#project/{slug}` deep links, and a GitHub Actions pipeline deploying Vercel (frontend) and Render (backend).

---

## Core Sections

1. **Profile Header**: Top banner with overlapping circular avatar, metadata pill strip (`Software Engineer`, `Philippines`, `Email`, `Online` indicator), and 3 tactile CTA buttons. `Schedule meeting` opens a contact-request modal delivered by `POST /api/contact/send`; `Download CV` and `Join Community` remain validated interactive placeholders. Live calendar booking is deferred beyond Milestone 2 (see the roadmap's Deferred Backlog).
2. **About Section**: Personal bio narrative, inline lowercase social links (`github / linkedin / facebook / instagram`), and a 4-column proof-of-work stat bar (`10 Tech Stacks`, live repository count, `10x Hackathons`, live commit total).
3. **Projects Showcase**: Hybrid layout featuring 2 large visual hero project cards (**eMSME** and **ColorGame**) with five-tab case-study modals, followed by a compact 3-row list with horizontal hairline dividers and an `All Projects ->` link.
4. **Certifications & Activity**:
   - Interactive slideshow/carousel of credential cards.
   - Dynamic GitHub contribution heat map embedded directly below the certifications.

---

## Monorepo Directory Structure

```
Personal-Portfolio/
├── AGENTS.md                  # Autonomous agent instructions & invariants
├── README.md                  # Project overview & developer guide
├── .github/workflows/ci-cd.yml # Tests + Vercel/Render deploy on main
├── specs/                     # Ground-truth project specifications
│   ├── constitution.md        # Architectural non-negotiables & invariants
│   ├── mission.md             # Vision, personas & KPIs
│   ├── tech-stack.md          # Technical stack matrix & component hierarchy
│   ├── roadmap.md             # Milestones, exit criteria & deferred backlog
│   ├── context.md             # Living implementation record & runbook
│   └── feature/               # Feature spec triads (spec/implementation/validation)
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # ProfileHeader, About, Projects, Modals, etc.
│   │   ├── services/api.js    # Typed client with offline fallback fixtures
│   │   ├── __tests__/         # Vitest + Testing Library component tests
│   │   └── App.jsx
│   ├── public/image/          # Profile avatar
│   ├── vercel.json            # Vite build config + /api rewrite to Render
│   ├── package.json
│   └── vite.config.js
├── backend/                   # FastAPI caching proxy & contact gateway
│   ├── app/
│   │   ├── api/endpoints/     # GitHub, projects, contact, health endpoints
│   │   ├── services/          # GitHub client, project loader, email gateway
│   │   ├── models/            # Strict Pydantic request/response models
│   │   ├── fixtures/          # Deterministic fallback JSON snapshots
│   │   ├── core/              # Config, in-memory TTLCache
│   │   └── main.py
│   ├── tests/                 # Pytest suite (31 tests)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
└── render.yaml                # Render web service + dashboard-injected secrets
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.x or later
- **Python**: v3.10 or later
- **uv**: v0.12+ (Recommended) or standard pip
- **pnpm / npm**

### 1. Backend Setup (FastAPI with `uv`)
```bash
cd backend

# Using uv (Fastest & Recommended):
uv venv
uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload --port 8001

# Execute backend tests:
uv run pytest tests -v
```

<details>
<summary>Alternative: Setup with standard Python venv & pip</summary>

```bash
cd backend
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
</details>

Create a `backend/.env` for live GitHub telemetry. Never commit this file:

```bash
GITHUB_USERNAME=myrson2
GITHUB_TOKEN=github_pat_...   # fine-grained PAT, all repositories
CACHE_TTL_SECONDS=900
RESEND_API_KEY=               # optional; empty = deterministic mock mode
RESEND_TO_EMAIL=
```

The repository counter uses the authenticated `GET /user/repos?visibility=all` endpoint so it includes private repositories. For a fine-grained PAT, select **All repositories** and grant **Metadata: read-only** plus **Contents: read** (needed for commit counting). A public-only token will report just the public repository count (for example, 40 instead of 49). For local-only verification, `GITHUB_TOKEN` can temporarily be set to `gh auth token` when the GitHub CLI is authenticated with `repo` scope; use a dedicated token for production. Never commit this file or add `GITHUB_TOKEN` to CI workflow files — in production it is injected only through the Render dashboard.

Without a token the API stays up and serves deterministic fixture data with `is_mock: true`. FastAPI interactive Swagger docs will be available at [http://localhost:8001/docs](http://localhost:8001/docs).

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The React development server runs at [http://localhost:5173](http://localhost:5173).

### 3. Tests & Production Build
```bash
# Backend
cd backend
uv run pytest tests -v                # 31 tests

# Frontend
cd ../frontend
npm test                              # 21 component tests
npm run build                         # → dist/
```

---

## API Endpoints

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Liveness probe used by Render |
| `GET` | `/api/github/overview?username=myrson2` | Cached repo/commit telemetry; `is_mock: true` on fallback |
| `GET` | `/api/github/calendar?username=myrson2` | Cached 53-week contribution heat map |
| `GET` | `/api/projects` | Curated showcase summaries (`eMSME`, `colorgame`) |
| `GET` | `/api/projects/{slug}` | Five-tab case study; 404 for retired slugs |
| `POST` | `/api/contact/send` | Rate-limited contact / meeting request via Resend |

Swagger UI: [http://localhost:8001/docs](http://localhost:8001/docs).

---

## Deployment

- **Backend**: `render.yaml` defines a Docker web service on port 8000 with health check `/api/health`. `GITHUB_TOKEN`, `RESEND_API_KEY`, and the Render deploy hook are dashboard secrets; `CACHE_TTL_SECONDS=900` is a static environment value.
- **Frontend**: `frontend/vercel.json` builds with Vite and rewrites `/api/(.*)` to the Render backend so all upstream calls stay behind the FastAPI gateway.
- **CI/CD**: `.github/workflows/ci-cd.yml` runs the test suites and build on every push, then deploys on `main`. Merge decisions and the pre-release checklist are recorded in the [Milestone 2 Closeout & Release Readiness plan](specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/specification.md).

---

## Specifications & Documentation

The codebase is governed by formal specifications located in the `specs/` directory:
- [System Constitution & Invariants](specs/constitution.md)
- [Mission & Product Charter](specs/mission.md)
- [Technology Stack Matrix](specs/tech-stack.md)
- [Roadmap & Milestone Verification](specs/roadmap.md)
- [Implementation Context & Runbook](specs/context.md)
- [Feature Specification Triads](specs/feature/) — one folder per feature (`specification.md`, `implementation.md`, `validation.md`)
- [Milestone 2 Closeout & Release Readiness](specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/) — current plan record

---

## License

MIT © [Jose Myrson O. Beros](https://github.com/myrsonberos)

