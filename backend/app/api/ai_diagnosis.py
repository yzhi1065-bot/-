"""AI诊断接口"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, AI_DIAGNOSE
from app.models.user import User
from app.models.diagnosis import DiagnosisSession
from app.models.ai_result import AIDiagnosisResult
from app.schemas.ai_diagnosis import AIDiagnosisRequest, AIDiagnosisResponse, DiagnosisReview
from app.schemas.common import Response
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai-diagnosis", tags=["AI诊断"])


@router.post("/diagnose", response_model=Response[AIDiagnosisResponse])
async def run_diagnosis(
    request: AIDiagnosisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(AI_DIAGNOSE)),
):
    """执行AI诊断"""
    session = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == request.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    # 收集四诊数据
    diagnosis_data = {
        "patient": {"name": session.patient.name, "age": session.patient.age,
                     "gender": session.patient.gender},
        "chief_complaint": session.chief_complaint,
    }

    if session.inspection:
        diagnosis_data["inspection"] = {
            "tongue_body": session.inspection.tongue_body,
            "tongue_coating": session.inspection.tongue_coating,
            "tongue_shape": session.inspection.tongue_shape,
            "complexion": session.inspection.complexion,
            "body_shape": session.inspection.body_shape,
        }
    if session.auscultation:
        diagnosis_data["auscultation"] = {
            "voice_quality": session.auscultation.voice_quality,
            "speech_pattern": session.auscultation.speech_pattern,
            "breath_odor": session.auscultation.breath_odor,
            "cough_type": session.auscultation.cough_type,
        }
    if session.inquiry:
        diagnosis_data["inquiry"] = {
            "chills_fever": session.inquiry.chills_fever,
            "sweat": session.inquiry.sweat,
            "head_body": session.inquiry.head_body,
            "appetite": session.inquiry.appetite,
            "sleep": session.inquiry.sleep,
            "bowel": session.inquiry.bowel,
            "urine": session.inquiry.urine,
            "emotion": session.inquiry.emotion,
        }
    if session.palpation:
        diagnosis_data["palpation"] = {
            "pulse_depth": session.palpation.pulse_depth,
            "pulse_rate": session.palpation.pulse_rate,
            "pulse_shape": session.palpation.pulse_shape,
            "pulse_force": session.palpation.pulse_force,
            "pulse_frequency": session.palpation.pulse_frequency,
            "pulse_rhythm": session.palpation.pulse_rhythm,
        }

    # 如果已有诊断结果，先删除（支持重新生成）
    existing = db.query(AIDiagnosisResult).filter(
        AIDiagnosisResult.session_id == request.session_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    # 调用AI服务
    ai_service = AIService()
    try:
        result = await ai_service.diagnose(diagnosis_data)
        print(f"AI诊断结果: primary_pattern={result.get('primary_pattern')}")
    except Exception as e:
        print(f"AI诊断服务出错: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI诊断服务出错: {str(e)}")

    # 保存结果
    try:
        ai_result = AIDiagnosisResult(
            session_id=request.session_id,
            primary_pattern=result.get("primary_pattern"),
            secondary_pattern=result.get("secondary_pattern"),
            confidence_score=result.get("confidence_score"),
            diagnosis_basis=result.get("diagnosis_basis"),
            treatment_principle=result.get("treatment_principle"),
            treatment_method=result.get("treatment_method"),
            recommended_prescription=result.get("recommended_prescription"),
            recommended_acupuncture=result.get("recommended_acupuncture"),
            differential_diagnosis=result.get("differential_diagnosis"),
            efficacy_prediction=result.get("efficacy_prediction"),
            health_advice=result.get("health_advice"),
            raw_llm_response=result,
            status="pending",
        )
        db.add(ai_result)
        db.commit()
        db.refresh(ai_result)
    except Exception as e:
        print(f"保存AI诊断结果出错: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"保存诊断结果出错: {str(e)}")

    return Response(data=AIDiagnosisResponse(
        id=ai_result.id,
        session_id=ai_result.session_id,
        primary_pattern=ai_result.primary_pattern,
        secondary_pattern=ai_result.secondary_pattern,
        confidence_score=ai_result.confidence_score,
        treatment_principle=ai_result.treatment_principle,
        treatment_method=ai_result.treatment_method,
        diagnosis_basis=ai_result.diagnosis_basis,
        recommended_prescription=ai_result.recommended_prescription,
        recommended_acupuncture=ai_result.recommended_acupuncture,
        differential_diagnosis=ai_result.differential_diagnosis,
        efficacy_prediction=ai_result.efficacy_prediction,
        health_advice=ai_result.health_advice,
        status=ai_result.status,
        created_at=ai_result.created_at,
    ))


@router.get("/sessions/{session_id}", response_model=Response[AIDiagnosisResponse])
def get_diagnosis_result(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(AI_DIAGNOSE)),
):
    """获取AI诊断结果"""
    result = db.query(AIDiagnosisResult).filter(
        AIDiagnosisResult.session_id == session_id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="诊断结果不存在")

    return Response(data=AIDiagnosisResponse(
        id=result.id,
        session_id=result.session_id,
        primary_pattern=result.primary_pattern,
        secondary_pattern=result.secondary_pattern,
        confidence_score=result.confidence_score,
        treatment_principle=result.treatment_principle,
        treatment_method=result.treatment_method,
        diagnosis_basis=result.diagnosis_basis,
        recommended_prescription=result.recommended_prescription,
        recommended_acupuncture=result.recommended_acupuncture,
        differential_diagnosis=result.differential_diagnosis,
        efficacy_prediction=result.efficacy_prediction,
        health_advice=result.health_advice,
        status=result.status,
        created_at=result.created_at,
    ))


@router.post("/review/{result_id}", response_model=Response)
def review_diagnosis(
    result_id: int,
    review: DiagnosisReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(AI_DIAGNOSE)),
):
    """医生审核AI诊断结果"""
    result = db.query(AIDiagnosisResult).filter(
        AIDiagnosisResult.id == result_id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="诊断结果不存在")

    result.status = review.action
    result.reviewed_by = current_user.id

    if review.action == "modified":
        if review.primary_pattern:
            result.primary_pattern = review.primary_pattern
        if review.secondary_pattern:
            result.secondary_pattern = review.secondary_pattern
        if review.treatment_principle:
            result.treatment_principle = review.treatment_principle
        if review.treatment_method:
            result.treatment_method = review.treatment_method

    result.doctor_notes = review.doctor_notes
    from datetime import datetime, timezone
    result.reviewed_at = datetime.now(timezone.utc)
    db.commit()

    return Response(message="审核完成")
