"""测试处方管理接口 - /api/prescriptions/*"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def patient_id(client: TestClient, auth_headers: dict):
    resp = client.post("/api/patients", json={
        "name": "处方患者", "gender": "男", "age": 40,
        "chief_complaint": "咳嗽1周",
    }, headers=auth_headers)
    return resp.json()["data"]["id"]


@pytest.fixture
def session_id(client: TestClient, auth_headers: dict, patient_id: int):
    resp = client.post("/api/diagnosis/sessions", json={
        "patient_id": patient_id,
        "chief_complaint": "咳嗽1周",
    }, headers=auth_headers)
    resp2 = client.post(f"/api/diagnosis/sessions/{resp.json()['data']['id']}/complete", headers=auth_headers)
    return resp.json()["data"]["id"]


class TestCreatePrescription:
    """测试创建处方"""

    def test_create_success(self, client: TestClient, auth_headers: dict, session_id: int):
        """创建处方成功"""
        response = client.post("/api/prescriptions", json={
            "session_id": session_id,
            "name": "止咳方",
            "principle": "宣肺止咳",
            "method": "内服",
            "dosage_form": "汤剂",
            "total_days": 7,
            "daily_doses": 2,
            "items": [
                {"herb_name": "甘草", "dosage": "6", "unit": "克", "sort_order": 1},
                {"herb_name": "桔梗", "dosage": "9", "unit": "克", "sort_order": 2},
            ],
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["prescription_no"].startswith("RX")
        assert "id" in data

    def test_create_duplicate(self, client: TestClient, auth_headers: dict, session_id: int):
        """同一会话重复创建返回409"""
        payload = {
            "session_id": session_id,
            "name": "止咳方",
            "total_days": 7,
            "daily_doses": 2,
            "items": [{"herb_name": "甘草", "dosage": "6", "unit": "克", "sort_order": 1}],
        }
        client.post("/api/prescriptions", json=payload, headers=auth_headers)
        response = client.post("/api/prescriptions", json=payload, headers=auth_headers)
        assert response.status_code == 409
        assert "已存在处方" in response.text

    def test_create_unauthorized(self, client: TestClient, session_id: int):
        """未认证返回401"""
        response = client.post("/api/prescriptions", json={
            "session_id": session_id, "name": "test",
            "total_days": 3, "daily_doses": 2,
            "items": [{"herb_name": "甘草", "sort_order": 1}],
        })
        assert response.status_code == 401


class TestGetPrescription:
    """测试获取处方"""

    def test_get_by_session(self, client: TestClient, auth_headers: dict, session_id: int):
        """按会话获取处方成功"""
        client.post("/api/prescriptions", json={
            "session_id": session_id, "name": "测试方",
            "total_days": 5, "daily_doses": 2,
            "items": [{"herb_name": "甘草", "sort_order": 1}],
        }, headers=auth_headers)

        response = client.get(f"/api/prescriptions/sessions/{session_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["prescription"]["name"] == "测试方"
        assert len(data["items"]) >= 1

    def test_get_nonexistent(self, client: TestClient, auth_headers: dict):
        """不存在的处方返回404"""
        response = client.get("/api/prescriptions/sessions/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_unauthorized(self, client: TestClient, session_id: int):
        """未认证返回401"""
        response = client.get(f"/api/prescriptions/sessions/{session_id}")
        assert response.status_code == 401


class TestTreatmentPlan:
    """测试治疗方案"""

    def test_create_treatment_plan(self, client: TestClient, auth_headers: dict, session_id: int):
        """创建治疗方案成功"""
        response = client.post("/api/prescriptions/treatment-plan", json={
            "session_id": session_id,
            "content": "中药调理，注意饮食",
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "已创建" in response.text or "已更新" in response.text

    def test_get_treatment_plan(self, client: TestClient, auth_headers: dict, session_id: int):
        """获取治疗方案成功"""
        client.post("/api/prescriptions/treatment-plan", json={
            "session_id": session_id, "content": "针灸+中药",
        }, headers=auth_headers)

        response = client.get(f"/api/prescriptions/treatment-plan/{session_id}", headers=auth_headers)
        assert response.status_code == 200

    def test_get_nonexistent_plan(self, client: TestClient, auth_headers: dict):
        """不存在的治疗方案返回404"""
        response = client.get("/api/prescriptions/treatment-plan/99999", headers=auth_headers)
        assert response.status_code == 404
