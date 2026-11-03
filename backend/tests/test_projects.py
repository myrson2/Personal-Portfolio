from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_projects_returns_200_and_summaries():
    res = client.get("/api/projects")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    slugs = [p["slug"] for p in data]
    assert "colorgame" in slugs
    assert "equiptrack" in slugs
    for p in data:
        assert "title" in p
        assert "tagline" in p
        assert "tags" in p
        assert "github_url" in p


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


def test_get_equiptrack_project_detail():
    res = client.get("/api/projects/equiptrack")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "equiptrack"
    assert data["title"] == "EquipTrack"
    assert "Python 3.10+" in data["tags"]
    assert len(data["metrics"]) > 0
    assert any(m["label"] == "Platform Completion" for m in data["metrics"])


def test_get_project_unknown_slug_returns_404():
    res = client.get("/api/projects/non-existent-project")
    assert res.status_code == 404
    data = res.json()
    assert "not found" in data["detail"].lower()
