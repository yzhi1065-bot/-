"""处方 Schema"""

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, date


class PrescriptionItemCreate(BaseModel):
    """处方明细"""
    herb_name: str
    dosage: Optional[str] = None
    unit: str = "克"
    special_preparation: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0


class PrescriptionCreate(BaseModel):
    """创建处方"""
    session_id: int
    name: str
    principle: Optional[str] = None
    method: Optional[str] = None
    dosage_form: str = "汤剂"
    decoction_method: Optional[str] = None
    administration: Optional[str] = None
    total_days: int = 7
    daily_doses: int = 1
    items: List[PrescriptionItemCreate]


class TreatmentPlanCreate(BaseModel):
    """创建治疗方案"""
    session_id: int
    # 针灸方案
    acupuncture_points: Optional[Any] = None
    acupuncture_method: Optional[str] = None
    moxibustion_method: Optional[str] = None
    acupuncture_frequency: Optional[str] = None
    acupuncture_course: Optional[str] = None
    # 外治法
    cupping: Optional[str] = None
    scraping: Optional[str] = None
    tuina: Optional[str] = None
    other_external: Optional[str] = None
    # 生活指导
    diet_advice: Optional[str] = None
    exercise_advice: Optional[str] = None
    emotional_advice: Optional[str] = None
    daily_routine: Optional[str] = None
    health_tips: Optional[str] = None
    # 随访
    follow_up_date: Optional[date] = None


class PrescriptionResponse(BaseModel):
    """处方响应"""
    id: int
    session_id: int
    name: str
    status: str
    total_days: int
    created_at: datetime
    items: Optional[List[PrescriptionItemCreate]] = None

    class Config:
        from_attributes = True
