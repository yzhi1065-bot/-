"""诊断 Schema"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class InspectionDataCreate(BaseModel):
    """望诊数据"""
    tongue_body: Optional[str] = None
    tongue_coating: Optional[str] = None
    tongue_shape: Optional[str] = None
    tongue_sublingual: Optional[str] = None
    complexion: Optional[str] = None
    spirit: Optional[str] = None
    body_shape: Optional[str] = None
    gait: Optional[str] = None
    notes: Optional[str] = None


class AuscultationDataCreate(BaseModel):
    """闻诊数据"""
    voice_quality: Optional[str] = None
    speech_pattern: Optional[str] = None
    breath_odor: Optional[str] = None
    body_odor: Optional[str] = None
    cough_type: Optional[str] = None
    sputum: Optional[str] = None
    notes: Optional[str] = None


class InquiryDataCreate(BaseModel):
    """问诊数据"""
    appetite: Optional[str] = None
    thirst: Optional[str] = None
    sleep: Optional[str] = None
    bowel: Optional[str] = None
    urine: Optional[str] = None
    chills_fever: Optional[str] = None
    sweat: Optional[str] = None
    head_body: Optional[str] = None
    chest_abdomen: Optional[str] = None
    emotion: Optional[str] = None
    menstruation: Optional[str] = None
    notes: Optional[str] = None


class PalpationDataCreate(BaseModel):
    """切诊数据"""
    pulse_frequency: Optional[float] = None
    pulse_depth: Optional[str] = None
    pulse_rate: Optional[str] = None
    pulse_shape: Optional[str] = None
    pulse_force: Optional[str] = None
    pulse_rhythm: Optional[str] = None
    abdomen_pressure: Optional[str] = None
    notes: Optional[str] = None


class DiagnosisSessionCreate(BaseModel):
    """创建诊断会话"""
    patient_id: int
    chief_complaint: Optional[str] = None


class DiagnosisSessionResponse(BaseModel):
    """诊断会话响应"""
    id: int
    patient_id: int
    session_no: str
    status: str
    chief_complaint: Optional[str]
    created_at: datetime
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True
