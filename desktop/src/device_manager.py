"""
设备接入框架 - 设备管理器
管理所有设备的注册、连接、数据采集生命周期
"""

import threading
import time
import json
from typing import Dict, Optional, List, Callable
from dataclasses import dataclass
from enum import Enum
from datetime import datetime


class DeviceStatus(Enum):
    OFFLINE = "offline"
    ONLINE = "online"
    COLLECTING = "collecting"
    ERROR = "error"


class DeviceType(Enum):
    PULSE = "pulse"
    TONGUE = "tongue"
    FACE = "face"
    VOICE = "voice"


@dataclass
class DeviceInfo:
    """设备信息"""
    id: str
    name: str
    device_type: DeviceType
    manufacturer: str = ""
    model: str = ""
    serial_no: str = ""
    status: DeviceStatus = DeviceStatus.OFFLINE
    connected_at: Optional[datetime] = None
    data_quality: float = 1.0
    config: dict = None


class BaseDeviceAdapter:
    """设备适配器基类 - 所有设备适配器需继承此类"""

    def __init__(self, device_info: DeviceInfo):
        self.device_info = device_info
        self._callbacks: List[Callable] = []

    def connect(self) -> bool:
        """连接设备"""
        raise NotImplementedError

    def disconnect(self) -> bool:
        """断开设备"""
        raise NotImplementedError

    def collect(self) -> dict:
        """采集数据"""
        raise NotImplementedError

    def preprocess(self, raw_data: dict) -> dict:
        """数据预处理"""
        raise NotImplementedError

    def get_status(self) -> DeviceStatus:
        """获取设备状态"""
        return self.device_info.status

    def add_callback(self, callback: Callable):
        """添加数据回调"""
        self._callbacks.append(callback)

    def _notify_callbacks(self, data: dict):
        """通知所有回调"""
        for callback in self._callbacks:
            try:
                callback(data)
            except Exception as e:
                print(f"Callback error: {e}")


class DeviceManager:
    """设备管理器 - 单例模式"""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._devices: Dict[str, BaseDeviceAdapter] = {}
        self._collecting = False
        self._collect_thread: Optional[threading.Thread] = None

    def register_device(self, device_id: str, adapter: BaseDeviceAdapter) -> bool:
        """注册设备"""
        if device_id in self._devices:
            print(f"设备 {device_id} 已注册")
            return False
        self._devices[device_id] = adapter
        print(f"设备 {device_id} 注册成功")
        return True

    def unregister_device(self, device_id: str) -> bool:
        """注销设备"""
        if device_id not in self._devices:
            return False
        self._devices[device_id].disconnect()
        del self._devices[device_id]
        return True

    def connect_all(self) -> Dict[str, bool]:
        """连接所有设备"""
        results = {}
        for device_id, adapter in self._devices.items():
            try:
                ok = adapter.connect()
                results[device_id] = ok
            except Exception as e:
                print(f"连接设备 {device_id} 失败: {e}")
                results[device_id] = False
        return results

    def disconnect_all(self):
        """断开所有设备"""
        for adapter in self._devices.values():
            try:
                adapter.disconnect()
            except Exception as e:
                print(f"断开设备失败: {e}")

    def get_device(self, device_id: str) -> Optional[BaseDeviceAdapter]:
        """获取设备适配器"""
        return self._devices.get(device_id)

    def get_device_list(self) -> List[DeviceInfo]:
        """获取所有设备信息"""
        return [adapter.device_info for adapter in self._devices.values()]

    def collect_all(self) -> Dict[str, dict]:
        """采集所有设备数据"""
        results = {}
        for device_id, adapter in self._devices.items():
            if adapter.device_info.status == DeviceStatus.ONLINE:
                try:
                    raw = adapter.collect()
                    processed = adapter.preprocess(raw)
                    results[device_id] = processed
                except Exception as e:
                    print(f"采集设备 {device_id} 数据失败: {e}")
                    results[device_id] = {"error": str(e)}
        return results

    def start_continuous_collect(self, interval: float = 1.0):
        """开始持续采集"""
        if self._collecting:
            return

        self._collecting = True
        self._collect_thread = threading.Thread(
            target=self._collect_loop,
            args=(interval,),
            daemon=True,
        )
        self._collect_thread.start()
        print("开始持续采集")

    def stop_continuous_collect(self):
        """停止持续采集"""
        self._collecting = False
        if self._collect_thread:
            self._collect_thread.join(timeout=2)
        print("停止持续采集")

    def _collect_loop(self, interval: float):
        """采集循环"""
        while self._collecting:
            data = self.collect_all()
            for device_id, device_data in data.items():
                adapter = self._devices.get(device_id)
                if adapter:
                    adapter._notify_callbacks(device_data)
            time.sleep(interval)

    def to_json(self) -> str:
        """导出设备配置"""
        config = {
            "devices": [
                {
                    "id": adapter.device_info.id,
                    "name": adapter.device_info.name,
                    "device_type": adapter.device_info.device_type.value,
                    "manufacturer": adapter.device_info.manufacturer,
                    "model": adapter.device_info.model,
                    "config": adapter.device_info.config,
                }
                for adapter in self._devices.values()
            ]
        }
        return json.dumps(config, ensure_ascii=False, indent=2)
