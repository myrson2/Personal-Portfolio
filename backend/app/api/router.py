from fastapi import APIRouter
from app.api.endpoints import health, github, contact, projects

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(github.router)
api_router.include_router(contact.router)
api_router.include_router(projects.router)

