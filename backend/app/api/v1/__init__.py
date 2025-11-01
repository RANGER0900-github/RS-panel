"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1 import auth, admin, users, vps, hosts, images, ssh_keys, tmate

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(vps.router, prefix="/vps", tags=["VPS"])
api_router.include_router(hosts.router, prefix="/hosts", tags=["Hosts"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])
api_router.include_router(ssh_keys.router, prefix="/ssh-keys", tags=["SSH Keys"])
api_router.include_router(tmate.router, prefix="/tmate", tags=["tmate"])

