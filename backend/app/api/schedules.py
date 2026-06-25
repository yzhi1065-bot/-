"""排班管理API - 真实数据库操作"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from pydantic import BaseModel
from app.core.database import get_db
from app.core.permissions import require_permissions, PATIENT_CREATE
from app.models.user import User
from app.models.schedule import Schedule

router = APIRouter(prefix="/api", tags=["排班管理"])


class ScheduleCreate(BaseModel):
    doctor_name: str
    date: date
    time_slot: Optional[str] = ""
    max_patients: Optional[int] = 20
    location: Optional[str] = ""


class ScheduleUpdate(BaseModel):
    doctor_name: Optional[str] = None
    date: Optional[date] = None
    time_slot: Optional[str] = None
    max_patients: Optional[int] = None
    location: Optional[str] = None


@router.get("/schedules", response_model=None)
def list_schedules(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    doctor_name: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    query = db.query(Schedule)
    if doctor_name:
        query = query.filter(Schedule.doctor_name.contains(doctor_name))
    if date_from:
        query = query.filter(Schedule.date >= date_from)
    if date_to:
        query = query.filter(Schedule.date <= date_to)

    total = query.count()
    items = query.order_by(Schedule.date.desc(), Schedule.time_slot.asc())\
                 .offset((page - 1) * page_size).limit(page_size).all()
    return {"code": 0, "message": "success", "data": {"items": items, "total": total}}


@router.post("/schedules", response_model=None)
def create_schedule(
    data: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    schedule = Schedule(**data.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return {"code": 0, "message": "排班已创建", "data": schedule}


@router.get("/schedules/{schedule_id}", response_model=None)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(404, "排班记录不存在")
    return {"code": 0, "message": "success", "data": schedule}


@router.put("/schedules/{schedule_id}", response_model=None)
def update_schedule(
    schedule_id: int,
    data: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(404, "排班记录不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(schedule, key, value)
    db.commit()
    db.refresh(schedule)
    return {"code": 0, "message": "排班已更新", "data": schedule}


@router.delete("/schedules/{schedule_id}", response_model=None)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(404, "排班记录不存在")
    db.delete(schedule)
    db.commit()
    return {"code": 0, "message": "已删除"}
