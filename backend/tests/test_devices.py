"""测试设备管理接口 - /api/devices/*"""

import pytest
from fastapi.testclient import TestClient


class TestListDevices:
    """测试获取设备列表"""

    def test_list_devices_empty(self, client: TestClient, auth_headers: dict):
        """空设备列表"""
        response = client.get("/api/devices", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json()["data"], list)

    def test_list_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/devices")
        assert response.status_code == 401


class TestRegisterDevice:
    """测试注册设备"""

    def test_register_success(self, client: TestClient, auth_headers: dict):
        """注册设备成功"""
        response = client.post("/api/devices/register", json={
            "serial_no": "SN-2024-001",
            "name": "脉诊仪-001",
            "device_type": "脉诊仪",
            "location": "诊室1",
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["serial_no"] == "SN-2024-001"
        assert data["name"] == "脉诊仪-001"

    def test_register_duplicate(self, client: TestClient, auth_headers: dict):
        """重复序列号返回400"""
        payload = {
            "serial_no": "SN-DUP",
            "name": "重复设备",
            "device_type": "舌诊仪",
        }
        client.post("/api/devices/register", json=payload, headers=auth_headers)
        response = client.post("/api/devices/register", json=payload, headers=auth_headers)
        assert response.status_code == 400
        assert "设备已注册" in response.text

    def test_register_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/devices/register", json={
            "serial_no": "SN-TEST", "name": "test",
        })
        assert response.status_code == 401


class TestUpdateDeviceStatus:
    """测试更新设备状态"""

    def test_update_status_success(self, client: TestClient, auth_headers: dict):
        """更新设备状态成功"""
        # 先注册
        created = client.post("/api/devices/register", json={
            "serial_no": "SN-STATUS",
            "name": "状态测试设备",
            "device_type": "脉诊仪",
        }, headers=auth_headers)
        device_id = created.json()["data"]["id"]

        # 更新状态为在线
        response = client.put(f"/api/devices/{device_id}/status", json={
            "status": "online",
            "data_quality": 95,
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "已更新" in response.text

    def test_update_nonexistent(self, client: TestClient, auth_headers: dict):
        """不存在的设备返回404"""
        response = client.put("/api/devices/99999/status", json={
            "status": "online",
        }, headers=auth_headers)
        assert response.status_code == 404
        assert "设备不存在" in response.text

    def test_update_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.put("/api/devices/1/status", json={"status": "online"})
        assert response.status_code == 401
