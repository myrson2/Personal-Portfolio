from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict


class ProjectItem(BaseModel):
    """One owned GitHub repo. Only GitHub-derived metadata; nothing inferred."""

    model_config = ConfigDict(extra="forbid")

    name: str
    language: Optional[str] = None  # GitHub's derived primary language; null if GitHub has none
    description: Optional[str] = None
    html_url: str


class ProjectsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projects: List[ProjectItem]
    is_mock: bool
    source: Literal["live", "snapshot", "fixture"]
    cached_at: str
