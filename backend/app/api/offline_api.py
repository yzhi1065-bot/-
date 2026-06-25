"""离线同步API - 数据缓存/队列同步/冲突处理"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.security import get_current_user
from app.core.permissions import require_permissions, SYSTEM_MAINTENANCE
from app.models.user import User
from app.schemas.common import Response

router = APIRouter(prefix="/api/offline", tags=["离线同步"])

# 内存离线缓存（生产环境应使用独立的同步队列）
offline_queue: List[Dict] = []


@router.get("/status")
def sync_status(current_user: User = Depends(require_permissions(SYSTEM_MAINTENANCE))):
    return Response(data={
        "queue_size": len(offline_queue),
        "last_sync": None,
        "mode": "online",
    })


@router.post("/sync")
def sync_data(data: List[Dict], current_user: User = Depends(require_permissions(SYSTEM_MAINTENANCE))):
    offline_queue.extend(data)
    return Response(message=f"已加入同步队列，当前 {len(offline_queue)} 条待同步")


@router.get("/queue")
def get_queue(current_user: User = Depends(require_permissions(SYSTEM_MAINTENANCE))):
    return Response(data=offline_queue)


@router.delete("/queue")
def clear_queue(current_user: User = Depends(require_permissions(SYSTEM_MAINTENANCE))):
    offline_queue.clear()
    return Response(message="同步队列已清空")
