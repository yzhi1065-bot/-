"""随访管理API - 真实数据库操作"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from app.core.database import get_db
from app.core.permissions import require_permissions, PATIENT_CREATE
from app.models.user import User
from app.models.followup import Followup

router = APIRouter(prefix="/api", tags=["随访管理"])


class FollowupCreate(BaseModel):
    patient_id: int
    patient_name: Optional[str] = ""
    session_id: Optional[int] = None
    followup_date: date
    followup_type: Optional[str] = "电话"
    content: Optional[str] = ""
    result: Optional[str] = ""
    satisfaction: Optional[int] = 0


class FollowupUpdate(BaseModel):
    status: Optional[str] = None
    content: Optional[str] = None
    result: Optional[str] = None
    satisfaction: Optional[int] = None


@router.get("/followups", response_model=dict)
def list_followups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    patient_id: Optional[int] = None,
    keyword: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    query = db.query(Followup)
    if status:
        query = query.filter(Followup.status == status)
    if patient_id:
        query = query.filter(Followup.patient_id == patient_id)
    if keyword:
        query = query.filter(
            Followup.patient_name.contains(keyword)
        )
    if date_from:
        query = query.filter(Followup.followup_date >= date_from)
    if date_to:
        query = query.filter(Followup.followup_date <= date_to)

    total = query.count()
    items = query.order_by(Followup.followup_date.desc())\
                 .offset((page - 1) * page_size).limit(page_size).all()
    return {"code": 0, "message": "success", "data": {"items": items, "total": total}}


@router.post("/followups", response_model=dict)
def create_followup(
    data: FollowupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    followup = Followup(**data.model_dump())
    db.add(followup)
    db.commit()
    db.refresh(followup)
    return {"code": 0, "message": "随访记录已创建", "data": followup}


@router.get("/followups/{followup_id}", response_model=dict)
def get_followup(
    followup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()
    if not followup:
        raise HTTPException(404, "随访记录不存在")
    return {"code": 0, "message": "success", "data": followup}


@router.put("/followups/{followup_id}", response_model=dict)
def update_followup(
    followup_id: int,
    data: FollowupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()
    if not followup:
        raise HTTPException(404, "随访记录不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(followup, key, value)
    db.commit()
    db.refresh(followup)
    return {"code": 0, "message": "随访记录已更新", "data": followup}


@router.delete("/followups/{followup_id}", response_model=dict)
def delete_followup(
    followup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()
    if not followup:
        raise HTTPException(404, "随访记录不存在")
    db.delete(followup)
    db.commit()
    return {"code": 0, "message": "已删除"}


@router.post("/followups/{followup_id}/status", response_model=dict)
def update_followup_status(
    followup_id: int,
    status: str = Query(..., description="目标状态: 待随访/已完成/已取消"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()
    if not followup:
        raise HTTPException(404, "随访记录不存在")
    followup.status = status
    db.commit()
    return {"code": 0, "message": f"状态已更新为 {status}"}
