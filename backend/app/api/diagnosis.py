"""四诊采集接口"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, DIAGNOSIS_READ, DIAGNOSIS_CREATE, DIAGNOSIS_UPDATE
from app.models.user import User
from app.models.patient import Patient
from app.models.diagnosis import (
    DiagnosisSession, InspectionData, AuscultationData,
    InquiryData, PalpationData,
)
from app.schemas.diagnosis import (
    DiagnosisSessionCreate, DiagnosisSessionResponse,
    InspectionDataCreate, AuscultationDataCreate,
    InquiryDataCreate, PalpationDataCreate,
)
from app.schemas.common import Response

router = APIRouter(prefix="/api/diagnosis", tags=["四诊采集"])


def generate_session_no(patient_id: int) -> str:
    """生成就诊号"""
    from datetime import datetime
    now = datetime.now()
    return f"TCM{now.strftime('%Y%m%d%H%M%S')}{patient_id:04d}"


@router.post("/sessions", response_model=Response[DiagnosisSessionResponse])
def create_session(
    session_data: DiagnosisSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_CREATE)),
):
    """创建诊断会话"""
    patient = db.query(Patient).filter(Patient.id == session_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    db_session = DiagnosisSession(
        patient_id=session_data.patient_id,
        doctor_id=current_user.id,
        session_no=generate_session_no(session_data.patient_id),
        chief_complaint=session_data.chief_complaint,
        status="collecting",
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return Response(data=DiagnosisSessionResponse(
        id=db_session.id,
        patient_id=db_session.patient_id,
        session_no=db_session.session_no,
        status=db_session.status,
        chief_complaint=db_session.chief_complaint,
        created_at=db_session.created_at,
        patient_name=patient.name,
    ))


@router.get("/sessions/{session_id}", response_model=Response)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_READ)),
):
    """获取诊断会话详情（含四诊数据）"""
    session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    def to_dict(obj):
        if not obj:
            return None
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    return Response(data={
        "session": to_dict(session),
        "inspection": to_dict(session.inspection),
        "auscultation": to_dict(session.auscultation),
        "inquiry": to_dict(session.inquiry),
        "palpation": to_dict(session.palpation),
    })


@router.get("/patients/{patient_id}/sessions", response_model=Response)
def get_patient_sessions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_READ)),
):
    """获取患者的所有诊断会话（含AI诊断结果）"""
    sessions = db.query(DiagnosisSession).filter(
        DiagnosisSession.patient_id == patient_id
    ).order_by(DiagnosisSession.created_at.desc()).all()

    result = []
    for s in sessions:
        item = {
            "id": s.id,
            "session_no": s.session_no,
            "status": s.status,
            "chief_complaint": s.chief_complaint,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            "doctor_id": s.doctor_id,
        }
        # 添加AI诊断结果摘要
        if s.ai_result:
            item["ai_result"] = {
                "id": s.ai_result.id,
                "primary_pattern": s.ai_result.primary_pattern,
                "secondary_pattern": s.ai_result.secondary_pattern,
                "confidence_score": s.ai_result.confidence_score,
                "status": s.ai_result.status,
            }
        # 添加处方摘要
        if s.prescription:
            item["prescription"] = {
                "id": s.prescription.id,
                "name": s.prescription.name,
                "total_days": s.prescription.total_days,
                "status": s.prescription.status,
            }
        result.append(item)

    return Response(data=result)


@router.post("/sessions/{session_id}/inspection", response_model=Response)
def save_inspection(
    session_id: int,
    data: InspectionDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_CREATE)),
):
    """保存望诊数据"""
    session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    inspection = db.query(InspectionData).filter(
        InspectionData.session_id == session_id
    ).first()
    if inspection:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(inspection, key, value)
    else:
        inspection = InspectionData(session_id=session_id, **data.model_dump(exclude_unset=True))
        db.add(inspection)
    db.commit()
    return Response(message="望诊数据保存成功")


@router.post("/sessions/{session_id}/auscultation", response_model=Response)
def save_auscultation(
    session_id: int,
    data: AuscultationDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_CREATE)),
):
    """保存闻诊数据"""
    session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    auscultation = db.query(AuscultationData).filter(
        AuscultationData.session_id == session_id
    ).first()
    if auscultation:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(auscultation, key, value)
    else:
        auscultation = AuscultationData(session_id=session_id, **data.model_dump(exclude_unset=True))
        db.add(auscultation)
    db.commit()
    return Response(message="闻诊数据保存成功")


@router.post("/sessions/{session_id}/inquiry", response_model=Response)
def save_inquiry(
    session_id: int,
    data: InquiryDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_CREATE)),
):
    """保存问诊数据"""
    session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    inquiry = db.query(InquiryData).filter(
        InquiryData.session_id == session_id
    ).first()
    if inquiry:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(inquiry, key, value)
    else:
        inquiry = InquiryData(session_id=session_id, **data.model_dump(exclude_unset=True))
        db.add(inquiry)
    db.commit()
    return Response(message="问诊数据保存成功")


@router.post("/sessions/{session_id}/palpation", response_model=Response)
def save_palpation(
    session_id: int,
    data: PalpationDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_CREATE)),
):
    """保存切诊数据"""
    session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    palpation = db.query(PalpationData).filter(
        PalpationData.session_id == session_id
    ).first()
    if palpation:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(palpation, key, value)
    else:
        palpation = PalpationData(session_id=session_id, **data.model_dump(exclude_unset=True))
        db.add(palpation)
    db.commit()
    return Response(message="切诊数据保存成功")


@router.post("/sessions/{session_id}/complete", response_model=Response)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DIAGNOSIS_UPDATE)),
):
    """完成采集，进入诊断阶段"""
    session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")
    session.status = "completed"
    from datetime import datetime
    session.completed_at = datetime.now()
    db.commit()
    return Response(message="采集完成")
