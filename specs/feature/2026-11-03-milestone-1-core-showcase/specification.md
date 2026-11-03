# Feature Specification: Milestone 1 Core Showcase

- **Feature ID**: `FEAT-M1-CORE-SHOWCASE`
- **Milestone**: Milestone 1 (`specs/roadmap.md`)
- **Status**: Approved & Ready for Implementation
- **Owner**: Jose Myrson O. Beros

---

### 1. Context & Motivation
The objective of Milestone 1 is to scaffold the foundational monorepo and deliver an interactive, editorial developer portfolio. Grounded in `specs/constitution.md` and `specs/mission.md`, this showcase merges an asymmetrical two-column layout with subtle retro pixel-art accents (70% white base, 30% black structure, 20% pastel blue highlights), backed by a resilient FastAPI caching proxy that surfaces live GitHub telemetry for user `myrson2` with deterministic mock fallbacks.

---

### 2. User Stories

#### US-1: Technical Hiring Manager & Evaluator
- **GIVEN** a hiring manager visits the portfolio landing page,
- **WHEN** they view the header and about section,
- **THEN** they see an immediate profile summary, availability badge (`Online ●`), 4-metric proof-of-work bar (`10 Tech Stacks`, `40 Repositories`, `10x Hackathons`, `5k+ Commits`), and can trigger `Download CV` or `Schedule meeting`.

#### US-2: Interactive Meeting & Community Explorer
- **GIVEN** a client or peer clicks `Schedule meeting`,
- **WHEN** the modal dialog opens,
- **THEN** an interactive validated form (Name, Email, Proposed Date, Note) is presented that submits to `/api/contact/placeholder` with an immediate confirmation toast.
- **WHEN** clicking `Download CV` or `Join Community`,
- **THEN** an actionable modal presents immediate download links and community connection details.

#### US-3: Technical Evaluator & Recruiter Reviewing Code & Activity
- **GIVEN** an evaluator scans the Projects and Certifications sections,
- **WHEN** they browse the right-column stream,
- **THEN** they inspect 2 prominent visual hero project cards, 3 compact tabular project rows, an RTL auto-playing certifications slideshow, and an interactive GitHub contribution calendar.

#### US-4: Offline / Rate-Limited Fallback Experience
- **GIVEN** the GitHub API is unreachable, rate-limited, or running without an API token,
- **WHEN** the frontend requests GitHub stats or calendar data,
- **THEN** the FastAPI backend returns deterministic fallback JSON fixtures with an explicit `is_mock: true` flag, allowing the UI to display authentic layout metrics alongside a subtle "Sample Data" indicator.

---

### 3. Functional Requirements

- **FR-1 [Profile Header]**: Display full-width top banner with overlapping circular profile avatar, identity text ("Jose Myrson O. Beros"), metadata badge strip (`Software Engineer`, `Philippines`, `Email`, `Online ●`), and 3 tactile buttons (`Schedule meeting`, `Download CV`, `Join Community`).
- **FR-2 [Interactive Modals]**:
  - `Schedule meeting`: Modal with validated client-side form submitting to `POST /api/contact/placeholder`.
  - `Download CV`: Modal confirming resume download with direct PDF link and fallback viewer.
  - `Join Community`: Modal showcasing Discord/community links with copyable invite actions.
- **FR-3 [About & Telemetry Bar]**: Editorial narrative copy, inline lowercase social links (`github / linkedin / facebook / instagram`), and a 4-column divider bar displaying live/cached stats.
- **FR-4 [Hybrid Projects Showcase]**: Render 2 side-by-side featured project preview cards (with image preview, tech badges, GitHub/Demo links) followed by 3 horizontal tabular row items and an `All Projects ->` link.
- **FR-5 [Certifications Slideshow]**: Continuous Right-to-Left (RTL) auto-playing carousel with pause-on-hover, step navigation arrows (pixel-styled), and a `Certifications ->` link.
- **FR-6 [GitHub Contribution Calendar]**: Visual 52-week activity grid embedded below the Certifications carousel, populated from backend proxy data.
- **FR-7 [FastAPI Proxy Layer]**: Cached endpoints for `/api/github/overview` and `/api/github/calendar` with `cachetools` TTL caching (30 min) and fallback fixtures for user `myrson2`.

---

### 4. Non-Functional Requirements

- **NFR-1 [70/30/20 Visual Hierarchy]**: 70% clean white canvas, 30% deep black typography and structural borders, 20% pastel blue accent (`#7bb2ff` / `#93c5fd`) for active hover and status pills.
- **NFR-2 [Subtle Retro Pixel Styling]**: Monospace counters, tactile `:active` button translation offsets (`translate(2px, 2px)`), subtle pixelated border-radius box shadows, and pixel status badges without compromising modern legibility.
- **NFR-3 [Accessibility (WCAG 2.1 AA)]**: Minimum contrast ratio of 4.5:1 for body copy and 3:1 for large headings and UI controls. Full keyboard operability for modals and carousel.
- **NFR-4 [Responsive Adaptation]**: Graceful two-column editorial split on viewports ≥ 768px; clean single-column stacked layout on mobile screens (< 768px).
- **NFR-5 [Security]**: Zero client-side tokens. All external API requests route through FastAPI with CORS restricted to local frontend and production domains.

---

### 5. Acceptance Criteria Checklist
- [ ] Monorepo structure (`/frontend` and `/backend`) runs with zero configuration collisions.
- [ ] Header renders with overlapping avatar, metadata strip, and all 3 modal triggers.
- [ ] `Schedule meeting` form validates input fields and successfully posts to `/api/contact/placeholder`.
- [ ] About section displays exact social links (`github / linkedin / facebook / instagram`) and 4-metric stat bar.
- [ ] Projects section renders 2 visual hero cards and 3 tabular row items with hairline dividers.
- [ ] Certifications slideshow auto-scrolls right-to-left and pauses upon cursor hover.
- [ ] GitHub calendar grid renders beneath certifications using backend proxy data.
- [ ] If GitHub API fails or token is omitted, backend serves JSON fixture marked with `is_mock: true`.
- [ ] Layout complies with WCAG 2.1 AA contrast and passes mobile responsiveness checks down to 375px.

