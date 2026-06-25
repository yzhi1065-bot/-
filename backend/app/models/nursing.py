"""护理记录数据模型"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class NursingRecord(Base):
    """护理记录"""
    __tablename__ = "nursing_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True, nullable=False)
    nurse_name = Column(String(64), default="")
    type = Column(String(20), default="常规护理")  # 常规护理/专科护理/康复护理/心理护理
    content = Column(Text, default="")
    status = Column(String(20), default="待执行")  # 待执行/执行中/已完成
    created_at = Column(DateTime(timezone=True), server_default=func.now())
