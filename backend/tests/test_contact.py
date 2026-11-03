from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.rate_limiter import IPRateLimiter

client = TestClient(app)

VALID_PAYLOAD = {
    "name": "Test User",
    "email": "test@example.com",
    "preferred_date": "2026-11-10",
    "notes": "Hello from the test suite"
}


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    IPRateLimiter.reset()
    yield
    IPRateLimiter.reset()


# TC-01: Valid payload, Resend mocked to succeed
def test_contact_send_success():
    with patch("resend.Emails.send") as mock_send, \
         patch.object(settings, "RESEND_API_KEY", "re_mock_key"), \
         patch.object(settings, "RESEND_TO_EMAIL", "me@test.com"):
        mock_send.return_value = {"id": "msg_12345"}
        res = client.post("/api/contact/send", json=VALID_PAYLOAD)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "sent"
        assert "successfully" in data["message"].lower()
        mock_send.assert_called_once()


# TC-02: Valid payload, RESEND_API_KEY not set (Mock mode)
def test_contact_send_mock_mode():
    with patch.object(settings, "RESEND_API_KEY", ""):
        res = client.post("/api/contact/send", json=VALID_PAYLOAD)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "mock"
        assert "skipped" in data["message"].lower()


# TC-03: Invalid email format
def test_contact_send_invalid_email():
    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    res = client.post("/api/contact/send", json=payload)
    assert res.status_code == 422


# TC-04: Missing required name field
def test_contact_send_missing_name():
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "name"}
    res = client.post("/api/contact/send", json=payload)
    assert res.status_code == 422


# TC-05: Notes field exceeds 2000 chars
def test_contact_send_notes_too_long():
    payload = {**VALID_PAYLOAD, "notes": "x" * 2001}
    res = client.post("/api/contact/send", json=payload)
    assert res.status_code == 422


# TC-06: 4th submission from same IP within 15 min triggers rate limit
def test_contact_send_rate_limit():
    with patch.object(settings, "RESEND_API_KEY", ""):
        for _ in range(3):
            r = client.post("/api/contact/send", json=VALID_PAYLOAD)
            assert r.status_code == 200
        # 4th request from same IP
        r4 = client.post("/api/contact/send", json=VALID_PAYLOAD)
        assert r4.status_code == 429
        assert "too many requests" in r4.json()["detail"].lower()


# TC-07: Resend SDK raises Exception -> 503 Service Unavailable
def test_contact_send_resend_failure():
    with patch("resend.Emails.send", side_effect=Exception("Resend API unreachable")), \
         patch.object(settings, "RESEND_API_KEY", "re_mock_key"), \
         patch.object(settings, "RESEND_TO_EMAIL", "me@test.com"):
        res = client.post("/api/contact/send", json=VALID_PAYLOAD)
        assert res.status_code == 503
        data = res.json()
        assert "delivery failed" in data["detail"].lower()


# TC-08: RESEND_API_KEY never leaks into response body
def test_api_key_not_in_response():
    secret_key = "re_SECRET_KEY_NEVER_LEAK"
    with patch("resend.Emails.send", return_value={"id": "msg_999"}), \
         patch.object(settings, "RESEND_API_KEY", secret_key), \
         patch.object(settings, "RESEND_TO_EMAIL", "me@test.com"):
        res = client.post("/api/contact/send", json=VALID_PAYLOAD)
        assert res.status_code == 200
        assert secret_key not in res.text


# Legacy Placeholder endpoint tests
def test_contact_placeholder_valid_submission():
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "preferred_date": "2026-11-20",
        "notes": "Exploring engineering collaboration",
        "type": "meeting"
    }
    response = client.post("/api/contact/placeholder", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "Jane Doe" in data["message"]
    assert "received_at" in data
