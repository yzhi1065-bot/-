"""测试四诊采集接口 - /api/diagnosis/*"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def patient_id(client: TestClient, auth_headers: dict):
    """创建一个患者并返回ID"""
    resp = client.post("/api/patients", json={
        "name": "诊断测试患者", "gender": "女", "age": 35,
        "chief_complaint": "头痛3天",
    }, headers=auth_headers)
    return resp.json()["data"]["id"]


@pytest.fixture
def session_id(client: TestClient, auth_headers: dict, patient_id: int):
    """创建一个诊断会话并返回ID"""
    resp = client.post("/api/diagnosis/sessions", json={
        "patient_id": patient_id,
        "chief_complaint": "头痛3天",
    }, headers=auth_headers)
    return resp.json()["data"]["id"]


class TestCreateSession:
    """测试创建诊断会话"""

    def test_create_success(self, client: TestClient, auth_headers: dict, patient_id: int):
        """创建诊断会话成功"""
        response = client.post("/api/diagnosis/sessions", json={
            "patient_id": patient_id,
            "chief_complaint": "胃痛反复2周",
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["status"] == "collecting"
        assert data["patient_id"] == patient_id
        assert data["session_no"].startswith("TCM")
        assert "id" in data

    def test_create_nonexistent_patient(self, client: TestClient, auth_headers: dict):
        """不存在的患者返回404"""
        response = client.post("/api/diagnosis/sessions", json={
            "patient_id": 99999, "chief_complaint": "test",
        }, headers=auth_headers)
        assert response.status_code == 404

    def test_create_unauthorized(self, client: TestClient, patient_id: int):
        """未认证返回401"""
        response = client.post("/api/diagnosis/sessions", json={
            "patient_id": patient_id, "chief_complaint": "test",
        })
        assert response.status_code == 401


class TestGetSession:
    """测试获取诊断会话详情"""

    def test_get_existing(self, client: TestClient, auth_headers: dict, session_id: int):
        """获取存在的会话成功"""
        response = client.get(f"/api/diagnosis/sessions/{session_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["session"]["id"] == session_id

    def test_get_nonexistent(self, client: TestClient, auth_headers: dict):
        """不存在的会话返回404"""
        response = client.get("/api/diagnosis/sessions/99999", headers=auth_headers)
        assert response.status_code == 404


class TestGetPatientSessions:
    """测试获取患者的所有会话"""

    def test_list_patient_sessions(self, client: TestClient, auth_headers: dict, patient_id: int, session_id: int):
        """获取患者的会话列表成功"""
        response = client.get(f"/api/diagnosis/patients/{patient_id}/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) >= 1
        assert any(s["id"] == session_id for s in data)

    def test_no_sessions(self, client: TestClient, auth_headers: dict):
        """无会话的患者返回空列表"""
        # 先创建患者
        resp = client.post("/api/patients", json={
            "name": "无会话患者", "gender": "男", "age": 40,
        }, headers=auth_headers)
        pid = resp.json()["data"]["id"]

        response = client.get(f"/api/diagnosis/patients/{pid}/sessions", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["data"] == []


class TestSaveExamination:
    """测试保存四诊数据"""

    def test_save_inspection(self, client: TestClient, auth_headers: dict, session_id: int):
        """保存望诊数据成功"""
        response = client.post(f"/api/diagnosis/sessions/{session_id}/inspection", json={
            "tongue_body": "舌淡红",
            "tongue_coating": "苔薄白",
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "望诊数据保存成功" in response.text

    def test_save_auscultation(self, client: TestClient, auth_headers: dict, session_id: int):
        """保存闻诊数据成功"""
        response = client.post(f"/api/diagnosis/sessions/{session_id}/auscultation", json={
            "voice_quality": "声低",
            "breath_odor": "无异常",
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "闻诊数据保存成功" in response.text

    def test_save_inquiry(self, client: TestClient, auth_headers: dict, session_id: int):
        """保存问诊数据成功"""
        response = client.post(f"/api/diagnosis/sessions/{session_id}/inquiry", json={
            "appetite": "差",
            "sleep": "差",
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "问诊数据保存成功" in response.text

    def test_save_palpation(self, client: TestClient, auth_headers: dict, session_id: int):
        """保存切诊数据成功"""
        response = client.post(f"/api/diagnosis/sessions/{session_id}/palpation", json={
            "pulse_depth": "沉",
            "pulse_rate": "细",
        }, headers=auth_headers)
        assert response.status_code == 200
        assert "切诊数据保存成功" in response.text

    def test_save_to_nonexistent_session(self, client: TestClient, auth_headers: dict):
        """不存在的会话返回404"""
        response = client.post("/api/diagnosis/sessions/99999/inspection", json={
            "tongue_body": "test",
        }, headers=auth_headers)
        assert response.status_code == 404


class TestCompleteSession:
    """测试完成采集"""

    def test_complete_success(self, client: TestClient, auth_headers: dict, session_id: int):
        """完成采集成功"""
        response = client.post(f"/api/diagnosis/sessions/{session_id}/complete", headers=auth_headers)
        assert response.status_code == 200
        assert "采集完成" in response.text

        # 验证状态已更新
        get_resp = client.get(f"/api/diagnosis/sessions/{session_id}", headers=auth_headers)
        assert get_resp.json()["data"]["session"]["status"] == "completed"

    def test_complete_nonexistent(self, client: TestClient, auth_headers: dict):
        """不存在的会话返回404"""
        response = client.post("/api/diagnosis/sessions/99999/complete", headers=auth_headers)
        assert response.status_code == 404
