"""预约挂号数据模型"""

from sqlalchemy import Column, Integer, String, DateTime, Date, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"      # 待就诊
    ONGOING = "ongoing"      # 就诊中
    COMPLETED = "completed"  # 已完成
    CANCELLED = "cancelled"  # 已取消

class VisitType(str, enum.Enum):
    FIRST = "初诊"
    FOLLOWUP = "复诊"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(64), nullable=False)
    patient_phone = Column(String(20), default="")
    doctor = Column(String(64), default="")
    department = Column(String(64), default="")
    appointment_date = Column(Date, nullable=False)
    time_slot = Column(String(20), default="")       # 09:00-09:30
    visit_type = Column(String(10), default=VisitType.FIRST.value)
    status = Column(String(20), default=AppointmentStatus.PENDING.value)
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
