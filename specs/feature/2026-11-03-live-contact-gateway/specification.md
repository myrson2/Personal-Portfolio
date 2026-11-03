# Specification: Live Contact Gateway
- **Feature ID**: `FEAT-M2-LIVE-CONTACT-GATEWAY`
- **Milestone**: Milestone 2 (`specs/roadmap.md`)
- **Status**: Completed & Verified
- **Completed At**: 2026-11-03T19:20:00+08:00
- **Author / Lead**: Jose Myrson O. Beros

---

## 1. Context & Motivation

Rooted in `specs/roadmap.md` Milestone 2 Workstream 1 and `specs/mission.md`. The current `POST /api/contact/placeholder` endpoint only acknowledges receipt without delivering any message. This feature replaces that stub with real email delivery via **Resend**, enabling potential clients and recruiters to meaningfully reach Jose through the portfolio.

This is the highest-priority M2 deliverable as it directly converts portfolio traffic into professional opportunities.

---

## 2. User Stories

### US-1: Meeting Request Submission (Happy Path)
```
GIVEN a visitor lands on the portfolio and wants to reach Jose
WHEN they click "Schedule meeting" in the header CTA
 AND fill in Name, Work Email, Preferred Date, and Topic/Meeting Notes
 AND click "Confirm Request"
THEN the backend delivers an email to Jose's configured recipient address
 AND the modal transitions to a success state:
     "Message sent! I'll get back to you within 24 hours."
```

### US-2: Graceful Delivery Failure
```
GIVEN the Resend API is unreachable or returns an error
WHEN a visitor submits a valid contact form
THEN the frontend displays:
     "Failed to send. Please try again or email me directly at [email]."
 AND the backend logs the error internally
 AND the frontend never crashes or renders a blank screen
```

### US-3: Spam Protection via Rate Limiting
```
GIVEN a single IP address submits more than 3 contact requests within 15 minutes
WHEN they attempt a 4th submission
THEN the backend returns HTTP 429 Too Many Requests
 AND the frontend displays:
     "Too many requests. Please wait a few minutes before trying again."
```

### US-4: Malformed or Invalid Input
```
GIVEN a visitor submits the form with an invalid email or missing required fields
THEN the backend returns HTTP 422 Unprocessable Entity
 AND the frontend shows inline validation errors on the relevant fields
```

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Backend replaces `POST /api/contact/placeholder` with `POST /api/contact/send` |
| FR-2 | Endpoint accepts: `name` (str, required), `email` (str, regex-validated, required), `preferred_date` (str, optional), `notes` (str, optional) |
| FR-3 | On valid submission, calls Resend Python SDK to deliver email to `RESEND_TO_EMAIL` env var |
| FR-4 | Email subject: `"Portfolio Contact: Meeting Request from {name}"` |
| FR-5 | Email body: formatted HTML with all submitted fields clearly labeled |
| FR-6 | Returns HTTP 200 with `{"status": "sent", "message": "Email delivered successfully"}` on success |
| FR-7 | Returns HTTP 503 with `{"status": "error", "message": "Delivery failed. Please try again."}` if Resend call fails |
| FR-8 | Returns HTTP 429 if the same IP exceeds 3 submissions in 15 minutes (in-memory rate limit) |
| FR-9 | `RESEND_API_KEY` and `RESEND_TO_EMAIL` stored in `backend/.env`, never exposed to frontend |
| FR-10 | If `RESEND_API_KEY` is not set, backend falls back gracefully: logs a warning and returns `{"status": "mock", "message": "Email delivery skipped (no API key configured)"}` with HTTP 200 |
| FR-11 | Frontend `ScheduleMeetingModal.jsx` wires the "Confirm Request" button to `POST /api/contact/send` |
| FR-12 | On success (HTTP 200), modal shows success state; on failure (non-200), shows error state with direct email fallback link |
| FR-13 | Frontend never exposes Resend API key — all requests route through the backend proxy (constitutional invariant) |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Security**: `RESEND_API_KEY` strictly in `backend/.env`; CORS origin allowlist unchanged |
| NFR-2 | **Performance**: Resend HTTP call must be `async` (non-blocking); no blocking I/O on the event loop |
| NFR-3 | **Resilience**: Backend never crashes on Resend failure; always returns structured JSON |
| NFR-4 | **Rate Limiting**: In-memory per-IP tracking using `cachetools.TTLCache` (consistent with M1 caching infrastructure) |
| NFR-5 | **Observability**: All Resend errors logged to `stderr` with timestamp and redacted payload |
| NFR-6 | **WCAG 2.1 AA**: Success/error modal states meet minimum color contrast requirements |
| NFR-7 | **Mobile UX**: Success/error states render correctly on 375px viewport; `font-size: 16px` on inputs (prevents iOS zoom) |

---

## 5. Acceptance Criteria

- [ ] `POST /api/contact/send` with valid payload → HTTP 200 + email delivered to Jose's inbox
- [ ] `POST /api/contact/send` with invalid email format → HTTP 422
- [ ] `POST /api/contact/send` with missing `name` field → HTTP 422
- [ ] 4th submission from same IP within 15 minutes → HTTP 429
- [ ] Resend API unreachable or throws → HTTP 503 + structured JSON error (no crash)
- [ ] `RESEND_API_KEY` not set in `.env` → HTTP 200 + `{"status": "mock"}` (graceful degradation)
- [ ] Frontend success state renders correctly after HTTP 200 response
- [ ] Frontend error state renders with direct email fallback after non-200 response
- [ ] No `RESEND_API_KEY` value visible in any frontend source file or network request
- [ ] All 10 automated tests pass (see `validation.md`)
- [ ] Manual QA runbook passes on desktop and 375px mobile viewport
