# Validation: Live Contact Gateway
- **Feature ID**: `FEAT-M2-LIVE-CONTACT-GATEWAY`
- **Milestone**: Milestone 2
- **Status**: Approved — Pending Implementation

---

## 1. Automated Test Matrix

| Test ID | Type | File | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| TC-01 | Integration | `test_contact.py` | Valid payload, Resend mocked to succeed | HTTP 200, `{"status": "sent"}` |
| TC-02 | Integration | `test_contact.py` | Valid payload, `RESEND_API_KEY` not set | HTTP 200, `{"status": "mock"}` |
| TC-03 | Unit | `test_contact.py` | Invalid email format (`"notanemail"`) | HTTP 422 |
| TC-04 | Unit | `test_contact.py` | Missing required `name` field | HTTP 422 |
| TC-05 | Unit | `test_contact.py` | `notes` field exceeds 2000 characters | HTTP 422 |
| TC-06 | Integration | `test_contact.py` | 4th submission from same IP within 15 min | HTTP 429 |
| TC-07 | Integration | `test_contact.py` | Resend SDK raises `Exception` (mocked) | HTTP 503, `{"status": "error"}` |
| TC-08 | Security | `test_contact.py` | Response body never contains `RESEND_API_KEY` value | Key not in response JSON |
| TC-09 | Security | `test_cors.py` | `POST /api/contact/send` from disallowed origin | CORS rejection (no `Access-Control-Allow-Origin`) |
| TC-10 | Build | CI / `npm run build` | Frontend bundle does not contain any Resend API key string | `grep RESEND_API_KEY dist/` returns empty |

### Test Implementation Sketches

```python
# backend/tests/test_contact.py

from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
VALID_PAYLOAD = {
    "name": "Test User",
    "email": "test@example.com",
    "preferred_date": "2026-11-10",
    "notes": "Hello from the test suite"
}

# TC-01: Valid payload, Resend succeeds
def test_contact_send_success():
    with patch("app.services.email_service.resend") as mock_resend:
        mock_resend.Emails.send.return_value = {"id": "abc123"}
        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test", "RESEND_TO_EMAIL": "me@test.com"}):
            res = client.post("/api/contact/send", json=VALID_PAYLOAD)
    assert res.status_code == 200
    assert res.json()["status"] == "sent"

# TC-02: No API key — mock mode
def test_contact_send_mock_mode():
    with patch.dict("os.environ", {"RESEND_API_KEY": "", "RESEND_TO_EMAIL": ""}):
        res = client.post("/api/contact/send", json=VALID_PAYLOAD)
    assert res.status_code == 200
    assert res.json()["status"] == "mock"

# TC-03: Invalid email
def test_contact_send_invalid_email():
    payload = {**VALID_PAYLOAD, "email": "notanemail"}
    res = client.post("/api/contact/send", json=payload)
    assert res.status_code == 422

# TC-04: Missing name
def test_contact_send_missing_name():
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "name"}
    res = client.post("/api/contact/send", json=payload)
    assert res.status_code == 422

# TC-05: Notes too long
def test_contact_send_notes_too_long():
    payload = {**VALID_PAYLOAD, "notes": "x" * 2001}
    res = client.post("/api/contact/send", json=payload)
    assert res.status_code == 422

# TC-06: Rate limiting (4th request from same IP)
def test_contact_send_rate_limit():
    with patch("app.services.email_service.resend") as mock_resend:
        mock_resend.Emails.send.return_value = {"id": "abc"}
        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test", "RESEND_TO_EMAIL": "me@test.com"}):
            for _ in range(3):
                client.post("/api/contact/send", json=VALID_PAYLOAD)
            res = client.post("/api/contact/send", json=VALID_PAYLOAD)
    assert res.status_code == 429

# TC-07: Resend SDK raises exception → 503
def test_contact_send_resend_failure():
    with patch("app.services.email_service.resend") as mock_resend:
        mock_resend.Emails.send.side_effect = Exception("Resend API down")
        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test", "RESEND_TO_EMAIL": "me@test.com"}):
            res = client.post("/api/contact/send", json=VALID_PAYLOAD)
    assert res.status_code == 503

# TC-08: API key never leaks into response body
def test_api_key_not_in_response():
    with patch.dict("os.environ", {"RESEND_API_KEY": "re_SECRET_KEY_NEVER_LEAK", "RESEND_TO_EMAIL": "me@test.com"}):
        res = client.post("/api/contact/send", json=VALID_PAYLOAD)
    assert "re_SECRET_KEY_NEVER_LEAK" not in res.text
```

---

## 2. Constitution Compliance Matrix

Cross-referenced against `specs/constitution.md` architectural invariants:

| Constitutional Invariant | Compliant? | Evidence / Implementation |
|---|---|---|
| **Zero Client Secret Leakage** | ✅ | `RESEND_API_KEY` stored in `backend/.env` only; never referenced in any frontend file. All contact submissions route through `POST /api/contact/send` backend proxy. |
| **Upstream Resilience & Mock Fallbacks** | ✅ | FR-10: if `RESEND_API_KEY` unset → HTTP 200 + `{"status": "mock"}` (no crash). FR-7: Resend failure → HTTP 503 structured JSON (no unhandled exception). Frontend catch block handles network errors. |
| **Frontend Never Crashes** | ✅ | `sendContact()` in `api.js` wraps all fetch calls in `try/catch`; always returns a status object. Modal renders `success`, `error`, or `rateLimit` UI state accordingly. |
| **No Blocking Calls on Event Loop** | ✅ | `EmailService.send()` is `async`; Resend SDK call is awaited. `IPRateLimiter.check()` is pure in-memory dict access (no I/O). |
| **70/30/20 Design Rule** | ✅ | Success/error modal states reuse existing retro CSS tokens from `retro-pixel.css`. No new color variables introduced. |
| **WCAG 2.1 AA Color Contrast** | ✅ | Success state uses existing pastel blue accent (`#7bb2ff` bg with dark text); error uses standard dark text on white. Both pass AA contrast ratio ≥ 4.5:1. |
| **Mobile UX (375px+)** | ✅ | Success/error states reuse existing modal responsive layout; form inputs retain `font-size: 16px` to prevent iOS automatic zoom. CTA button height ≥ 44px for touch targets. |
| **No PostgreSQL / ORM (M1/M2 Scope)** | ✅ | Rate limiter uses `TTLCache` (in-memory, same library as M1 GitHub cache). No database tables introduced. |
| **No JWT / Multi-user Auth** | ✅ | Contact endpoint is fully public. No `get_current_user` or session dependencies. |
| **Scope Discipline (M2)** | ✅ | No Calendly integration, no multi-user auth, no 3D canvas, no database ORM. Delivery mechanism only. |

---

## 3. Manual QA Runbook

### Prerequisites
```powershell
# Backend
cd backend
uv run uvicorn app.main:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
npm run dev
```
Ensure `RESEND_API_KEY` and `RESEND_TO_EMAIL` are set in `backend/.env`.

---

### Test Case QA-1: Happy Path (Real Email Delivery)
1. Open `http://localhost:5173`
2. Click **"Schedule meeting"** in the header → modal opens
3. Fill in:
   - Name: `QA Tester`
   - Email: `your-test-email@example.com`
   - Preferred Date: `2026-11-10`
   - Notes: `QA test submission — please ignore`
4. Click **"Confirm Request"**
5. **VERIFY**: Modal transitions to success state: *"Message sent! I'll get back to you within 24 hours."*
6. **VERIFY**: Email arrives in the `RESEND_TO_EMAIL` inbox with all fields visible

---

### Test Case QA-2: Frontend Validation
1. Open the modal
2. Leave **Name** blank, enter a valid email, click **"Confirm Request"**
3. **VERIFY**: Name field shows validation error; no network request fired
4. Enter Name but set email to `"invalid-email"`, click **"Confirm Request"**
5. **VERIFY**: Email field shows validation error

---

### Test Case QA-3: Rate Limiting
1. Submit 3 valid forms in rapid succession (< 15 min)
2. Attempt a 4th submission
3. **VERIFY**: Modal shows: *"Too many requests. Please wait a few minutes before trying again."*

---

### Test Case QA-4: Mock Mode (No API Key)
1. Temporarily remove or clear `RESEND_API_KEY` from `backend/.env`
2. Restart the backend
3. Submit a valid contact form
4. **VERIFY**: HTTP 200 is returned with `{"status": "mock"}`
5. **VERIFY**: Frontend shows the success state (developer transparency, no UX disruption)
6. **VERIFY**: Backend logs contain warning: `RESEND_API_KEY not set — skipping email delivery`

---

### Test Case QA-5: Delivery Failure Resilience
1. Set `RESEND_API_KEY` to an intentionally invalid value (e.g. `re_INVALID`)
2. Restart the backend
3. Submit a valid contact form
4. **VERIFY**: HTTP 503 is returned
5. **VERIFY**: Frontend shows error state: *"Failed to send. Please try again or email me directly at [email]."*
6. **VERIFY**: Frontend does NOT crash or render a blank screen

---

### Test Case QA-6: Mobile Viewport (375px)
1. Open Chrome DevTools → Responsive mode → Set to **375px width**
2. Open the Schedule Meeting modal
3. **VERIFY**: Modal renders without horizontal overflow
4. **VERIFY**: All form inputs are full-width and have `font-size: 16px` (check in DevTools)
5. **VERIFY**: "Confirm Request" button is at least 44px tall
6. Complete a submission and **VERIFY**: Success/error states display correctly at 375px

---

### Test Case QA-7: Security — No API Key in Frontend
1. Run `cd frontend && npm run build`
2. Run: `Select-String -Path "dist/assets/*.js" -Pattern "RESEND_API_KEY|re_[a-zA-Z0-9]+" -SimpleMatch`
3. **VERIFY**: No matches found — Resend API key is not present in the compiled frontend bundle

---

## 4. Automated Test Execution Commands

```powershell
# Backend test suite
cd backend
uv run pytest tests/test_contact.py -v

# Full backend suite
uv run pytest tests -v

# Frontend build verification
cd ..\frontend
npm run build
```

### Expected Backend Output
```
tests/test_contact.py::test_contact_send_success          PASSED
tests/test_contact.py::test_contact_send_mock_mode        PASSED
tests/test_contact.py::test_contact_send_invalid_email    PASSED
tests/test_contact.py::test_contact_send_missing_name     PASSED
tests/test_contact.py::test_contact_send_notes_too_long   PASSED
tests/test_contact.py::test_contact_send_rate_limit       PASSED
tests/test_contact.py::test_contact_send_resend_failure   PASSED
tests/test_contact.py::test_api_key_not_in_response       PASSED
```
