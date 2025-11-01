"""
Admin-only endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User

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

