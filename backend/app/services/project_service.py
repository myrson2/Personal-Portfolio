"""Projects = the top public repos owned by settings.GITHUB_USERNAME.

Flow: live GitHub fetch -> on success, write a last-known-good snapshot to disk.
On any failure (no token, 401/403/429, timeout, network, bad payload) serve the
snapshot, or the committed (empty) fixture if no snapshot exists yet.
"""
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import httpx

from app.core.cache import get_cached, set_cached
from app.core.config import settings
from app.models.project import ProjectItem, ProjectsResponse
from app.services.github_service import GITHUB_API, _headers

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
FIXTURE_PATH = BACKEND_DIR / "app" / "fixtures" / "projects_fallback.json"
CACHE_KEY = "projects_list"
MAX_PROJECTS = 5
MAX_PAGES = 10


def _snapshot_path() -> Path:
    path = Path(settings.PROJECTS_SNAPSHOT_PATH)
    return path if path.is_absolute() else BACKEND_DIR / path


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _fetch_owned_repos(client: httpx.AsyncClient) -> Optional[List[dict]]:
    """All repos the token owner owns (paginated). None on any upstream failure."""
    repos: List[dict] = []
    for page in range(1, MAX_PAGES + 1):
        res = await client.get(
            f"{GITHUB_API}/user/repos",
            params={"affiliation": "owner", "visibility": "all", "per_page": 100, "page": page},
            headers=_headers(),
        )
        if res.status_code != 200:
            logger.warning("Owned repos fetch page %s -> %s", page, res.status_code)
            return None
        data = res.json()
        if not isinstance(data, list):
            return None
        repos.extend(data)
        if len(data) < 100:
            break
    return repos


def select_projects(repos: List[dict], owner: str) -> List[ProjectItem]:
    """Public, non-fork, non-archived repos owned by `owner`; top 5 by stars, then recent push."""
    owned = [
        r for r in repos
        if (r.get("owner") or {}).get("login", "").lower() == owner.lower()
        and not r.get("private")
        and not r.get("fork")
        and not r.get("archived")
        and r.get("name")
        and r.get("html_url")
    ]
    owned.sort(key=lambda r: r.get("pushed_at") or "", reverse=True)
    owned.sort(key=lambda r: r.get("stargazers_count") or 0, reverse=True)  # stable: pushed_at breaks ties
    return [
        ProjectItem(
            name=r["name"],
            language=r.get("language"),
            description=r.get("description"),
            html_url=r["html_url"],
        )
        for r in owned[:MAX_PROJECTS]
    ]


def _write_snapshot(projects: List[ProjectItem]) -> None:
    path = _snapshot_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps([p.model_dump() for p in projects], indent=2), encoding="utf-8")
        os.replace(tmp, path)  # atomic: a crash never leaves a half-written snapshot
    except OSError:
        logger.exception("Failed to write projects snapshot to %s", path)


def _read_projects_file(path: Path) -> Optional[List[ProjectItem]]:
    if not path.exists():
        return None
    try:
        return [ProjectItem(**item) for item in json.loads(path.read_text(encoding="utf-8"))]
    except Exception:
        logger.exception("Invalid projects file at %s", path)
        return None


def _fallback() -> ProjectsResponse:
    snapshot = _read_projects_file(_snapshot_path())
    if snapshot is not None:
        return ProjectsResponse(projects=snapshot, is_mock=True, source="snapshot", cached_at=_now())
    fixture = _read_projects_file(FIXTURE_PATH) or []
    return ProjectsResponse(projects=fixture, is_mock=True, source="fixture", cached_at=_now())


async def get_projects() -> ProjectsResponse:
    cached = get_cached(CACHE_KEY)
    if cached is not None:
        return cached

    response: Optional[ProjectsResponse] = None
    if settings.GITHUB_TOKEN:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                repos = await _fetch_owned_repos(client)
            if repos is not None:
                projects = select_projects(repos, settings.GITHUB_USERNAME)
                _write_snapshot(projects)
                response = ProjectsResponse(projects=projects, is_mock=False, source="live", cached_at=_now())
        except Exception:
            logger.exception("Live projects fetch failed")

    if response is None:
        response = _fallback()
    # Cache fallbacks too so a down/rate-limited GitHub isn't hammered every request.
    set_cached(CACHE_KEY, response)
    return response
