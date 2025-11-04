"""
Audit logging helpers.
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog, AuditAction, AuditResource


def record_audit(
    db: Session,
    *,
    user_id: Optional[int],
    action: AuditAction,
    resource_type: AuditResource,
    resource_id: Optional[int] = None,
    resource_uuid: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_uuid=resource_uuid,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details or {},
    )
    db.add(log)
    db.commit()


