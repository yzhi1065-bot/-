"""AI诊断结果模型"""

from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class AIDiagnosisResult(Base):
    """AI诊断结果表"""
    __tablename__ = "ai_diagnosis_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)

    # 诊断概览
    primary_pattern = Column(String(100))         # 主证
    secondary_pattern = Column(String(100))       # 兼证
    confidence_score = Column(Float)              # 置信度 0-1
    ai_model_version = Column(String(50))         # 模型版本

    # 辨证依据
    diagnosis_basis = Column(JSON)                # 辨证依据 structured

    # 治则治法
    treatment_principle = Column(Text)            # 治则
    treatment_method = Column(Text)               # 治法

    # AI补充建议
    recommended_prescription = Column(JSON)       # 推荐方剂
    recommended_acupuncture = Column(JSON)        # 推荐针灸
    differential_diagnosis = Column(JSON)         # 鉴别诊断
    western_medicine_ref = Column(Text)           # 西医参考
    health_advice = Column(JSON)                  # 健康建议

    # 疗效预测
    efficacy_prediction = Column(Text)            # 疗效预测
    similar_cases = Column(JSON)                  # 相似病例参考

    # 状态
    status = Column(String(20), default="pending")
    # pending - 等待审核
    # approved - 已通过
    # rejected - 已驳回
    # modified - 已修改

    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    doctor_notes = Column(Text)

    raw_llm_response = Column(JSON)               # LLM原始输出
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="ai_result")
