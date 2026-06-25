"""护理记录API - 真实数据库操作"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.permissions import require_permissions, PATIENT_CREATE
from app.models.user import User
from app.models.nursing import NursingRecord

router = APIRouter(prefix="/api", tags=["护理记录"])


class NursingCreate(BaseModel):
    patient_id: int
    nurse_name: Optional[str] = ""
    type: Optional[str] = "常规护理"
    content: Optional[str] = ""
    status: Optional[str] = "待执行"


class NursingUpdate(BaseModel):
    nurse_name: Optional[str] = None
    type: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None


@router.get("/nursing", response_model=dict)
def list_nursing_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    query = db.query(NursingRecord)
    if patient_id:
        query = query.filter(NursingRecord.patient_id == patient_id)
    if status:
        query = query.filter(NursingRecord.status == status)

    total = query.count()
    items = query.order_by(NursingRecord.created_at.desc())\
                 .offset((page - 1) * page_size).limit(page_size).all()
    return {"code": 0, "message": "success", "data": {"items": items, "total": total}}


@router.post("/nursing", response_model=dict)
def create_nursing_record(
    data: NursingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    record = NursingRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"code": 0, "message": "护理记录已创建", "data": record}


@router.get("/nursing/{record_id}", response_model=dict)
def get_nursing_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    record = db.query(NursingRecord).filter(NursingRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, "护理记录不存在")
    return {"code": 0, "message": "success", "data": record}


@router.put("/nursing/{record_id}", response_model=dict)
def update_nursing_record(
    record_id: int,
    data: NursingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    record = db.query(NursingRecord).filter(NursingRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, "护理记录不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return {"code": 0, "message": "护理记录已更新", "data": record}


@router.delete("/nursing/{record_id}", response_model=dict)
def delete_nursing_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    record = db.query(NursingRecord).filter(NursingRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, "护理记录不存在")
    db.delete(record)
    db.commit()
    return {"code": 0, "message": "已删除"}
