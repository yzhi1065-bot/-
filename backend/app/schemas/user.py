"""用户 Schema"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """创建用户"""
    username: str
    password: str
    real_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str = "doctor"
    title: Optional[str] = None
    department: Optional[str] = None
    hospital: Optional[str] = None
    license_no: Optional[str] = None


class UserLogin(BaseModel):
    """用户登录"""
    username: str
    password: str


class UserResponse(BaseModel):
    """用户信息响应"""
    id: int
    username: str
    real_name: str
    phone: Optional[str]
    email: Optional[str]
    role: str
    title: Optional[str]
    department: Optional[str]
    hospital: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
