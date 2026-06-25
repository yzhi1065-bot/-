"""导入聚药堂报价单 JSON 到 DrugPrice 表"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.drug_price import DrugPrice


def import_prices(json_path: str):
    """从 JSON 文件导入价格数据"""
    if not os.path.exists(json_path):
        print(f"❌ 文件不存在: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("❌ JSON 格式错误: 应为数组")
        return

    db = SessionLocal()
    try:
        imported = 0
        updated = 0

        for item in data:
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
        print(f"✅ 导入完成: 新增 {imported} 条, 更新 {updated} 条, 合计 {imported + updated} 条")
    except Exception as e:
        db.rollback()
        print(f"❌ 导入失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)

    default_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "juyaotang_prices.json"
    )

    json_path = sys.argv[1] if len(sys.argv) > 1 else default_path
    import_prices(json_path)
