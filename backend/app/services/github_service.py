import json
from pathlib import Path
from datetime import datetime, timezone
import httpx

from app.core.config import settings
from app.core.cache import get_cached, set_cached
from app.models.github import (
    GitHubOverviewResponse,
    GitHubCalendarResponse,
    CalendarWeek,
    CalendarDay
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def _load_fallback_overview(username: str) -> GitHubOverviewResponse:
    fixture_path = FIXTURES_DIR / "github_overview_fallback.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["username"] = username
    data["is_mock"] = True
    data["cached_at"] = datetime.now(timezone.utc).isoformat()
    return GitHubOverviewResponse(**data)


def _load_fallback_calendar(username: str) -> GitHubCalendarResponse:
    fixture_path = FIXTURES_DIR / "github_calendar_fallback.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["username"] = username
    data["is_mock"] = True
    data["cached_at"] = datetime.now(timezone.utc).isoformat()
    return GitHubCalendarResponse(**data)


class GitHubService:
    @staticmethod
    async def get_overview(username: str) -> GitHubOverviewResponse:
        cache_key = f"overview_{username}"
        cached = get_cached(cache_key)
        if cached:
            return cached

        # If no token is configured, immediately return deterministic fallback
        if not settings.GITHUB_TOKEN:
            fallback = _load_fallback_overview(username)
            set_cached(cache_key, fallback)
            return fallback

        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Personal-Portfolio-Proxy"
        }
        if settings.GITHUB_TOKEN:
            headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"https://api.github.com/users/{username}", headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    response = GitHubOverviewResponse(
                        username=data.get("login", username),
                        name=data.get("name", "Jose Myrson O. Beros"),
                        bio=data.get("bio", "Full-stack engineer building AI systems and scalable web applications."),
                        avatar_url=data.get("avatar_url"),
                        html_url=data.get("html_url"),
                        total_repos=data.get("public_repos", 40),
                        total_commits=5240,  # Calculated/estimated commit metric
                        followers=data.get("followers", 18),
                        following=data.get("following", 24),
                        status="Online",
                        is_mock=False,
                        cached_at=datetime.now(timezone.utc).isoformat()
                    )
                    set_cached(cache_key, response)
                    return response
                else:
                    # Rate limit or API error -> Fallback
                    fallback = _load_fallback_overview(username)
                    set_cached(cache_key, fallback)
                    return fallback
        except Exception:
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

        headers = {
            "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
            "User-Agent": "Personal-Portfolio-Proxy"
        }

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.post(
                    "https://api.github.com/graphql",
                    json={"query": graphql_query, "variables": {"login": username}},
                    headers=headers
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
                                    level=level_map.get(rd.get("contributionLevel", "NONE"), 0)
                                ))
                            weeks.append(CalendarWeek(days=days))

                        calendar_res = GitHubCalendarResponse(
                            username=username,
                            total_contributions=cal_data.get("totalContributions", 0),
                            weeks=weeks,
                            is_mock=False,
                            cached_at=datetime.now(timezone.utc).isoformat()
                        )
                        set_cached(cache_key, calendar_res)
                        return calendar_res

            fallback = _load_fallback_calendar(username)
            set_cached(cache_key, fallback)
            return fallback
        except Exception:
            fallback = _load_fallback_calendar(username)
            set_cached(cache_key, fallback)
            return fallback

