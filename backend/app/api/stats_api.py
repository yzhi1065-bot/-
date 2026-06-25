"""数据统计API - 就诊统计/用药排名/证型分布"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, STATS_READ
from app.models.user import User
from app.models.patient import Patient
from app.models.diagnosis import DiagnosisSession
from app.models.ai_result import AIDiagnosisResult
from app.models.pharmacy import Drug, Sale
from app.schemas.common import Response

router = APIRouter(prefix="/api/stats", tags=["数据统计"])


@router.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(require_permissions(STATS_READ))):
    total_patients = db.query(Patient).count()
    today_visits = db.query(DiagnosisSession).filter(
        func.date(DiagnosisSession.created_at) == func.current_date()
    ).count()
    pending_review = db.query(AIDiagnosisResult).filter(
        AIDiagnosisResult.status == "pending"
    ).count()
    low_stock = db.query(Drug).filter(Drug.stock <= Drug.stock_alert).count()
    return Response(data={
        "total_patients": total_patients,
        "today_visits": today_visits,
        "pending_review": pending_review,
        "low_stock_drugs": low_stock,
    })


@router.get("/patterns")
def pattern_stats(db: Session = Depends(get_db), current_user: User = Depends(require_permissions(STATS_READ))):
    results = db.query(
        AIDiagnosisResult.primary_pattern,
        func.count(AIDiagnosisResult.id).label("count")
    ).filter(
        AIDiagnosisResult.primary_pattern.isnot(None),
        AIDiagnosisResult.primary_pattern != ""
    ).group_by(AIDiagnosisResult.primary_pattern).order_by(func.count(AIDiagnosisResult.id).desc()).all()
    return Response(data={
        "patterns": [{"name": r[0], "count": r[1]} for r in results],
        "total": sum(r[1] for r in results),
    })


@router.get("/drugs")
def drug_stats(db: Session = Depends(get_db), current_user: User = Depends(require_permissions(STATS_READ))):
    total_drugs = db.query(Drug).filter(Drug.is_active == True).count()
    low_stock = db.query(Drug).filter(Drug.is_active == True, Drug.stock <= Drug.stock_alert).count()
    total_sales = db.query(func.sum(Sale.total_amount)).scalar() or 0
    total_profit = db.query(func.sum(Sale.profit)).scalar() or 0
    return Response(data={
        "total_drugs": total_drugs,
        "low_stock": low_stock,
        "total_sales": round(total_sales, 2),
        "total_profit": round(total_profit, 2),
    })


@router.get("/top-herbs")
def top_herbs(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db),
              current_user: User = Depends(require_permissions(STATS_READ))):
    results = db.query(
        Sale.drug_name, func.sum(Sale.quantity).label("qty"),
        func.sum(Sale.total_amount).label("amt"), func.count(Sale.id).label("times")
    ).group_by(Sale.drug_name).order_by(func.sum(Sale.quantity).desc()).limit(limit).all()
    return Response(data=[{"name": r[0], "quantity": r[1], "amount": round(r[2] or 0, 2), "times": r[3]} for r in results])


@router.get("/monthly-trend")
def monthly_trend(db: Session = Depends(get_db), current_user: User = Depends(require_permissions(STATS_READ))):
    results = db.query(
        func.strftime("%Y-%m", DiagnosisSession.created_at).label("month"),
        func.count(DiagnosisSession.id).label("visits")
    ).group_by("month").order_by("month").all()
    return Response(data=[{"month": r[0], "visits": r[1]} for r in results])
