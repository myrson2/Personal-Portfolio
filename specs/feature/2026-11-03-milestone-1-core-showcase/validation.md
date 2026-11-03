# Validation & Test Suite Specification: Milestone 1 Core Showcase

- **Feature ID**: `FEAT-M1-CORE-SHOWCASE`
- **Target Milestone**: Milestone 1
- **Status**: Approved & Ready for Implementation

---

### 1. Mandatory Constitution Compliance Matrix

| Constitution Invariant | Compliance Strategy | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **1. Executive Editorial Clarity & Subtle Retro Styling** | 70% white canvas, 30% black structure, 20% pastel blue accent. Monospace counters, tactile pressable button offsets, and stepped pixel borders. WCAG 2.1 AA compliant. | CSS audit, visual inspection, automated Lighthouse accessibility check (score ≥ 95). | **COMPLIANT** |
| **2. Zero Client Secret Leakage** | All GitHub API requests route strictly through the FastAPI backend proxy. No client-side tokens exist in the React bundle or frontend `.env`. | Codebase grep audit (`grep -r GITHUB_TOKEN frontend/`), network inspection in devtools. | **COMPLIANT** |
| **3. Upstream API Resilience** | In-memory TTL cache (`cachetools`). In case of rate limits, network outages, or missing tokens, backend serves deterministic JSON fixtures flagged with `is_mock: true`. | Pytest unit/integration tests with mocked HTTPX failures (403, 429, 500, Timeout). | **COMPLIANT** |
| **4. Strict Scope Discipline (M1)** | Zero database tables (no SQLite/PostgreSQL/Alembic in M1). In-memory caching and JSON fixtures only. No JWT sessions. No 3D canvas libraries. | Architectural boundary audit, dependency check in `requirements.txt` and `package.json`. | **COMPLIANT** |
| **5. Backend as Single Gateway & CORS Invariants** | FastAPI configured with explicit CORS origins (`http://localhost:5173`). All external data queries route via backend endpoints. | TestClient CORS preflight request tests (`OPTIONS /api/github/overview`). | **COMPLIANT** |
| **6. Input Validation via Strict Pydantic Models** | Pydantic models validate `POST /api/contact/placeholder` payloads and enforce response shapes on `/api/github/*`. | Pytest payload fuzzing tests with invalid emails, empty strings, and malformed types. | **COMPLIANT** |

---

### 2. Automated Test Matrix

```
Personal-Portfolio/
├── frontend/
│   └── src/__tests__/
│       ├── ProfileHeader.test.jsx        # Avatar, metadata badges, 3 CTA triggers
│       ├── ScheduleMeetingModal.test.jsx # Form validation, input handling, submission
│       ├── AboutSection.test.jsx         # Bio text, exact social links, 4-metric stat bar
│       ├── ProjectsSection.test.jsx      # 2 hero cards, 3 compact table rows
│       ├── CertificationsCarousel.test.jsx # Autoplay loop, pause on hover, nav controls
│       └── GitHubCalendarGrid.test.jsx   # Heat map rendering, sample data indicator
└── backend/
    └── tests/
        ├── test_health.py                # GET /api/health
        ├── test_github_overview.py       # Proxy fetch, caching, fallback mode
        ├── test_github_calendar.py       # Calendar data formatting, mock fallback
        ├── test_contact.py               # Form validation (201 vs 422), CORS verification
        └── test_cors.py                  # Access-Control-Allow-Origin enforcement
```

---

### 3. Backend Test Suite Specifications (`pytest`)

#### A. Health Check Tests (`tests/test_health.py`)
- `test_health_returns_200_ok`:
  - Request: `GET /api/health`
  - Assertions: Status code is `200`, JSON body contains `{"status": "ok"}` and ISO `timestamp`.

#### B. GitHub Proxy & Fallback Tests (`tests/test_github_overview.py`)
- `test_overview_with_valid_upstream`:
  - Mock HTTPX to return GitHub user data for `myrson2`.
  - Request: `GET /api/github/overview?username=myrson2`
  - Assertions: Status `200`, `total_repos` is integer, `is_mock` is `false`.
- `test_overview_fallback_on_rate_limit`:
  - Mock HTTPX to return `429 Too Many Requests` or `403 Forbidden`.
  - Request: `GET /api/github/overview?username=myrson2`
  - Assertions: Status `200`, data matches `github_overview_fallback.json`, `is_mock` is `true`.
- `test_overview_caching_behavior`:
  - Trigger initial request; assert upstream mock is called once.
  - Trigger immediate second request; assert upstream mock is **NOT** called, and cached response is returned.

#### C. GitHub Calendar Tests (`tests/test_github_calendar.py`)
- `test_calendar_with_valid_upstream`:
  - Mock GraphQL upstream for contribution calendar.
  - Assertions: Status `200`, response contains `total_contributions` and `weeks` array.
- `test_calendar_fallback_on_network_error`:
  - Mock HTTPX to raise `httpx.ConnectError`.
  - Assertions: Status `200`, returns fallback fixture, `is_mock` is `true`.

#### D. Contact Placeholder Tests (`tests/test_contact.py`)
- `test_contact_placeholder_valid_submission`:
  - Request: `POST /api/contact/placeholder` with `{ "name": "Jane", "email": "jane@example.com", "preferred_date": "2026-11-15", "notes": "Meeting", "type": "meeting" }`
  - Assertions: Status `201 Created`, response contains `status: "success"`.
- `test_contact_placeholder_invalid_email`:
  - Request: `POST /api/contact/placeholder` with `{ "name": "Jane", "email": "not-an-email" }`
  - Assertions: Status `422 Unprocessable Entity`, error details reference `email`.
- `test_contact_placeholder_missing_name`:
  - Request: `POST /api/contact/placeholder` with `{ "email": "jane@example.com" }`
  - Assertions: Status `422 Unprocessable Entity`, error details reference `name`.

#### E. CORS Invariant Tests (`tests/test_cors.py`)
- `test_cors_allowed_origin`:
  - Send preflight `OPTIONS /api/github/overview` with `Origin: http://localhost:5173`.
  - Assertions: Header `Access-Control-Allow-Origin` equals `http://localhost:5173`.
- `test_cors_disallowed_origin`:
  - Send request with `Origin: http://malicious-site.com`.
  - Assertions: Response does not include `Access-Control-Allow-Origin: http://malicious-site.com`.

---

### 4. Frontend Test Suite Specifications (`vitest` + `@testing-library/react`)

#### A. `ProfileHeader.test.jsx`
- Verifies identity text: `"Jose Myrson O. Beros"`.
- Verifies presence of metadata badges: `"Software Engineer"`, `"Philippines"`, `"Email"`, and `"Online"`.
- Verifies presence of all 3 CTA buttons: `"Schedule meeting"`, `"Download CV"`, and `"Join Community"`.
- Verifies clicking `"Schedule meeting"` opens the meeting modal.

#### B. `ScheduleMeetingModal.test.jsx`
- Verifies all input fields render: Name, Email, Proposed Date, Notes.
- Verifies form does not submit when required fields are empty (HTML5 / state validation).
- Verifies successful submission displays a confirmation toast and calls the API service.

#### C. `AboutSection.test.jsx`
- Verifies personal narrative copy renders accurately.
- Verifies exact social links render with proper anchors: `github`, `linkedin`, `facebook`, `instagram`.
- Verifies the 4-metric stat bar renders counters: `10 Tech Stacks`, `40 Repositories`, `10x Hackathons`, `5k+ Commits`.

#### D. `ProjectsSection.test.jsx`
- Verifies exactly 2 featured hero project cards are rendered with tags and links.
- Verifies exactly 3 compact tabular row items are rendered with horizontal rules.
- Verifies presence of `"All Projects ->"` link.

#### E. `CertificationsCarousel.test.jsx`
- Verifies certification cards render inside the carousel.
- Verifies mouse enter event triggers pause (`animationPlayState: paused`).
- Verifies clicking Next / Prev step buttons triggers slide transition.

#### F. `GitHubCalendarGrid.test.jsx`
- Verifies calendar squares render based on supplied data.
- Verifies that when `is_mock: true` is passed, a subtle `"Sample Data"` badge/notice is displayed.

---

### 5. Manual QA & Exploratory Runbook

| Step | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **QA-1** | Run `npm run test` in `/frontend`. | All Vitest component test suites pass with 0 errors. | [ ] |
| **QA-2** | Run `pytest` in `/backend`. | All API endpoints, caching, fallback, and validation tests pass with 0 failures. | [ ] |
| **QA-3** | Run `npm run build` in `/frontend`. | Build succeeds cleanly with zero bundle errors. | [ ] |
| **QA-4** | Open page at desktop viewport (1440px). | Two-column editorial layout displays with sticky/anchored left titles. | [ ] |
| **QA-5** | Open page at mobile viewport (375px). | Two-column layout cleanly collapses to stacked single column without horizontal scroll. | [ ] |
| **QA-6** | Click `Schedule meeting`, fill form, and submit. | Modal validates input, sends POST to backend, displays success message. | [ ] |
| **QA-7** | Stop backend or disconnect internet. | Frontend loads gracefully with mock fallback data and sample indicator without throwing errors. | [ ] |
| **QA-8** | Inspect contrast with Chrome DevTools / Lighthouse. | Color contrast ratio meets WCAG 2.1 AA across all text elements. | [ ] |

