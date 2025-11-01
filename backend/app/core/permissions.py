"""
RBAC and permissions
"""
from enum import Enum
from fastapi import HTTPException, status
from app.models.user import User, UserRole


class Permission(str, Enum):
    # VPS permissions
    VPS_CREATE = "vps:create"
    VPS_READ = "vps:read"
    VPS_UPDATE = "vps:update"
    VPS_DELETE = "vps:delete"
    VPS_START = "vps:start"
    VPS_STOP = "vps:stop"
    VPS_REBOOT = "vps:reboot"
    
    # User permissions
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    
    # Host permissions
    HOST_READ = "host:read"
    HOST_MANAGE = "host:manage"
    
    # Image permissions
    IMAGE_UPLOAD = "image:upload"
    IMAGE_DELETE = "image:delete"
    
    # Billing permissions
    BILLING_READ = "billing:read"
    BILLING_MANAGE = "billing:manage"


# Role to permissions mapping
ROLE_PERMISSIONS = {
    UserRole.ADMIN: list(Permission),
    UserRole.SUPPORT: [
        Permission.VPS_READ,
        Permission.VPS_UPDATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.HOST_READ,
    ],
    UserRole.BILLING: [
        Permission.BILLING_READ,
        Permission.BILLING_MANAGE,
        Permission.USER_READ,
    ],
    UserRole.USER: [
        Permission.VPS_READ,
        Permission.VPS_UPDATE,
        Permission.VPS_START,
        Permission.VPS_STOP,
        Permission.VPS_REBOOT,
    ],
}


def has_permission(user: User, permission: Permission) -> bool:
    """Check if user has a specific permission"""
    user_permissions = ROLE_PERMISSIONS.get(user.role, [])
    return permission in user_permissions


def require_permission(permission: Permission):
    """Decorator/dependency to require a permission"""
    def check_permission(user: User):
        if not has_permission(user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission.value}"
            )
        return user
    return check_permission

