"""AI配置API"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.common import Response

router = APIRouter(prefix="/api/ai-config", tags=["AI配置"])

# 当前AI配置（内存存储，生产环境应写入数据库）
current_config = {
    "mode": "demo",
    "provider": "deepseek",
    "api_url": "http://127.0.0.1:15721/v1",
    "api_key": "",
    "model": "deepseek-chat",
    "temperature": 0.3,
}


class AIConfigSchema(BaseModel):
    """AI配置"""
    mode: str = "demo"
    provider: Optional[str] = "deepseek"
    api_url: Optional[str] = "http://127.0.0.1:15721/v1"
    api_key: Optional[str] = ""
    model: Optional[str] = "deepseek-chat"
    temperature: Optional[float] = 0.3


@router.get("", response_model=Response)
def get_config(current_user: User = Depends(get_current_user)):
    """获取AI配置"""
    return Response(data=current_config)


@router.put("", response_model=Response)
def update_config(
    config: AIConfigSchema,
    current_user: User = Depends(get_current_user),
):
    """更新AI配置"""
    current_config.update(config.model_dump(exclude_unset=True))
    return Response(message="配置已更新", data=current_config)