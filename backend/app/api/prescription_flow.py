"""处方流转接口 - 状态机"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import (
    require_permissions,
    PRESCRIPTION_READ, PRESCRIPTION_CREATE, PRESCRIPTION_AUDIT,
    PRESCRIPTION_DISPENSE, PRESCRIPTION_FLOW,
)
from app.models.user import User
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.charging import Charge, ChargeItem, ChargeStatus, PaymentMethod
from app.models.diagnosis import DiagnosisSession
from app.models.pharmacy import Drug
from app.schemas.common import Response

router = APIRouter(prefix="/api/prescriptions", tags=["处方流转"])


def _check_status(prescription: Prescription, expected: str, action_name: str):
    """检查处方状态是否匹配"""
    if prescription.status != expected:
        raise HTTPException(
            status_code=400,
            detail=f"处方当前状态为 [{prescription.status}]，{action_name}需要状态 [{expected}]"
        )


def _transition(prescription: Prescription, new_status: str):
    """执行状态转换"""
    prescription.status = new_status


@router.post("/{prescription_id}/submit", response_model=Response)
def submit_prescription(
    prescription_id: int,
    doctor_signature: Optional[str] = Query(None, description="医生签名"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_FLOW)),
):
    """提交处方审核 (draft → pending_audit)"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")

    _check_status(prescription, PrescriptionStatus.DRAFT.value, "提交审核")

    # 检查是否有处方明细
    items = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription.id
    ).count()
    if items == 0:
        raise HTTPException(status_code=400, detail="处方为空，请先添加药品明细")

    _transition(prescription, PrescriptionStatus.PENDING_AUDIT.value)
    if doctor_signature:
        prescription.doctor_signature = doctor_signature
        prescription.signed_at = datetime.now()

    db.commit()
    return Response(data={
        "id": prescription.id,
        "prescription_no": prescription.prescription_no,
        "status": prescription.status,
    }, message="处方已提交审核")


@router.post("/{prescription_id}/audit", response_model=Response)
def audit_prescription(
    prescription_id: int,
    action: str = Query(..., description="审核动作: approve/reject"),
    comment: Optional[str] = Query(None, description="审核意见"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_AUDIT)),
):
    """药师审核处方 (pending_audit → approved/rejected)"""
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="审核动作无效，请使用 approve 或 reject")

    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")

    _check_status(prescription, PrescriptionStatus.PENDING_AUDIT.value, "审核")

    if action == "approve":
        _transition(prescription, PrescriptionStatus.APPROVED.value)
        msg = "处方审核通过"
    else:
        _transition(prescription, PrescriptionStatus.REJECTED.value)
        msg = "处方已驳回"

    prescription.audit_by = current_user.id
    prescription.audit_at = datetime.now()
    prescription.audit_comment = comment

    db.commit()
    return Response(data={
        "id": prescription.id,
        "prescription_no": prescription.prescription_no,
        "status": prescription.status,
        "audit_by": current_user.real_name,
        "audit_comment": comment,
    }, message=msg)


@router.post("/{prescription_id}/pay", response_model=Response)
def pay_prescription(
    prescription_id: int,
    payment_method: str = Query(..., description="支付方式: cash/wechat/alipay/insurance"),
    insurance_amount: Optional[float] = Query(0.0, description="医保支付金额"),
    self_pay_amount: Optional[float] = Query(0.0, description="自付金额"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_FLOW)),
):
    """收费确认 (approved → paid)，同时创建收费记录并扣减库存"""
    if payment_method not in ["cash", "wechat", "alipay", "insurance"]:
        raise HTTPException(status_code=400, detail="无效的支付方式")

    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")

    _check_status(prescription, PrescriptionStatus.APPROVED.value, "收费")

    session = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == prescription.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="诊断会话不存在")

    # 获取处方明细，计算总额
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

    # 创建收费明细 + 扣库存
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

        drug = db.query(Drug).filter(
            Drug.name.ilike(f"%{ci['item_name']}%"),
            Drug.is_active == True
        ).first()
        if drug:
            drug.stock = max(0, (drug.stock or 0) - ci["quantity"])

    # 更新处方状态
    _transition(prescription, PrescriptionStatus.PAID.value)
    prescription.paid_at = datetime.now()

    db.commit()
    db.refresh(charge)

    return Response(data={
        "charge_id": charge.id,
        "prescription_id": prescription.id,
        "prescription_no": prescription.prescription_no,
        "status": prescription.status,
        "total_amount": charge.total_amount,
        "insurance_amount": charge.insurance_amount,
        "self_pay_amount": charge.self_pay_amount,
        "payment_method": charge.payment_method,
        "paid_at": str(charge.paid_at) if charge.paid_at else "",
    }, message="收费成功")


@router.post("/{prescription_id}/dispense", response_model=Response)
def dispense_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_DISPENSE)),
):
    """发药确认 (paid → dispensing → dispensed)"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="处方不存在")

    if prescription.status == PrescriptionStatus.PAID.value:
        _transition(prescription, PrescriptionStatus.DISPENSING.value)
        db.commit()
        return Response(data={
            "id": prescription.id,
            "prescription_no": prescription.prescription_no,
            "status": prescription.status,
        }, message="开始发药")

    if prescription.status == PrescriptionStatus.DISPENSING.value:
        _transition(prescription, PrescriptionStatus.DISPENSED.value)
        prescription.dispensed_at = datetime.now()
        db.commit()
        return Response(data={
            "id": prescription.id,
            "prescription_no": prescription.prescription_no,
            "status": prescription.status,
            "dispensed_at": str(prescription.dispensed_at) if prescription.dispensed_at else "",
        }, message="发药完成")

    raise HTTPException(
        status_code=400,
        detail=f"处方状态 [{prescription.status}] 不允许发药，需要 [paid/dispensing]"
    )


@router.get("/audit-queue", response_model=Response)
def audit_queue(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PRESCRIPTION_AUDIT)),
):
    """待审核处方列表（药师用）"""
    query = db.query(Prescription).filter(
        Prescription.status == PrescriptionStatus.PENDING_AUDIT.value
    )

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    records = query.order_by(Prescription.created_at.asc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    result = []
    for r in records:
        session = db.query(DiagnosisSession).filter(
            DiagnosisSession.id == r.session_id
        ).first()
        patient_name = session.patient.name if (session and session.patient) else ""
        doctor_name = ""
        if session:
            doctor = db.query(User).filter(User.id == session.doctor_id).first()
            doctor_name = doctor.real_name if doctor else ""

        item_count = db.query(PrescriptionItem).filter(
            PrescriptionItem.prescription_id == r.id
        ).count()

        result.append({
            "id": r.id,
            "prescription_no": r.prescription_no,
            "name": r.name,
            "patient_name": patient_name,
            "doctor_name": doctor_name,
            "item_count": item_count,
            "total_days": r.total_days,
            "created_at": str(r.created_at) if r.created_at else "",
        })

    return Response(data={
        "items": result,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    })
