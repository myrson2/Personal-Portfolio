import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.cache import clear_cache

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_cache():
    clear_cache()
    yield
    clear_cache()


def test_overview_fallback_mode():
    # In default test env with no GITHUB_TOKEN, should return mock fallback
    response = client.get("/api/github/overview?username=myrson2")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "myrson2"
    assert data["total_repos"] >= 40
    assert data["total_commits"] >= 5000
    assert data["is_mock"] is True
    assert "cached_at" in data


def test_overview_caching_behavior():
    res1 = client.get("/api/github/overview?username=myrson2")
    assert res1.status_code == 200
    cached_at_1 = res1.json()["cached_at"]

    res2 = client.get("/api/github/overview?username=myrson2")
    assert res2.status_code == 200
    cached_at_2 = res2.json()["cached_at"]

    assert cached_at_1 == cached_at_2

