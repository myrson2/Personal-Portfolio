from fastapi import APIRouter

from app.models.project import ProjectsResponse
from app.services.project_service import get_projects

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=ProjectsResponse)
async def list_projects():
    return await get_projects()
