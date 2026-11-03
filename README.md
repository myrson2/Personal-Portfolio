# Jose Myrson O. Beros — Personal Portfolio & Engineering Showcase

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive, high-performance personal portfolio for **Jose Myrson O. Beros** (Software & AI Engineer). Designed with an asymmetrical two-column editorial layout and subtle retro pixel-art accents, powered by a dedicated FastAPI backend caching proxy that surfaces live GitHub telemetry and contribution heat maps.

---

## Architecture Overview

```
+--------------------------------------------------------------------------+
|                              CLIENT BROWSER                              |
|   [ React + Vite App (Editorial Layout + Subtle Retro Pixel Accents) ]   |
+------------------------------------+-------------------------------------+
                                     |
                       REST API calls| (CORS Protected: localhost:5173)
                                     v
+--------------------------------------------------------------------------+
|                             FASTAPI BACKEND                              |
|  +--------------------+   +-----------------------+   +---------------+  |
|  | /api/github/overview|  | /api/github/calendar  |   | /api/contact  |  |
|  +---------+----------+   +-----------+-----------+   +-------+-------+  |
|            |                          |                       |          |
|            v                          v                       v          |
|  [ In-Memory TTL Cache ]     [ In-Memory TTL Cache ]    [ Placeholder/   |
|            |                          |                   Validation ]   |
|  (Miss)    v                (Miss)    v                                  |
|  [ GitHub REST / GraphQL ]   [ GitHub GraphQL API ]                      |
|  (Fallback to JSON fixtures on rate-limit or offline mode)               |
+--------------------------------------------------------------------------+
```

### Key Differentiators
- **Editorial Asymmetry with Retro Charm**: Combines clean Swiss-style section headings with tactile pixel-art borders, pixel badges, tactile pressable buttons, and monospace counters in a strict **70/30/20** palette (70% white base, 30% black structure, 20% pastel blue accent).
- **Engineered Live Metrics**: Real-time repository counts, commit activity, and contribution graphs served through a cached backend proxy with instant fallback fixtures.
- **Zero Client Secret Leakage**: GitHub Personal Access Tokens and upstream credentials are never bundled into the client build.
- **Sub-Second Performance**: Instant HMR and lightweight bundle size using Vite and FastAPI.

---

## Core Sections

1. **Profile Header**: Top banner with overlapping circular avatar, metadata pill strip (`Software Engineer`, `Philippines`, `Email`, `Online` indicator), and 3 tactile CTA buttons (`Schedule meeting`, `Download CV`, `Join Community`) operating as validated interactive placeholders.
2. **About Section**: Personal bio narrative, inline lowercase social links (`github / linkedin / facebook / instagram`), and a 4-column proof-of-work stat bar (`10 Tech Stacks`, `40 Repositories`, `10x Hackathons`, `5k+ Commits`).
3. **Projects Showcase**: Hybrid layout featuring 2 large visual hero project cards on top, followed by a compact 3-row list with horizontal hairline dividers and an `All Projects ->` link.
4. **Certifications & Activity**:
   - Interactive slideshow/carousel of credential cards.
   - Dynamic GitHub contribution heat map embedded directly below the certifications.

---

## Monorepo Directory Structure

```
Personal-Portfolio/
├── AGENTS.md                  # Autonomous agent instructions & invariants
├── README.md                  # Project overview & developer guide
├── specs/                     # Ground-truth project specifications
│   ├── constitution.md        # Architectural non-negotiables & invariants
│   ├── mission.md             # Vision, personas & KPIs
│   ├── tech-stack.md          # Technical stack matrix & component hierarchy
│   └── roadmap.md             # Phased execution milestones & exit criteria
├── frontend/                  # React + Vite application (Milestone 1)
│   ├── src/
│   │   ├── components/        # ProfileHeader, About, Projects, Certifications, etc.
│   │   ├── styles/            # Retro pixel CSS variables, mixins, and theme
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/                   # FastAPI caching proxy (Milestone 1)
    ├── app/
    │   ├── api/               # GitHub proxy & contact endpoints
    │   ├── core/              # Config, cache settings, fallback fixtures
    │   └── main.py
    ├── requirements.txt
    └── .env.example
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

FastAPI interactive Swagger docs will be available at [http://localhost:8001/docs](http://localhost:8001/docs).

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The React development server runs at [http://localhost:5173](http://localhost:5173).

---

## Specifications & Documentation

The codebase is governed by formal specifications located in the `specs/` directory:
- [System Constitution & Invariants](specs/constitution.md)
- [Mission & Product Charter](specs/mission.md)
- [Technology Stack Matrix](specs/tech-stack.md)
- [Roadmap & Milestone Verification](specs/roadmap.md)

---

## License

MIT © [Jose Myrson O. Beros](https://github.com/myrsonberos)

