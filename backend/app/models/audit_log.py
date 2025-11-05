"""
Audit Log Model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from app.core.database import Base


class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    START = "start"
    STOP = "stop"
    REBOOT = "reboot"
    LOGIN = "login"
    LOGOUT = "logout"
    UPLOAD = "upload"
    DOWNLOAD = "download"


class AuditResource(str, Enum):
    VPS = "vps"
    USER = "user"
    HOST = "host"
    IMAGE = "image"
    SSH_KEY = "ssh_key"
    TEMPLATE = "template"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="audit_logs")
    
    action = Column(SQLEnum(AuditAction), nullable=False)
    resource_type = Column(SQLEnum(AuditResource), nullable=False)
    resource_id = Column(Integer, nullable=True)
    resource_uuid = Column(String, nullable=True)
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    details = Column(JSON, nullable=True)  # Additional context
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

