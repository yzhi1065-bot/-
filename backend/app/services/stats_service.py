"""数据统计服务"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.models.patient import Patient
from app.models.diagnosis import DiagnosisSession
from app.models.ai_result import AIDiagnosisResult
from app.models.prescription import Prescription
from app.models.pharmacy import Drug, Sale


class StatsService:
    """业务数据统计"""

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        total_patients = db.query(Patient).count()
        today_visits = db.query(DiagnosisSession).filter(
            func.date(DiagnosisSession.created_at) == date.today()
        ).count()
        pending_review = db.query(AIDiagnosisResult).filter(
            AIDiagnosisResult.status == "pending"
        ).count()
        low_stock = db.query(Drug).filter(
            Drug.is_active == True,
            Drug.stock <= Drug.stock_alert
        ).count()
        return {
            "total_patients": total_patients,
            "today_visits": today_visits,
            "pending_review": pending_review,
            "low_stock_drugs": low_stock,
        }

    @staticmethod
    def get_pattern_stats(db: Session) -> dict:
        results = db.query(
            AIDiagnosisResult.primary_pattern,
            func.count(AIDiagnosisResult.id)
        ).filter(
            AIDiagnosisResult.primary_pattern.isnot(None),
            AIDiagnosisResult.primary_pattern != ""
        ).group_by(AIDiagnosisResult.primary_pattern).order_by(
            func.count(AIDiagnosisResult.id).desc()
        ).all()
        return {
            "patterns": [{"name": r[0], "count": r[1]} for r in results],
            "total": sum(r[1] for r in results),
        }

    @staticmethod
    def get_drug_stats(db: Session) -> dict:
        return {
            "total_drugs": db.query(Drug).filter(Drug.is_active == True).count(),
            "low_stock": db.query(Drug).filter(Drug.is_active == True, Drug.stock <= Drug.stock_alert).count(),
            "total_sales": round(db.query(func.sum(Sale.total_amount)).scalar() or 0, 2),
            "total_profit": round(db.query(func.sum(Sale.profit)).scalar() or 0, 2),
        }

    @staticmethod
    def get_visit_trend(db: Session, days: int = 30) -> list:
        from datetime import date, timedelta
        results = []
        for i in range(days - 1, -1, -1):
            d = date.today() - timedelta(days=i)
            count = db.query(DiagnosisSession).filter(
                func.date(DiagnosisSession.created_at) == d
            ).count()
            results.append({"date": str(d), "visits": count})
        return results

    @staticmethod
    def get_full_report(db) -> dict:
        total_patients = db.query(Patient).count()
        total_sessions = db.query(DiagnosisSession).count()
        return {
            "total_patients": total_patients,
            "total_sessions": total_sessions,
            "today_visits": db.query(DiagnosisSession).filter(
                func.date(DiagnosisSession.created_at) == date.today()
            ).count(),
        }
