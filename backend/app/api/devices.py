"""设备管理接口"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_permissions, DEVICE_READ, DEVICE_CREATE
from app.models.user import User
from app.models.device import Device, DeviceLog
from app.schemas.device import DeviceRegister, DeviceStatusUpdate, DeviceResponse
from app.schemas.common import Response

router = APIRouter(prefix="/api/devices", tags=["设备管理"])


@router.get("", response_model=Response[List[DeviceResponse]])
def list_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DEVICE_READ)),
):
    """获取设备列表"""
    devices = db.query(Device).all()
    return Response(data=[DeviceResponse.model_validate(d) for d in devices])


@router.post("/register", response_model=Response[DeviceResponse])
def register_device(
    data: DeviceRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DEVICE_CREATE)),
):
    """注册设备"""
    existing = db.query(Device).filter(Device.serial_no == data.serial_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="设备已注册")

    device = Device(**data.model_dump())
    db.add(device)
    db.commit()
    db.refresh(device)
    return Response(data=DeviceResponse.model_validate(device))


@router.put("/{device_id}/status", response_model=Response)
def update_device_status(
    device_id: int,
    status_update: DeviceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(DEVICE_CREATE)),
):
    """更新设备状态"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")

    device.status = status_update.status
    if status_update.status == "online":
        from datetime import datetime, timezone
        device.last_connected_at = datetime.now()

    # 记录日志
    log = DeviceLog(
        device_id=device_id,
        event_type=f"status_{status_update.status}",
        data_quality=status_update.data_quality,
    )
    db.add(log)
    db.commit()

    return Response(message=f"设备状态已更新为 {status_update.status}")
