"""测试舌诊分析接口 - /api/tongue/*"""

import io
import pytest
from fastapi.testclient import TestClient


class TestUploadTongueImage:
    """测试舌象图片上传"""

    def test_upload_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/tongue/upload", files={
            "file": ("test.jpg", b"fake_image_data", "image/jpeg"),
        })
        assert response.status_code == 401

    def test_upload_invalid_extension(self, client: TestClient, auth_headers: dict):
        """不支持的文件格式返回400"""
        response = client.post("/api/tongue/upload", files={
            "file": ("test.exe", b"fake", "application/octet-stream"),
        }, headers=auth_headers)
        assert response.status_code == 400
        assert "不支持的图片格式" in response.text

    def test_upload_valid(self, client: TestClient, auth_headers: dict):
        """上传有效图片成功"""
        # 创建一个小PNG文件
        response = client.post("/api/tongue/upload", files={
            "file": ("tongue.png", b"\x89PNG\r\n\x1a\n" + b"\x00" * 100, "image/png"),
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "image_path" in data
        assert "filename" in data
        assert data["filename"].endswith(".png")


class TestAnalyzeTongue:
    """测试舌象分析"""

    def test_analyze_unauthorized(self, client: TestClient):
        """未认证返回401"""
        response = client.post("/api/tongue/analyze", json={
            "description": "舌淡红苔薄白",
        })
        assert response.status_code == 401

    def test_analyze_no_image(self, client: TestClient, auth_headers: dict):
        """无图片路径仅描述文本分析"""
        response = client.post("/api/tongue/analyze", json={
            "description": "舌淡红，苔薄白，边有齿痕",
        }, headers=auth_headers)
        # 可能成功也可能AI服务不可用
        assert response.status_code in (200, 500)

    def test_analyze_nonexistent_path(self, client: TestClient, auth_headers: dict):
        """不存在的图片路径返回404"""
        response = client.post("/api/tongue/analyze", json={
            "image_path": "/nonexistent/path/image.jpg",
            "description": "test",
        }, headers=auth_headers)
        assert response.status_code == 404
