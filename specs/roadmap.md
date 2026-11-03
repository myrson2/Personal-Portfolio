# Project Roadmap & Milestone Verification

### Phase Overview

```
[Milestone 1: Monorepo Foundation & Editorial Retro Showcase]
   ├── Monorepo Scaffolding (/frontend + /backend)
   ├── ProfileHeader with Banner, Avatar, Metadata Badges & 3 CTA Placeholders
   ├── About Section with Proof-of-Work Stats Bar (fetched via FastAPI proxy)
   ├── Hybrid Projects Section (2 Featured Hero Cards + Compact Row List)
   ├── Certifications Slideshow Carousel + GitHub Contribution Calendar
   └── FastAPI GitHub Caching Proxy Layer with offline fallbacks
         │
         ▼
[Milestone 2: Production Contact Gateway & Interactive Case Studies]
   ├── Full Contact Form backend delivery & Live Meeting Scheduler Integration
   ├── Dedicated Project Details Modal / Deep Dive routes
   └── Automated CI/CD & Deployment
         │
         ▼
[Milestone 3: AI Engineer Showcase Sandbox]
   ├── Interactive AI Demo / Micro-Agent playground
   ├── Advanced Visitor Analytics
   └── Expanded Gamification Achievements / Retro Terminal Mode
```

---

### Milestone 1: Detailed Workstreams & Exit Criteria

#### Workstream 1: Monorepo Scaffolding
- Setup root directory structure:
  - `/frontend`: Vite + React + Bootstrap template with custom CSS.
  - `/backend`: FastAPI app with virtual environment and `requirements.txt`.
- Configure root `.gitignore` and `.env.example` to prevent secret leakage.

#### Workstream 2: Frontend Implementation
- Implement responsive two-column editorial layout:
  - **Header Section**: Top banner with overlapping circular avatar, metadata badges (`Software Engineer`, `Philippines`, `Email`, `Online` indicator), and 3 tactile pixel-styled buttons (`Schedule meeting`, `Download CV`, `Join Community`).
  - **About Section**: Personal bio, inline text social links (`github / linkedin / facebook / instagram`), and a 4-column divider stat bar displaying live counts (`10 Tech Stacks`, `40 Repositories`, `10x Hackathons`, `5k+ Commits`).
  - **Projects Showcase**: 2 visual featured hero preview cards followed by a 3-row compact table list with horizontal hairline dividers and an `All Projects ->` link.
  - **Certifications Showcase**: Slideshow carousel component with clean card placeholders and step controls, followed by a `Certifications ->` link.
  - **GitHub Contribution Calendar**: Visual contribution heat map embedded directly below the Certifications slideshow.
  - **Interactive Placeholders**: Tactile modals/toasts triggered when clicking the 3 header CTAs.
  - **Retro Theme Integration**: 70% white base, 30% black structure, 20% pastel blue accent with subtle pixel borders, pixel badges, tactile press states, and monospace numbers.

#### Workstream 3: Backend Implementation
- Scaffold FastAPI application (`main.py`):
  - Setup CORS middleware for local frontend development.
  - Implement `/api/health` endpoint.
  - Implement `/api/github/overview` (cached proxy for repository counts, commit totals, and public profile metrics).
  - Implement `/api/github/calendar` (cached contribution data).
  - Implement `/api/contact/placeholder` acknowledging submitted messages.
  - Implement in-memory TTL caching with fallback fixtures for offline/unauthenticated execution.

---

### Milestone 1 Exit Criteria
1. `npm run dev` starts React on `localhost:5173` without console errors.
2. `uvicorn main:app --reload` runs FastAPI on `localhost:8000` with interactive docs at `/docs`.
3. Frontend successfully renders live GitHub stats & calendar via backend proxy (or clean mock fallback when offline).
4. Responsive design renders cleanly across mobile (375px+), tablet, and desktop viewports, with the two-column grid gracefully collapsing on mobile.
