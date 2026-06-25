"""处方管理接口 - 含销售自动联动"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import date, datetime
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PRESCRIPTION_READ, PRESCRIPTION_CREATE
from app.models.user import User
from app.models.prescription import Prescription, PrescriptionItem, TreatmentPlan
from app.models.pharmacy import Drug, Sale
from app.schemas.prescription import PrescriptionCreate, TreatmentPlanCreate, PrescriptionResponse
from app.schemas.common import Response

router = APIRouter(prefix="/api/prescriptions", tags=["处方管理"])


@router.post("", response_model=Response)
def create_prescription(
    data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_CREATE)),
):
    """创建处方 - 自动创建销售记录并扣减库存"""
    existing = db.query(Prescription).filter(
        Prescription.session_id == data.session_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="该诊断会话已存在处方")

    today_str = date.today().strftime("%Y%m%d")
    count_today = db.query(Prescription).filter(
        Prescription.created_at >= today_str
    ).count()
    prescription_no = f"RX{today_str}{count_today + 1:04d}"

    prescription = Prescription(
        session_id=data.session_id,
        prescription_no=prescription_no,
        name=data.name,
        principle=data.principle,
        method=data.method,
        dosage_form=data.dosage_form,
        decoction_method=data.decoction_method,
        administration=data.administration,
        total_days=data.total_days,
        daily_doses=data.daily_doses,
        status="active",
    )
    db.add(prescription)
    db.flush()

    total_cost = 0.0
    total_profit = 0.0
    sale_items = []

    for item in data.items:
        db_item = PrescriptionItem(
            prescription_id=prescription.id,
            herb_name=item.herb_name,
            dosage=item.dosage,
            unit=item.unit,
            special_preparation=item.special_preparation,
            notes=item.notes,
            sort_order=item.sort_order,
        )
        db.add(db_item)

        drug = db.query(Drug).filter(
            Drug.name.ilike(f"%{item.herb_name}%"),
            Drug.is_active == True
        ).first()
        if drug:
            try:
                qty = int(float(item.dosage or 0) * data.total_days)
            except (ValueError, TypeError):
                qty = data.total_days
            qty = max(1, qty)
            sale_amount = (drug.selling_price or 0) * qty
            sale_profit = ((drug.selling_price or 0) - (drug.purchase_price or 0)) * qty
            total_cost += sale_amount
            total_profit += sale_profit

            sale = Sale(
                sale_date=date.today(),
                drug_id=drug.id,
                drug_name=drug.name,
                quantity=qty,
                unit=item.unit or "克",
                purchase_price=drug.purchase_price or 0,
                selling_price=drug.selling_price or 0,
                total_amount=sale_amount,
                profit=sale_profit,
                prescription_id=prescription.id,
                created_by=current_user.id,
            )
            db.add(sale)

            drug.stock = max(0, (drug.stock or 0) - qty)

    db.commit()
    db.refresh(prescription)
    return Response(data={"id": prescription.id, "prescription_no": prescription_no,
                          "total_cost": round(total_cost, 2), "total_profit": round(total_profit, 2)})


@router.get("/sessions/{session_id}", response_model=Response)
def get_prescription_by_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_READ)),
):
    """获取诊断会话的处方"""
    prescription = db.query(Prescription).filter(
        Prescription.session_id == session_id
    ).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")
    items = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription.id
    ).order_by(PrescriptionItem.sort_order).all()
    return Response(data={
        "prescription": {
            "id": prescription.id,
            "session_id": prescription.session_id,
            "prescription_no": prescription.prescription_no,
            "name": prescription.name,
            "principle": prescription.principle,
            "method": prescription.method,
            "dosage_form": prescription.dosage_form,
            "decoction_method": prescription.decoction_method,
            "administration": prescription.administration,
            "total_days": prescription.total_days,
            "daily_doses": prescription.daily_doses,
            "status": prescription.status,
            "created_at": str(prescription.created_at) if prescription.created_at else "",
        },
        "items": [{
            "id": i.id, "herb_name": i.herb_name, "dosage": i.dosage,
            "unit": i.unit, "special_preparation": i.special_preparation,
            "notes": i.notes, "sort_order": i.sort_order,
        } for i in items],
    })


@router.post("/treatment-plan", response_model=Response)
def create_treatment_plan(
    data: TreatmentPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_CREATE)),
):
    """创建治疗方案"""
    existing = db.query(TreatmentPlan).filter(
        TreatmentPlan.session_id == data.session_id
    ).first()
    if existing:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(existing, key, value)
        db.commit()
        return Response(message="治疗方案已更新")
    plan = TreatmentPlan(session_id=data.session_id, **data.model_dump(exclude_unset=True, exclude={"session_id"}))
    db.add(plan)
    db.commit()
    return Response(message="治疗方案已创建")


@router.get("/treatment-plan/{session_id}", response_model=Response)
def get_treatment_plan(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_READ)),
):
    """获取治疗方案"""
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.session_id == session_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="治疗方案不存在")
    return Response(data={c.name: getattr(plan, c.name) for c in plan.__table__.columns})
