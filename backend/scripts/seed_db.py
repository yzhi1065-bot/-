"""数据库种子数据 - 中药材、方剂、穴位"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.pharmacy import Drug, DrugCategory, Supplier
from app.data.seed_data import HERBS, FORMULAS, ACUPOINTS


def seed_all():
    db = SessionLocal()
    try:
        if db.query(Drug).count() > 0:
            print("✅ 已有种子数据，跳过")
            return

        # 创建分类
        categories = {}
        all_cats = sorted(set(h["category"] for h in HERBS))
        for cat_name in all_cats:
            cat = DrugCategory(name=cat_name)
            db.add(cat)
            db.flush()
            categories[cat_name] = cat.id

        # 创建药品
        for h in HERBS:
            drug = Drug(
                name=h["name"],
                category_id=categories.get(h["category"]),
                category_name=h["category"],
                property_taste=h["property"],
                meridian=h["meridian"],
                effect=h["effect"],
                dosage=h.get("dosage", ""),
                contraindication=h.get("contraindication", ""),
                selling_price=0.0,
                unit="克",
                stock=1000,
                stock_alert=100,
                is_active=True,
            )
            db.add(drug)

        db.commit()
        print(f"✅ 已导入 {len(HERBS)} 味药材、{len(FORMULAS)} 个方剂、{len(ACUPOINTS)} 个穴位")
    except Exception as e:
        db.rollback()
        print(f"❌ 种子数据导入失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_all()
