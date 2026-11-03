# Implementation Context & Historical Record: Milestone 1 Core Showcase

- **Feature ID**: `FEAT-M1-CORE-SHOWCASE`
- **Milestone**: Milestone 1 (`specs/roadmap.md`)
- **Status**: Completed & Verified
- **Completed At**: 2026-11-03T13:50:00+08:00
- **Author / Lead**: Jose Myrson O. Beros

---

## 1. Executive Summary

Milestone 1 established the foundational monorepo (`/frontend` and `/backend`) and delivered an interactive developer portfolio. Grounded in `specs/constitution.md`, the platform integrates:
1. An asymmetrical two-column editorial layout with tactile retro pixel-art styling (70% white base, 30% black structure, 20% pastel blue accent).
2. A Modern Hero Showcase featuring a centered floating pill navigation island (`Home`, `About`, `Projects`, `Certifications`, `Contact`), status badge (`Available for freelance & engineering roles`), bold editorial greeting, blinking typewriter cursor (`Software Engineer & AI Engineer|`), metadata badges, 3 tactile action CTAs (`Schedule meeting`, `Download CV`, `Join Community`), subtle divider, `Follow me:` social icon strip, and a retro-framed illustration card.
3. An About section featuring an editorial bio, inline lowercase social links (`github / linkedin / facebook / instagram`), and a 4-column proof-of-work stat bar (`10 Tech Stacks`, `40 Repositories`, `10x Hackathons`, `5k+ Commits`).
4. A hybrid Projects showcase (2 featured visual hero cards + 3 compact tabular row items + `All Projects ->` link).
5. An RTL auto-playing Certifications slideshow carousel with pause-on-hover and stepped pixel navigation buttons.
6. An interactive 52-week GitHub contribution heat map embedded directly beneath the Certifications carousel.
7. A FastAPI caching proxy gateway utilizing in-memory TTL caching and deterministic fallback JSON fixtures when GitHub tokens are missing or rate-limited (`is_mock: true`).

---

## 2. Implementation Inventory

### Root & Governance
- [`.gitignore`](file:///c:/Users/merss/Personal-Portfolio/.gitignore): Excludes node_modules, Python venvs, `.env`, caches, and build outputs.
- [`.env.example`](file:///c:/Users/merss/Personal-Portfolio/.env.example): Documents backend environment variables.
- [`README.md`](file:///c:/Users/merss/Personal-Portfolio/README.md): Full project architecture, features, directory layout, and setup runbook.
- [`AGENTS.md`](file:///c:/Users/merss/Personal-Portfolio/AGENTS.md): Operational rules and invariants for AI agents.

### Ground-Truth Specifications
- [`specs/constitution.md`](file:///c:/Users/merss/Personal-Portfolio/specs/constitution.md): Architectural non-negotiables & 70/30/20 design system rules.
- [`specs/mission.md`](file:///c:/Users/merss/Personal-Portfolio/specs/mission.md): Product charter, persona workflows, and KPIs.
- [`specs/tech-stack.md`](file:///c:/Users/merss/Personal-Portfolio/specs/tech-stack.md): Stack matrix, boundary diagrams, and component tree.
- [`specs/roadmap.md`](file:///c:/Users/merss/Personal-Portfolio/specs/roadmap.md): Phased roadmap across Milestones 1, 2, and 3.

### Feature Specification Triad
- [`specification.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/specification.md): User stories and functional requirements.
- [`implementation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/implementation.md): Schemas, control flow sequence diagram, and CSS techniques.
- [`validation.md`](file:///c:/Users/merss/Personal-Portfolio/specs/feature/2026-11-03-milestone-1-core-showcase/validation.md): Constitution Compliance Matrix, automated test specifications, and manual QA runbook.

### Backend Gateway (`/backend`)
- [`backend/requirements.txt`](file:///c:/Users/merss/Personal-Portfolio/backend/requirements.txt): FastAPI, Uvicorn, HTTPX, cachetools, Pydantic, pytest.
- [`backend/app/main.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/main.py): Root ASGI application and CORS middleware.
- [`backend/app/core/config.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/core/config.py): Pydantic settings loading `GITHUB_USERNAME` and cache TTL.
- [`backend/app/core/cache.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/core/cache.py): In-memory TTL cache instance (`TTLCache`).
- [`backend/app/models/github.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/models/github.py): Schemas for overview and contribution calendar.
- [`backend/app/models/contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/models/contact.py): Schemas for meeting and message placeholder submissions.
- [`backend/app/services/github_service.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/services/github_service.py): Upstream HTTPX queries, caching, and fallback resolution.
- [`backend/app/fixtures/github_overview_fallback.json`](file:///c:/Users/merss/Personal-Portfolio/backend/app/fixtures/github_overview_fallback.json): Fallback profile telemetry.
- [`backend/app/fixtures/github_calendar_fallback.json`](file:///c:/Users/merss/Personal-Portfolio/backend/app/fixtures/github_calendar_fallback.json): Fallback 52-week activity dataset.
- [`backend/app/api/router.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/router.py): Consolidated API router.
- [`backend/app/api/endpoints/health.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/health.py): `GET /api/health`.
- [`backend/app/api/endpoints/github.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/github.py): `GET /api/github/overview`, `GET /api/github/calendar`.
- [`backend/app/api/endpoints/contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/app/api/endpoints/contact.py): `POST /api/contact/placeholder`.
- [`backend/tests/test_health.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_health.py): Uptime verification.
- [`backend/tests/test_github_overview.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_github_overview.py): Fallback mode and caching assertions.
- [`backend/tests/test_github_calendar.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_github_calendar.py): Calendar grid parsing and fallback assertions.
- [`backend/tests/test_contact.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_contact.py): Form validation and HTTP status codes (`201` vs `422`).
- [`backend/tests/test_cors.py`](file:///c:/Users/merss/Personal-Portfolio/backend/tests/test_cors.py): Strict origin isolation assertions.

### Frontend Application (`/frontend`)
- [`frontend/package.json`](file:///c:/Users/merss/Personal-Portfolio/frontend/package.json): React 18, Vite, Bootstrap 5.3, Lucide React, Vitest, JSDOM.
- [`frontend/vite.config.js`](file:///c:/Users/merss/Personal-Portfolio/frontend/vite.config.js): Dev server proxying `/api` to `localhost:8000` and Vitest setup.
- [`frontend/src/setupTests.js`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/setupTests.js): JSDOM environment polyfills (e.g. `scrollBy`).
- [`frontend/src/styles/retro-pixel.css`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/styles/retro-pixel.css): Retro design system tokens, stepped borders, tactile `:active` button offsets, and monospace typography.
- [`frontend/src/styles/layout.css`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/styles/layout.css): Two-column asymmetrical layout, RTL continuous marquee, and mobile responsive collapse.
  - Updated CSS: added `.compact-project-row` rule with consistent 1px border and `box-shadow: 2px 2px 0 var(--border-dark);` to match `.cert-card` and `.featured-project-card`.
- [`frontend/src/services/api.js`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/services/api.js): Fetch wrappers with client-side fallback safety.
- [`frontend/src/components/Header/ProfileHeader.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Header/ProfileHeader.jsx): Header with avatar overlap and 3 CTAs.
- [`frontend/src/components/About/AboutSection.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/About/AboutSection.jsx): Narrative, lowercase socials, and 4-column stat bar.
- [`frontend/src/components/Projects/ProjectsSection.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Projects/ProjectsSection.jsx): 2 visual hero cards and 3 tabular project rows.
- [`frontend/src/components/Certifications/CertificationsCarousel.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Certifications/CertificationsCarousel.jsx): RTL continuous auto-play carousel with pause-on-hover and manual step navigation.
- [`frontend/src/components/Calendar/GitHubCalendarGrid.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Calendar/GitHubCalendarGrid.jsx): 52-week activity heat map grid.
- [`frontend/src/components/Modals/ScheduleMeetingModal.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/ScheduleMeetingModal.jsx): Interactive meeting request form.
- [`frontend/src/components/Modals/DownloadCVModal.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/DownloadCVModal.jsx): CV download dialog.
- [`frontend/src/components/Modals/JoinCommunityModal.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/components/Modals/JoinCommunityModal.jsx): Community invite hub with one-click copy.
- [`frontend/src/__tests__/ProfileHeader.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ProfileHeader.test.jsx): Header render & CTA click tests.
- [`frontend/src/__tests__/ScheduleMeetingModal.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ScheduleMeetingModal.test.jsx): Form validation and submission tests.
- [`frontend/src/__tests__/AboutSection.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/AboutSection.test.jsx): Social links and 4 stat counter tests.
- [`frontend/src/__tests__/ProjectsSection.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/ProjectsSection.test.jsx): Hero cards and table rows test.
- [`frontend/src/__tests__/CertificationsCarousel.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/CertificationsCarousel.test.jsx): Slideshow render and button step controls test.
- [`frontend/src/__tests__/GitHubCalendarGrid.test.jsx`](file:///c:/Users/merss/Personal-Portfolio/frontend/src/__tests__/GitHubCalendarGrid.test.jsx): Contribution heat map & sample badge test.

---

## 3. Key Architectural & Design Decisions

1. **Pure Regex Email Validation in Pydantic**:
   - Switched from default `email-validator` to strict offline-safe regex validation (`re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")`). This eliminated blocking network DNS lookups for MX records, ensuring 0ms validation latency even in isolated sandbox or offline environments.
2. **Defensive In-Memory Caching & Deterministic Fallbacks**:
   - `GitHubService` provides in-memory TTL caching via `cachetools.TTLCache`. If `GITHUB_TOKEN` is unset, rate limits are hit (`429`), or network connectivity drops, the backend returns deterministic fixtures with `is_mock: true`. The UI surfaces a subtle "Sample Data" notice without breaking layout structure.
3. **Continuous Right-to-Left (RTL) Marquee with JSDOM Compatibility**:
   - The certifications slideshow uses pure CSS translation loop (`@keyframes scroll-rtl`) duplicated across items. To support headless JSDOM testing while maintaining smooth manual navigation, `scrollRef.current.scrollBy` calls are guarded with function existence checks and polyfilled in `setupTests.js`.
4. **Subtle Retro Gamified Accents on Clean Canvas**:
   - Followed the 70/30/20 rule: 70% white base, 30% black structure, 20% pastel blue accent (`#7bb2ff` / `#93c5fd`). Used stepped pixel borders (`box-shadow: 3px 3px 0 #111827`) and tactile `:active { transform: translate(2px, 2px); }` offsets for buttons, while keeping typography crisp and WCAG 2.1 AA compliant.
5. **Adoption of `uv` for Backend Python Toolchain**:
   - Replaced legacy `venv`/`pip` orchestration with `uv` (`uv venv`, `uv pip install`, `uv run`). This reduced package resolution and installation to sub-second speeds (< 700ms for 33 packages), standardized virtual environment isolation in `.venv`, and enabled zero-activation commands via `uv run`.
6. **Alignment & Grid Track Overflow Fix**:
   - Enforced `grid-template-columns: 180px minmax(0, 1fr)` and `min-width: 0; overflow: hidden` on `.editorial-content`. This prevented the wide carousel track (`width: max-content`) from blowing out the CSS Grid track to 2,000px, restoring strict right-margin alignment across all sections (`All Projects ->`, `Certifications ->`, and the GitHub Calendar box).
   - Generated a complete 53-week dataset in `github_calendar_fallback.json` (1,510 contributions) and implemented fallback distribution in `services/api.js`, cleanly filling the entire width of the calendar container.
7. **Hero Section Redesign & Floating Pill Navigation Bar**:
   - Replaced legacy banner/avatar header with a centered floating pill navigation island (`Home`, `About`, `Projects`, `Certifications`, `Contact`) equipped with active pill states and subtle box shadows.
   - Structured the hero into a two-column editorial split:
     - **Left Column**: Live availability status pill (`. Available for freelance & engineering roles`), bold headline, role subtitle with a CSS-animated blinking typewriter cursor (`|`), value proposition pitch, metadata tags, 3 primary/secondary CTAs, subtle divider line, and a `Follow me:` icon row.
     - **Right Column**: Tactile character illustration card with 24px rounded corners, solid dark border, and retro pixel drop shadow (`box-shadow: 6px 6px 0px #111827`) featuring an interactive hover translation offset.
8. **Comprehensive Multi-Breakpoint Responsive Design**:
   - **Mobile Breakpoint (< 768px down to 320px)**:
     - Collapsed `.editorial-section` and `.hero-content-grid` from two columns to an anchored single-column stack with distinctive section underline accents.
     - Centered pill navigation allows smooth horizontal swipe if needed; character card centers above content or stacks gracefully (`order: -1`, 250px max width).
     - Hero CTA buttons expand to full-width stacked touch-friendly actions (≥ 44px height).
     - Stat Bar: Adapted to a balanced 2x2 grid with adjusted vertical dividing rules.
     - Projects: Hero cards collapse to single column; tabular project rows stack title above description without horizontal squishing.
     - Certifications & Calendar: Card widths resized to 210px; carousel controls enlarged to 44x44px tap targets; calendar heat map equipped with smooth iOS/Android native touch scrolling (`-webkit-overflow-scrolling: touch`) and a subtle horizontal swipe hint.
     - Modals: Fluid width on mobile with `font-size: 16px` on inputs to prevent iOS automatic zoom.
   - **Tablet Breakpoint (768px - 991.98px)**: Optimized grid column ratio to `140px minmax(0, 1fr)` and hero to `1.15fr 0.85fr` with balanced container padding.

9. **Contact Modal Layout Alignment Fix (`ScheduleMeetingModal`)**:
   - Replaced invalid Bootstrap class `flex-direction-column` with standard `flex-column`, preventing inputs from being collapsed into a single squished horizontal row.
   - Form fields (`Your Name`, `Work Email`, `Preferred Date`, `Topic / Meeting Notes`) now stack vertically with full width (`w-100`) and clear text labels.
   - Action buttons (`Cancel`, `Confirm Request`) align cleanly to the bottom right with responsive mobile stacking.
10. **Certifications Infinite Slideshow Loop (`CertificationsCarousel`)**:
   - Built a continuous right-to-left moving slideshow using a mathematically seamless two-track marquee structure (`calc(-100% - 1rem)` translation loop on 8-card tracks).
   - Glides continuously in an infinite 360-degree loop without running out of cards, without blank spaces, and with 0px jump.
   - Automatically pauses on mouse hover or element focus so credentials can be read comfortably; resumes on mouse leave.
   - Chevron step navigation buttons (`Previous Certification` / `Next Certification`) and loop indicator badge cycle the active card indicator (`1/4`, `2/4`, `3/4`, `4/4`) in an infinite circular loop.
11. **Section Decoupling & Contributions Main-Width Alignment**:
   - Decoupled the GitHub Contributions Calendar from `<section id="certifications">` into its own dedicated section `<section className="contributions-section" id="contributions">`.
   - The Contributions section spans the full main container width (aligned from the main left margin to the main right margin), eliminating the awkward 180px offset void.
   - Enhanced the 53-week heat map grid cells (11px × 11px with 4px gap and subtle hover zoom) to distribute evenly across the main container width.
   - Added direct `#contributions` navigation link with `GitCommit` icon in the floating pill navbar.

---

## 4. Verification & Test Evidence

### Backend Pytest Suite (via `uv run`)
Executed via `cd backend && uv run pytest tests -v`:
- `tests/test_contact.py::test_contact_placeholder_valid_submission`: **PASSED**
- `tests/test_contact.py::test_contact_placeholder_invalid_email`: **PASSED**
- `tests/test_contact.py::test_contact_placeholder_missing_name`: **PASSED**
- `tests/test_cors.py::test_cors_allowed_origin`: **PASSED**
- `tests/test_cors.py::test_cors_disallowed_origin`: **PASSED**
- `tests/test_github_calendar.py::test_calendar_fallback_mode`: **PASSED**
- `tests/test_github_overview.py::test_overview_fallback_mode`: **PASSED**
- `tests/test_github_overview.py::test_overview_caching_behavior`: **PASSED**
- `tests/test_health.py::test_health_returns_200_ok`: **PASSED**
- **Summary**: **9 passed in 1.67s**

### Frontend Vitest Suite
Executed via `npm test` inside `/frontend`:
- `AboutSection.test.jsx`: **2 passed**
- `ProjectsSection.test.jsx`: **1 passed**
- `ProfileHeader.test.jsx`: **2 passed**
- `CertificationsCarousel.test.jsx`: **3 passed** (includes infinite loop & pause-on-hover assertions)
- `ScheduleMeetingModal.test.jsx`: **2 passed**
- `GitHubCalendarGrid.test.jsx`: **2 passed**
- **Summary**: **6 test files passed, 12 tests passed in 11.58s**

### Production Build
Executed via `npm run build` inside `/frontend`:
```
✓ 1587 modules transformed.
dist/index.html                   0.85 kB │ gzip:  0.48 kB
dist/assets/index-CjZ3Qj7l.css  245.93 kB │ gzip: 34.32 kB
dist/assets/index-DMM6hyC3.js   176.48 kB │ gzip: 54.64 kB
✓ built in 12.71s
```

---

## 5. Operational Runbook

### Starting Backend (with `uv`):
```powershell
cd backend
uv run uvicorn app.main:app --reload --port 8001
```
Interactive API docs: `http://localhost:8001/docs`.

Run backend tests:
```powershell
cd backend
uv run pytest tests -v
```

### Starting Frontend:
```powershell
cd frontend
npm.cmd run dev
```
Client application: `http://localhost:5173`.

### Starting Frontend:
```powershell
cd frontend
npm.cmd run dev
```
Client application: `http://localhost:5173`.

---

## 6. Next Milestone Handoff (Milestone 2)

As documented in `specs/roadmap.md`, the next phase will introduce:
1. **Live Email / Webhook Gateway**: Replacing the placeholder acknowledge endpoint with actual email dispatch (e.g., Resend, SendGrid, or Discord Webhook).
2. **Project Deep Dive Modals**: Dedicated interactive modal views for each project showing architecture diagrams and live demo embeds.
3. **Automated CI/CD & Production Deployment**: GitHub Actions pipeline and deployment to Vercel/Cloudflare Pages (frontend) and Render/Railway (backend).

