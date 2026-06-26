"""收银结算接口"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func, and_
from datetime import date, datetime
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import (
    require_permissions, CHARGING_READ, CHARGING_CREATE, CHARGING_PAY, CHARGING_STATS
)
from app.models.user import User
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.charging import Charge, ChargeItem, ChargeStatus, PaymentMethod
from app.models.diagnosis import DiagnosisSession
from app.models.pharmacy import Drug
from app.schemas.common import Response

router = APIRouter(prefix="/api/charging", tags=["收银结算"])


@router.post("/calculate", response_model=Response)
def calculate_charge(
    prescription_id: int = Query(..., description="处方ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(CHARGING_READ)),
):
    """根据处方自动计价"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")

    session = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == prescription.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    items = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription.id
    ).order_by(PrescriptionItem.sort_order).all()

    charge_items = []
    total_amount = 0.0

    for item in items:
        # 查找药品价格
        drug = db.query(Drug).filter(
            Drug.name.ilike(f"%{item.herb_name}%"),
            Drug.is_active == True
        ).first()

        unit_price = drug.selling_price if drug else 0.0
        try:
            qty = int(float(item.dosage or 0) * (prescription.total_days or 1))
        except (ValueError, TypeError):
            qty = 1
        qty = max(1, qty)
        amount = round(unit_price * qty, 2)

        charge_items.append({
            "item_type": "prescription",
            "item_name": item.herb_name,
            "quantity": qty,
            "unit_price": unit_price,
            "amount": amount,
        })
        total_amount += amount

    # 计算医保和自付（示例：按80%医保比例）
    insurance_amount = round(total_amount * 0.8, 2)
    self_pay_amount = round(total_amount - insurance_amount, 2)

    return Response(data={
        "prescription_id": prescription.id,
        "prescription_no": prescription.prescription_no,
        "patient_id": session.patient_id,
        "patient_name": session.patient.name if session.patient else "",
        "total_amount": round(total_amount, 2),
        "insurance_amount": insurance_amount,
        "self_pay_amount": self_pay_amount,
        "items": charge_items,
    })


@router.post("/pay", response_model=Response)
def pay_charge(
    prescription_id: int = Query(..., description="处方ID"),
    payment_method: str = Query(..., description="支付方式: cash/wechat/alipay/insurance"),
    insurance_amount: Optional[float] = Query(0.0, description="医保支付金额"),
    self_pay_amount: Optional[float] = Query(0.0, description="自付金额"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(CHARGING_PAY)),
):
    """收费确认 - 标记已付并创建收费记录"""
    if payment_method not in ["cash", "wechat", "alipay", "insurance"]:
        raise HTTPException(status_code=400, detail="无效的支付方式")

    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")

    if prescription.status != PrescriptionStatus.APPROVED.value:
        raise HTTPException(
            status_code=400,
            detail=f"处方状态不允许收费，当前状态: {prescription.status}，需要: approved"
        )

    session = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == prescription.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    # 计算总额
    items = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription.id
    ).all()

    total_amount = 0.0
    charge_items = []

    for item in items:
        drug = db.query(Drug).filter(
            Drug.name.ilike(f"%{item.herb_name}%"),
            Drug.is_active == True
        ).first()
        unit_price = drug.selling_price if drug else 0.0
        try:
            qty = int(float(item.dosage or 0) * (prescription.total_days or 1))
        except (ValueError, TypeError):
            qty = 1
        qty = max(1, qty)
        amount = round(unit_price * qty, 2)
        total_amount += amount
        charge_items.append({
            "item_type": "prescription",
            "item_name": item.herb_name,
            "quantity": qty,
            "unit_price": unit_price,
            "amount": amount,
        })

    # 创建收费记录
    charge = Charge(
        session_id=prescription.session_id,
        patient_id=session.patient_id,
        patient_name=session.patient.name if session.patient else "",
        total_amount=round(total_amount, 2),
        insurance_amount=round(insurance_amount, 2),
        self_pay_amount=round(self_pay_amount, 2),
        status=ChargeStatus.PAID.value,
        payment_method=payment_method,
        paid_at=datetime.now(),
    )
    db.add(charge)
    db.flush()

    # 创建收费明细
    for ci in charge_items:
        charge_item = ChargeItem(
            charge_id=charge.id,
            item_type=ci["item_type"],
            item_name=ci["item_name"],
            quantity=ci["quantity"],
            unit_price=ci["unit_price"],
            amount=ci["amount"],
        )
        db.add(charge_item)

        # 扣减库存
        drug = db.query(Drug).filter(
            Drug.name.ilike(f"%{ci['item_name']}%"),
            Drug.is_active == True
        ).first()
        if drug:
            drug.stock = max(0, (drug.stock or 0) - ci["quantity"])

    # 更新处方状态为 paid
    prescription.status = PrescriptionStatus.PAID.value
    prescription.paid_at = datetime.now()

    db.commit()
    db.refresh(charge)

    return Response(data={
        "charge_id": charge.id,
        "total_amount": charge.total_amount,
        "insurance_amount": charge.insurance_amount,
        "self_pay_amount": charge.self_pay_amount,
        "payment_method": charge.payment_method,
        "paid_at": str(charge.paid_at) if charge.paid_at else "",
    })


@router.get("/records", response_model=Response)
def list_charges(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(CHARGING_READ)),
):
    """收费记录列表"""
    query = db.query(Charge)

    if keyword:
        like = f"%{keyword}%"
        query = query.filter(
            Charge.patient_name.ilike(like) |
            Charge.payment_method.ilike(like) |
            Charge.status.ilike(like)
        )

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    records = query.order_by(Charge.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return Response(data={
        "items": [{
            "id": r.id,
            "session_id": r.session_id,
            "patient_id": r.patient_id,
            "patient_name": r.patient_name,
            "total_amount": r.total_amount,
            "insurance_amount": r.insurance_amount,
            "self_pay_amount": r.self_pay_amount,
            "status": r.status,
            "payment_method": r.payment_method,
            "paid_at": str(r.paid_at) if r.paid_at else "",
            "created_at": str(r.created_at) if r.created_at else "",
        } for r in records],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    })


@router.get("/daily-summary", response_model=Response)
def daily_summary(
    summary_date: Optional[str] = Query(None, description="日期，默认今天 YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(CHARGING_STATS)),
):
    """日结统计"""
    target_date = summary_date if summary_date else date.today().strftime("%Y-%m-%d")

    # 获取当日所有已付记录
    charges = db.query(Charge).filter(
        and_(
            Charge.status == ChargeStatus.PAID.value,
            sa_func.date(Charge.paid_at) == target_date,
        )
    ).all()

    total_income = sum(c.total_amount for c in charges)
    total_count = len(charges)

    # 按支付方式统计
    method_stats = {}
    for c in charges:
        method = c.payment_method or "unknown"
        if method not in method_stats:
            method_stats[method] = {"count": 0, "amount": 0.0}
        method_stats[method]["count"] += 1
        method_stats[method]["amount"] += c.total_amount

    return Response(data={
        "date": target_date,
        "total_income": round(total_income, 2),
        "total_count": total_count,
        "cash": {
            "count": method_stats.get("cash", {}).get("count", 0),
            "amount": round(method_stats.get("cash", {}).get("amount", 0), 2),
        },
        "wechat": {
            "count": method_stats.get("wechat", {}).get("count", 0),
            "amount": round(method_stats.get("wechat", {}).get("amount", 0), 2),
        },
        "alipay": {
            "count": method_stats.get("alipay", {}).get("count", 0),
            "amount": round(method_stats.get("alipay", {}).get("amount", 0), 2),
        },
        "insurance": {
            "count": method_stats.get("insurance", {}).get("count", 0),
            "amount": round(method_stats.get("insurance", {}).get("amount", 0), 2),
        },
    })
