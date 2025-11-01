"""
Host management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.user import User
from app.models.host import Host, HostStatus
from app.models.vps import VPS, VPSStatus

router = APIRouter()


class HostResponse(BaseModel):
    id: int
    uuid: str
    name: str
    fqdn: Optional[str]
    ip_address: str
    total_cpu_cores: int
    total_ram_gb: float
    total_storage_gb: float
    used_cpu_cores: int
    used_ram_gb: float
    used_storage_gb: float
    status: str
    last_seen: Optional[datetime]
    stats_cache: Optional[dict]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[HostResponse])
async def list_hosts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all hosts"""
    hosts = db.query(Host).all()
    return hosts


@router.get("/stats")
async def get_host_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cluster-wide host statistics"""
    hosts = db.query(Host).all()
    vpses = db.query(VPS).filter(VPS.status.in_([VPSStatus.RUNNING, VPSStatus.CREATING])).all()
    
    total_cpu = sum(h.total_cpu_cores for h in hosts)
    total_ram = sum(h.total_ram_gb for h in hosts)
    total_storage = sum(h.total_storage_gb for h in hosts)
    
    used_cpu = sum(h.used_cpu_cores for h in hosts)
    used_ram = sum(h.used_ram_gb for h in hosts)
    used_storage = sum(h.used_storage_gb for h in hosts)
    
    return {
        "hosts": {
            "total": len(hosts),
            "online": len([h for h in hosts if h.status == HostStatus.ONLINE]),
            "offline": len([h for h in hosts if h.status == HostStatus.OFFLINE]),
        },
        "resources": {
            "cpu": {
                "total": total_cpu,
                "used": used_cpu,
                "available": total_cpu - used_cpu,
                "usage_percent": (used_cpu / total_cpu * 100) if total_cpu > 0 else 0
            },
            "ram": {
                "total_gb": total_ram,
                "used_gb": used_ram,
                "available_gb": total_ram - used_ram,
                "usage_percent": (used_ram / total_ram * 100) if total_ram > 0 else 0
            },
            "storage": {
                "total_gb": total_storage,
                "used_gb": used_storage,
                "available_gb": total_storage - used_storage,
                "usage_percent": (used_storage / total_storage * 100) if total_storage > 0 else 0
            }
        },
        "vpses": {
            "total": len(vpses),
            "running": len([v for v in vpses if v.status == VPSStatus.RUNNING]),
            "creating": len([v for v in vpses if v.status == VPSStatus.CREATING]),
        }
    }


@router.get("/{host_id}", response_model=HostResponse)
async def get_host(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get host by ID"""
    host = db.query(Host).filter(Host.id == host_id).first()
    
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    
    return host

