import asyncio
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import parse_qs, urlparse

import httpx

from app.core.config import settings
from app.core.cache import get_cached, set_cached
from app.models.github import (
    GitHubOverviewResponse,
    GitHubCalendarResponse,
    CalendarWeek,
    CalendarDay,
)

logger = logging.getLogger(__name__)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"
GITHUB_API = "https://api.github.com"
COMMIT_FETCH_CONCURRENCY = 5
DEFAULT_TOTAL_REPOS = 49
_refresh_locks: dict[str, asyncio.Lock] = {}


def _load_fallback_overview(username: str) -> GitHubOverviewResponse:
    fixture_path = FIXTURES_DIR / "github_overview_fallback.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["username"] = username
    data["is_mock"] = True
    data["cached_at"] = datetime.now(timezone.utc).isoformat()
    return GitHubOverviewResponse(**data)


def _fallback_total_commits() -> int:
    """Read the last-known commit total from the deterministic fixture."""
    fixture_path = FIXTURES_DIR / "github_overview_fallback.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return int(data.get("total_commits", 0))


def _load_fallback_calendar(username: str) -> GitHubCalendarResponse:
    fixture_path = FIXTURES_DIR / "github_calendar_fallback.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["username"] = username
    data["is_mock"] = True
    data["cached_at"] = datetime.now(timezone.utc).isoformat()
    return GitHubCalendarResponse(**data)


def _headers() -> dict:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Personal-Portfolio-Proxy",
    }
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return headers


def parse_next_link(link_header: str | None) -> Optional[str]:
    """Parse GitHub Link header for rel=\"next\" URL. Returns None if none."""
    if not link_header:
        return None
    for part in link_header.split(","):
        part = part.strip()
        if 'rel="next"' in part:
            start = part.find("<")
            end = part.find(">")
            if start != -1 and end != -1 and end > start:
                return part[start + 1 : end]
    return None


def parse_last_page(link_header: str | None) -> Optional[int]:
    """Parse GitHub Link header for the rel=\"last\" page number."""
    if not link_header:
        return None
    for part in link_header.split(","):
        part = part.strip()
        if 'rel="last"' in part:
            start = part.find("<")
            end = part.find(">")
            if start != -1 and end != -1 and end > start:
                query = parse_qs(urlparse(part[start + 1 : end]).query)
                try:
                    return int(query["page"][0])
                except (KeyError, IndexError, TypeError, ValueError):
                    return None
    return None


async def _fetch_user(client: httpx.AsyncClient, username: str, headers: dict) -> Optional[dict]:
    res = await client.get(f"{GITHUB_API}/users/{username}", headers=headers)
    if res.status_code != 200:
        logger.warning("GitHub user fetch %s -> %s", username, res.status_code)
        return None
    return res.json()


async def _fetch_repos(
    client: httpx.AsyncClient, username: str, headers: dict
) -> Optional[list[dict]]:
    """Fetch all public repos for username (paginated, per_page=100). None on failure."""
    repos: list[dict] = []
    page = 1
    while True:
        res = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            params={"per_page": 100, "page": page, "type": "owner"},
            headers=headers,
        )
        if res.status_code != 200:
            logger.warning("GitHub repos fetch %s page %s -> %s", username, page, res.status_code)
            return None
        data = res.json()
        if not data:
            break
        repos.extend(data)
        if len(data) < 100:
            break
        page += 1
        if page > 10:  # safety cap: 1000 repos max for M1
            break
    return repos


async def _fetch_owned_repo_count(
    client: httpx.AsyncClient, headers: dict
) -> Optional[int]:
    """Count all repositories owned by the authenticated user.

    ``GET /users/{username}/repos`` only exposes public repositories. The
    portfolio should mirror the owner's GitHub repository total, including
    private repositories, so this uses ``GET /user/repos`` with
    ``visibility=all``. The authenticated token must have access to those
    repositories. ``per_page=1`` keeps the payload tiny; GitHub's Link header
    exposes the last page, which equals the total repo count.
    """
    res = await client.get(
        f"{GITHUB_API}/user/repos",
        params={
            "per_page": 1,
            "page": 1,
            "affiliation": "owner",
            "visibility": "all",
        },
        headers=headers,
    )
    if res.status_code != 200:
        logger.warning("Owned repo count fetch -> %s", res.status_code)
        return None
    data = res.json()
    if not isinstance(data, list):
        logger.warning("Owned repo count returned a non-list payload")
        return None
    last_page = parse_last_page(res.headers.get("link"))
    if last_page is not None:
        return last_page
    return len(data)


async def _count_repo_commits(
    client: httpx.AsyncClient, owner: str, repo: str, headers: dict
) -> Optional[int]:
    """Count all commits for one repo (paginated). None on upstream failure."""
    total = 0
    page = 1
    while True:
        res = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/commits",
            params={"per_page": 100, "page": page},
            headers=headers,
        )
        if res.status_code == 409:  # empty repository
            return 0
        if res.status_code != 200:
            logger.debug("Commits fetch %s/%s page %s -> %s", owner, repo, page, res.status_code)
            return None
        data = res.json()
        if not data:
            break
        total += len(data)
        if len(data) < 100:
            break
        page += 1
        if page > 50:  # safety: max 5000 commits/repo for M1
            break
    return total


async def compute_total_commits(client: httpx.AsyncClient, username: str, headers: dict) -> Optional[int]:
    """Sum commits across all non-fork public repos. None if any upstream call fails."""
    repos = await _fetch_repos(client, username, headers)
    if repos is None:
        return None
    if not repos:
        # User exists but has no public repos -> 0 commits; probe the user
        # endpoint to distinguish that from a failed repo-list call.
        user = await _fetch_user(client, username, headers)
        if user is None:
            return None
        return 0

    tracked = [repo["name"] for repo in repos if not repo.get("fork") and repo.get("name")]
    if not tracked:
        return 0

    # Fetch commit pages concurrently (bounded) instead of serially across repos.
    semaphore = asyncio.Semaphore(COMMIT_FETCH_CONCURRENCY)

    async def count(repo_name: str) -> Optional[int]:
        async with semaphore:
            return await _count_repo_commits(client, username, repo_name, headers)

    counts = await asyncio.gather(*(count(name) for name in tracked))
    if any(count is None for count in counts):
        return None
    return sum(counts)


async def fetch_repo_meta(client: httpx.AsyncClient, owner: str, repo: str, headers: dict) -> dict:
    """Return {'stars','forks','language','pushed_at'} for one repo (defaults on failure)."""
    defaults = {"stars": 0, "forks": 0, "language": None, "pushed_at": None}
    res = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=headers)
    if res.status_code != 200:
        return defaults
    data = res.json()
    return {
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "language": data.get("language"),
        "pushed_at": data.get("pushed_at"),
    }


async def refresh_commits_background(username: str) -> None:
    """BackgroundTasks entry: recompute commits_total and patch overview cache."""
    if not settings.GITHUB_TOKEN:
        return
    lock = _refresh_locks.setdefault(username, asyncio.Lock())
    if lock.locked():
        # Another request already triggered the same expensive scan.
        return
    async with lock:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                total = await compute_total_commits(client, username, _headers())
            if total is None:
                return
            set_cached(f"commits_total_{username}", total)
            overview_key = f"overview_{username}"
            cached = get_cached(overview_key)
            if cached is not None and hasattr(cached, "total_commits"):
                # Rebuild with fresh commits, preserve other fields
                updated = cached.model_copy(update={"total_commits": total})
                set_cached(overview_key, updated)
        except Exception:
            logger.exception("Background commits refresh failed for %s", username)


class GitHubService:
    @staticmethod
    async def get_overview(username: str, background_tasks=None) -> GitHubOverviewResponse:
        cache_key = f"overview_{username}"
        cached = get_cached(cache_key)
        if cached:
            # Schedule background refresh if commits_total not cached yet
            if background_tasks is not None and get_cached(f"commits_total_{username}") is None and settings.GITHUB_TOKEN:
                background_tasks.add_task(refresh_commits_background, username)
            return cached

        # If no token is configured, immediately return deterministic fallback
        if not settings.GITHUB_TOKEN:
            fallback = _load_fallback_overview(username)
            set_cached(cache_key, fallback)
            return fallback

        headers = _headers()

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                user = await _fetch_user(client, username, headers)
                if user is None:
                    fallback = _load_fallback_overview(username)
                    set_cached(cache_key, fallback)
                    return fallback

                # Count owned repos through the authenticated endpoint so private
                # repositories are included when the token has metadata access.
                # Only do this for the configured portfolio owner: /user/repos
                # describes the token owner, not an arbitrary ?username= value.
                owned_repo_count = None
                if username.lower() == settings.GITHUB_USERNAME.lower():
                    try:
                        owned_repo_count = await _fetch_owned_repo_count(client, headers)
                    except Exception:
                        logger.exception("Owned repo count failed for %s", username)
                total_repos = (
                    owned_repo_count
                    if owned_repo_count is not None
                    else user.get("public_repos", DEFAULT_TOTAL_REPOS)
                )

                # Commit sum with separate cache key. On a miss, serve the last-known
                # fixture value immediately and let BackgroundTasks recompute it.
                commits_key = f"commits_total_{username}"
                cached_commits = get_cached(commits_key)
                if cached_commits is not None:
                    total_commits = cached_commits
                elif background_tasks is not None:
                    total_commits = _fallback_total_commits()
                    background_tasks.add_task(refresh_commits_background, username)
                else:
                    # Direct service call without a background executor: compute inline.
                    total_commits = _fallback_total_commits()
                    try:
                        live_total = await compute_total_commits(client, username, headers)
                        if live_total is not None:
                            total_commits = live_total
                            set_cached(commits_key, live_total)
                    except Exception:
                        logger.exception("Commit sum failed for %s, serving fixture total", username)

                response = GitHubOverviewResponse(
                    username=user.get("login", username),
                    name=user.get("name", "Jose Myrson O. Beros"),
                    bio=user.get("bio", "Full-stack engineer building AI systems and scalable web applications."),
                    avatar_url=user.get("avatar_url"),
                    html_url=user.get("html_url"),
                    total_repos=total_repos,
                    total_commits=total_commits,
                    followers=user.get("followers", 18),
                    following=user.get("following", 24),
                    status="Online",
                    is_mock=False,
                    cached_at=datetime.now(timezone.utc).isoformat(),
                )
                set_cached(cache_key, response)
                return response
        except Exception:
            logger.exception("Overview fetch failed for %s", username)
            fallback = _load_fallback_overview(username)
            set_cached(cache_key, fallback)
            return fallback

    @staticmethod
    async def get_calendar(username: str) -> GitHubCalendarResponse:
        cache_key = f"calendar_{username}"
        cached = get_cached(cache_key)
        if cached:
            return cached

        # If no token is configured, use fallback fixture
        if not settings.GITHUB_TOKEN:
            fallback = _load_fallback_calendar(username)
            set_cached(cache_key, fallback)
            return fallback

        graphql_query = """
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
            }
          }
        }
        """

        headers = _headers()

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.post(
                    "https://api.github.com/graphql",
                    json={"query": graphql_query, "variables": {"login": username}},
                    headers=headers,
                )
                if res.status_code == 200:
                    body = res.json()
                    cal_data = (
                        body.get("data", {})
                        .get("user", {})
                        .get("contributionsCollection", {})
                        .get("contributionCalendar", {})
                    )
                    if cal_data:
                        raw_weeks = cal_data.get("weeks", [])
                        level_map = {
                            "NONE": 0,
                            "FIRST_QUARTILE": 1,
                            "SECOND_QUARTILE": 2,
                            "THIRD_QUARTILE": 3,
                            "FOURTH_QUARTILE": 4,
                        }
                        weeks = []
                        for rw in raw_weeks:
                            days = []
                            for rd in rw.get("contributionDays", []):
                                days.append(CalendarDay(
                                    date=rd.get("date", ""),
                                    count=rd.get("contributionCount", 0),
                                    level=level_map.get(rd.get("contributionLevel", "NONE"), 0),
                                ))
                            weeks.append(CalendarWeek(days=days))

                        calendar_res = GitHubCalendarResponse(
                            username=username,
                            total_contributions=cal_data.get("totalContributions", 0),
                            weeks=weeks,
                            is_mock=False,
                            cached_at=datetime.now(timezone.utc).isoformat(),
                        )
                        set_cached(cache_key, calendar_res)
                        return calendar_res

            fallback = _load_fallback_calendar(username)
            set_cached(cache_key, fallback)
            return fallback
        except Exception:
            logger.exception("Calendar fetch failed for %s", username)
            fallback = _load_fallback_calendar(username)
            set_cached(cache_key, fallback)
            return fallback
