"""Debug dashboard query issues"""
import sys; sys.path.insert(0, '.')
from datetime import date, datetime, timedelta
from app.core.database import SessionLocal
from app.models.patient import Patient
from app.models.diagnosis import DiagnosisSession
from app.models.ai_result import AIDiagnosisResult
from app.models.prescription import Prescription
from app.models.pharmacy import Sale
from sqlalchemy import func
import traceback

db = SessionLocal()

queries = [
    ("total_patients", lambda: db.query(Patient).count()),
    ("today_patients", lambda: db.query(DiagnosisSession).filter(
        func.date(DiagnosisSession.created_at) == date.today()).count()),
    ("total_sessions", lambda: db.query(DiagnosisSession).count()),
    ("pending_reviews", lambda: db.query(AIDiagnosisResult).filter(
        AIDiagnosisResult.status == 'pending').count()),
    ("week_new", lambda: db.query(DiagnosisSession).filter(
        DiagnosisSession.created_at >= datetime.now() - timedelta(days=7)).count()),
    ("today_sales", lambda: db.query(func.sum(Sale.total_amount)).filter(
        Sale.sale_date == date.today()).scalar() or 0),
    ("month_rx", lambda: db.query(Prescription).filter(
        Prescription.created_at >= date.today().replace(day=1)).count()),
]

for name, fn in queries:
    try:
        result = fn()
        print(f"  OK {name}: {result}")
    except Exception as e:
        print(f"  ERROR {name}: {e}")
        traceback.print_exc()

db.close()
