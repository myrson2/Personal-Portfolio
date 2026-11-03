from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8001)
    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")
    
    # GitHub integration
    GITHUB_USERNAME: str = Field(default="myrson2")
    GITHUB_TOKEN: str = Field(default="")
    
    # Cache settings (seconds)
    CACHE_TTL_SECONDS: int = Field(default=1800)

    # Resend Email Delivery
    RESEND_API_KEY: str = Field(default="")
    RESEND_TO_EMAIL: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()

