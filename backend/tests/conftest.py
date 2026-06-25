"""测试配置 - 数据库 Fixtures"""

import pytest
import os
from typing import Generator
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# 使用独立的测试数据库
TEST_DB_URL = "sqlite:///./test_tcm.db"

# 初始化测试引擎
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """每个session前重建数据库表并插入默认用户"""
    from app.core.database import Base
    from app.core.security import get_password_hash
    from app.models.user import User
    # 先drop再create，保证干净
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 创建测试默认用户（admin_token fixture依赖）
    db = TestingSessionLocal()
    try:
        admin = User(username="admin", password_hash=get_password_hash("admin123"),
                     real_name="管理员", role="admin", title="系统管理员", is_active=True)
        db.add(admin)
        doctor = User(username="doctor", password_hash=get_password_hash("doctor123"),
                      real_name="张医生", role="doctor", title="主治医师",
                      department="中医科", hospital="测试医院", is_active=True)
        db.add(doctor)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    yield
    # 清理测试数据库
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """独立的数据库会话"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """FastAPI 测试客户端"""
    from app.main import app
    from app.core.database import get_db

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client: TestClient) -> str:
    """获取admin用户的JWT token"""
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token: str) -> dict:
    """认证请求头"""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def sample_patient_data() -> dict:
    """测试患者数据"""
    return {
        "name": "测试患者",
        "gender": "男",
        "age": 45,
        "phone": "13800138000",
        "chief_complaint": "胃痛反复2周"
    }


@pytest.fixture
def sample_diagnosis_data() -> dict:
    """测试四诊数据"""
    return {
        "inspection": {"tongue": "舌淡红苔薄白", "face": "面色萎黄"},
        "auscultation": {"voice": "声低", "breath": "平"},
        "inquiry": {"appetite": "差", "sleep": "差", "stool": "溏"},
        "palpation": {"pulse": "沉细", "abdomen": "软"}
    }
