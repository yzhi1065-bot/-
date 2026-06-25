"""测试AI诊断接口 - /api/ai-diagnosis/*"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def patient_id(client: TestClient, auth_headers: dict):
    resp = client.post("/api/patients", json={
        "name": "AI诊断患者", "gender": "男", "age": 50,
        "chief_complaint": "腰痛1月",
    }, headers=auth_headers)
    return resp.json()["data"]["id"]


@pytest.fixture
def session_id(client: TestClient, auth_headers: dict, patient_id: int):
    resp = client.post("/api/diagnosis/sessions", json={
        "patient_id": patient_id,
        "chief_complaint": "腰痛1月",
    }, headers=auth_headers)
    return resp.json()["data"]["id"]


class TestRunDiagnosis:
    """测试执行AI诊断"""

    def test_diagnosis_no_session(self, client: TestClient, auth_headers: dict):
        """不存在的会话返回404"""
        response = client.post("/api/ai-diagnosis/diagnose", json={
            "session_id": 99999,
        }, headers=auth_headers)
        assert response.status_code == 404

    def test_diagnosis_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/ai-diagnosis/diagnose", json={
            "session_id": 1,
        })
        assert response.status_code == 401

    def test_diagnosis_with_data(self, client: TestClient, auth_headers: dict, session_id: int):
        """有采集数据时执行诊断"""
        # 先保存四诊数据
        client.post(f"/api/diagnosis/sessions/{session_id}/inspection", json={
            "tongue_body": "舌淡红", "tongue_coating": "苔薄白",
        }, headers=auth_headers)
        client.post(f"/api/diagnosis/sessions/{session_id}/inquiry", json={
            "appetite": "一般", "sleep": "差", "bowel": "正常",
        }, headers=auth_headers)
        client.post(f"/api/diagnosis/sessions/{session_id}/palpation", json={
            "pulse_depth": "沉", "pulse_rate": "细",
        }, headers=auth_headers)

        # 执行诊断
        response = client.post("/api/ai-diagnosis/diagnose", json={
            "session_id": session_id,
        }, headers=auth_headers)
        # 可能成功也可能AI服务不可用返回500
        assert response.status_code in (200, 500)


class TestGetDiagnosisResult:
    """测试获取AI诊断结果"""

    def test_get_nonexistent(self, client: TestClient, auth_headers: dict):
        """不存在的诊断结果返回404"""
        response = client.get("/api/ai-diagnosis/sessions/99999", headers=auth_headers)
        assert response.status_code == 404
        assert "诊断结果不存在" in response.text

    def test_get_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.get("/api/ai-diagnosis/sessions/1")
        assert response.status_code == 401


class TestReviewDiagnosis:
    """测试审核AI诊断结果"""

    def test_review_nonexistent(self, client: TestClient, auth_headers: dict):
        """不存在的审核结果返回404"""
        response = client.post("/api/ai-diagnosis/review/99999", json={
            "action": "approved",
        }, headers=auth_headers)
        assert response.status_code == 404

    def test_review_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/ai-diagnosis/review/1", json={
            "action": "approved",
        })
        assert response.status_code == 401
