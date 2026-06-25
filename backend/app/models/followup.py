"""患者随访数据模型"""

from sqlalchemy import Column, Integer, String, DateTime, Date, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class Followup(Base):
    """患者随访记录"""
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True, nullable=False)
    patient_name = Column(String(64), default="")
    session_id = Column(Integer, index=True)
    followup_date = Column(Date, nullable=False)
    followup_type = Column(String(20), default="电话")  # 电话/上门/复诊/在线
    status = Column(String(20), default="待随访")       # 待随访/已完成/已取消
    content = Column(Text, default="")
    result = Column(Text, default="")
    satisfaction = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
