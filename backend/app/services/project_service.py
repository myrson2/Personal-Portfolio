import asyncio
import json
import logging
from pathlib import Path
from typing import List, Optional, Dict

import httpx

from app.core.cache import get_cached, set_cached
from app.core.config import settings
from app.models.project import ProjectSummaryResponse, ProjectDetailResponse
from app.services.github_service import fetch_repo_meta, _headers

logger = logging.getLogger(__name__)

FIXTURES_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "projects_data.json"

# Curated showcase order: eMSME first, then ColorGame (matches ProjectsSection.jsx)
CURATED_ORDER = ["eMSME", "colorgame"]
# GitHub repo names differ in case from slugs (slug is lowercase, repo is exact case)
REPO_NAME_BY_SLUG: Dict[str, str] = {
    "eMSME": "eMSME",
    "colorgame": "ColorGame",
}


class ProjectService:
    def __init__(self):
        self._projects_cache: Dict[str, ProjectDetailResponse] = {}
        self._load_fixtures()

    def _load_fixtures(self) -> None:
        if not FIXTURES_PATH.exists():
            logger.warning("projects_data.json not found at %s", FIXTURES_PATH)
            return
        try:
            with open(FIXTURES_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    detail = ProjectDetailResponse(**item)
                    self._projects_cache[detail.slug] = detail
            logger.info("Loaded %d project fixtures: %s", len(self._projects_cache), list(self._projects_cache.keys()))
        except Exception:
            logger.exception("Failed to load projects_data.json")

    def get_all_projects(self) -> List[ProjectSummaryResponse]:
        ordered = [self._projects_cache[s] for s in CURATED_ORDER if s in self._projects_cache]
        return [
            ProjectSummaryResponse(
                slug=p.slug,
                title=p.title,
                tagline=p.tagline,
                category=p.category,
                tags=p.tags,
                github_url=p.github_url,
                demo_url=p.demo_url,
                stars=p.stars,
                forks=p.forks,
                language=p.language,
                pushed_at=p.pushed_at,
            )
            for p in ordered
        ]

    def get_project_by_slug(self, slug: str) -> Optional[ProjectDetailResponse]:
        return self._projects_cache.get(slug)

    @staticmethod
    def _apply_meta(project: ProjectDetailResponse, meta: dict) -> None:
        # Mutate the fixture singleton in place so repeated reads stay cheap.
        project.stars = meta.get("stars", 0)
        project.forks = meta.get("forks", 0)
        project.language = meta.get("language")
        project.pushed_at = meta.get("pushed_at")

    async def _enrich_with_meta(self, project: ProjectDetailResponse) -> ProjectDetailResponse:
        """Fetch live stars/forks/language/pushed_at for one slug (no-op without token)."""
        if not settings.GITHUB_TOKEN:
            return project

        cache_key = f"repo_meta_{project.slug}"
        cached_meta = get_cached(cache_key)
        if cached_meta is not None:
            self._apply_meta(project, cached_meta)
            return project

        repo_name = REPO_NAME_BY_SLUG.get(project.slug, project.title)
        defaults = {"stars": 0, "forks": 0, "language": None, "pushed_at": None}
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                meta = await fetch_repo_meta(client, settings.GITHUB_USERNAME, repo_name, _headers())
        except Exception:
            logger.exception("Repo meta enrichment failed for slug %s", project.slug)
            meta = defaults

        # Cache defaults on failure too, so a down/slow GitHub is not hammered.
        set_cached(cache_key, meta)
        self._apply_meta(project, meta)
        return project

    async def get_all_projects_with_meta(self) -> List[ProjectSummaryResponse]:
        # Enrich each curated project concurrently; on any failure keep fixture defaults
        ordered = [self._projects_cache[s] for s in CURATED_ORDER if s in self._projects_cache]
        if settings.GITHUB_TOKEN:
            await asyncio.gather(*[self._enrich_with_meta(p) for p in ordered], return_exceptions=True)
        return self.get_all_projects()

    async def get_project_by_slug_with_meta(self, slug: str) -> Optional[ProjectDetailResponse]:
        project = self.get_project_by_slug(slug)
        if project is None:
            return None
        return await self._enrich_with_meta(project)


project_service = ProjectService()
