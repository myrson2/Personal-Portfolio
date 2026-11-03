# Technology Stack & System Boundaries

### Core Stack Matrix

| Layer | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | ^18.x / ^19.x | Component-driven architecture, robust state management, rich ecosystem. |
| **Frontend Build Tool** | Vite | ^5.x / ^6.x | Instant HMR, lightning-fast build times, zero-overhead bundling. |
| **Styling & Layout** | Bootstrap + Custom Retro CSS | ^5.3.x | Asymmetrical responsive grid combined with pixel borders, tactile buttons, and badges. |
| **Icons & Assets** | Lucide React | Latest | Lightweight vector icons (calendar, download, users, mail, map-pin, external-link). |
| **Backend Framework** | FastAPI | ^0.110+ | High-performance asynchronous Python API framework with native OpenAPI docs. |
| **ASGI Server** | Uvicorn (standard) | ^0.29+ | Production-grade asynchronous web server implementation. |
| **HTTP Client (Backend)** | HTTPX | ^0.27+ | Modern async HTTP client with connection pooling for upstream GitHub queries. |
| **Caching Layer** | In-Memory TTL Cache (cachetools) | Latest | Lightweight in-memory caching to enforce rate-limit safety without Redis overhead in M1. |
| **Environment Config** | Pydantic-Settings / python-dotenv | Latest | Type-safe environment variable parsing and validation. |

---

### Component Hierarchy (Frontend)

```
[App]
 ├── [ProfileHeader]
 │    ├── [Banner & Overlapping Avatar]
 │    ├── [MetadataBadges] (Software Engineer, Philippines, Email, Online indicator)
 │    └── [CTAButtonGroup] (Schedule Meeting, Download CV, Join Community)
 ├── [TwoColumnLayout]
 │    ├── [Section: About]
 │    │    ├── [BioNarrative]
 │    │    ├── [InlineSocialLinks] (github / linkedin / facebook / instagram)
 │    │    └── [ProofOfWorkBar] (10 Tech Stacks | 40 Repos | 10x Hackathons | 5k+ Commits)
 │    ├── [Section: Projects]
 │    │    ├── [FeaturedHeroGrid] (2 large visual cards)
 │    │    ├── [CompactProjectList] (table rows with hairline dividers)
 │    │    └── [AllProjectsLink]
 │    └── [Section: Certifications & Activity]
 │         ├── [CertificationsCarousel] (slideshow cards with navigation controls)
 │         ├── [CertificationsLink]
 │         └── [GitHubCalendarSection] (interactive contribution heat map from FastAPI)
 └── [PlaceholderModals] (Meeting scheduler, CV download confirmation, Community link)
```

---

### Architectural Boundaries & Data Flow

```
+--------------------------------------------------------------------------+
|                            CLIENT BROWSER                                |
|   [ React + Vite App (Editorial Layout + Subtle Retro Pixel Accents) ]   |
+------------------------------------+-------------------------------------+
                                     |
                       REST API calls| (CORS Protected)
                                     v
+--------------------------------------------------------------------------+
|                           FASTAPI BACKEND                                |
|  +--------------------+   +-----------------------+   +---------------+  |
|  | /api/github/overview|  | /api/github/calendar  |   | /api/contact  |  |
|  +---------+----------+   +-----------+-----------+   +-------+-------+  |
|            |                          |                       |          |
|            v                          v                       v          |
|  [ In-Memory TTL Cache ]     [ In-Memory TTL Cache ]    [ Placeholder/   |
|            |                          |                   Validation ]   |
|  (Miss)    v                (Miss)    v                                  |
|  [ GitHub REST / GraphQL ]   [ GitHub GraphQL API ]                      |
|  (Fallback to JSON mock on rate limit or offline)                        |
+--------------------------------------------------------------------------+
```

---

### Rejected Alternatives & Forbidden Patterns
- **No Direct Frontend API Tokens**: Forbidden to store or fetch GitHub Personal Access Tokens inside React.
- **No Heavy 3D Frameworks**: Rejecting Three.js / Canvas 3D to maintain instant loading and battery efficiency.
- **No Premature Database Cluster**: PostgreSQL/Redis deferred until M2/M3 persistence needs materialize.
