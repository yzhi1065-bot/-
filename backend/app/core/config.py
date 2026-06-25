"""应用配置管理"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """系统配置"""

    # 应用基础
    APP_NAME: str = "TCM Diagnosis System"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 数据库（开发环境用SQLite，生产环境用PostgreSQL）
    DATABASE_URL: str = "sqlite:///./tcm.db"
    DB_ECHO: bool = False

    # Redis（可选，开发环境不需要）
    REDIS_URL: str = ""

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8小时

    # 文件存储
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB

    # AI服务
    AI_API_URL: str = "http://localhost:8010"
    AI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    LLM_TIMEOUT: int = 60

    # 设备配置
    DEVICE_POLL_INTERVAL: int = 5  # 秒
    DEVICE_RECONNECT_MAX: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
