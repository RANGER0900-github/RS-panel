"""
SSH Key Model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class SSHKey(Base):
    __tablename__ = "ssh_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="ssh_keys")
    
    name = Column(String, nullable=False)
    public_key = Column(Text, nullable=False)  # SSH public key content
    fingerprint = Column(String, nullable=False, unique=True, index=True)  # MD5 fingerprint
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)

