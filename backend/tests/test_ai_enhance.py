"""测试AI增强方案推荐接口 - /api/ai-enhance/*"""

import pytest
from fastapi.testclient import TestClient


class TestGetEnhanced:
    """测试获取增强方案"""

    def test_get_existing_pattern(self, client: TestClient, auth_headers: dict):
        """获取已知证型的增强方案成功"""
        response = client.get("/api/ai-enhance/diagnosis/脾肾阳虚证", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "prescription" in data
        assert "acupuncture" in data
        assert "diet" in data

    def test_get_unknown_pattern(self, client: TestClient, auth_headers: dict):
        """获取未知证型返回错误信息"""
        response = client.get("/api/ai-enhance/diagnosis/未知证型", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "error" in data
        assert "available_patterns" in data

    def test_get_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/ai-enhance/diagnosis/脾肾阳虚证")
        assert response.status_code == 401


class TestAvailablePatterns:
    """测试获取可用证型列表"""

    def test_list_available_patterns(self, client: TestClient, auth_headers: dict):
        """获取可用证型列表成功"""
        response = client.get("/api/ai-enhance/diagnosis/available-patterns", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "patterns" in data
        assert "count" in data
        assert data["count"] >= 3
        assert "脾肾阳虚证" in data["patterns"]

    def test_list_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/ai-enhance/diagnosis/available-patterns")
        assert response.status_code == 401
