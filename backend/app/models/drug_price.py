"""聚药堂中药价格模型"""

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class DrugPrice(Base):
    """中药价格表（聚药堂报价）"""
    __tablename__ = "drug_prices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True, comment="药材名称")
    spec = Column(String(100), nullable=False, comment="规格")
    price = Column(Float, default=0.0, comment="价格（元）")
    origin = Column(String(100), default="", comment="产地")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
