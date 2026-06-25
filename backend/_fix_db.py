"""Fix missing DB columns"""
import sys; sys.path.insert(0, '.')
from app.core.database import engine

with engine.connect() as conn:
    trans = conn.begin()
    try:
        # Check if health_advice column exists
        r = conn.execute(
            "SELECT COUNT(*) FROM pragma_table_info('ai_diagnosis_results') WHERE name='health_advice'"
        )
        if r.scalar() == 0:
            conn.execute("ALTER TABLE ai_diagnosis_results ADD COLUMN health_advice JSON")
            print("Added health_advice column")
        else:
            print("health_advice exists")
        trans.commit()
    except Exception as e:
        trans.rollback()
        print(f"Error: {e}")

print("Done")
