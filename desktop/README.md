# 设备接入框架

## 概述
提供统一的设备接入抽象层，支持脉诊仪、舌诊仪、面诊仪、声诊仪等四诊设备的连接、数据采集和预处理。采用适配器模式，各厂商设备实现统一接口即可接入系统。

## 架构
```
设备接入层
├── DeviceManager       # 设备管理器（单例）
├── BaseDeviceAdapter   # 设备适配器基类
├── devices/
│   ├── pulse/          # 脉诊仪适配器
│   ├── tongue/         # 舌诊仪适配器
│   ├── face/           # 面诊仪适配器
│   └── voice/          # 声诊仪适配器
├── data_processor/     # 数据预处理
└── protocols/          # 通信协议
```

## 快速开始
```python
from device_manager import DeviceManager

manager = DeviceManager()
pulse_device = manager.get_device('pulse_001')
data = pulse_device.collect()
processed = pulse_device.preprocess(data)
```
