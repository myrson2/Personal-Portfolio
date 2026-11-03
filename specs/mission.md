# Mission Statement & Product Charter

### Executive Summary
The **Jose Myrson O. Beros Personal Portfolio** is an interactive, high-performance web platform designed to establish a distinctive technical brand as a Software and AI Engineer. It pairs an asymmetrical editorial layout with tactile retro pixel-art accents, backed by an engineered FastAPI caching proxy that surfaces real-time GitHub telemetry and an interactive contribution calendar.

---

### The Problem Statement & Industry Friction
- **Template Homogeneity**: Most developer portfolios rely on identical static templates that fail to stand out to engineering hiring managers.
- **Static vs. Dynamic Imbalance**: Portfolios are often either purely static HTML without engineering depth, or excessively bloated dynamic apps that suffer from sluggish load times and fragile setups.
- **Unverified Metrics**: Technical recruiters and hackathon judges seek authentic proof of activity, yet manual statistics quickly become stale.

---

### Target Personas & User Workflows
1. **Engineering Hiring Managers & Technical Leads**:
   - *Goal*: Quickly assess architectural skill, code quality, real-world project prototypes, and continuous commit activity.
   - *Workflow*: Arrives at landing page -> scans metadata badges & CTAs -> downloads CV or schedules a call -> inspects featured projects and live GitHub activity calendar.
2. **Hackathon Judges & Technical Evaluators**:
   - *Goal*: Gauge rapid execution capability, systems thinking, and technical breadth.
   - *Workflow*: Explores narrative & proof-of-work stats -> flips through Certifications slideshow -> inspects live GitHub activity and tech stack badges.
3. **Potential Clients & Collaborators**:
   - *Goal*: Evaluate credibility, check real-time availability, and initiate project discussions.
   - *Workflow*: Observes "Online" availability status -> clicks `Schedule meeting` placeholder modal.

---

### Value Proposition & Differentiators
- **Editorial Minimalism with Subtle Retro Charm**: Modern two-column layout enhanced with pixel borders, pixel badges, tactile pressable buttons, and monospace counters in a 70/30/20 color harmony (70% white canvas, 30% black structure, 20% pastel blue accent).
- **Engineered Live Metrics**: Real-time GitHub commit history, repository metadata, and contribution calendar delivered via a secure backend caching proxy.
- **Interactive Slideshow & Structured Showcase**: Dense, easily scannable project list combined with high-impact hero cards and a fluid certifications carousel.
- **Sub-Second Performance**: Powered by Vite and FastAPI for instant interactions and zero bundle bloat.

---

### Key Performance Indicators (KPIs)
- **Performance**: Lighthouse Performance score ≥ 95 on desktop and mobile.
- **Accessibility**: 100% WCAG 2.1 AA color contrast and screen-reader compliance.
- **Cache Hit Ratio**: ≥ 90% cache hit rate for GitHub metrics endpoints to minimize external API consumption.
