"""AI诊断 Schema"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AIDiagnosisRequest(BaseModel):
    """AI诊断请求"""
    session_id: int
    model: Optional[str] = None


class AIDiagnosisResponse(BaseModel):
    """AI诊断响应"""
    id: int
    session_id: int
    primary_pattern: Optional[str] = None
    secondary_pattern: Optional[str] = None
    confidence_score: Optional[float] = None
    treatment_principle: Optional[str] = None
    treatment_method: Optional[str] = None
    diagnosis_basis: Optional[Any] = None
    recommended_prescription: Optional[Any] = None
    recommended_acupuncture: Optional[Any] = None
    differential_diagnosis: Optional[Any] = None
    efficacy_prediction: Optional[str] = None
    health_advice: Optional[Any] = None
    status: str = "pending"
    created_at: Optional[datetime] = None


class DiagnosisReview(BaseModel):
    """诊断审核"""
    action: str
    primary_pattern: Optional[str] = None
    secondary_pattern: Optional[str] = None
    treatment_principle: Optional[str] = None
    treatment_method: Optional[str] = None
    doctor_notes: Optional[str] = None
