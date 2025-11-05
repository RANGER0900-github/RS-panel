"""
SSH Key management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.ssh_key import SSHKey

router = APIRouter()


class SSHKeyCreate(BaseModel):
    name: str
    public_key: str


class SSHKeyResponse(BaseModel):
    id: int
    name: str
    fingerprint: str
    created_at: datetime
    last_used_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[SSHKeyResponse])
async def list_ssh_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List SSH keys for current user"""
    keys = db.query(SSHKey).filter(SSHKey.user_id == current_user.id).all()
    return keys


@router.post("/", response_model=SSHKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_ssh_key(
    key_data: SSHKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add SSH public key"""
    import hashlib
    import base64
    
    # Parse and validate SSH key
    try:
        key_parts = key_data.public_key.strip().split()
        if len(key_parts) < 2:
            raise ValueError("Invalid SSH key format")
        
        key_type = key_parts[0]
        key_content = key_parts[1]
        
        # Decode and generate fingerprint
        key_bytes = base64.b64decode(key_content)
        fingerprint_md5 = hashlib.md5(key_bytes).hexdigest()
        fingerprint = ":".join([fingerprint_md5[i:i+2] for i in range(0, len(fingerprint_md5), 2)])
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid SSH key: {str(e)}")
    
    # Check if fingerprint already exists
    existing = db.query(SSHKey).filter(SSHKey.fingerprint == fingerprint).first()
    if existing:
        raise HTTPException(status_code=400, detail="SSH key already exists")
    
    ssh_key = SSHKey(
        user_id=current_user.id,
        name=key_data.name,
        public_key=key_data.public_key,
        fingerprint=fingerprint
    )
    
    db.add(ssh_key)
    db.commit()
    db.refresh(ssh_key)
    
    return ssh_key


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ssh_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete SSH key"""
    ssh_key = db.query(SSHKey).filter(SSHKey.id == key_id).first()
    
    if not ssh_key:
        raise HTTPException(status_code=404, detail="SSH key not found")
    
    if ssh_key.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(ssh_key)
    db.commit()
    
    return None

