"""
OS Image management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.user import User
from app.models.image import OSImage, ImageFormat

router = APIRouter()


class ImageResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    os_family: str
    os_version: Optional[str]
    file_size_gb: float
    file_format: str
    is_public: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ImageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    os_family: str
    os_version: Optional[str] = None
    file_format: str = "qcow2"


@router.get("/", response_model=List[ImageResponse])
async def list_images(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List OS images"""
    query = db.query(OSImage).filter(OSImage.is_active == True)
    
    # Non-admins only see public images
    if current_user.role.value == "user":
        query = query.filter(OSImage.is_public == True)
    
    images = query.all()
    return images


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get OS image by ID"""
    image = db.query(OSImage).filter(OSImage.id == image_id).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not image.is_public and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return image


@router.post("/", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def create_image(
    image_data: ImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create OS image metadata (admin only)"""
    image = OSImage(
        name=image_data.name,
        description=image_data.description,
        os_family=image_data.os_family,
        os_version=image_data.os_version,
        file_format=ImageFormat(image_data.file_format),
        file_path="",  # Will be set on upload
        file_size_gb=0  # Will be set on upload
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return image


@router.post("/{image_id}/upload")
async def upload_image(
    image_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Upload OS image file (admin only)"""
    image = db.query(OSImage).filter(OSImage.id == image_id).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # TODO: Upload to S3 or local storage
    # TODO: Calculate checksums
    # TODO: Update image.file_path and file_size_gb
    
    return {"message": "Image upload initiated", "image_id": image_id}


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete OS image (admin only)"""
    image = db.query(OSImage).filter(OSImage.id == image_id).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Check if image is in use
    from app.models.vps import VPS
    vps_count = db.query(VPS).filter(VPS.os_image_id == image_id).count()
    if vps_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete image: {vps_count} VPS instances are using it"
        )
    
    image.is_active = False
    db.commit()
    
    # TODO: Delete file from storage
    
    return None

