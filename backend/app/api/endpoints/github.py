from fastapi import APIRouter, Query
from app.core.config import settings
from app.models.github import GitHubOverviewResponse, GitHubCalendarResponse
from app.services.github_service import GitHubService

router = APIRouter()


@router.get("/github/overview", response_model=GitHubOverviewResponse, tags=["GitHub"])
async def get_github_overview(
    username: str = Query(default=None, description="GitHub username to query")
):
    target_user = username or settings.GITHUB_USERNAME
    return await GitHubService.get_overview(target_user)


@router.get("/github/calendar", response_model=GitHubCalendarResponse, tags=["GitHub"])
async def get_github_calendar(
    username: str = Query(default=None, description="GitHub username to query")
):
    target_user = username or settings.GITHUB_USERNAME
    return await GitHubService.get_calendar(target_user)

