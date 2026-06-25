"""患者管理接口"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PATIENT_READ, PATIENT_CREATE, PATIENT_UPDATE
from app.models.user import User
from app.models.patient import Patient
from app.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse, PatientDetailResponse,
)
from app.schemas.common import Response, PaginatedResponse

router = APIRouter(prefix="/api/patients", tags=["患者管理"])


@router.get("", response_model=Response[PaginatedResponse[PatientResponse]])
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_READ)),
):
    """获取患者列表"""
    query = db.query(Patient)
    if keyword:
        query = query.filter(
            Patient.name.ilike(f"%{keyword}%")
            | Patient.phone.ilike(f"%{keyword}%")
        )
    total = query.count()
    patients = query.order_by(Patient.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    items = [PatientResponse.model_validate(p) for p in patients]
    return Response(data=PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    ))


@router.post("", response_model=Response[PatientResponse])
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_CREATE)),
):
    """新建患者"""
    print(f"收到创建患者请求: {patient.model_dump()}")
    db_patient = Patient(**patient.model_dump(exclude_unset=True))
    db_patient.created_by = current_user.id
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return Response(data=PatientResponse.model_validate(db_patient))


@router.get("/{patient_id}", response_model=Response[PatientDetailResponse])
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_READ)),
):
    """获取患者详细信息"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    constitution_type = None
    if patient.constitutional:
        constitution_type = patient.constitutional.constitution_type

    data = PatientDetailResponse(
        **PatientResponse.model_validate(patient).model_dump(),
        birth_date=patient.birth_date,
        id_card=patient.id_card,
        occupation=patient.occupation,
        emergency_contact=patient.emergency_contact,
        emergency_phone=patient.emergency_phone,
        present_illness=patient.present_illness,
        past_illness=patient.past_illness,
        family_history=patient.family_history,
        constitution_type=constitution_type,
        updated_at=patient.updated_at,
    )
    return Response(data=data)


@router.put("/{patient_id}", response_model=Response[PatientResponse])
def update_patient(
    patient_id: int,
    patient_update: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PATIENT_UPDATE)),
):
    """更新患者信息"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    for key, value in patient_update.model_dump(exclude_unset=True).items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return Response(data=PatientResponse.model_validate(patient))
