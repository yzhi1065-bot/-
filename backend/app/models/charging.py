"""收银结算模型"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Float, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ChargeStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    WECHAT = "wechat"
    ALIPAY = "alipay"
    INSURANCE = "insurance"


class Charge(Base):
    """收费总表"""
    __tablename__ = "charges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    patient_name = Column(String(50), nullable=False)
    total_amount = Column(Float, default=0.0)
    insurance_amount = Column(Float, default=0.0)
    self_pay_amount = Column(Float, default=0.0)
    status = Column(String(20), default=ChargeStatus.UNPAID.value)
    payment_method = Column(String(20))
    paid_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    session = relationship("DiagnosisSession")
    items = relationship("ChargeItem", back_populates="charge", cascade="all, delete-orphan")


class ChargeItem(Base):
    """收费明细表"""
    __tablename__ = "charge_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    charge_id = Column(Integer, ForeignKey("charges.id"), nullable=False)
    item_type = Column(String(30), default="other")  # registration/diagnosis/prescription/other
    item_name = Column(String(200), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    amount = Column(Float, default=0.0)

    # 关系
    charge = relationship("Charge", back_populates="items")
