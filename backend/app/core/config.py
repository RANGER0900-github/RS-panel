"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MS VPS Panel"
    DEBUG: bool = False
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    # Prefer env-provided DB, otherwise default to local SQLite for non-Docker setups
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./app.db"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ]
    
    # File Storage (S3-compatible)
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "http://minio:9000")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "vps-panel")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    USE_S3: bool = os.getenv("USE_S3", "false").lower() == "true"
    
    # Libvirt/KVM
    LIBVIRT_URI: str = os.getenv("LIBVIRT_URI", "qemu:///system")
    
    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/2")
    
    # tmate
    TMATE_HOST: str = os.getenv("TMATE_HOST", "localhost")
    TMATE_PORT: int = int(os.getenv("TMATE_PORT", "22"))
    TMATE_BIN_PATH: str = os.getenv("TMATE_BIN_PATH", "/usr/bin/tmate")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

