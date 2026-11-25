import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.cache import clear_cache
from app.core.config import settings
from app.main import app
from app.services import project_service

client = TestClient(app)


def repo(name, stars=0, pushed="2026-01-01T00:00:00Z", owner="myrson2", **extra):
    return {
        "name": name,
        "owner": {"login": owner},
        "private": False,
        "fork": False,
        "archived": False,
        "stargazers_count": stars,
        "pushed_at": pushed,
        "language": "Python",
        "description": f"{name} desc",
        "html_url": f"https://github.com/{owner}/{name}",
        "size": 999,  # extra GitHub fields must not leak into the response
        **extra,
    }


@pytest.fixture(autouse=True)
def isolated(monkeypatch, tmp_path):
    clear_cache()
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "")
    monkeypatch.setattr(settings, "GITHUB_USERNAME", "myrson2")
    monkeypatch.setattr(settings, "PROJECTS_SNAPSHOT_PATH", str(tmp_path / "snap.json"))
    yield
    clear_cache()


def mock_github(monkeypatch, handler):
    transport = httpx.MockTransport(handler)
    real = httpx.AsyncClient

    monkeypatch.setattr(settings, "GITHUB_TOKEN", "test-token")
    monkeypatch.setattr(
        project_service.httpx, "AsyncClient", lambda **kw: real(transport=transport, **kw)
    )


def test_no_token_without_snapshot_returns_empty_fixture():
    res = client.get("/api/projects")
    assert res.status_code == 200
    assert res.json()["projects"] == []
    assert res.json()["is_mock"] is True
    assert res.json()["source"] == "fixture"


def test_live_fetch_filters_sorts_limits_and_writes_snapshot(monkeypatch, tmp_path):
    repos = [
        repo("a", stars=1),
        repo("b", stars=5),
        repo("c", stars=5, pushed="2026-06-01T00:00:00Z"),  # tie with b, newer push wins
        repo("d", stars=3, language=None),
        repo("e", stars=2),
        repo("f", stars=0),
        repo("forked", stars=99, fork=True),
        repo("secret", stars=99, private=True),
        repo("old", stars=99, archived=True),
        repo("theirs", stars=99, owner="someone-else"),
    ]
    seen = {}

    def handler(request):
        seen["path"] = request.url.path
        seen["params"] = dict(request.url.params)
        seen["auth"] = request.headers.get("authorization")
        return httpx.Response(200, json=repos)

    mock_github(monkeypatch, handler)
    res = client.get("/api/projects")
    body = res.json()

    assert seen["path"] == "/user/repos"
    assert seen["params"]["affiliation"] == "owner"
    assert seen["params"]["visibility"] == "all"
    assert seen["auth"] == "Bearer test-token"
    assert body["is_mock"] is False and body["source"] == "live"
    assert [p["name"] for p in body["projects"]] == ["c", "b", "d", "e", "a"]
    assert set(body["projects"][0]) == {"name", "language", "description", "html_url"}
    assert body["projects"][2]["language"] is None  # null passes through, never guessed
    snap = json.loads((tmp_path / "snap.json").read_text())
    assert [p["name"] for p in snap] == ["c", "b", "d", "e", "a"]


def test_live_fetch_follows_pagination(monkeypatch):
    # Page 1 is full (100 repos) so the service must request page 2.
    page1 = [repo(f"p1-{i}", stars=0) for i in range(100)]
    page2 = [repo("top", stars=50)]
    pages = []

    def handler(request):
        page = int(request.url.params["page"])
        pages.append(page)
        return httpx.Response(200, json=page1 if page == 1 else page2)

    mock_github(monkeypatch, handler)
    body = client.get("/api/projects").json()
    assert pages == [1, 2]
    assert body["source"] == "live"
    assert body["projects"][0]["name"] == "top"
    assert len(body["projects"]) == 5


def test_failure_on_second_page_serves_fallback(monkeypatch):
    def handler(request):
        if request.url.params["page"] == "1":
            return httpx.Response(200, json=[repo(f"r{i}") for i in range(100)])
        return httpx.Response(429, json={"message": "rate limited"})

    mock_github(monkeypatch, handler)
    body = client.get("/api/projects").json()
    assert body["source"] == "fixture" and body["is_mock"] is True


@pytest.mark.parametrize("status", [401, 403, 429, 500])
def test_upstream_error_serves_snapshot(monkeypatch, tmp_path, status):
    (tmp_path / "snap.json").write_text(json.dumps([
        {"name": "eMSME", "language": "Python", "description": None,
         "html_url": "https://github.com/myrson2/eMSME"}
    ]))
    mock_github(monkeypatch, lambda request: httpx.Response(status, json={"message": "nope"}))
    body = client.get("/api/projects").json()
    assert body["source"] == "snapshot" and body["is_mock"] is True
    assert body["projects"][0]["name"] == "eMSME"


def test_timeout_without_snapshot_serves_fixture(monkeypatch):
    def handler(request):
        raise httpx.ConnectTimeout("timed out", request=request)

    mock_github(monkeypatch, handler)
    body = client.get("/api/projects").json()
    assert body["source"] == "fixture" and body["projects"] == []


def test_corrupt_snapshot_falls_back_to_fixture(tmp_path):
    (tmp_path / "snap.json").write_text("{not json")
    body = client.get("/api/projects").json()
    assert body["source"] == "fixture"


def test_detail_endpoint_removed():
    assert client.get("/api/projects/eMSME").status_code == 404
