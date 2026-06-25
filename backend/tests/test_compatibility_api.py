"""测试配伍检查接口 - /api/compatibility/*"""

import pytest
from fastapi.testclient import TestClient


class TestCheckCompatibility:
    """测试配伍禁忌检查"""

    def test_check_no_conflict(self, client: TestClient, auth_headers: dict):
        """无冲突的药材组合"""
        response = client.post("/api/compatibility/check", json={
            "herbs": ["甘草", "人参", "白术"],
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["has_conflicts"] is False
        assert data["total"] == 0

    def test_check_eighteen_antagonisms(self, client: TestClient, auth_headers: dict):
        """十八反冲突检测"""
        response = client.post("/api/compatibility/check", json={
            "herbs": ["川乌", "半夏", "甘草"],
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["has_conflicts"] is True
        assert data["total"] > 0

    def test_check_nineteen_incompatibilities(self, client: TestClient, auth_headers: dict):
        """十九畏冲突检测"""
        response = client.post("/api/compatibility/check", json={
            "herbs": ["人参", "五灵脂"],
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["has_conflicts"] is True

    def test_check_empty_herbs(self, client: TestClient, auth_headers: dict):
        """空药材列表返回400"""
        response = client.post("/api/compatibility/check", json={
            "herbs": []
        }, headers=auth_headers)
        assert response.status_code == 400
        assert "不能为空" in response.text

    def test_check_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/compatibility/check", json={
            "herbs": ["甘草"]
        })
        assert response.status_code == 401
