"""
Host Model
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
import uuid
from app.core.database import Base


class HostStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class Host(Base):
    __tablename__ = "hosts"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False, unique=True)
    fqdn = Column(String, nullable=True)  # Fully qualified domain name
    ip_address = Column(String, nullable=False)
    
    # Specifications
    total_cpu_cores = Column(Integer, nullable=False)
    total_ram_gb = Column(Float, nullable=False)
    total_storage_gb = Column(Float, nullable=False)
    
    # Current usage (cached)
    used_cpu_cores = Column(Integer, default=0, nullable=False)
    used_ram_gb = Column(Float, default=0.0, nullable=False)
    used_storage_gb = Column(Float, default=0.0, nullable=False)
    
    # Libvirt
    libvirt_uri = Column(String, nullable=True)
    
    # Status
    status = Column(SQLEnum(HostStatus), default=HostStatus.OFFLINE, nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    
    # Stats cache
    stats_cache = Column(JSON, nullable=True)  # System metrics
    stats_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vpses = relationship("VPS", back_populates="host")

