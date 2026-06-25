"""用户模型"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    DOCTOR = "doctor"        # 医生
    PATIENT = "patient"      # 患者
    ADMIN = "admin"          # 管理员
    TRAINER = "trainer"      # AI训练师


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    real_name = Column(String(50), nullable=False)
    phone = Column(String(20))
    email = Column(String(100))
    role = Column(String(20), default=UserRole.DOCTOR.value)
    title = Column(String(50))            # 职称
    department = Column(String(100))       # 科室
    hospital = Column(String(200))         # 医院
    license_no = Column(String(50))        # 执业证号
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
