"""药品管理API - 药品目录/入库/销售/统计"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_
from typing import Optional, List
from datetime import date, datetime, timedelta
import csv, io, json
from fastapi.responses import Response as FastAPIResponse
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PHARMACY_READ, PHARMACY_CREATE, PHARMACY_UPDATE, PHARMACY_DELETE
from app.models.user import User
from app.models.pharmacy import Drug, DrugCategory, Purchase, Sale
from app.schemas.common import Response

router = APIRouter(prefix="/api/pharmacy", tags=["药品管理"])


class DrugCreate(BaseModel):
    name: str
    common_dosage: Optional[str] = None
    unit: str = "克"
    category: Optional[str] = None
    category_name: Optional[str] = None
    pinyin: Optional[str] = None
    barcode: Optional[str] = None
    purchase_price: Optional[float] = 0
    selling_price: Optional[float] = 0
    stock: int = 0
    stock_alert: int = 10
    manufacturer: Optional[str] = None
    approval_number: Optional[str] = None
    efficacy: Optional[str] = None
    property_taste: Optional[str] = None
    meridian: Optional[str] = None
    dosage: Optional[str] = None
    contraindication: Optional[str] = None
    notes: Optional[str] = None


class DrugOut(BaseModel):
    id: int
    name: str
    common_dosage: Optional[str] = None
    unit: str = "克"
    category: Optional[str] = None
    category_name: Optional[str] = None
    pinyin: Optional[str] = None
    barcode: Optional[str] = None
    purchase_price: float = 0
    selling_price: float = 0
    stock: int = 0
    stock_alert: int = 10
    manufacturer: Optional[str] = None
    approval_number: Optional[str] = None
    efficacy: Optional[str] = None
    property_taste: Optional[str] = None
    meridian: Optional[str] = None
    dosage: Optional[str] = None
    contraindication: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


@router.get("/drugs")
def list_drugs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = Query("asc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PHARMACY_READ)),
):
    query = db.query(Drug).filter(Drug.is_active == True)
    if keyword:
        query = query.filter(or_(
            Drug.name.ilike(f"%{keyword}%"),
            Drug.pinyin.ilike(f"%{keyword}%"),
            Drug.category_name.ilike(f"%{keyword}%"),
        ))
    if category:
        query = query.filter(Drug.category_name == category)
    if low_stock:
        query = query.filter(Drug.stock <= Drug.stock_alert)
    total = query.count()
    sort_col = getattr(Drug, sort_by, Drug.name) if sort_by else Drug.name
    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())
    drugs = query.offset((page-1)*page_size).limit(page_size).all()
    return Response(data={
        "items": [DrugOut.model_validate(d) for d in drugs],
        "total": total, "page": page, "page_size": page_size,
    })


@router.get("/drugs/categories")
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_READ))):
    cats = db.query(DrugCategory).order_by(DrugCategory.name).all()
    return Response(data=[{"id": c.id, "name": c.name} for c in cats])


@router.get("/drugs/{drug_id}")
def get_drug(drug_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_READ))):
    drug = db.query(Drug).filter(Drug.id == drug_id, Drug.is_active == True).first()
    if not drug:
        raise HTTPException(404, "药品不存在")
    return Response(data=DrugOut.model_validate(drug))


@router.post("/drugs")
def create_drug(drug: DrugCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_CREATE))):
    if drug.barcode:
        existing = db.query(Drug).filter(Drug.barcode == drug.barcode).first()
        if existing:
            raise HTTPException(409, f"条形码 '{drug.barcode}' 已存在")
    data = drug.model_dump()
    if data.get("category") and not data.get("category_name"):
        data["category_name"] = data.pop("category")
    if "category" in data:
        data.pop("category", None)
    db_drug = Drug(**data)
    db.add(db_drug)
    db.commit()
    db.refresh(db_drug)
    return Response(data=DrugOut.model_validate(db_drug))


@router.put("/drugs/{drug_id}")
def update_drug(drug_id: int, drug: DrugCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_UPDATE))):
    db_drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not db_drug:
        raise HTTPException(404, "药品不存在")
    for key, value in drug.model_dump(exclude_unset=True).items():
        if key == "category":
            key = "category_name"
        setattr(db_drug, key, value)
    db.commit()
    db.refresh(db_drug)
    return Response(data=DrugOut.model_validate(db_drug))


@router.delete("/drugs/{drug_id}")
def delete_drug(drug_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_DELETE))):
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(404, "药品不存在")
    drug.is_active = False
    db.commit()
    return Response(message="药品已删除")


@router.get("/drugs/export")
def export_drugs(category: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_READ))):
    query = db.query(Drug).filter(Drug.is_active == True)
    if category:
        query = query.filter(Drug.category_name == category)
    drugs = query.order_by(Drug.category_name, Drug.name).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["名称", "常用量", "单位", "分类", "拼音", "条形码", "进价", "售价", "库存", "报警值", "厂家", "批准文号", "功效", "性味", "归经"])
    for d in drugs:
        writer.writerow([d.name, d.common_dosage, d.unit, d.category_name, d.pinyin, d.barcode,
                         d.purchase_price, d.selling_price, d.stock, d.stock_alert,
                         d.manufacturer, d.approval_number, d.efficacy, d.property_taste, d.meridian])
    return FastAPIResponse(content=output.getvalue(), media_type="text/csv",
                           headers={"Content-Disposition": f"attachment; filename=drugs_{date.today().isoformat()}.csv"})


@router.get("/purchases")
def list_purchases(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                   keyword: Optional[str] = None, date_from: Optional[str] = None, date_to: Optional[str] = None,
                   drug_id: Optional[int] = None, supplier: Optional[str] = None,
                   db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_READ))):
    query = db.query(Purchase)
    if keyword:
        query = query.filter(or_(Purchase.drug_name.ilike(f"%{keyword}%"), Purchase.supplier.ilike(f"%{keyword}%")))
    if date_from: query = query.filter(Purchase.purchase_date >= date_from)
    if date_to: query = query.filter(Purchase.purchase_date <= date_to)
    if drug_id: query = query.filter(Purchase.drug_id == drug_id)
    if supplier: query = query.filter(Purchase.supplier.ilike(f"%{supplier}%"))
    total = query.count()
    items = query.order_by(Purchase.purchase_date.desc(), Purchase.id.desc()).offset((page-1)*page_size).limit(page_size).all()
    return Response(data={"items": [{
        "id": p.id, "purchase_date": str(p.purchase_date) if p.purchase_date else "",
        "drug_id": p.drug_id, "drug_name": p.drug_name, "quantity": p.quantity,
        "unit": p.unit, "purchase_price": p.purchase_price, "selling_price": p.selling_price,
        "total_amount": p.total_amount, "supplier": p.supplier, "batch_no": p.batch_no,
    } for p in items], "total": total, "page": page, "page_size": page_size})


@router.post("/purchases")
def create_purchase(data: dict, db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_CREATE))):
    pdate = date.today()
    if data.get("purchase_date"):
        try: pdate = datetime.strptime(data["purchase_date"], "%Y-%m-%d").date()
        except ValueError: pass
    qty = int(data.get("quantity", 0))
    pp = float(data.get("purchase_price", 0))
    sp = float(data.get("selling_price", 0))
    purchase = Purchase(purchase_date=pdate, drug_id=data.get("drug_id"),
        drug_name=data.get("drug_name"), quantity=qty, unit=data.get("unit", "克"),
        purchase_price=pp, selling_price=sp, total_amount=data.get("total_amount") or (qty * pp),
        supplier=data.get("supplier"), batch_no=data.get("batch_no"), created_by=current_user.id)
    db.add(purchase)
    drug = db.query(Drug).filter(Drug.id == data.get("drug_id")).first()
    if drug:
        drug.stock = (drug.stock or 0) + qty
    db.commit()
    return Response(message="进货记录已添加")


@router.get("/sales")
def list_sales(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
               date_from: Optional[str] = None, date_to: Optional[str] = None,
               db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_READ))):
    query = db.query(Sale)
    if date_from: query = query.filter(Sale.sale_date >= date_from)
    if date_to: query = query.filter(Sale.sale_date <= date_to)
    total = query.count()
    items = query.order_by(Sale.sale_date.desc(), Sale.id.desc()).offset((page-1)*page_size).limit(page_size).all()
    return Response(data={"items": [{
        "id": s.id, "sale_date": str(s.sale_date), "drug_id": s.drug_id,
        "drug_name": s.drug_name, "quantity": s.quantity, "unit": s.unit,
        "selling_price": s.selling_price, "total_amount": s.total_amount,
        "profit": s.profit, "patient_name": s.patient_name, "doctor_name": s.doctor_name,
    } for s in items], "total": total, "page": page, "page_size": page_size})


@router.get("/sales/summary")
def sales_summary(date_from: Optional[str] = None, date_to: Optional[str] = None,
                  db: Session = Depends(get_db), current_user: User = Depends(require_permissions(PHARMACY_READ))):
    query = db.query(Sale)
    if date_from: query = query.filter(Sale.sale_date >= date_from)
    if date_to: query = query.filter(Sale.sale_date <= date_to)
    total_qty = query.with_entities(func.sum(Sale.quantity)).scalar() or 0
    total_amount = query.with_entities(func.sum(Sale.total_amount)).scalar() or 0
    total_profit = query.with_entities(func.sum(Sale.profit)).scalar() or 0
    return Response(data={
        "total_quantity": total_qty, "total_amount": round(total_amount, 2),
        "total_profit": round(total_profit, 2),
    })
