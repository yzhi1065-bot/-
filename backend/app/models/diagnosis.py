"""诊断相关模型 - 四诊数据"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Text, JSON, ForeignKey, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class DiagnosisSession(Base):
    """诊断会话表"""
    __tablename__ = "diagnosis_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_no = Column(String(50), unique=True, nullable=False)  # 就诊号
    status = Column(String(20), default="pending")  # pending/collecting/completed
    chief_complaint = Column(Text)
    diagnosis_type = Column(String(20), default="outpatient")  # outpatient/inpatient/consultation
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    notes = Column(Text)

    # 关系
    patient = relationship("Patient", back_populates="diagnosis_sessions")
    inspection = relationship("InspectionData", back_populates="session", uselist=False)
    auscultation = relationship("AuscultationData", back_populates="session", uselist=False)
    inquiry = relationship("InquiryData", back_populates="session", uselist=False)
    palpation = relationship("PalpationData", back_populates="session", uselist=False)
    ai_result = relationship("AIDiagnosisResult", back_populates="session", uselist=False)
    prescription = relationship("Prescription", back_populates="session", uselist=False)
    treatment_plan = relationship("TreatmentPlan", back_populates="session", uselist=False)


class InspectionData(Base):
    """望诊数据表"""
    __tablename__ = "inspection_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)

    # 舌诊
    tongue_body = Column(String(200))         # 舌质
    tongue_coating = Column(String(200))      # 舌苔
    tongue_shape = Column(String(100))        # 舌形（胖大/瘦小/裂纹等）
    tongue_sublingual = Column(String(200))    # 舌下脉络
    tongue_image_path = Column(String(500))   # 舌象图片路径
    tongue_ai_analysis = Column(JSON)         # AI舌诊分析结果

    # 面诊
    complexion = Column(String(200))          # 面色
    spirit = Column(String(100))              # 神采
    facial_features = Column(JSON)            # 面部特征
    face_image_path = Column(String(500))     # 面诊图片路径

    # 形态
    body_shape = Column(String(100))          # 体型
    gait = Column(String(100))                # 步态
    posture = Column(String(100))             # 姿态

    # 其他
    nail_observation = Column(Text)           # 甲诊
    ear_observation = Column(Text)            # 耳诊
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="inspection")


class AuscultationData(Base):
    """闻诊数据表"""
    __tablename__ = "auscultation_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)

    # 声诊
    voice_quality = Column(String(100))       # 音质（清亮/低微/嘶哑等）
    voice_frequency = Column(Float)           # 语音频率
    speech_pattern = Column(String(100))      # 语态
    audio_file_path = Column(String(500))     # 录音文件路径
    audio_ai_analysis = Column(JSON)          # AI声诊分析结果

    # 气味
    breath_odor = Column(String(100))         # 口气
    body_odor = Column(String(100))           # 体味

    # 咳声
    cough_type = Column(String(100))          # 咳嗽类型
    cough_sound = Column(String(100))         # 咳声特征
    sputum = Column(String(200))              # 痰

    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="auscultation")


class InquiryData(Base):
    """问诊数据表"""
    __tablename__ = "inquiry_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)

    # 一般情况
    appetite = Column(String(100))            # 食欲
    thirst = Column(String(100))              # 口渴
    sleep = Column(String(200))               # 睡眠
    bowel = Column(String(200))               # 大便
    urine = Column(String(200))               # 小便

    # 十问歌标准化
    chills_fever = Column(String(200))        # 寒热
    sweat = Column(String(200))               # 汗
    head_body = Column(String(200))           # 头身
    chest_abdomen = Column(String(200))       # 胸腹
    hearing_vision = Column(String(100))      # 耳目
    taste_smell = Column(String(100))         # 口味

    # 女性专用
    menstruation = Column(Text)               # 月经
    leukorrhea = Column(Text)                 # 带下
    pregnancy_history = Column(Text)          # 孕产史

    # 情绪与生活习惯
    emotion = Column(String(200))             # 情志
    diet_preference = Column(String(200))     # 饮食偏好
    exercise = Column(String(100))            # 运动
    smoking = Column(String(50))
    alcohol = Column(String(50))

    # AI问诊辅助
    ai_guided_questions = Column(JSON)        # AI追问记录
    raw_data = Column(JSON)                   # 原始问诊数据

    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="inquiry")


class PalpationData(Base):
    """切诊数据表"""
    __tablename__ = "palpation_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), unique=True)

    # 脉诊
    pulse_frequency = Column(Float)           # 脉率 (次/分)
    pulse_depth = Column(String(50))          # 脉位（浮/中/沉）
    pulse_rate = Column(String(50))           # 脉数（迟/数/缓/急）
    pulse_shape = Column(String(100))         # 脉形（细/弦/滑/涩等）
    pulse_force = Column(String(50))          # 脉势（有力/无力）
    pulse_rhythm = Column(String(50))         # 节律（整齐/不齐）
    pulse_wave_url = Column(String(500))      # 脉波图URL
    pulse_ai_analysis = Column(JSON)          # AI脉诊分析结果

    # 腹诊
    abdomen_pressure = Column(String(100))    # 腹壁压力
    abdominal_tenderness = Column(Text)       # 腹部压痛
    abdominal_mass = Column(Text)             # 腹部包块

    # 穴位按压
    acupoint_tenderness = Column(JSON)        # 穴位压痛反应

    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # 关系
    session = relationship("DiagnosisSession", back_populates="palpation")
