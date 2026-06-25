"""预约挂号API - 真实数据库操作"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PATIENT_CREATE
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus

router = APIRouter(prefix="/api", tags=["预约挂号"])


class AppointmentCreate(BaseModel):
    patient_name: str
    patient_phone: Optional[str] = ""
    doctor: Optional[str] = ""
    department: Optional[str] = ""
    appointment_date: date
    time_slot: Optional[str] = ""
    visit_type: Optional[str] = "初诊"
    notes: Optional[str] = ""


class AppointmentOut(BaseModel):
    id: int
    patient_name: str
    patient_phone: str
    doctor: str
    department: str
    appointment_date: date
    time_slot: str
    visit_type: str
    status: str
    notes: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentListOut(BaseModel):
    items: List[AppointmentOut]
    total: int


@router.get("/appointments", response_model=None)
def list_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    query = db.query(Appointment)
    if status:
        query = query.filter(Appointment.status == status)
    if keyword:
        query = query.filter(
            or_(
                Appointment.patient_name.contains(keyword),
                Appointment.patient_phone.contains(keyword),
            )
        )
    if date_from:
        query = query.filter(Appointment.appointment_date >= date_from)
    if date_to:
        query = query.filter(Appointment.appointment_date <= date_to)

    total = query.count()
    items = query.order_by(Appointment.appointment_date.desc(), Appointment.time_slot.asc())\
                 .offset((page - 1) * page_size).limit(page_size).all()
    return {"code": 0, "message": "success", "data": {"items": items, "total": total}}


@router.post("/appointments", response_model=None)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    appt = Appointment(**data.model_dump())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return {"code": 0, "message": "预约成功", "data": appt}


@router.post("/appointments/{appointment_id}/cancel", response_model=None)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(404, "预约不存在")
    appt.status = AppointmentStatus.CANCELLED.value
    db.commit()
    return {"code": 0, "message": "已取消"}


@router.post("/appointments/{appointment_id}/complete", response_model=None)
def complete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(404, "预约不存在")
    appt.status = AppointmentStatus.COMPLETED.value
    db.commit()
    return {"code": 0, "message": "已完成"}
