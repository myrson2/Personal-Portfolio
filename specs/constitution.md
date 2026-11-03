# System Constitution & Architectural Invariants

### Status & Scope
- **Classification**: Foundational Non-Negotiables
- **Applicability**: All modules, services, and workflows within `Personal-Portfolio`
- **Revision Policy**: Amendments require explicit developer review and sign-off.

---

### Core Philosophy & Axioms
1. **Executive Editorial Clarity Infused with Subtle Retro Character**: The interface combines an asymmetrical two-column editorial layout with tactile retro accents (70% white base, 30% black structure, 20% pastel blue accents). Subtle pixel borders, pixel badges, tactile pressable buttons, and monospace stat numbers provide distinct personality without sacrificing recruiter readability or accessibility (WCAG 2.1 AA).
2. **Zero Client Secret Leakage**: Under no circumstance shall third-party access tokens (e.g., GitHub Personal Access Tokens) be bundled into or exposed by client-side code. All upstream integrations run strictly through the backend gateway.
3. **Resilience Over External Dependencies**: Upstream API outages or rate-limit exhaustion (e.g., GitHub API downtime or 429 errors) must gracefully fall back to cached responses or clean mock fixtures without degrading the user experience.
4. **Scope Discipline (Milestone 1)**: Premature features (full relational database clusters, complex authentication, heavy 3D canvas runtimes) are strictly forbidden in M1.

---

### Security & Invariants
- **Backend as Gateway**: The FastAPI service serves as the single trusted gateway between the frontend and external service providers.
- **Environment Isolation**: Secret keys and configuration values are loaded strictly via `.env` files and validated Pydantic settings.
- **CORS Invariants**: Strict CORS middleware configured in FastAPI, allowing only authorized origins (`http://localhost:5173` in local development and the production domain).
- **Rate-Limiting & Proxy Caching**: FastAPI caches upstream GitHub responses in-memory with a defined TTL (15–60 minutes) to eliminate GitHub rate-limit exhaustion.
- **Input Validation**: All backend endpoints utilize strict Pydantic models for incoming payloads and responses.

---

### Scope Discipline (Milestone 1)
- **Strictly In-Scope**:
  - Monorepo structure (`/frontend` and `/backend`).
  - React + Vite + Bootstrap frontend with subtle retro pixel-art styling.
  - Two-column editorial layout (left section headers, right content stream).
  - Profile Header: Top banner, overlapping circular avatar, metadata pill strip (Role, Location, Email, Online indicator), and 3 tactile CTA buttons (`Schedule meeting`, `Download CV`, `Join Community`) operating as validated interactive placeholders.
  - About Section: Personal narrative, inline social links (`github / linkedin / facebook / instagram`), and a 4-column proof-of-work stat bar (`10 Tech Stacks`, `40 Repositories`, `10x Hackathons`, `5k+ Commits`).
  - Projects Showcase: Hybrid display featuring 2 visual hero cards and a compact line-item list with horizontal rules.
  - Certifications Showcase: Interactive slideshow/carousel of credential cards.
  - GitHub Calendar: Visual contribution activity graph directly below Certifications.
  - FastAPI caching proxy service exposing `/api/github/overview` and `/api/github/calendar` with robust fallback fixtures.
- **Strictly Out-of-Scope**:
  - Full relational database / ORM setup (M1 relies on fast in-memory caching and JSON data).
  - Multi-user authentication or session state.
  - Live third-party calendar booking integration (e.g., Calendly/Cal.com APIs deferred to M2).
  - Heavy 3D canvas libraries (Three.js, Babylon.js).
