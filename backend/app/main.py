"""
MS VPS Panel - Main FastAPI Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1 import api_router
from app.core.logging_middleware import setup_json_logging, request_logging_middleware
from app.core.errors import (
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.host import Host, HostStatus
from app.models.image import OSImage, ImageFormat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    Base.metadata.create_all(bind=engine)
    # Setup logging once
    setup_json_logging()
    # Ensure admin user exists
    seed_admin_if_missing()
    # Ensure baseline fixtures (host/images)
    seed_fixtures_if_missing()
    yield
    # Shutdown


app = FastAPI(
    title="MS VPS Panel API",
    description="Professional VPS Management Panel API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured logging + correlation IDs
app.middleware("http")(request_logging_middleware)

# Global error handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "MS VPS Panel API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/health/details")
async def health_details():
    """Lightweight dependency checks (DB ping)."""
    ok = True
    db_ok = True
    tmate_ok = True
    tmate_bin_ok = True
    redis_ok = True
    libvirt_ok = True
    try:
        with SessionLocal() as db:
            db.execute("SELECT 1")
    except Exception:
        ok = False
        db_ok = False
    # tmate checks (binary presence)
    try:
        import os
        tmate_bin_ok = os.path.exists(settings.TMATE_BIN_PATH)
        if not tmate_bin_ok:
            ok = False
        tmate_ok = tmate_bin_ok
    except Exception:
        ok = False
        tmate_ok = False
    # redis check
    try:
        import redis
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
    except Exception:
        ok = False
        redis_ok = False
    # libvirt check (optional)
    try:
        import importlib
        libvirt_module = importlib.util.find_spec("libvirt")
        libvirt_ok = libvirt_module is not None
    except Exception:
        libvirt_ok = False
    return {
        "ok": ok,
        "dependencies": {
            "database": db_ok,
            "tmate": tmate_ok,
            "tmate_bin": tmate_bin_ok,
            "redis": redis_ok,
            "libvirt": libvirt_ok,
        },
    }


def seed_admin_if_missing() -> None:
    """Create default admin if it doesn't exist."""
    with SessionLocal() as db:
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrator",
                role=UserRole.ADMIN,
                is_active=True,
                is_email_verified=True,
            )
            db.add(admin)
            db.commit()


def seed_fixtures_if_missing() -> None:
    """Seed minimal host and images if none exist."""
    with SessionLocal() as db:
        host = db.query(Host).filter(Host.name == "localhost").first()
        if not host:
            host = Host(
                name="localhost",
                fqdn="localhost.localdomain",
                ip_address="127.0.0.1",
                total_cpu_cores=8,
                total_ram_gb=32.0,
                total_storage_gb=500.0,
                status=HostStatus.ONLINE,
            )
            db.add(host)

        ubuntu = db.query(OSImage).filter(OSImage.name == "Ubuntu 22.04 LTS").first()
        if not ubuntu:
            ubuntu = OSImage(
                name="Ubuntu 22.04 LTS",
                description="Ubuntu Server 22.04 LTS (Jammy)",
                os_family="ubuntu",
                os_version="22.04",
                file_path="/images/ubuntu-22.04.qcow2",
                file_size_gb=2.5,
                file_format=ImageFormat.QCOW2,
                is_public=True,
                is_active=True,
            )
            db.add(ubuntu)

        debian = db.query(OSImage).filter(OSImage.name == "Debian 12").first()
        if not debian:
            debian = OSImage(
                name="Debian 12",
                description="Debian 12 (Bookworm)",
                os_family="debian",
                os_version="12",
                file_path="/images/debian-12.qcow2",
                file_size_gb=2.0,
                file_format=ImageFormat.QCOW2,
                is_public=True,
                is_active=True,
            )
            db.add(debian)

        db.commit()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

