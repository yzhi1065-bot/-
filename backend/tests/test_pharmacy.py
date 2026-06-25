"""测试药品管理接口 - /api/pharmacy/*"""

import pytest
from fastapi.testclient import TestClient


class TestDrugCRUD:
    """测试药品CRUD"""

    def test_list_drugs_empty(self, client: TestClient, auth_headers: dict):
        """空药品列表"""
        response = client.get("/api/pharmacy/drugs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "items" in data

    def test_create_drug(self, client: TestClient, auth_headers: dict):
        """创建药品成功"""
        response = client.post("/api/pharmacy/drugs", json={
            "name": "测试药材",
            "unit": "克",
            "stock": 500,
            "stock_alert": 50,
            "purchase_price": 10.0,
            "selling_price": 25.0,
            "efficacy": "清热解毒",
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["name"] == "测试药材"
        assert data["stock"] == 500

    def test_get_drug(self, client: TestClient, auth_headers: dict):
        """获取单个药品"""
        created = client.post("/api/pharmacy/drugs", json={
            "name": "查询药材", "unit": "克", "stock": 100,
        }, headers=auth_headers)
        drug_id = created.json()["data"]["id"]

        response = client.get(f"/api/pharmacy/drugs/{drug_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["data"]["name"] == "查询药材"

    def test_get_drug_not_found(self, client: TestClient, auth_headers: dict):
        """不存在的药品返回404"""
        response = client.get("/api/pharmacy/drugs/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_update_drug(self, client: TestClient, auth_headers: dict):
        """更新药品成功"""
        created = client.post("/api/pharmacy/drugs", json={
            "name": "更新测试", "unit": "克", "stock": 200,
        }, headers=auth_headers)
        drug_id = created.json()["data"]["id"]

        response = client.put(f"/api/pharmacy/drugs/{drug_id}", json={
            "name": "已更新药材", "stock": 300,
        }, headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["data"]["name"] == "已更新药材"
        assert response.json()["data"]["stock"] == 300

    def test_delete_drug(self, client: TestClient, auth_headers: dict):
        """软删除药品"""
        created = client.post("/api/pharmacy/drugs", json={
            "name": "待删除药材", "unit": "克", "stock": 10,
        }, headers=auth_headers)
        drug_id = created.json()["data"]["id"]

        response = client.delete(f"/api/pharmacy/drugs/{drug_id}", headers=auth_headers)
        assert response.status_code == 200
        assert "已删除" in response.text

    def test_create_duplicate_barcode(self, client: TestClient, auth_headers: dict):
        """重复条形码返回409"""
        client.post("/api/pharmacy/drugs", json={
            "name": "药品A", "barcode": "123456", "unit": "克",
        }, headers=auth_headers)
        response = client.post("/api/pharmacy/drugs", json={
            "name": "药品B", "barcode": "123456", "unit": "克",
        }, headers=auth_headers)
        assert response.status_code == 409

    def test_list_categories(self, client: TestClient, auth_headers: dict):
        """获取分类列表"""
        response = client.get("/api/pharmacy/drugs/categories", headers=auth_headers)
        assert response.status_code == 200


class TestPurchases:
    """测试进货管理"""

    def test_create_purchase(self, client: TestClient, auth_headers: dict):
        """创建进货记录"""
        # 先创建药品
        drug = client.post("/api/pharmacy/drugs", json={
            "name": "进货药材", "unit": "克", "stock": 100,
        }, headers=auth_headers)
        drug_id = drug.json()["data"]["id"]

        response = client.post("/api/pharmacy/purchases", json={
            "drug_id": drug_id,
            "drug_name": "进货药材",
            "quantity": 50,
            "purchase_price": 8.0,
            "selling_price": 20.0,
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "已添加" in response.text

    def test_list_purchases(self, client: TestClient, auth_headers: dict):
        """获取进货列表"""
        response = client.get("/api/pharmacy/purchases", headers=auth_headers)
        assert response.status_code == 200


class TestSales:
    """测试销售管理"""

    def test_list_sales(self, client: TestClient, auth_headers: dict):
        """获取销售列表"""
        response = client.get("/api/pharmacy/sales", headers=auth_headers)
        assert response.status_code == 200

    def test_sales_summary(self, client: TestClient, auth_headers: dict):
        """获取销售汇总"""
        response = client.get("/api/pharmacy/sales/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "total_amount" in data
        assert "total_profit" in data
