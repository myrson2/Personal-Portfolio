import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.cache import clear_cache
from app.core.config import settings

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_cache(monkeypatch):
    # Force deterministic fixture mode even when a local .env has a real token.
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "")
    clear_cache()
    yield
    clear_cache()


def test_calendar_fallback_mode():
    response = client.get("/api/github/calendar?username=myrson2")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "myrson2"
    assert data["total_contributions"] > 0
    assert "weeks" in data
    assert len(data["weeks"]) > 0
    assert data["is_mock"] is True
    # Verify first day structure
    first_day = data["weeks"][0]["days"][0]
    assert "date" in first_day
    assert "count" in first_day
    assert "level" in first_day

