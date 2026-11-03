from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title="Jose Myrson O. Beros Portfolio API",
    description="FastAPI caching proxy and backend gateway for developer portfolio telemetry.",
    version="1.0.0"
)

# Strict CORS Invariants
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Jose Myrson O. Beros Portfolio API",
        "docs": "/docs",
        "health": "/api/health"
    }

