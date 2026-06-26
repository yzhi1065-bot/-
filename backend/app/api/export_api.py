"""数据导出与报表API - CSV/JSON/Excel"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response as FastAPIResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import io
import json
from datetime import datetime, date, timedelta
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PATIENT_READ, STATS_EXPORT
from app.core.encryption import decrypt_id_card
from app.models.user import User
from app.models.patient import Patient
from app.models.diagnosis import DiagnosisSession
from app.models.ai_result import AIDiagnosisResult
from app.models.prescription import Prescription, PrescriptionItem
from app.models.pharmacy import Drug, Sale, Purchase
from app.schemas.common import Response

router = APIRouter(prefix="/api/export", tags=["数据导出"])


# ══════════════════════════════════════════
# CSV 导出
# ══════════════════════════════════════════

def _build_csv_response(csv_content: str, filename: str) -> FastAPIResponse:
    """构建CSV下载响应"""
    return FastAPIResponse(
        content=csv_content,
        media_type="text/csv; charset=utf-8-sig",
        headers={
            "Content-Disposition": f"attachment; filename={filename}_{datetime.now().strftime('%Y%m%d')}.csv"
        },
    )


def _build_json_response(data: list, filename: str) -> FastAPIResponse:
    """构建JSON下载响应"""
    return FastAPIResponse(
        content=json.dumps(data, ensure_ascii=False, default=str, indent=2),
        media_type="application/json; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename={filename}_{datetime.now().strftime('%Y%m%d')}.json"
        },
    )


# ── 患者导出 ──

@router.get("/patients/csv")
def export_patients_csv(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出患者数据为CSV（带日期筛选）"""
    query = db.query(Patient)
    if date_from:
        query = query.filter(Patient.created_at >= date_from)
    if date_to:
        try:
            dt_end = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Patient.created_at < dt_end)
        except ValueError:
            pass
    patients = query.order_by(Patient.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "姓名", "性别", "年龄", "手机号", "身份证号", "地址",
                     "主诉", "既往史", "过敏史", "建档时间"])
    for p in patients:
        # 收集过敏史
        allergy_str = ""
        if hasattr(p, 'allergies') and p.allergies:
            allergy_str = "; ".join(f"{a.allergen}({a.reaction or ''})" for a in p.allergies)
        writer.writerow([
            p.id, p.name,
            "男" if p.gender == "male" else "女" if p.gender == "female" else "",
            p.age or "", p.phone or "", decrypt_id_card(p.id_card) or "", p.address or "",
            p.chief_complaint or "", p.past_illness or "", allergy_str,
            p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
        ])
    return _build_csv_response(output.getvalue(), "patients")


@router.get("/patients/json")
def export_patients_json(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出患者数据为JSON"""
    query = db.query(Patient)
    if date_from:
        query = query.filter(Patient.created_at >= date_from)
    if date_to:
        try:
            dt_end = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Patient.created_at < dt_end)
        except ValueError:
            pass
    patients = query.order_by(Patient.created_at.desc()).all()

    data = [
        {
            "id": p.id, "name": p.name, "gender": p.gender, "age": p.age,
            "phone": p.phone, "id_card": decrypt_id_card(p.id_card), "address": p.address,
            "chief_complaint": p.chief_complaint,
            "past_history": p.past_illness,
            "created_at": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
        }
        for p in patients
    ]
    return _build_json_response(data, "patients")


# ── 处方导出 ──

@router.get("/prescriptions/csv")
def export_prescriptions_csv(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出处方数据为CSV"""
    query = db.query(Prescription)
    if status:
        query = query.filter(Prescription.status == status)
    if date_from:
        query = query.filter(Prescription.created_at >= date_from)
    if date_to:
        try:
            dt_end = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Prescription.created_at < dt_end)
        except ValueError:
            pass
    prescriptions = query.order_by(Prescription.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["处方编号", "方剂名称", "治则", "治法", "剂型", "总天数",
                     "状态", "药材明细", "创建时间"])
    for p in prescriptions:
        items_str = "; ".join(
            f"{i.herb_name}{i.dosage or ''}{i.unit or ''}"
            for i in (p.items or [])
        ) if p.items else ""
        writer.writerow([
            p.prescription_no or "", p.name or "", p.principle or "",
            p.method or "", p.dosage_form or "", p.total_days or "",
            p.status, items_str,
            p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
        ])
    return _build_csv_response(output.getvalue(), "prescriptions")


@router.get("/prescriptions/json")
def export_prescriptions_json(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出处方数据为JSON"""
    query = db.query(Prescription)
    if status:
        query = query.filter(Prescription.status == status)
    if date_from:
        query = query.filter(Prescription.created_at >= date_from)
    if date_to:
        try:
            dt_end = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Prescription.created_at < dt_end)
        except ValueError:
            pass
    prescriptions = query.order_by(Prescription.created_at.desc()).all()

    data = []
    for p in prescriptions:
        data.append({
            "id": p.id,
            "prescription_no": p.prescription_no,
            "session_id": p.session_id,
            "name": p.name,
            "principle": p.principle,
            "method": p.method,
            "dosage_form": p.dosage_form,
            "decoction_method": p.decoction_method,
            "administration": p.administration,
            "total_days": p.total_days,
            "daily_doses": p.daily_doses,
            "status": p.status,
            "items": [
                {
                    "herb_name": i.herb_name, "dosage": i.dosage,
                    "unit": i.unit, "special_preparation": i.special_preparation,
                    "notes": i.notes, "sort_order": i.sort_order,
                }
                for i in (p.items or [])
            ] if p.items else [],
            "created_at": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
        })
    return _build_json_response(data, "prescriptions")


# ── 药房导出 ──

@router.get("/pharmacy/csv")
def export_pharmacy_csv(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出药品目录为CSV"""
    query = db.query(Drug).filter(Drug.is_active == True)
    if category:
        query = query.filter(Drug.category_name == category)
    drugs = query.order_by(Drug.category_name, Drug.name).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["名称", "常用量", "单位", "分类", "拼音", "条形码",
                     "进价", "售价", "库存", "报警值", "厂家", "批准文号", "功效"])
    for d in drugs:
        writer.writerow([
            d.name, d.common_dosage, d.unit, d.category, d.pinyin, d.barcode,
            d.purchase_price, d.selling_price, d.stock, d.stock_alert,
            d.manufacturer, d.approval_number, d.efficacy,
        ])
    return _build_csv_response(output.getvalue(), "drugs")


@router.get("/sales/csv")
def export_sales_csv(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出销售记录为CSV"""
    query = db.query(Sale)
    if date_from:
        query = query.filter(Sale.sale_date >= date_from)
    if date_to:
        query = query.filter(Sale.sale_date <= date_to)
    sales = query.order_by(Sale.sale_date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["日期", "药品", "数量", "单位", "进价", "售价",
                     "金额", "利润", "患者", "医生"])
    for s in sales:
        writer.writerow([
            str(s.sale_date) if s.sale_date else "",
            s.drug_name, s.quantity, s.unit,
            s.purchase_price, s.selling_price,
            s.total_amount, s.profit,
            s.patient_name, s.doctor_name,
        ])
    return _build_csv_response(output.getvalue(), "sales")


@router.get("/sales/json")
def export_sales_json(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出销售记录为JSON"""
    query = db.query(Sale)
    if date_from:
        query = query.filter(Sale.sale_date >= date_from)
    if date_to:
        query = query.filter(Sale.sale_date <= date_to)
    sales = query.order_by(Sale.sale_date.desc()).all()

    data = [
        {
            "id": s.id, "sale_date": str(s.sale_date),
            "drug_name": s.drug_name, "quantity": s.quantity, "unit": s.unit,
            "purchase_price": s.purchase_price, "selling_price": s.selling_price,
            "total_amount": s.total_amount, "profit": s.profit,
            "patient_name": s.patient_name, "doctor_name": s.doctor_name,
        }
        for s in sales
    ]
    return _build_json_response(data, "sales")


# ── 诊断记录导出 ──

@router.get("/diagnoses/csv")
def export_diagnoses_csv(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出诊断记录为CSV"""
    query = db.query(DiagnosisSession)
    if date_from:
        query = query.filter(DiagnosisSession.created_at >= date_from)
    if date_to:
        try:
            dt_end = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(DiagnosisSession.created_at < dt_end)
        except ValueError:
            pass
    sessions = query.order_by(DiagnosisSession.created_at.desc()).limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "患者ID", "就诊类型", "主诉", "AI证型", "状态", "创建时间"])
    for s in sessions:
        pattern = ""
        if s.ai_result:
            pattern = s.ai_result.primary_pattern or ""
        writer.writerow([
            s.id, s.patient_id, s.diagnosis_type or "",
            s.chief_complaint or "", pattern,
            s.status or "",
            s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
        ])
    return _build_csv_response(output.getvalue(), "diagnoses")


# ── 统计导出 ──

@router.get("/stats/summary")
def get_stats_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """获取统计数据摘要"""
    total_patients = db.query(Patient).count()
    today = datetime.now().date()

    today_patients = db.query(DiagnosisSession).filter(
        func.date(DiagnosisSession.created_at) == today
    ).count()

    total_prescriptions = db.query(Prescription).count()
    total_sales = db.query(func.sum(Sale.total_amount)).scalar() or 0

    return Response(data={
        "total_patients": total_patients,
        "today_patients": today_patients,
        "total_prescriptions": total_prescriptions,
        "total_sales": round(total_sales, 2),
        "export_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })


@router.get("/stats/json")
def export_stats_json(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出完整统计数据为JSON"""
    from app.services.stats_service import StatsService
    report = StatsService.get_full_report(db)
    return _build_json_response(report, "stats_report")


# ══════════════════════════════════════════
# Excel 导出（通过CSV方式，兼容Excel打开）
# ══════════════════════════════════════════

@router.get("/report/daily")
def export_daily_report(
    report_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(STATS_EXPORT)),
):
    """导出日报表（CSV格式，Excel兼容）"""
    target_date = date.today()
    if report_date:
        try:
            target_date = datetime.strptime(report_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    # 当日就诊
    sessions = db.query(DiagnosisSession).filter(
        func.date(DiagnosisSession.created_at) == target_date
    ).count()

    # 当日处方
    prescriptions = db.query(Prescription).filter(
        func.date(Prescription.created_at) == target_date
    ).all()
    rx_count = len(prescriptions)

    # 当日销售
    sales_q = db.query(
        func.sum(Sale.total_amount).label("amt"),
        func.sum(Sale.profit).label("prf"),
        func.count(Sale.id).label("cnt"),
    ).filter(Sale.sale_date == target_date).first()
    sale_amount = sales_q.amt or 0
    sale_profit = sales_q.prf or 0
    sale_count = sales_q.cnt or 0

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["中医智能诊断系统 - 日报表"])
    writer.writerow([f"日期: {target_date.isoformat()}"])
    writer.writerow([])
    writer.writerow(["指标", "数值"])
    writer.writerow(["就诊人次", sessions])
    writer.writerow(["处方数", rx_count])
    writer.writerow(["销售笔数", sale_count])
    writer.writerow(["销售金额", round(sale_amount, 2)])
    writer.writerow(["销售利润", round(sale_profit, 2)])

    return _build_csv_response(output.getvalue(), f"daily_report_{target_date.isoformat()}")
