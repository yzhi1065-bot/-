"""设备模型"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Text, JSON, Float, ForeignKey, Boolean
)
from sqlalchemy.sql import func
from app.core.database import Base


class Device(Base):
    """设备表"""
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)       # 设备名称
    device_type = Column(String(50), nullable=False)  # pulse/tongue/face/voice
    manufacturer = Column(String(100))                # 厂商
    model = Column(String(100))                       # 型号
    serial_no = Column(String(100), unique=True)      # 序列号
    firmware_version = Column(String(50))             # 固件版本
    driver_version = Column(String(50))               # 驱动版本
    connection_type = Column(String(20), default="usb")  # usb/bluetooth/wifi
    status = Column(String(20), default="offline")    # online/offline/error
    last_connected_at = Column(DateTime)
    last_calibrated_at = Column(DateTime)
    calibration_due_days = Column(Integer, default=30)
    location = Column(String(100))                    # 位置
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    config = Column(JSON)                             # 设备配置
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class DeviceLog(Base):
    """设备日志表"""
    __tablename__ = "device_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    event_type = Column(String(50), nullable=False)   # connect/disconnect/error/data
    message = Column(Text)
    data_quality = Column(Float)                       # 数据质量评分
    created_at = Column(DateTime, server_default=func.now())
