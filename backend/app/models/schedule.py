"""排班数据模型"""

from sqlalchemy import Column, Integer, String, Date
from app.core.database import Base


class Schedule(Base):
    """医生排班"""
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    doctor_name = Column(String(64), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    time_slot = Column(String(20), default="")  # 09:00-12:00 / 14:00-17:00
    max_patients = Column(Integer, default=20)
    location = Column(String(64), default="")
