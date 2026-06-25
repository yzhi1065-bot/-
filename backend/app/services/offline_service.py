"""离线同步服务 - SQLite本地缓存"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json

# 内存缓存（生产环境应使用本地SQLite/IndexedDB）
offline_cache: Dict[str, Any] = {
    "pending_sync": [],
    "last_sync_time": None,
    "sync_conflicts": [],
}


class SyncService:
    """离线数据同步服务"""

    @staticmethod
    def get_status() -> dict:
        return {
            "queue_size": len(offline_cache["pending_sync"]),
            "last_sync": str(offline_cache["last_sync_time"]) if offline_cache["last_sync_time"] else None,
            "conflicts": len(offline_cache["sync_conflicts"]),
        }

    @staticmethod
    def add_to_queue(data: dict) -> int:
        data["_queued_at"] = datetime.now().isoformat()
        offline_cache["pending_sync"].append(data)
        return len(offline_cache["pending_sync"])

    @staticmethod
    def sync_all() -> dict:
        count = len(offline_cache["pending_sync"])
        offline_cache["pending_sync"] = []
        offline_cache["last_sync_time"] = datetime.now()
        return {"synced": count}

    @staticmethod
    def resolve_conflict(conflict_id: str, resolution: str) -> bool:
        for c in offline_cache["sync_conflicts"]:
            if c.get("id") == conflict_id:
                c["resolution"] = resolution
                c["resolved_at"] = datetime.now().isoformat()
                return True
        return False
