"""
VPS Model
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
import uuid
from datetime import datetime
from app.core.database import Base


class VPSStatus(str, Enum):
    CREATING = "creating"
    RUNNING = "running"
    STOPPED = "stopped"
    PAUSED = "paused"
    ERROR = "error"
    DELETING = "deleting"


class NetworkType(str, Enum):
    PUBLIC_IPV4 = "public_ipv4"
    PRIVATE_ONLY = "private_only"


class ExpirationAction(str, Enum):
    AUTO_DELETE = "auto_delete"
    AUTO_SHUTDOWN = "auto_shutdown"
    NOTIFY = "notify"


class VPS(Base):
    __tablename__ = "vpses"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False, index=True)
    
    # Specifications
    cpu_cores = Column(Integer, nullable=False)
    ram_gb = Column(Float, nullable=False)
    storage_gb = Column(Integer, nullable=False)
    
    # Image
    os_image_id = Column(Integer, ForeignKey("os_images.id"), nullable=False)
    os_image = relationship("OSImage", back_populates="vpses")
    
    # Networking
    network_type = Column(SQLEnum(NetworkType), default=NetworkType.PUBLIC_IPV4, nullable=False)
    public_ipv4 = Column(String, nullable=True)
    private_ip = Column(String, nullable=True)
    
    # Assignment
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="vps_list", foreign_keys=[owner_id])
    host_id = Column(Integer, ForeignKey("hosts.id"), nullable=True)
    host = relationship("Host", back_populates="vpses")
    
    # Template
    template_id = Column(Integer, ForeignKey("vps_templates.id"), nullable=True)
    template = relationship("VPSTemplate", back_populates="vpses")
    
    # Status
    status = Column(SQLEnum(VPSStatus), default=VPSStatus.CREATING, nullable=False)
    vm_id = Column(String, nullable=True)  # Libvirt domain ID
    
    # Expiration
    expires_at = Column(DateTime(timezone=True), nullable=True)
    expiration_action = Column(SQLEnum(ExpirationAction), default=ExpirationAction.NOTIFY)
    
    # Options
    start_on_create = Column(Boolean, default=False, nullable=False)
    auto_backups = Column(Boolean, default=False, nullable=False)
    cloud_init_data = Column(Text, nullable=True)
    
    # Stats (cached)
    stats_cache = Column(JSON, nullable=True)  # {cpu: %, ram: %, disk: %, network: {in: bytes, out: bytes}}
    stats_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    snapshots = relationship("VPSSnapshot", back_populates="vps", cascade="all, delete-orphan")


class VPSTemplate(Base):
    __tablename__ = "vps_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Specifications
    cpu_cores = Column(Integer, nullable=False)
    ram_gb = Column(Float, nullable=False)
    storage_gb = Column(Integer, nullable=False)
    
    # Pricing (optional)
    price_per_month = Column(Float, nullable=True)
    price_per_hour = Column(Float, nullable=True)
    
    # Expiration defaults
    default_expiration_days = Column(Integer, nullable=True)
    default_expiration_action = Column(SQLEnum(ExpirationAction), default=ExpirationAction.NOTIFY)
    
    # Metadata
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vpses = relationship("VPS", back_populates="template")
    plans = relationship("VPSTemplatePlan", back_populates="template", cascade="all, delete-orphan")


class VPSTemplatePlan(Base):
    __tablename__ = "vps_template_plans"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("vps_templates.id"), nullable=False)
    template = relationship("VPSTemplate", back_populates="plans")
    
    name = Column(String, nullable=False)
    duration_days = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class VPSSnapshot(Base):
    __tablename__ = "vps_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    vps_id = Column(Integer, ForeignKey("vpses.id"), nullable=False)
    vps = relationship("VPS", back_populates="snapshots")
    
    name = Column(String, nullable=False)
    snapshot_path = Column(String, nullable=True)  # Path to snapshot file
    size_gb = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

