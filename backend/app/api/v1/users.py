"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.core.permissions import require_permission, Permission
from app.models.user import User, UserRole

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    uuid: str
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    is_2fa_enabled: bool
    created_at: str
    last_login: Optional[str]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List users (requires USER_READ permission)"""
    # Check permission (admin/support can see all, users see only themselves)
    query = db.query(User)
    
    if current_user.role == UserRole.USER:
        query = query.filter(User.id == current_user.id)
    else:
        if search:
            query = query.filter(
                (User.email.ilike(f"%{search}%")) |
                (User.username.ilike(f"%{search}%")) |
                (User.full_name.ilike(f"%{search}%"))
            )
        if role:
            query = query.filter(User.role == UserRole(role))
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Users can only see themselves unless they're admin/support
    if current_user.role == UserRole.USER and user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new user (admin only)"""
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    from app.core.security import get_password_hash
    
    role = UserRole(user_data.role) if user_data.role else UserRole.USER
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user (admin or self)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Users can only update themselves (limited fields)
    if current_user.role == UserRole.USER and user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Only admin can change role and is_active
    if current_user.role != UserRole.ADMIN:
        user_data.role = None
        user_data.is_active = None
    
    if user_data.email and user_data.email != user.email:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_data.email
    
    if user_data.username and user_data.username != user.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = user_data.username
    
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    
    if user_data.role and current_user.role == UserRole.ADMIN:
        user.role = UserRole(user_data.role)
    
    if user_data.is_active is not None and current_user.role == UserRole.ADMIN:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    
    return None

