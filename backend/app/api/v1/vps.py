"""
VPS management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.vps import VPS, VPSStatus, NetworkType, ExpirationAction
from app.models.user import User, UserRole
from app.models.image import OSImage

router = APIRouter()


class VPSCreate(BaseModel):
    name: str
    cpu_cores: int
    ram_gb: float
    storage_gb: int
    os_image_id: int
    network_type: str = "public_ipv4"
    owner_id: int
    template_id: Optional[int] = None
    start_on_create: bool = False
    auto_backups: bool = False
    cloud_init_data: Optional[str] = None
    expires_at: Optional[datetime] = None
    expiration_action: str = "notify"


class VPSUpdate(BaseModel):
    name: Optional[str] = None
    cpu_cores: Optional[int] = None
    ram_gb: Optional[float] = None
    storage_gb: Optional[int] = None
    auto_backups: Optional[bool] = None
    expires_at: Optional[datetime] = None
    expiration_action: Optional[str] = None


class VPSResponse(BaseModel):
    id: int
    uuid: str
    name: str
    cpu_cores: int
    ram_gb: float
    storage_gb: int
    network_type: str
    public_ipv4: Optional[str]
    private_ip: Optional[str]
    status: str
    owner_id: int
    host_id: Optional[int]
    expires_at: Optional[datetime]
    expiration_action: str
    auto_backups: bool
    stats_cache: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[VPSResponse])
async def list_vpses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    owner_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List VPS instances"""
    query = db.query(VPS)
    
    # Users can only see their own VPSes
    if current_user.role == UserRole.USER:
        query = query.filter(VPS.owner_id == current_user.id)
    elif owner_id:
        query = query.filter(VPS.owner_id == owner_id)
    
    if status_filter:
        query = query.filter(VPS.status == VPSStatus(status_filter))
    
    vpses = query.offset(skip).limit(limit).all()
    return vpses


@router.get("/{vps_id}", response_model=VPSResponse)
async def get_vps(
    vps_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get VPS by ID"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    # Users can only see their own VPSes
    if current_user.role == UserRole.USER and vps.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return vps


@router.post("/", response_model=VPSResponse, status_code=status.HTTP_201_CREATED)
async def create_vps(
    vps_data: VPSCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new VPS (admin only)"""
    # Validate OS image
    os_image = db.query(OSImage).filter(OSImage.id == vps_data.os_image_id).first()
    if not os_image:
        raise HTTPException(status_code=404, detail="OS image not found")
    
    # Validate owner
    owner = db.query(User).filter(User.id == vps_data.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner user not found")
    
    # Create VPS
    vps = VPS(
        name=vps_data.name,
        cpu_cores=vps_data.cpu_cores,
        ram_gb=vps_data.ram_gb,
        storage_gb=vps_data.storage_gb,
        os_image_id=vps_data.os_image_id,
        network_type=NetworkType(vps_data.network_type),
        owner_id=vps_data.owner_id,
        template_id=vps_data.template_id,
        start_on_create=vps_data.start_on_create,
        auto_backups=vps_data.auto_backups,
        cloud_init_data=vps_data.cloud_init_data,
        expires_at=vps_data.expires_at,
        expiration_action=ExpirationAction(vps_data.expiration_action),
        status=VPSStatus.CREATING
    )
    
    db.add(vps)
    db.commit()
    db.refresh(vps)
    
    # TODO: Trigger provisioning task via Celery
    
    return vps


@router.patch("/{vps_id}", response_model=VPSResponse)
async def update_vps(
    vps_id: int,
    vps_data: VPSUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update VPS"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    # Users can only update limited fields on their own VPSes
    if current_user.role == UserRole.USER:
        if vps.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        # Users can only update auto_backups
        if vps_data.name or vps_data.cpu_cores or vps_data.ram_gb or vps_data.storage_gb:
            raise HTTPException(status_code=403, detail="Only admins can modify specs")
    
    if vps_data.name:
        vps.name = vps_data.name
    if vps_data.auto_backups is not None:
        vps.auto_backups = vps_data.auto_backups
    if vps_data.expires_at:
        vps.expires_at = vps_data.expires_at
    if vps_data.expiration_action:
        vps.expiration_action = ExpirationAction(vps_data.expiration_action)
    
    # Admin-only updates
    if current_user.role != UserRole.USER:
        if vps_data.cpu_cores:
            vps.cpu_cores = vps_data.cpu_cores
        if vps_data.ram_gb:
            vps.ram_gb = vps_data.ram_gb
        if vps_data.storage_gb:
            vps.storage_gb = vps_data.storage_gb
    
    db.commit()
    db.refresh(vps)
    
    # TODO: Trigger resize task if specs changed
    
    return vps


@router.post("/{vps_id}/start")
async def start_vps(
    vps_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start VPS"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    if current_user.role == UserRole.USER and vps.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if vps.status == VPSStatus.RUNNING:
        raise HTTPException(status_code=400, detail="VPS is already running")
    
    vps.status = VPSStatus.RUNNING
    db.commit()
    
    # TODO: Trigger start task via Celery
    
    return {"message": "VPS start initiated", "status": vps.status.value}


@router.post("/{vps_id}/stop")
async def stop_vps(
    vps_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stop VPS"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    if current_user.role == UserRole.USER and vps.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if vps.status == VPSStatus.STOPPED:
        raise HTTPException(status_code=400, detail="VPS is already stopped")
    
    vps.status = VPSStatus.STOPPED
    db.commit()
    
    # TODO: Trigger stop task via Celery
    
    return {"message": "VPS stop initiated", "status": vps.status.value}


@router.post("/{vps_id}/reboot")
async def reboot_vps(
    vps_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reboot VPS"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    if current_user.role == UserRole.USER and vps.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if vps.status != VPSStatus.RUNNING:
        raise HTTPException(status_code=400, detail="VPS must be running to reboot")
    
    # TODO: Trigger reboot task via Celery
    
    return {"message": "VPS reboot initiated"}


@router.delete("/{vps_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vps(
    vps_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete VPS (admin only)"""
    vps = db.query(VPS).filter(VPS.id == vps_id).first()
    
    if not vps:
        raise HTTPException(status_code=404, detail="VPS not found")
    
    vps.status = VPSStatus.DELETING
    db.commit()
    
    # TODO: Trigger delete task via Celery
    
    return None

