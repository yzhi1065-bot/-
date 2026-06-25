"""设备 Schema"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeviceRegister(BaseModel):
    """设备注册"""
    name: str
    device_type: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_no: str
    connection_type: str = "usb"


class DeviceStatusUpdate(BaseModel):
    """设备状态更新"""
    status: str  # online/offline/error
    data_quality: Optional[float] = None


class DeviceResponse(BaseModel):
    """设备信息响应"""
    id: int
    name: str
    device_type: str
    manufacturer: Optional[str]
    model: Optional[str]
    serial_no: str
    status: str
    last_connected_at: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True
