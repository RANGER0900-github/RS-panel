"""
tmate integration endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.vps import VPS, NetworkType

router = APIRouter()


class TmateSessionResponse(BaseModel):
    session_id: str
    connect_url: str
    expires_at: datetime
    ttl_seconds: int


@router.post("/vps/{vps_id}")
async def create_tmate_session(
    vps_id: int,
    ttl_minutes: int = 60,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a tmate session for a private-only VPS"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    # Users can only access their own VPSes
    if current_user.role.value == "user" and vps.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Only private-only VPSes can use tmate
    if vps.network_type != NetworkType.PRIVATE_ONLY:
        raise HTTPException(
            status_code=400,
            detail="tmate is only available for private-only VPS instances"
        )
    
    if vps.status.value != "running":
        raise HTTPException(status_code=400, detail="VPS must be running")
    
    # TODO: Integrate with tmate to create session on the host
    # This would typically:
    # 1. SSH to the host
    # 2. Run tmate command to create session
    # 3. Get the connection URL
    # 4. Store session metadata in Redis with TTL
    
    # Mock response for now
    session_id = f"tmate-{vps.id}-{datetime.utcnow().timestamp()}"
    expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)
    
    # Example tmate URL format
    connect_url = f"ssh://session@{session_id}.tmate.io"
    
    return TmateSessionResponse(
        session_id=session_id,
        connect_url=connect_url,
        expires_at=expires_at,
        ttl_seconds=ttl_minutes * 60
    )

