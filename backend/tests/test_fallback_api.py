"""测试回退API接口 - 前端占位路由"""

import pytest
from fastapi.testclient import TestClient


class TestFallbackEndpoints:
    """测试所有回退/占位API端点"""

    def test_equipment(self, client: TestClient, auth_headers: dict):
        """获取设备列表"""
        response = client.get("/api/equipment", headers=auth_headers)
        assert response.status_code == 200

    def test_audit_logs(self, client: TestClient, auth_headers: dict):
        """获取审计日志"""
        response = client.get("/api/audit-logs", headers=auth_headers)
        assert response.status_code == 200

    def test_chief_complaints_symptoms(self, client: TestClient, auth_headers: dict):
        """获取主诉症状列表"""
        response = client.get("/api/chief-complaints/symptoms", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "bodyParts" in data
        assert "commonComplaints" in data

    def test_followups(self, client: TestClient, auth_headers: dict):
        """获取随访列表"""
        response = client.get("/api/followups", headers=auth_headers)
        assert response.status_code == 200

    def test_health_advice(self, client: TestClient, auth_headers: dict):
        """获取健康建议"""
        response = client.get("/api/health-advice", headers=auth_headers)
        assert response.status_code == 200

    def test_health_edu(self, client: TestClient, auth_headers: dict):
        """获取健康教育文章"""
        response = client.get("/api/health-edu/articles", headers=auth_headers)
        assert response.status_code == 200

    def test_insurance_records(self, client: TestClient, auth_headers: dict):
        """获取保险记录"""
        response = client.get("/api/insurance/records", headers=auth_headers)
        assert response.status_code == 200

    def test_lab_tests(self, client: TestClient, auth_headers: dict):
        """获取实验室检查"""
        response = client.get("/api/lab-tests", headers=auth_headers)
        assert response.status_code == 200

    def test_medication(self, client: TestClient, auth_headers: dict):
        """获取用药记录"""
        response = client.get("/api/medication", headers=auth_headers)
        assert response.status_code == 200

    def test_referrals(self, client: TestClient, auth_headers: dict):
        """获取转诊记录"""
        response = client.get("/api/referrals", headers=auth_headers)
        assert response.status_code == 200

    def test_nursing(self, client: TestClient, auth_headers: dict):
        """获取护理记录"""
        response = client.get("/api/nursing", headers=auth_headers)
        assert response.status_code == 200

    def test_satisfaction(self, client: TestClient, auth_headers: dict):
        """获取满意度反馈"""
        response = client.get("/api/satisfaction/feedbacks", headers=auth_headers)
        assert response.status_code == 200

    def test_finance_transactions(self, client: TestClient, auth_headers: dict):
        """获取财务交易"""
        response = client.get("/api/finance/transactions", headers=auth_headers)
        assert response.status_code == 200

    def test_schedules(self, client: TestClient, auth_headers: dict):
        """获取排班"""
        response = client.get("/api/schedules", headers=auth_headers)
        assert response.status_code == 200

    def test_notifications(self, client: TestClient, auth_headers: dict):
        """获取通知"""
        response = client.get("/api/notifications", headers=auth_headers)
        assert response.status_code == 200

    def test_messages(self, client: TestClient, auth_headers: dict):
        """获取消息"""
        response = client.get("/api/messages", headers=auth_headers)
        assert response.status_code == 200

    def test_formulas(self, client: TestClient, auth_headers: dict):
        """获取方剂库"""
        response = client.get("/api/formulas", headers=auth_headers)
        assert response.status_code == 200

    def test_knowledge_base(self, client: TestClient, auth_headers: dict):
        """获取知识库"""
        response = client.get("/api/knowledge-base", headers=auth_headers)
        assert response.status_code == 200

    def test_appointments(self, client: TestClient, auth_headers: dict):
        """获取预约列表"""
        response = client.get("/api/appointments", headers=auth_headers)
        assert response.status_code == 200

    def test_medical_records(self, client: TestClient, auth_headers: dict):
        """获取病历"""
        response = client.get("/api/medical-records", headers=auth_headers)
        assert response.status_code == 200

    def test_patient_search(self, client: TestClient, auth_headers: dict):
        """获取患者搜索"""
        response = client.get("/api/patient-search", headers=auth_headers)
        assert response.status_code == 200

    def test_diagnosis_patient_sessions(self, client: TestClient, auth_headers: dict):
        """获取诊断患者会话"""
        response = client.get("/api/diagnosis/patients/1/sessions", headers=auth_headers)
        assert response.status_code == 200

    def test_start_session(self, client: TestClient, auth_headers: dict):
        """开始诊断会话"""
        response = client.post("/api/diagnosis/sessions/1/start", headers=auth_headers)
        assert response.status_code == 200

    def test_create_appointment(self, client: TestClient, auth_headers: dict):
        """创建预约"""
        response = client.post("/api/appointments", json={}, headers=auth_headers)
        assert response.status_code in (200, 422)

    def test_cancel_appointment(self, client: TestClient, auth_headers: dict):
        """取消预约"""
        response = client.post("/api/appointments/1/cancel", headers=auth_headers)
        # 不存在的预约返回404或200
        assert response.status_code in (200, 404)

    def test_consultations(self, client: TestClient, auth_headers: dict):
        """获取会诊"""
        response = client.get("/api/consultations", headers=auth_headers)
        assert response.status_code == 200

    def test_compatibility_references(self, client: TestClient, auth_headers: dict):
        """获取配伍禁忌参考"""
        response = client.get("/api/compatibility/references", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "eighteen_antagonisms" in data

    def test_export_stats(self, client: TestClient, auth_headers: dict):
        """导出统计"""
        response = client.get("/api/export/stats", headers=auth_headers)
        assert response.status_code == 200

    def test_visit_compare(self, client: TestClient, auth_headers: dict):
        """就诊对比"""
        response = client.get("/api/visit-compare", headers=auth_headers)
        assert response.status_code == 200

    def test_admin_users(self, client: TestClient, auth_headers: dict):
        """管理员用户管理"""
        response = client.get("/api/admin/users", headers=auth_headers)
        assert response.status_code == 200

    def test_admin_settings(self, client: TestClient, auth_headers: dict):
        """管理员设置"""
        response = client.get("/api/admin/settings", headers=auth_headers)
        assert response.status_code == 200

    def test_admin_maintenance(self, client: TestClient, auth_headers: dict):
        """管理员维护"""
        response = client.get("/api/admin/maintenance", headers=auth_headers)
        assert response.status_code == 200

    def test_unauthorized(self, client: TestClient):
        """所有回退API都要求认证"""
        for endpoint in ["/api/equipment", "/api/audit-logs", "/api/followups",
                          "/api/formulas", "/api/notifications", "/api/appointments"]:
            response = client.get(endpoint)
            assert response.status_code == 401, f"{endpoint} should return 401"
