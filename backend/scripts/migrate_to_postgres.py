#!/usr/bin/env python3
"""SQLite → PostgreSQL 数据迁移脚本

用法:
    python scripts/migrate_to_postgres.py

要求:
    - 当前 DATABASE_URL 指向 SQLite 数据库（有数据）
    - 目标 PostgreSQL 数据库已创建（空库，或已有表结构）
    - 在 .env 中设置 DATABASE_URL=postgresql://user:pass@host:5432/dbname
    - 建议先运行 `alembic upgrade head` 初始化 PostgreSQL 表结构
"""

import sys
import os

# 将项目根目录加入 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 必须先导入 settings 读取数据库 URL
os.environ.setdefault("DATABASE_URL", "sqlite:///./tcm.db")

from app.core.config import settings  # noqa: E402
from sqlalchemy import create_engine, inspect, MetaData, Table  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402


def get_tables(engine) -> list:
    """获取数据库中所有用户表"""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    # 排除 alembic 版本表
    return [t for t in tables if t != "alembic_version"]


def get_all_data(engine) -> dict:
    """从源数据库读取所有表数据"""
    source_session = sessionmaker(bind=engine)()
    tables = get_tables(engine)
    data = {}

    for table_name in tables:
        print(f"  读取表: {table_name}")
        metadata = MetaData()
        table = Table(table_name, metadata, autoload_with=engine)
        rows = source_session.execute(table.select()).fetchall()
        data[table_name] = {
            "table": table,
            "rows": [dict(row._mapping) for row in rows],
        }
        print(f"    → {len(data[table_name]['rows'])} 条记录")

    source_session.close()
    return data


def is_postgres_empty(engine) -> bool:
    """检查 PostgreSQL 目标库是否为空"""
    tables = get_tables(engine)
    if not tables:
        return True
    # 只有 alembic_version 也算空（数据表层面）
    return len(tables) == 0


def write_data(target_engine, data: dict, batch_size: int = 500):
    """将数据写入目标数据库"""
    target_session = sessionmaker(bind=target_engine)()

    for table_name, table_data in data.items():
        table = table_data["table"]
        rows = table_data["rows"]
        if not rows:
            continue

        print(f"  写入表: {table_name} ({len(rows)} 条)")

        # 分批插入
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            try:
                target_session.execute(table.insert(), batch)
                target_session.commit()
            except Exception as e:
                target_session.rollback()
                print(f"    ⚠ 批次插入失败: {e}")
                print(f"    → 尝试逐条插入...")
                # 逐条插入以跳过冲突行
                for row in batch:
                    try:
                        target_session.execute(table.insert(), row)
                        target_session.commit()
                    except Exception as row_e:
                        target_session.rollback()
                        print(f"    ⚠ 跳过记录: {row.get('id', '?')} - {row_e}")

        print(f"    ✓ 完成")

    target_session.close()


def main():
    print("=" * 60)
    print("  SQLite → PostgreSQL 数据迁移")
    print("=" * 60)

    # ── 源数据库（SQLite）──
    source_url = settings.DATABASE_URL
    if "sqlite" not in source_url:
        print("⚠ 当前 DATABASE_URL 不是 SQLite 数据库，请先设置 .env 中 DATABASE_URL=sqlite:///./tcm.db")
        proceed = input("是否继续以当前数据库为源？(y/N): ")
        if proceed.lower() != "y":
            print("已取消")
            return

    print(f"\n📂 源数据库: {source_url}")
    source_engine = create_engine(
        source_url,
        connect_args={"check_same_thread": False} if "sqlite" in source_url else {},
    )

    # ── 目标数据库（PostgreSQL）──
    target_url = os.environ.get("PG_DATABASE_URL", "")
    if not target_url:
        target_url = input("\n📦 目标 PostgreSQL 连接 URL: ").strip()
    if not target_url:
        print("❌ 未提供目标数据库 URL")
        return

    # 安全：确保 URL 是 PostgreSQL
    if "postgresql" not in target_url and "postgres" not in target_url:
        print("❌ 目标 URL 不是 PostgreSQL 连接")
        return

    print(f"📦 目标数据库: {target_url.split('@')[-1] if '@' in target_url else target_url}")
    target_engine = create_engine(target_url)

    # ── 检查 PostgreSQL 是否为空 ──
    if not is_postgres_empty(target_engine):
        print("⚠ 目标数据库已有数据表。")
        print("  建议: 先运行 `alembic upgrade head` 初始化表结构，")
        print("        但确保表是空的（没有业务数据）。")
        proceed = input("是否继续？数据可能重复！(y/N): ")
        if proceed.lower() != "y":
            print("已取消")
            return

    # ── 执行迁移 ──
    print("\n🔍 读取源数据...")
    data = get_all_data(source_engine)

    total_records = sum(len(d["rows"]) for d in data.values())
    print(f"\n📊 共读取 {len(data)} 个表，{total_records} 条记录")

    if total_records == 0:
        print("ℹ 源数据库为空，无需迁移")
        return

    print(f"\n💾 写入目标数据库...")
    write_data(target_engine, data)

    print("\n" + "=" * 60)
    print("  ✅ 迁移完成")
    print("=" * 60)
    print(f"  迁移表数: {len(data)}")
    print(f"  迁移记录: {total_records}")
    print("=" * 60)


if __name__ == "__main__":
    main()
