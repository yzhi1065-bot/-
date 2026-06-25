"""测试数据统计接口 - /api/stats/*"""

import pytest
from fastapi.testclient import TestClient


class TestDashboard:
    """测试仪表盘统计"""

    def test_dashboard_success(self, client: TestClient, auth_headers: dict):
        """获取仪表盘数据成功"""
        response = client.get("/api/stats/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "total_patients" in data
        assert "today_visits" in data
        assert "pending_review" in data
        assert "low_stock_drugs" in data

    def test_dashboard_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/stats/dashboard")
        assert response.status_code == 401


class TestPatternStats:
    """测试证型分布统计"""

    def test_pattern_stats_success(self, client: TestClient, auth_headers: dict):
        """获取证型统计成功"""
        response = client.get("/api/stats/patterns", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "patterns" in data
        assert "total" in data


class TestDrugStats:
    """测试药品统计"""

    def test_drug_stats_success(self, client: TestClient, auth_headers: dict):
        """获取药品统计成功"""
        response = client.get("/api/stats/drugs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "total_drugs" in data
        assert "low_stock" in data
        assert "total_sales" in data
        assert "total_profit" in data


class TestTopHerbs:
    """测试高频药材统计"""

    def test_top_herbs_success(self, client: TestClient, auth_headers: dict):
        """获取高频药材成功"""
        response = client.get("/api/stats/top-herbs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert isinstance(data, list)

    def test_top_herbs_with_limit(self, client: TestClient, auth_headers: dict):
        """指定数量获取高频药材"""
        response = client.get("/api/stats/top-herbs?limit=5", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) <= 5


class TestMonthlyTrend:
    """测试月度趋势统计"""

    def test_monthly_trend_success(self, client: TestClient, auth_headers: dict):
        """获取月度趋势成功"""
        response = client.get("/api/stats/monthly-trend", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert isinstance(data, list)
