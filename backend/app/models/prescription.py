"""处方和治疗方案模型"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Text, JSON, Float, ForeignKey, Date
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class PrescriptionStatus(str, enum.Enum):
    DRAFT = "draft"                 # 草稿
    PENDING_AUDIT = "pending_audit"  # 待审核
    APPROVED = "approved"           # 审核通过
    REJECTED = "rejected"           # 审核驳回
    PAID = "paid"                   # 已收费
    DISPENSING = "dispensing"       # 发药中
    DISPENSED = "dispensed"         # 已发药


class Prescription(Base):
    """处方表"""
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)
    prescription_no = Column(String(50), unique=True)

    # 处方信息
    name = Column(String(200))                 # 方剂名称
    principle = Column(String(200))            # 治则
    method = Column(String(200))               # 治法
    dosage_form = Column(String(50))           # 剂型（汤剂/丸剂/散剂等）
    decoction_method = Column(String(200))     # 煎法
    administration = Column(String(200))       # 用法
    total_days = Column(Integer)               # 总天数
    daily_doses = Column(Integer, default=1)   # 每日剂量

    # 状态流转 (draft → pending_audit → approved/rejected → paid → dispensing → dispensed)
    status = Column(String(20), default=PrescriptionStatus.DRAFT.value)
    doctor_signature = Column(String(100))
    signed_at = Column(DateTime)

    # 审核信息
    audit_by = Column(Integer, ForeignKey("users.id"))
    audit_at = Column(DateTime)
    audit_comment = Column(Text)

    # 收费信息
    paid_at = Column(DateTime)

    # 发药信息
    dispensed_at = Column(DateTime)

    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="prescription")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionItem(Base):
    """处方明细表"""
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"))
    herb_name = Column(String(100), nullable=False)   # 药名
    dosage = Column(String(50))                       # 剂量
    unit = Column(String(20), default="克")           # 单位
    special_preparation = Column(String(100))         # 特殊煎法（先煎/后下/包煎等）
    notes = Column(Text)                              # 备注
    sort_order = Column(Integer, default=0)           # 排序

    # 关系
    prescription = relationship("Prescription", back_populates="items")


class TreatmentPlan(Base):
    """治疗方案表（非药物）"""
    __tablename__ = "treatment_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)

    # 针灸方案
    acupuncture_points = Column(JSON)         # 穴位配伍
    acupuncture_method = Column(Text)         # 针法
    moxibustion_method = Column(Text)         # 灸法
    acupuncture_frequency = Column(String(100))  # 治疗频率
    acupuncture_course = Column(String(100))     # 疗程

    # 外治法
    cupping = Column(Text)                    # 拔罐
    scraping = Column(Text)                   # 刮痧
    tuina = Column(Text)                      # 推拿
    other_external = Column(Text)             # 其他外治

    # 生活指导
    diet_advice = Column(Text)                # 饮食建议
    exercise_advice = Column(Text)            # 运动建议
    emotional_advice = Column(Text)           # 情志调节
    daily_routine = Column(Text)             # 作息建议
    health_tips = Column(Text)               # 养生建议

    # 随访
    follow_up_date = Column(Date)
    follow_up_notes = Column(Text)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="treatment_plan")
