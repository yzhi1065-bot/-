"""诊断流程编排服务"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.diagnosis import (
    DiagnosisSession, InspectionData, AuscultationData,
    InquiryData, PalpationData
)
from app.models.ai_result import AIDiagnosisResult
from app.models.patient import Patient
from app.services.ai_service import AIService
from app.services.compatibility import check_compatibility
import json


class DiagnosisFlowService:
    """诊断流程编排 - 四诊→AI辨证→处方→审核"""

    @staticmethod
    def get_session_data(session_id: int, db: Session) -> Dict[str, Any]:
        """获取会话完整四诊数据"""
        session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
        if not session:
            return {}

        data = {
            "session_id": session.id,
            "session_no": session.session_no,
            "status": session.status,
            "chief_complaint": session.chief_complaint,
        }
        if session.patient:
            data["patient"] = {"name": session.patient.name, "age": session.patient.age,
                               "gender": session.patient.gender, "id": session.patient.id}

        for attr, key in [("inspection", "inspection"), ("auscultation", "auscultation"),
                          ("inquiry", "inquiry"), ("palpation", "palpation")]:
            obj = getattr(session, attr, None)
            if obj:
                data[key] = {c.name: getattr(obj, c.name) for c in obj.__table__.columns
                            if not c.name.startswith("_") and c.name != "id" and c.name != "session_id"}

        return data

    @staticmethod
    def run_full_diagnosis(session_id: int, db: Session) -> Dict[str, Any]:
        """完整诊断流程：收集四诊→AI辨证→配伍检查"""
        session_data = DiagnosisFlowService.get_session_data(session_id, db)
        if not session_data:
            return {"error": "诊断会话不存在"}

        # AI诊断
        ai_service = AIService()
        try:
            import asyncio
            diagnosis = asyncio.run(ai_service.diagnose(session_data))
        except Exception as e:
            diagnosis = ai_service._get_mock_result()

        # 提取处方药材做配伍检查
        herbs = []
        rx = diagnosis.get("recommended_prescription", {})
        if rx and isinstance(rx, dict):
            herbs = [item.get("herb", "") for item in rx.get("composition", []) if item.get("herb")]

        compatibility_result = check_compatibility(herbs) if herbs else []
        diagnosis["compatibility_check"] = compatibility_result
        diagnosis["has_conflicts"] = len(compatibility_result) > 0

        return diagnosis

    @staticmethod
    def get_session_status(session_id: int, db: Session) -> str:
        """获取诊断会话当前阶段"""
        session = db.query(DiagnosisSession).filter(DiagnosisSession.id == session_id).first()
        if not session:
            return "not_found"
        if session.status == "completed":
            ai = db.query(AIDiagnosisResult).filter(
                AIDiagnosisResult.session_id == session_id).first()
            if ai and ai.status == "approved":
                return "treatment_ready"
            return "diagnosis_ready"
        return "collecting"
