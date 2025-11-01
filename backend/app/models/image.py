"""
OS Image Model
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from app.core.database import Base


class ImageFormat(str, Enum):
    QCOW2 = "qcow2"
    RAW = "raw"
    VMDK = "vmdk"


class OSImage(Base):
    __tablename__ = "os_images"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    os_family = Column(String, nullable=False)  # ubuntu, debian, centos, etc.
    os_version = Column(String, nullable=True)  # 22.04, 12, etc.
    
    # File information
    file_path = Column(String, nullable=False)  # S3 path or local path
    file_size_gb = Column(Float, nullable=False)
    file_format = Column(SQLEnum(ImageFormat), default=ImageFormat.QCOW2, nullable=False)
    checksum_md5 = Column(String, nullable=True)
    checksum_sha256 = Column(String, nullable=True)
    
    # Metadata
    is_public = Column(Boolean, default=True, nullable=False)  # Public or admin-only
    is_active = Column(Boolean, default=True, nullable=False)
    uploader_id = Column(Integer, nullable=True)  # Admin who uploaded
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vpses = relationship("VPS", back_populates="os_image")

