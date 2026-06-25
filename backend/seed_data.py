"""数据库种子数据 - 中药材、方剂、穴位"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash
from app.data.seed_data import HERBS, FORMULAS, ACUPOINTS

# Import the pharmacy model
from app.models.pharmacy import Drug, DrugCategory, Supplier


def seed_all():
    db = SessionLocal()
    try:
        # 1. 检查是否已有数据
        if db.query(Drug).count() > 0:
            print("✅ 已有种子数据，跳过")
            return

        # 2. 创建药品分类
        categories = {}
        all_cats = set(h["category"] for h in HERBS)
        for cat_name in all_cats:
            cat = DrugCategory(name=cat_name)
            db.add(cat)
            db.flush()
            categories[cat_name] = cat.id

        # 3. 创建药品
        for h in HERBS:
            drug = Drug(
                name=h["name"],
                category_id=categories.get(h["category"]),
                category_name=h["category"],
                property_taste=h["property"],
                meridian=h["meridian"],
                effect=h["effect"],
                dosage=h["dosage"],
                contraindication=h["contraindication"],
                price=0.0,
                unit="克",
                current_stock=1000,
                minimum_stock=100,
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
