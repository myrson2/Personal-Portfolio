import json
from pathlib import Path
from typing import List, Optional, Dict
from app.models.project import ProjectSummaryResponse, ProjectDetailResponse

FIXTURES_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "projects_data.json"


class ProjectService:
    def __init__(self):
        self._projects_cache: Dict[str, ProjectDetailResponse] = {}
        self._load_fixtures()

    def _load_fixtures(self) -> None:
        if not FIXTURES_PATH.exists():
            return
        try:
            with open(FIXTURES_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    detail = ProjectDetailResponse(**item)
                    self._projects_cache[detail.slug] = detail
        except Exception as e:
            # Fallback defensively if file parsing fails
            pass

    def get_all_projects(self) -> List[ProjectSummaryResponse]:
        return [
            ProjectSummaryResponse(
                slug=p.slug,
                title=p.title,
                tagline=p.tagline,
                category=p.category,
                tags=p.tags,
                github_url=p.github_url,
                demo_url=p.demo_url,
            )
            for p in self._projects_cache.values()
        ]

    def get_project_by_slug(self, slug: str) -> Optional[ProjectDetailResponse]:
        return self._projects_cache.get(slug)


project_service = ProjectService()
