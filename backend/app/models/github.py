from typing import List, Optional
from pydantic import BaseModel, Field


class GitHubOverviewResponse(BaseModel):
    username: str
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    html_url: Optional[str] = None
    total_repos: int = Field(default=0)
    total_commits: int = Field(default=0)
    followers: int = Field(default=0)
    following: int = Field(default=0)
    status: str = Field(default="Online")
    is_mock: bool = Field(default=False)
    cached_at: Optional[str] = None


class CalendarDay(BaseModel):
    date: str
    count: int = 0
    level: int = 0


class CalendarWeek(BaseModel):
    days: List[CalendarDay]


class GitHubCalendarResponse(BaseModel):
    username: str
    total_contributions: int = 0
    weeks: List[CalendarWeek] = []
    is_mock: bool = False
    cached_at: Optional[str] = None

