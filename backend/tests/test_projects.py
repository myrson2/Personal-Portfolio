import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def no_live_github(monkeypatch):
    # Keep project fixture tests offline even when a local .env has a token.
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "")


def test_list_projects_returns_200_and_summaries():
    res = client.get("/api/projects")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    slugs = [p["slug"] for p in data]
    assert len(data) == 2
    assert set(slugs) == {"eMSME", "colorgame"}
    assert slugs[0] == "eMSME"  # curated showcase order
    for p in data:
        assert "title" in p
        assert "tagline" in p
        assert "tags" in p
        assert "github_url" in p
        assert "stars" in p
        assert "forks" in p


def test_get_colorgame_project_detail():
    res = client.get("/api/projects/colorgame")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "colorgame"
    assert data["title"] == "ColorGame"
    assert "architecture_overview" in data
    assert "React 19" in data["tags"]
    assert len(data["components"]) > 0
    assert len(data["challenges"]) > 0
    assert len(data["tech_rationale"]) > 0
    assert len(data["metrics"]) > 0
    assert any(m["label"] == "Max Multiplier" for m in data["metrics"])
    assert len(data["simulated_steps"]) > 0


def test_get_eMSME_project_detail():
    res = client.get("/api/projects/eMSME")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "eMSME"
    assert data["title"] == "eMSME"
    assert "Python" in data["tags"]
    assert len(data["components"]) > 0
    assert len(data["challenges"]) > 0
    assert len(data["metrics"]) > 0
    assert any(m["label"] == "AI Accuracy" for m in data["metrics"])
    assert len(data["simulated_steps"]) > 0


def test_get_project_unknown_slug_returns_404():
    res = client.get("/api/projects/non-existent-project")
    assert res.status_code == 404
    data = res.json()
    assert "not found" in data["detail"].lower()
