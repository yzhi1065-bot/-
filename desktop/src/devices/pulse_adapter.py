"""
脉诊仪适配器示例 - 以某型号脉诊仪为例
实际应用中根据具体SDK进行适配
"""

import time
import random
import numpy as np
from typing import Optional
from device_manager import BaseDeviceAdapter, DeviceInfo, DeviceStatus


class PulseDeviceAdapter(BaseDeviceAdapter):
    """脉诊仪适配器"""

    def __init__(self, device_info: DeviceInfo):
        super().__init__(device_info)
        self._device_handle = None

    def connect(self) -> bool:
        """连接脉诊仪"""
        try:
            # 模拟连接过程
            # 实际应为: self._device_handle = sdk.connect(port, baudrate)
            print(f"正在连接脉诊仪 {self.device_info.name}...")
            time.sleep(0.5)

            # 模拟连接成功
            self.device_info.status = DeviceStatus.ONLINE
            self.device_info.connected_at = __import__('datetime').datetime.now()
            print(f"脉诊仪 {self.device_info.name} 连接成功")
            return True
        except Exception as e:
            self.device_info.status = DeviceStatus.ERROR
            print(f"脉诊仪连接失败: {e}")
            return False

    def disconnect(self) -> bool:
        """断开脉诊仪"""
        try:
            # 实际应为: sdk.disconnect(self._device_handle)
            self.device_info.status = DeviceStatus.OFFLINE
            self._device_handle = None
            print(f"脉诊仪 {self.device_info.name} 已断开")
            return True
        except Exception as e:
            print(f"断开失败: {e}")
            return False

    def collect(self) -> dict:
        """采集脉诊数据"""
        # 模拟脉诊仪数据采集
        # 实际应为: raw_data = sdk.get_pulse_wave(self._device_handle)
        time.sleep(0.1)

        # 模拟脉波数据
        pulse_rate = random.randint(60, 90)
        wave_data = self._generate_pulse_wave(pulse_rate)

        raw_data = {
            "pulse_wave": wave_data,
            "pulse_rate": pulse_rate,
            "sampling_rate": 200,  # Hz
            "duration": 10,  # seconds
            "timestamp": time.time(),
        }
        return raw_data

    def preprocess(self, raw_data: dict) -> dict:
        """脉诊数据预处理"""
        wave = np.array(raw_data.get("pulse_wave", []))

        if len(wave) == 0:
            return {"error": "无脉波数据"}

        # 计算脉诊参数
        processed = {
            "pulse_frequency": float(raw_data.get("pulse_rate", 0)),
            "pulse_depth": self._analyze_depth(wave),
            "pulse_rate_type": self._classify_rate(raw_data.get("pulse_rate", 70)),
            "pulse_shape": self._analyze_shape(wave),
            "pulse_force": self._analyze_force(wave),
            "pulse_rhythm": self._analyze_rhythm(wave),
            "pulse_wave_summary": {
                "amplitude_mean": float(np.mean(np.abs(wave))),
                "amplitude_std": float(np.std(wave)),
                "peak_count": self._count_peaks(wave),
            },
            "device_id": self.device_info.id,
            "data_quality": self.device_info.data_quality,
        }
        return processed

    def _generate_pulse_wave(self, rate: int, duration: float = 10.0, fs: int = 200) -> list:
        """生成模拟脉波数据"""
        t = np.linspace(0, duration, int(duration * fs))
        # 主搏动
        beats = int(rate * duration / 60)
        wave = np.zeros_like(t)

        for i in range(beats):
            center = i * fs * 60 / rate
            # 主波
            wave[int(center):int(center) + 20] += 1.0 * np.exp(
                -np.linspace(0, 3, 20) ** 2
            )
            # 重搏波
            wave[int(center) + 30:int(center) + 40] += 0.3 * np.exp(
                -np.linspace(0, 2, 10) ** 2
            )

        # 加噪声
        wave += np.random.normal(0, 0.05, len(wave))
        return wave.tolist()

    def _analyze_depth(self, wave: np.ndarray) -> str:
        """分析脉位（浮/中/沉）"""
        amplitude = np.max(np.abs(wave))
        if amplitude > 0.8:
            return "浮"
        elif amplitude > 0.4:
            return "中"
        else:
            return "沉"

    def _classify_rate(self, rate: float) -> str:
        """分类脉率"""
        if rate < 60:
            return "迟"
        elif rate <= 70:
            return "缓"
        elif rate <= 90:
            return "平"
        else:
            return "数"

    def _analyze_shape(self, wave: np.ndarray) -> list:
        """分析脉形"""
        features = []
        amplitude = np.max(np.abs(wave))

        if amplitude < 0.3:
            features.append("细")
        if self._count_peaks(wave) > 0:
            features.append("弦")
        if amplitude > 0.8:
            features.append("洪")

        return features or ["平"]

    def _analyze_force(self, wave: np.ndarray) -> str:
        """分析脉势"""
        return "有力" if np.max(np.abs(wave)) > 0.5 else "无力"

    def _analyze_rhythm(self, wave: np.ndarray) -> str:
        """分析节律"""
        peaks = self._count_peaks(wave)
        return "整齐" if peaks > 0 else "不齐"

    def _count_peaks(self, wave: np.ndarray) -> int:
        """统计波峰数"""
        from scipy.signal import find_peaks
        try:
            peaks, _ = find_peaks(wave, height=0.3, distance=20)
            return len(peaks)
        except ImportError:
            return len(wave) // 100
