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
   ├── Full Contact Form backend delivery & meeting-request CTA (live calendar booking deferred — see Deferred Backlog)
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

---

### Milestone 2 Exit Criteria

1. Contact form delivers a real email via Resend, with a deterministic mock fallback when `RESEND_API_KEY` is unset.
2. Project deep-dive `#project/{slug}` links open populated five-tab modals for `eMSME` and `colorgame`; retired slugs return 404.
3. `main` is merged into `Milestone2Branch` and the two predicted conflicts are resolved per `FEAT-M2-CLOSEOUT-RELEASE` FR-2: keep `CACHE_TTL_SECONDS: "900"`, adopt main's Render deploy-hook safety check, keep the branch's `working-directory: ./frontend` Vercel build, and keep the `frontend/vercel.json` trailing newline.
4. CI is green with backend 31/31 and frontend 21/21 tests plus a clean production build.
5. The exposed GitHub PAT is revoked and replaced by a fine-grained token with all-repository read access, set only in the Render dashboard.
6. Render and Vercel are redeployed; the `context.md §5` curl set returns live/fallback JSON with `eMSME`, `colorgame`, `equiptrack` → 404, and the Vercel `/api` rewrite matches direct Render.
7. Layout verified at 375px and 1200px+; both Case Study modals populate all five tabs.
8. Live meeting scheduler is formally deferred beyond M2 and reflected in both this roadmap and `specs/constitution.md`.
9. `specs/context.md` and all feature `validation.md` files report current statuses, values, and test counts.

### Deferred Backlog (not in M2)

- **Live Meeting Scheduler Integration**: `Schedule meeting` remains a contact-request modal posting to `POST /api/contact/send`. A minimal CTA relabel (e.g. "Request a meeting") is logged as a future code task. Revisit in M3 or later with a roadmap amendment — do not add a third-party booking API without a new feature spec.

### Milestone 3: Detailed Workstreams & Exit Criteria

#### Workstream 1: AI Engineer Showcase Sandbox
- Interactive AI demo / micro-agent playground with a clearly labeled simulated or mocked execution path when no provider key is configured.
- Keep all provider keys behind the FastAPI gateway; no client-side secret.

#### Workstream 2: Advanced Visitor Analytics
- Privacy-conscious, aggregate-only visitor metrics; no multi-user accounts or cookies.
- Surface counts through the existing backend gateway with in-memory caching or fixtures; no database introduced without a new spec.

#### Workstream 3: Expanded Gamification / Retro Terminal Mode
- Extend the existing retro pixel aesthetic with a terminal-style mode and achievement badges; preserve the 70/30/20 palette and WCAG 2.1 AA contrast.

#### Workstream 4 (measurement): Mission KPI Verification
- Measure and record Lighthouse Performance ≥ 95 (desktop and mobile) and 100% WCAG 2.1 AA color contrast / screen-reader compliance from `specs/mission.md`.

#### Milestone 3 Exit Criteria

1. All M2 exit criteria above are met and `main` contains the merged closeout branch.
2. The deferred meeting scheduler is either explicitly scheduled in M3 or remains in the Deferred Backlog with a dated decision.
3. Every M3 workstream has its own feature triad under `specs/feature/` before code begins.
4. Lighthouse and WCAG AA results are recorded in `specs/context.md`.
5. No database, multi-user auth, or heavy 3D library is introduced unless a constitution amendment is approved.
