"""药品管理数据模型 - 含中药特性字段"""

from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, Text, JSON,
    ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class DrugCategory(Base):
    """药品分类表"""
    __tablename__ = "drug_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    drugs = relationship("Drug", back_populates="category_rel")


class Drug(Base):
    """药品信息表"""
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    pinyin = Column(String(100))

    # 分类
    category_id = Column(Integer, ForeignKey("drug_categories.id"))
    category_name = Column(String(50))  # 冗余，方便查询

    # 中药特有字段
    property_taste = Column(String(100))       # 性味（辛甘苦寒温等）
    meridian = Column(String(100))             # 归经
    effect = Column(Text)                      # 功效
    dosage = Column(String(50))                # 常用剂量
    contraindication = Column(Text)            # 禁忌

    # 通用字段
    common_dosage = Column(String(50))
    unit = Column(String(20), default="克")
    barcode = Column(String(100), unique=True)
    purchase_price = Column(Float, default=0)
    selling_price = Column(Float, default=0)
    stock = Column(Integer, default=0)
    stock_alert = Column(Integer, default=10)
    manufacturer = Column(String(200))
    approval_number = Column(String(100))
    efficacy = Column(Text)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    category_rel = relationship("DrugCategory", back_populates="drugs")


class Supplier(Base):
    """供应商表"""
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(50))
    phone = Column(String(20))
    address = Column(String(200))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class Purchase(Base):
    """进货记录表"""
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    purchase_date = Column(Date, nullable=False)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    drug_name = Column(String(100))
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20))
    purchase_price = Column(Float)
    selling_price = Column(Float)
    total_amount = Column(Float)
    supplier = Column(String(200))
    manufacturer = Column(String(200))
    batch_no = Column(String(100))
    approval_number = Column(String(100))
    expiry_date = Column(Date)
    expiry_reminder = Column(Boolean, default=True)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    drug = relationship("Drug", backref="purchases")


class Sale(Base):
    """销售记录表"""
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sale_date = Column(Date, nullable=False)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    drug_name = Column(String(100))
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20))
    purchase_price = Column(Float)
    selling_price = Column(Float)
    total_amount = Column(Float)
    profit = Column(Float)
    patient_name = Column(String(50))
    doctor_name = Column(String(50))
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"))
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    drug = relationship("Drug", backref="sales")
