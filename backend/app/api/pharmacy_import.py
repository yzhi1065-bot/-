"""药品Excel导入API - 支持导入进货单"""
import io
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import openpyxl

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PHARMACY_CREATE
from app.models.user import User
from app.models.pharmacy import Drug, Purchase
from app.schemas.common import Response

router = APIRouter(prefix="/api/pharmacy/purchases", tags=["药品管理-导入"])


@router.post("/import")
async def import_purchases(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(PHARMACY_CREATE)),
):
    """上传Excel文件批量导入进货单

    预期的Excel列顺序（第一行为表头）:
        品名 | 规格 | 数量 | 单价 | 供货单位 | 批号 | 有效期 | 生产厂家
    """
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(400, "请上传 .xlsx 或 .xls 格式的Excel文件")

    # 读取上传文件
    contents = await file.read()
    try:
        wb = openpyxl.load_workbook(io.BytesIO(contents), data_only=True)
    except Exception as e:
        raise HTTPException(400, f"无法解析Excel文件: {e}")

    ws = wb.active
    if ws is None:
        raise HTTPException(400, "Excel文件中没有工作表")

    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        raise HTTPException(400, "Excel文件至少需要包含表头行和一行数据")

    header = [str(c or "").strip() for c in rows[0]]
    expected = ["品名", "规格", "数量", "单价", "供货单位", "批号", "有效期", "生产厂家"]
    # 宽松校验：检查是否包含核心列"品名"和"数量"
    if "品名" not in header or "数量" not in header:
        raise HTTPException(400, f"表头格式不正确，需要的列: {' | '.join(expected)}")

    # 确定各列索引
    col_map = {}
    for h in expected:
        try:
            col_map[h] = header.index(h)
        except ValueError:
            col_map[h] = None

    success_count = 0
    error_list = []
    today = date.today()

    for row_idx, row in enumerate(rows[1:], start=2):
        line_no = row_idx
        try:
            # 读取各列值
            drug_name = str(row[col_map["品名"]] or "").strip() if col_map["品名"] is not None else ""
            spec = str(row[col_map["规格"]] or "").strip() if col_map["规格"] is not None else ""
            quantity_str = str(row[col_map["数量"]] or "0").strip() if col_map["数量"] is not None else "0"
            price_str = str(row[col_map["单价"]] or "0").strip() if col_map["单价"] is not None else "0"
            supplier = str(row[col_map["供货单位"]] or "").strip() if col_map["供货单位"] is not None else ""
            batch_no = str(row[col_map["批号"]] or "").strip() if col_map["批号"] is not None else ""
            expiry_raw = row[col_map["有效期"]] if col_map["有效期"] is not None else None
            manufacturer = str(row[col_map["生产厂家"]] or "").strip() if col_map["生产厂家"] is not None else ""

            if not drug_name:
                error_list.append(f"第{line_no}行: 品名为空，跳过")
                continue

            # 解析数量
            try:
                quantity = int(float(quantity_str))
            except (ValueError, TypeError):
                error_list.append(f"第{line_no}行: 数量 '{quantity_str}' 格式无效")
                continue

            if quantity <= 0:
                error_list.append(f"第{line_no}行: 数量必须大于0")
                continue

            # 解析单价
            try:
                unit_price = float(price_str)
            except (ValueError, TypeError):
                unit_price = 0.0

            # 解析有效期
            expiry_date = None
            if expiry_raw is not None:
                if isinstance(expiry_raw, datetime):
                    expiry_date = expiry_raw.date()
                elif isinstance(expiry_raw, date):
                    expiry_date = expiry_raw
                elif isinstance(expiry_raw, str):
                    expiry_raw = expiry_raw.strip()
                    if expiry_raw:
                        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y年%m月%d日"):
                            try:
                                expiry_date = datetime.strptime(expiry_raw, fmt).date()
                                break
                            except ValueError:
                                continue

            # 查找或创建药品
            drug = db.query(Drug).filter(Drug.name == drug_name, Drug.is_active == True).first()
            if not drug:
                # 自动创建新药品
                drug = Drug(
                    name=drug_name,
                    unit=spec or "克",
                    manufacturer=manufacturer,
                    stock=0,
                    is_active=True,
                )
                db.add(drug)
                db.flush()

            # 规格作为 unit，如果已有 unit 且规格不为空则覆盖
            if spec:
                drug.unit = spec

            # 创建进货记录
            total_amount = round(quantity * unit_price, 2)
            purchase = Purchase(
                purchase_date=today,
                drug_id=drug.id,
                drug_name=drug_name,
                quantity=quantity,
                unit=drug.unit or "克",
                purchase_price=unit_price,
                total_amount=total_amount,
                supplier=supplier,
                manufacturer=manufacturer,
                batch_no=batch_no,
                expiry_date=expiry_date,
                created_by=current_user.id,
            )
            db.add(purchase)

            # 更新库存
            drug.stock = (drug.stock or 0) + quantity

            success_count += 1

        except Exception as e:
            error_list.append(f"第{line_no}行: {str(e)}")
            continue

    db.commit()
    wb.close()

    message = f"成功导入 {success_count} 条进货记录"
    if error_list:
        message += f"，{len(error_list)} 条跳过"
    if success_count == 0 and error_list:
        db.rollback()
        raise HTTPException(400, f"导入失败，全部 {len(error_list)} 行均有错误", detail=error_list[:10])

    return Response(
        message=message,
        data={
            "success_count": success_count,
            "error_count": len(error_list),
            "errors": error_list[:20],  # 最多返回前20条错误
        },
    )
