#!/usr/bin/env python3
"""数据库自动备份脚本

支持 SQLite 和 PostgreSQL 两种模式，自动清理 7 天前的备份。

用法:
    python -m app.scripts.backup              # 使用当前配置
    python -m app.scripts.backup --type sqlite  # 强制 SQLite 模式
    python -m app.scripts.backup --type postgres  # 强制 PostgreSQL 模式
    python -m app.scripts.backup --keep 14      # 保留 14 天备份

定时任务（cron / 任务计划程序）示例:
    # 每天凌晨 2:00 执行备份
    0 2 * * * cd /path/to/backend && python -m app.scripts.backup
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

# 将项目根目录加入 Python 路径
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

# 设置默认环境变量
os.environ.setdefault("DATABASE_URL", "sqlite:///./tcm.db")


def get_project_root() -> Path:
    """获取项目根目录 (backend/)"""
    return Path(__file__).resolve().parents[2]


def get_backup_dir() -> Path:
    """获取备份目录"""
    backup_dir = get_project_root() / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    return backup_dir


def backup_sqlite(db_path: str) -> str:
    """SQLite 备份 - 使用文件拷贝（跨平台兼容）"""
    backup_dir = get_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"tcm_db_{timestamp}.sqlite3"

    print(f"[SQLite] 备份: {db_path} → {backup_file}")

    # 解析相对路径
    resolved_path = db_path
    if not os.path.isabs(db_path):
        resolved_path = str(get_project_root() / db_path)

    if not os.path.exists(resolved_path):
        raise FileNotFoundError(f"SQLite 数据库文件不存在: {resolved_path}")

    import shutil
    shutil.copy2(resolved_path, backup_file)

    print(f"  ✓ 备份完成: {backup_file} ({backup_file.stat().st_size / 1024:.1f} KB)")
    return str(backup_file)


def backup_postgres(database_url: str) -> str:
    """PostgreSQL 备份 - 使用 pg_dump"""
    backup_dir = get_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"tcm_db_{timestamp}.sql"

    # 解析 PostgreSQL URL
    # postgresql://user:pass@host:port/dbname
    from urllib.parse import urlparse
    parsed = urlparse(database_url)

    dbname = parsed.path.lstrip("/")
    host = parsed.hostname or "localhost"
    port = str(parsed.port or 5432)
    user = parsed.username or "postgres"
    password = parsed.password or ""

    print(f"[PostgreSQL] 备份: {dbname}@{host}:{port} → {backup_file}")

    # 设置 PGPASSWORD 环境变量以避免交互式密码输入
    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password

    result = subprocess.run(
        [
            "pg_dump",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", dbname,
            "-F", "p",           # 纯文本格式
            "-f", str(backup_file),
        ],
        capture_output=True, text=True, timeout=300,
        env=env,
    )
    if result.returncode != 0:
        print(f"  ❌ pg_dump 失败: {result.stderr.strip()}")
        # 如果备份文件已创建但可能不完整，删除它
        if backup_file.exists():
            backup_file.unlink()
        raise RuntimeError(f"pg_dump failed: {result.stderr.strip()}")

    print(f"  ✓ 备份完成: {backup_file} ({backup_file.stat().st_size / 1024:.1f} KB)")
    return str(backup_file)


def clean_old_backups(keep_days: int = 7, backup_dir: Path = None):
    """清理 keep_days 天前的备份"""
    if backup_dir is None:
        backup_dir = get_backup_dir()

    cutoff = datetime.now() - timedelta(days=keep_days)
    deleted = 0
    kept = 0

    for f in sorted(backup_dir.iterdir()):
        if not f.is_file():
            continue
        # 只清理我们的备份文件
        if not (
            f.name.startswith("tcm_db_")
            and (f.suffix in (".sqlite3", ".sql", ".gz"))
        ):
            continue

        # 从文件名解析时间戳: tcm_db_20250101_120000.sqlite3
        try:
            parts = f.stem.split("_")
            # parts = ["tcm", "db", "20250101", "120000"]
            if len(parts) >= 4:
                file_date = datetime.strptime(f"{parts[2]} {parts[3]}", "%Y%m%d %H%M%S")
            else:
                # 如果解析不了，按文件修改时间
                file_date = datetime.fromtimestamp(f.stat().st_mtime)
        except (ValueError, IndexError):
            file_date = datetime.fromtimestamp(f.stat().st_mtime)

        if file_date < cutoff:
            f.unlink()
            deleted += 1
            print(f"  🗑 清理旧备份: {f.name}")
        else:
            kept += 1

    if deleted:
        print(f"  已清理 {deleted} 个旧备份，保留 {kept} 个")
    else:
        print(f"  无需清理，保留 {kept} 个备份")


def detect_db_type() -> str:
    """从 DATABASE_URL 检测数据库类型"""
    from app.core.config import settings
    url = settings.DATABASE_URL
    if "postgresql" in url or "postgres" in url:
        return "postgres"
    return "sqlite"


def main():
    parser = argparse.ArgumentParser(description="数据库自动备份")
    parser.add_argument(
        "--type", choices=["sqlite", "postgres", "auto"], default="auto",
        help="数据库类型（默认自动检测）",
    )
    parser.add_argument(
        "--keep", type=int, default=7,
        help="保留备份天数（默认 7 天）",
    )
    parser.add_argument(
        "--no-clean", action="store_true",
        help="不清理旧备份",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("  数据库自动备份")
    print(f"  时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 检测数据库类型
    if args.type == "auto":
        db_type = detect_db_type()
    else:
        db_type = args.type
    print(f"  数据库类型: {db_type}")

    try:
        # 执行备份
        if db_type == "sqlite":
            from app.core.config import settings
            url = settings.DATABASE_URL
            # 提取 SQLite 文件路径
            # sqlite:///./tcm.db → ./tcm.db
            db_path = url.replace("sqlite:///", "")
            backup_sqlite(db_path)
        else:
            from app.core.config import settings
            backup_postgres(settings.DATABASE_URL)

        # 清理旧备份
        if not args.no_clean:
            print(f"\n  清理 {args.keep} 天前的备份...")
            clean_old_backups(keep_days=args.keep)

        print("\n" + "=" * 60)
        print("  ✅ 备份完成")
        print("=" * 60)

    except Exception as e:
        print(f"\n  ❌ 备份失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
