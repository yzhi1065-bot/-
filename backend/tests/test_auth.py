"""测试认证接口 - /api/auth/*"""

import pytest
from fastapi.testclient import TestClient


class TestRegister:
    """测试用户注册"""

    def test_register_success(self, client: TestClient):
        """注册新用户成功"""
        response = client.post("/api/auth/register", json={
            "username": "testdoctor",
            "password": "test123",
            "real_name": "测试医生",
            "role": "doctor",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testdoctor"
        assert data["role"] == "doctor"
        assert "id" in data

    def test_register_duplicate_username(self, client: TestClient):
        """重复用户名注册返回400"""
        # 先注册一次
        client.post("/api/auth/register", json={
            "username": "dupuser", "password": "test123",
        })
        # 再注册同名的
        response = client.post("/api/auth/register", json={
            "username": "dupuser", "password": "test456",
        })
        assert response.status_code == 400
        assert "用户名已存在" in response.text


class TestLogin:
    """测试用户登录"""

    def test_login_admin_success(self, client: TestClient):
        """admin用户登录成功"""
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "admin"

    def test_login_wrong_password(self, client: TestClient):
        """错误密码登录失败"""
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "wrongpass",
        })
        assert response.status_code == 401
        assert "用户名或密码错误" in response.text

    def test_login_nonexistent_user(self, client: TestClient):
        """不存在的用户登录"""
        response = client.post("/api/auth/login", json={
            "username": "nobody",
            "password": "nopass",
        })
        assert response.status_code == 401


class TestGetMe:
    """测试获取当前用户"""

    def test_get_me_authenticated(self, client: TestClient, auth_headers: dict):
        """认证用户获取自身信息成功"""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "admin"
        assert "role" in data

    def test_get_me_no_token(self, client: TestClient):
        """未认证用户获取信息返回401"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client: TestClient):
        """无效token返回401"""
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert response.status_code == 401
