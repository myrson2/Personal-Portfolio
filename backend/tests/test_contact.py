from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


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


def test_contact_placeholder_invalid_email():
    payload = {
        "name": "Jane Doe",
        "email": "not-a-valid-email",
        "type": "meeting"
    }
    response = client.post("/api/contact/placeholder", json=payload)
    assert response.status_code == 422


def test_contact_placeholder_missing_name():
    payload = {
        "email": "jane@example.com",
        "type": "meeting"
    }
    response = client.post("/api/contact/placeholder", json=payload)
    assert response.status_code == 422

