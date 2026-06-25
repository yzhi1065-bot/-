"""聚药堂中药价格查询API"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PHARMACY_READ, PHARMACY_CREATE
from app.models.user import User
from app.models.drug_price import DrugPrice
from app.schemas.common import Response

router = APIRouter(prefix="/api/pharmacy/prices", tags=["聚药堂价格"])


class DrugPriceOut(BaseModel):
    id: int
    name: str
    spec: str
    price: float
    origin: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class BatchPriceUpdate(BaseModel):
    """批量更新价格"""
    prices: list[dict]  # [{"name":"矮地茶","spec":"选/1kg","price":16.0,"origin":"河北"}]


@router.get("")
def search_prices(
    keyword: Optional[str] = Query(None, description="药材名称关键词"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PHARMACY_READ)),
):
    """模糊搜索药材价格"""
    query = db.query(DrugPrice)
    if keyword:
        query = query.filter(DrugPrice.name.ilike(f"%{keyword}%"))
    total = query.count()
    items = query.order_by(DrugPrice.name, DrugPrice.spec).offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for item in items:
        d = {
            "id": item.id,
            "name": item.name,
            "spec": item.spec,
            "price": item.price,
            "origin": item.origin,
            "updated_at": str(item.updated_at) if item.updated_at else None,
        }
        result.append(d)

    return Response(data={
        "items": result,
        "total": total,
        "page": page,
        "page_size": page_size,
    })


@router.get("/{price_id}")
def get_price_detail(
    price_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PHARMACY_READ)),
):
    """获取单条价格详情"""
    item = db.query(DrugPrice).filter(DrugPrice.id == price_id).first()
    if not item:
        raise HTTPException(404, "价格记录不存在")
    return Response(data={
        "id": item.id,
        "name": item.name,
        "spec": item.spec,
        "price": item.price,
        "origin": item.origin,
        "updated_at": str(item.updated_at) if item.updated_at else None,
    })


@router.post("/batch")
def batch_update_prices(
    data: BatchPriceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PHARMACY_CREATE)),
):
    """批量更新价格（覆盖式导入）"""
    imported = 0
    updated = 0
    for item in data.prices:
        name = item.get("name", "").strip()
        spec = item.get("spec", "").strip()
        if not name or not spec:
            continue

        price = item.get("price", 0)
        origin = item.get("origin", "")

        existing = db.query(DrugPrice).filter(
            DrugPrice.name == name,
            DrugPrice.spec == spec,
        ).first()

        if existing:
            existing.price = price
            existing.origin = origin
            updated += 1
        else:
            db.add(DrugPrice(name=name, spec=spec, price=price, origin=origin))
            imported += 1

    db.commit()
    return Response(message=f"导入完成: 新增 {imported} 条, 更新 {updated} 条", data={
        "imported": imported,
        "updated": updated,
        "total": imported + updated,
    })
