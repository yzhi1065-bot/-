"""患者 Schema"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class PatientCreate(BaseModel):
    """新建患者"""
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    birth_date: Optional[date] = None
    phone: Optional[str] = None
    id_card: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    chief_complaint: Optional[str] = None
    present_illness: Optional[str] = None
    past_illness: Optional[str] = None
    family_history: Optional[str] = None


class PatientUpdate(BaseModel):
    """更新患者信息"""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    chief_complaint: Optional[str] = None


class PatientResponse(BaseModel):
    """患者信息响应"""
    id: int
    name: str
    gender: Optional[str]
    age: Optional[int]
    phone: Optional[str]
    address: Optional[str]
    blood_type: Optional[str]
    height: Optional[int]
    weight: Optional[int]
    chief_complaint: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PatientDetailResponse(PatientResponse):
    """患者详细信息"""
    birth_date: Optional[date]
    id_card: Optional[str]
    occupation: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    present_illness: Optional[str]
    past_illness: Optional[str]
    family_history: Optional[str]
    constitution_type: Optional[str]
    updated_at: Optional[datetime]
