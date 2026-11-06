from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.project import ProjectSummaryResponse, ProjectDetailResponse
from app.services.project_service import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectSummaryResponse])
async def list_projects():
    return await project_service.get_all_projects_with_meta()


@router.get("/{slug}", response_model=ProjectDetailResponse)
async def get_project_detail(slug: str):
    project = await project_service.get_project_by_slug_with_meta(slug)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project
