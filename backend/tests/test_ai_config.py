"""测试AI配置接口 - /api/ai-config/*"""

import pytest
from fastapi.testclient import TestClient


class TestGetConfig:
    """测试获取AI配置"""

    def test_get_config_success(self, client: TestClient, auth_headers: dict):
        """获取配置成功"""
        response = client.get("/api/ai-config", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "mode" in data
        assert "provider" in data
        assert "model" in data

    def test_get_config_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/ai-config")
        assert response.status_code == 401


class TestUpdateConfig:
    """测试更新AI配置"""

    def test_update_config_success(self, client: TestClient, auth_headers: dict):
        """更新配置成功"""
        response = client.put("/api/ai-config", json={
            "mode": "production",
            "temperature": 0.5,
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "已更新" in response.text

        # 验证更新结果
        get_resp = client.get("/api/ai-config", headers=auth_headers)
        assert get_resp.json()["data"]["mode"] == "production"
        assert get_resp.json()["data"]["temperature"] == 0.5

    def test_update_config_partial(self, client: TestClient, auth_headers: dict):
        """部分字段更新"""
        response = client.put("/api/ai-config", json={
            "temperature": 0.8,
        }, headers=auth_headers)
        assert response.status_code == 200

    def test_update_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.put("/api/ai-config", json={"mode": "demo"})
        assert response.status_code == 401
