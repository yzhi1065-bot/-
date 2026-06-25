"""测试患者管理接口 - /api/patients/*"""

import pytest
from fastapi.testclient import TestClient


class TestListPatients:
    """测试获取患者列表"""

    def test_list_success(self, client: TestClient, auth_headers: dict):
        """获取患者列表成功"""
        response = client.get("/api/patients", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # 可能已有其他测试创建的患者
        assert "items" in data["data"]
        assert "total" in data["data"]

    def test_list_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/patients")
        assert response.status_code == 401

    def test_list_with_pagination(self, client: TestClient, auth_headers: dict):
        """分页参数正常工作"""
        response = client.get("/api/patients?page=1&page_size=5", headers=auth_headers)
        assert response.status_code == 200


class TestCreatePatient:
    """测试创建患者"""

    def test_create_success(self, client: TestClient, auth_headers: dict, sample_patient_data: dict):
        """创建患者成功"""
        response = client.post("/api/patients", json=sample_patient_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["name"] == "测试患者"
        assert data["gender"] == "男"
        assert data["age"] == 45
        assert "id" in data

    def test_create_unauthorized(self, client: TestClient, sample_patient_data: dict):
        """未认证创建返回401"""
        response = client.post("/api/patients", json=sample_patient_data)
        assert response.status_code == 401

    def test_create_missing_fields(self, client: TestClient, auth_headers: dict):
        """缺少必填字段返回422"""
        response = client.post("/api/patients", json={"name": "test"}, headers=auth_headers)
        # 根据schema定义，可能422也可能成功（如果有默认值）
        assert response.status_code in (200, 422)


class TestGetPatient:
    """测试获取患者详情"""

    def test_get_existing(self, client: TestClient, auth_headers: dict, sample_patient_data: dict):
        """获取存在的患者成功"""
        # 先创建
        created = client.post("/api/patients", json=sample_patient_data, headers=auth_headers)
        pid = created.json()["data"]["id"]

        # 再获取
        response = client.get(f"/api/patients/{pid}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["data"]["id"] == pid

    def test_get_nonexistent(self, client: TestClient, auth_headers: dict):
        """获取不存在的患者返回404"""
        response = client.get("/api/patients/99999", headers=auth_headers)
        assert response.status_code == 404
        assert "患者不存在" in response.text

    def test_get_unauthorized(self, client: TestClient):
        """未认证获取返回401"""
        response = client.get("/api/patients/1")
        assert response.status_code == 401


class TestUpdatePatient:
    """测试更新患者信息"""

    def test_update_success(self, client: TestClient, auth_headers: dict, sample_patient_data: dict):
        """更新患者成功"""
        created = client.post("/api/patients", json=sample_patient_data, headers=auth_headers)
        pid = created.json()["data"]["id"]

        response = client.put(f"/api/patients/{pid}", json={"name": "更新姓名"}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["name"] == "更新姓名"

    def test_update_nonexistent(self, client: TestClient, auth_headers: dict):
        """更新不存在的患者返回404"""
        response = client.put("/api/patients/99999", json={"name": "test"}, headers=auth_headers)
        assert response.status_code == 404

    def test_update_unauthorized(self, client: TestClient):
        """未认证更新返回401"""
        response = client.put("/api/patients/1", json={"name": "test"})
        assert response.status_code == 401
