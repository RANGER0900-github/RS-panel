"""
Admin-only endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from typing import Optional, List
from pydantic import BaseModel
from app.models.audit_log import AuditLog, AuditAction, AuditResource

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin dashboard statistics"""
    from app.models.user import User
    from app.models.vps import VPS, VPSStatus
    from app.models.host import Host, HostStatus
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    total_vpses = db.query(VPS).count()
    running_vpses = db.query(VPS).filter(VPS.status == VPSStatus.RUNNING).count()
    
    total_hosts = db.query(Host).count()
    online_hosts = db.query(Host).filter(Host.status == HostStatus.ONLINE).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users
        },
        "vpses": {
            "total": total_vpses,
            "running": running_vpses
        },
        "hosts": {
            "total": total_hosts,
            "online": online_hosts
        }
    }


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[int]
    resource_uuid: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    details: Optional[dict]
    created_at: str

    class Config:
        from_attributes = True


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    user_id: Optional[int] = None,
):
    """List audit logs with optional filters"""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == AuditAction(action))
    if resource_type:
        query = query.filter(AuditLog.resource_type == AuditResource(resource_type))
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs

