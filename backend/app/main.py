"""FastAPI 应用入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.api import (
    auth_router, patients_router, diagnosis_router,
    ai_diagnosis_router, prescriptions_router, devices_router,
    ai_config_router, constitution_router, export_router, pharmacy_router,
    ai_enhance_router, offline_router, stats_router, tongue_router,
    compatibility_router, appointments_router, followups_router,
    nursing_router, schedules_router, fallback_router,
)

Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    try:
        existing = db.query(User).first()
        if existing:
            print("OK: DB has users, skip init")
            return
        admin = User(username="admin", password_hash=get_password_hash("admin123"), real_name="管理员", role="admin", title="系统管理员", is_active=True)
        db.add(admin)
        doctor = User(username="doctor", password_hash=get_password_hash("doctor123"), real_name="张医生", role="doctor", title="主治医师", department="中医科", hospital="测试医院", is_active=True)
        db.add(doctor)
        db.commit()
        print("OK: default accounts created")
    except Exception as e:
        print(f"init error: {e}")
        db.rollback()
    finally:
        db.close()

init_db()

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, description="中医智能诊断系统后端服务", docs_url="/api/docs", redoc_url="/api/redoc")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(diagnosis_router)
app.include_router(ai_diagnosis_router)
app.include_router(prescriptions_router)
app.include_router(devices_router)
app.include_router(ai_config_router)
app.include_router(constitution_router)
app.include_router(export_router)
app.include_router(pharmacy_router)
app.include_router(ai_enhance_router)
app.include_router(offline_router)
app.include_router(stats_router)
app.include_router(tongue_router)
app.include_router(compatibility_router)
app.include_router(appointments_router)
app.include_router(followups_router)
app.include_router(nursing_router)
app.include_router(schedules_router)
app.include_router(fallback_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": settings.VERSION}
