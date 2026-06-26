"""RBAC 权限控制系统

角色-权限映射表 + 权限检查中间件
"""

from functools import wraps
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.core.security import get_current_user


# ═══════════════════════════════════════
# 权限定义
# ═══════════════════════════════════════

# 患者管理
PATIENT_READ = "patient:read"
PATIENT_CREATE = "patient:create"
PATIENT_UPDATE = "patient:update"
PATIENT_DELETE = "patient:delete"

# 诊断
DIAGNOSIS_READ = "diagnosis:read"
DIAGNOSIS_CREATE = "diagnosis:create"
DIAGNOSIS_UPDATE = "diagnosis:update"

# AI诊断
AI_DIAGNOSE = "ai:diagnose"
AI_CONFIG = "ai:config"

# 处方
PRESCRIPTION_READ = "prescription:read"
PRESCRIPTION_CREATE = "prescription:create"
PRESCRIPTION_UPDATE = "prescription:update"
PRESCRIPTION_DELETE = "prescription:delete"
PRESCRIPTION_REVIEW = "prescription:review"  # 药房审核

# 药房
PHARMACY_READ = "pharmacy:read"
PHARMACY_CREATE = "pharmacy:create"
PHARMACY_UPDATE = "pharmacy:update"
PHARMACY_DELETE = "pharmacy:delete"

# 收银
CHARGING_READ = "charging:read"
CHARGING_CREATE = "charging:create"
CHARGING_PAY = "charging:pay"
CHARGING_STATS = "charging:stats"

# 处方审核
PRESCRIPTION_AUDIT = "prescription:audit"
PRESCRIPTION_DISPENSE = "prescription:dispense"
PRESCRIPTION_FLOW = "prescription:flow"

# 设备
DEVICE_READ = "device:read"
DEVICE_CREATE = "device:create"
DEVICE_MANAGE = "device:manage"

# 系统
USER_READ = "user:read"
USER_CREATE = "user:create"
USER_UPDATE = "user:update"
SYSTEM_CONFIG = "system:config"
AUDIT_LOG = "audit:log"
SYSTEM_MAINTENANCE = "system:maintenance"

# 统计
STATS_READ = "stats:read"
STATS_EXPORT = "stats:export"

# 患者端
PATIENT_SELF_READ = "patient:self:read"
PATIENT_SELF_UPDATE = "patient:self:update"


# ═══════════════════════════════════════
# 角色-权限映射
# ═══════════════════════════════════════

ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        PATIENT_READ, PATIENT_CREATE, PATIENT_UPDATE, PATIENT_DELETE,
        DIAGNOSIS_READ, DIAGNOSIS_CREATE, DIAGNOSIS_UPDATE,
        AI_DIAGNOSE, AI_CONFIG,
        PRESCRIPTION_READ, PRESCRIPTION_CREATE, PRESCRIPTION_UPDATE,
        PRESCRIPTION_DELETE, PRESCRIPTION_REVIEW,
        PRESCRIPTION_AUDIT, PRESCRIPTION_DISPENSE, PRESCRIPTION_FLOW,
        PHARMACY_READ, PHARMACY_CREATE, PHARMACY_UPDATE, PHARMACY_DELETE,
        CHARGING_READ, CHARGING_CREATE, CHARGING_PAY, CHARGING_STATS,
        DEVICE_READ, DEVICE_CREATE, DEVICE_MANAGE,
        USER_READ, USER_CREATE, USER_UPDATE,
        SYSTEM_CONFIG, AUDIT_LOG, SYSTEM_MAINTENANCE,
        STATS_READ, STATS_EXPORT,
    ],
    UserRole.DOCTOR: [
        PATIENT_READ, PATIENT_CREATE, PATIENT_UPDATE,
        DIAGNOSIS_READ, DIAGNOSIS_CREATE, DIAGNOSIS_UPDATE,
        AI_DIAGNOSE,
        PRESCRIPTION_READ, PRESCRIPTION_CREATE, PRESCRIPTION_UPDATE,
        PHARMACY_READ,
        DEVICE_READ,
        STATS_READ,
    ],
    UserRole.TRAINER: [
        PATIENT_READ,
        DIAGNOSIS_READ,
        AI_DIAGNOSE, AI_CONFIG,
        STATS_READ, STATS_EXPORT,
    ],
    UserRole.PATIENT: [
        PATIENT_SELF_READ, PATIENT_SELF_UPDATE,
        DIAGNOSIS_READ,
        PRESCRIPTION_READ,
        STATS_READ,
    ],
}


# ═══════════════════════════════════════
# 权限检查依赖
# ═══════════════════════════════════════

class PermissionDenied(HTTPException):
    def __init__(self, permission: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"权限不足: 需要 [{permission}]"
        )


def require_permissions(*permissions: str):
    """权限检查中间件

    用法:
        @router.get("/patients")
        def list_patients(
            db: Session = Depends(get_db),
            user: User = Depends(require_permissions(PATIENT_READ)),
        ):
            ...

    多个权限为 OR 关系（满足任一即可）
    """
    async def permission_dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        user_role = UserRole(current_user.role) if current_user.role else UserRole.DOCTOR
        user_perms = ROLE_PERMISSIONS.get(user_role, [])

        # admin 拥有全部权限
        if user_role == UserRole.ADMIN:
            return current_user

        for required in permissions:
            if required in user_perms:
                return current_user

        raise PermissionDenied(permissions[0])

    return permission_dependency


def has_permission(user: User, permission: str) -> bool:
    """检查用户是否有某个权限"""
    user_role = UserRole(user.role) if user.role else UserRole.DOCTOR
    if user_role == UserRole.ADMIN:
        return True
    return permission in ROLE_PERMISSIONS.get(user_role, [])
