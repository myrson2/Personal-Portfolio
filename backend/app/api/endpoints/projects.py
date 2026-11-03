from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.project import ProjectSummaryResponse, ProjectDetailResponse
from app.services.project_service import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectSummaryResponse])
async def list_projects():
    return project_service.get_all_projects()


@router.get("/{slug}", response_model=ProjectDetailResponse)
async def get_project_detail(slug: str):
    project = project_service.get_project_by_slug(slug)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project
