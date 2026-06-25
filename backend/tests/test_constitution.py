"""测试体质辨识接口 - /api/constitution/*"""

import pytest
from fastapi.testclient import TestClient


class TestListConstitutions:
    """测试获取体质类型列表"""

    def test_list_success(self, client: TestClient, auth_headers: dict):
        """获取体质类型列表成功"""
        response = client.get("/api/constitution/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert isinstance(data, list)
        # 至少包含九种体质中的几种
        assert len(data) > 0

    def test_list_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/constitution/list")
        assert response.status_code == 401


class TestAnalyzeConstitution:
    """测试体质分析"""

    def test_analyze_success(self, client: TestClient, auth_headers: dict):
        """分析体质成功"""
        response = client.post("/api/constitution/analyze", json={
            "symptoms": {
                "畏寒": True,
                "手足不温": True,
                "喜热饮": True,
            }
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "constitution_type" in data or "type" in data or isinstance(data, dict)

    def test_analyze_empty_symptoms(self, client: TestClient, auth_headers: dict):
        """空症状分析"""
        response = client.post("/api/constitution/analyze", json={
            "symptoms": {}
        }, headers=auth_headers)
        assert response.status_code == 200

    def test_analyze_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/constitution/analyze", json={"symptoms": {}})
        assert response.status_code == 401
