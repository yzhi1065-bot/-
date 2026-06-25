"""测试离线同步接口 - /api/offline/*"""

import pytest
from fastapi.testclient import TestClient


class TestSyncStatus:
    """测试同步状态"""

    def test_status_success(self, client: TestClient, auth_headers: dict):
        """获取同步状态成功"""
        response = client.get("/api/offline/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "queue_size" in data
        assert "mode" in data
        assert data["queue_size"] >= 0

    def test_status_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/offline/status")
        assert response.status_code == 401


class TestSyncData:
    """测试同步数据"""

    def test_sync_data_success(self, client: TestClient, auth_headers: dict):
        """同步数据成功"""
        response = client.post("/api/offline/sync", json=[
            {"action": "create_patient", "data": {"name": "离线患者"}},
            {"action": "create_session", "data": {"patient_id": 1}},
        ], headers=auth_headers)
        assert response.status_code == 200
        assert "已加入同步队列" in response.text

    def test_sync_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/offline/sync", json=[])
        assert response.status_code == 401


class TestQueue:
    """测试同步队列管理"""

    def test_get_queue(self, client: TestClient, auth_headers: dict):
        """获取队列成功"""
        response = client.get("/api/offline/queue", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert isinstance(data, list)

    def test_clear_queue(self, client: TestClient, auth_headers: dict):
        """清空队列成功"""
        # 先添加数据
        client.post("/api/offline/sync", json=[{"test": "data"}], headers=auth_headers)

        # 清空
        response = client.delete("/api/offline/queue", headers=auth_headers)
        assert response.status_code == 200
        assert "已清空" in response.text

        # 验证队列为空
        get_resp = client.get("/api/offline/queue", headers=auth_headers)
        assert get_resp.json()["data"] == []

    def test_clear_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.delete("/api/offline/queue")
        assert response.status_code == 401
