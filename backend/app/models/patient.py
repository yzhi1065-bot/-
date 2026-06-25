"""患者模型"""

from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Text, JSON, Float,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class BloodType(str, enum.Enum):
    A = "A"
    B = "B"
    AB = "AB"
    O = "O"


class BodyConstitutionType(str, enum.Enum):
    """中医九种体质"""
    LEVEL = "平和质"
    QI_XU = "气虚质"
    YANG_XU = "阳虚质"
    YIN_XU = "阴虚质"
    TAN_SHI = "痰湿质"
    SHI_RE = "湿热质"
    XUE_YU = "血瘀质"
    QI_YU = "气郁质"
    TE_BING = "特禀质"


class Patient(Base):
    """患者表"""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), nullable=False, index=True)
    gender = Column(String(10))
    birth_date = Column(Date)
    age = Column(Integer)
    phone = Column(String(20))
    id_card = Column(String(18))          # 身份证号（加密存储）
    address = Column(String(200))
    occupation = Column(String(50))
    emergency_contact = Column(String(50))
    emergency_phone = Column(String(20))
    blood_type = Column(String(5))
    height = Column(Integer)              # cm
    weight = Column(Integer)              # kg
    bmi = Column(Float)                   # BMI
    chief_complaint = Column(Text)        # 主诉
    present_illness = Column(Text)        # 现病史
    past_illness = Column(Text)           # 既往史
    family_history = Column(Text)         # 家族史
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # 关系
    diagnosis_sessions = relationship("DiagnosisSession", back_populates="patient")
    constitutional = relationship("PatientBodyConstitution", back_populates="patient", uselist=False)
    medical_histories = relationship("MedicalHistory", back_populates="patient")
    allergies = relationship("Allergy", back_populates="patient")


class PatientBodyConstitution(Base):
    """患者体质表"""
    __tablename__ = "patient_body_constitutions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), unique=True)
    constitution_type = Column(String(20), nullable=False)  # 九种体质
    score = Column(Integer)                                  # 分值
    assessed_at = Column(DateTime, server_default=func.now())
    notes = Column(Text)

    # 关系
    patient = relationship("Patient", back_populates="constitutional")


class MedicalHistory(Base):
    """既往病史表"""
    __tablename__ = "medical_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    disease_name = Column(String(100), nullable=False)
    diagnosed_at = Column(Date)
    status = Column(String(20))           # 已愈/治疗中/未治疗
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    patient = relationship("Patient", back_populates="medical_histories")


class Allergy(Base):
    """过敏史表"""
    __tablename__ = "allergies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    allergen = Column(String(100), nullable=False)  # 过敏原
    reaction = Column(String(200))                   # 反应
    severity = Column(String(20))                    # 轻度/中度/重度
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    patient = relationship("Patient", back_populates="allergies")
