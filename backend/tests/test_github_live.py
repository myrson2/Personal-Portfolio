import pytest

from app.core.cache import clear_cache, get_cached, set_cached
from app.core.config import settings
from app.models.github import GitHubOverviewResponse
from app.services import github_service
from app.services.github_service import (
    GitHubService,
    compute_total_commits,
    parse_last_page,
    parse_next_link,
)


class FakeResponse:
    def __init__(self, status_code: int, payload, headers=None):
        self.status_code = status_code
        self._payload = payload
        self.headers = headers or {}

    def json(self):
        return self._payload


class FakeGitHubClient:
    """Minimal httpx.AsyncClient stand-in for deterministic pagination tests."""

    def __init__(self, repos_by_page, commits_by_repo):
        self.repos_by_page = repos_by_page
        self.commits_by_repo = commits_by_repo
        self.requested = []

    async def get(self, url, params=None, headers=None):
        params = params or {}
        page = params.get("page", 1)
        self.requested.append((url, page))
        if url.endswith("/repos"):
            return FakeResponse(200, self.repos_by_page.get(page, []))
        for repo_name, pages in self.commits_by_repo.items():
            if url.endswith(f"/repos/myrson2/{repo_name}/commits"):
                return FakeResponse(200, pages.get(page, []))
        return FakeResponse(404, {})


class FakeRepoCountClient:
    """Stand-in for the authenticated GET /user/repos call."""

    def __init__(self, payload, link=None, status_code=200):
        self.payload = payload
        self.link = link
        self.status_code = status_code
        self.requested = []

    async def get(self, url, params=None, headers=None):
        self.requested.append((url, params))
        response_headers = {"link": self.link} if self.link else {}
        return FakeResponse(self.status_code, self.payload, response_headers)


class RecordingBackgroundTasks:
    def __init__(self):
        self.tasks = []

    def add_task(self, func, *args, **kwargs):
        self.tasks.append((func, args, kwargs))


@pytest.fixture(autouse=True)
def clean_cache():
    clear_cache()
    yield
    clear_cache()


def test_parse_next_link_extracts_next_url():
    header = (
        '<https://api.github.com/repos/a/b/commits?page=2>; rel="next", '
        '<https://api.github.com/repos/a/b/commits?page=9>; rel="last"'
    )
    assert parse_next_link(header) == "https://api.github.com/repos/a/b/commits?page=2"
    assert parse_next_link('<https://api.github.com/repos/a/b/commits?page=1>; rel="prev"') is None
    assert parse_next_link(None) is None


def test_parse_last_page_extracts_total_count():
    header = (
        '<https://api.github.com/user/repos?per_page=1&page=2>; rel="next", '
        '<https://api.github.com/user/repos?per_page=1&page=49>; rel="last"'
    )
    assert parse_last_page(header) == 49
    assert parse_last_page('<https://api.github.com/user/repos?page=1>; rel="prev"') is None
    assert parse_last_page(None) is None


@pytest.mark.asyncio
async def test_owned_repo_count_includes_private_via_link_header():
    client = FakeRepoCountClient(
        [{"name": "private-repo", "private": True}],
        link='<https://api.github.com/user/repos?per_page=1&page=49>; rel="last"',
    )

    count = await github_service._fetch_owned_repo_count(client, {})

    assert count == 49
    assert client.requested[0][0].endswith("/user/repos")
    assert client.requested[0][1]["visibility"] == "all"
    assert client.requested[0][1]["affiliation"] == "owner"


@pytest.mark.asyncio
async def test_owned_repo_count_single_page_without_link_header():
    client = FakeRepoCountClient([{"name": "only-repo"}])

    assert await github_service._fetch_owned_repo_count(client, {}) == 1


@pytest.mark.asyncio
async def test_owned_repo_count_returns_none_on_upstream_failure():
    client = FakeRepoCountClient({"message": "Bad credentials"}, status_code=401)

    assert await github_service._fetch_owned_repo_count(client, {}) is None


@pytest.mark.asyncio
async def test_commit_sum_paginates_and_skips_forks():
    client = FakeGitHubClient(
        repos_by_page={
            1: [
                {"name": "eMSME", "fork": False},
                {"name": "forked-repo", "fork": True},
                {"name": "ColorGame", "fork": False},
            ],
        },
        commits_by_repo={
            "eMSME": {1: [{}] * 100, 2: [{}] * 3},
            "ColorGame": {1: [{}] * 5},
            "forked-repo": {1: [{}] * 50},
        },
    )

    total = await compute_total_commits(client, "myrson2", {})

    assert total == 108
    assert not any("forked-repo" in url for url, _ in client.requested)


@pytest.mark.asyncio
async def test_commit_sum_returns_none_when_repo_fetch_fails():
    class RateLimitedClient:
        async def get(self, url, params=None, headers=None):
            return FakeResponse(429, {"message": "API rate limit exceeded"})

    assert await compute_total_commits(RateLimitedClient(), "myrson2", {}) is None


@pytest.mark.asyncio
async def test_overview_uses_cached_commit_total(monkeypatch):
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "test-token")
    monkeypatch.setattr(settings, "GITHUB_USERNAME", "myrson2")

    async def fake_user(client, username, headers):
        return {
            "login": username,
            "name": "Test User",
            "bio": None,
            "avatar_url": None,
            "html_url": None,
            "public_repos": 40,
            "followers": 3,
            "following": 2,
        }

    async def fake_owned_repo_count(client, headers):
        return 49

    async def fail_if_called(*args, **kwargs):
        raise AssertionError("commit sum must not run when the cache is warm")

    monkeypatch.setattr(github_service, "_fetch_user", fake_user)
    monkeypatch.setattr(github_service, "_fetch_owned_repo_count", fake_owned_repo_count)
    monkeypatch.setattr(github_service, "compute_total_commits", fail_if_called)
    set_cached("commits_total_myrson2", 1234)

    overview = await GitHubService.get_overview("myrson2")

    assert overview.total_repos == 49
    assert overview.total_commits == 1234
    assert overview.is_mock is False


@pytest.mark.asyncio
async def test_overview_falls_back_to_public_repos_when_owned_count_unavailable(monkeypatch):
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "test-token")
    monkeypatch.setattr(settings, "GITHUB_USERNAME", "myrson2")

    async def fake_user(client, username, headers):
        return {"login": username, "public_repos": 40}

    async def no_owned_repo_count(client, headers):
        return None

    monkeypatch.setattr(github_service, "_fetch_user", fake_user)
    monkeypatch.setattr(github_service, "_fetch_owned_repo_count", no_owned_repo_count)
    set_cached("commits_total_myrson2", 370)

    overview = await GitHubService.get_overview("myrson2")

    assert overview.total_repos == 40
    assert overview.is_mock is False


@pytest.mark.asyncio
async def test_overview_does_not_use_owned_count_for_other_users(monkeypatch):
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "test-token")
    monkeypatch.setattr(settings, "GITHUB_USERNAME", "myrson2")

    async def fake_user(client, username, headers):
        return {"login": username, "public_repos": 3}

    async def fail_if_called(client, headers):
        raise AssertionError("owned repo count is only valid for the configured owner")

    monkeypatch.setattr(github_service, "_fetch_user", fake_user)
    monkeypatch.setattr(github_service, "_fetch_owned_repo_count", fail_if_called)
    set_cached("commits_total_someoneelse", 12)

    overview = await GitHubService.get_overview("someoneelse")

    assert overview.total_repos == 3
    assert overview.is_mock is False


@pytest.mark.asyncio
async def test_overview_defers_commit_sum_to_background(monkeypatch):
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "test-token")
    monkeypatch.setattr(settings, "GITHUB_USERNAME", "myrson2")

    async def fake_user(client, username, headers):
        return {"login": username, "public_repos": 40}

    async def fake_owned_repo_count(client, headers):
        return 49

    async def fail_if_called(*args, **kwargs):
        raise AssertionError("the first response must not block on the commit sum")

    monkeypatch.setattr(github_service, "_fetch_user", fake_user)
    monkeypatch.setattr(github_service, "_fetch_owned_repo_count", fake_owned_repo_count)
    monkeypatch.setattr(github_service, "compute_total_commits", fail_if_called)

    background_tasks = RecordingBackgroundTasks()
    overview = await GitHubService.get_overview("myrson2", background_tasks=background_tasks)

    assert overview.total_repos == 49
    assert overview.total_commits == github_service._fallback_total_commits()
    assert overview.is_mock is False
    assert len(background_tasks.tasks) == 1
    assert background_tasks.tasks[0][0] is github_service.refresh_commits_background


@pytest.mark.asyncio
async def test_refresh_commits_background_updates_cache(monkeypatch):
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "test-token")

    async def fake_compute(client, username, headers):
        return 4321

    monkeypatch.setattr(github_service, "compute_total_commits", fake_compute)
    set_cached(
        "overview_myrson2",
        GitHubOverviewResponse(username="myrson2", total_commits=5240, is_mock=True),
    )

    await github_service.refresh_commits_background("myrson2")

    assert get_cached("commits_total_myrson2") == 4321
    assert get_cached("overview_myrson2").total_commits == 4321
