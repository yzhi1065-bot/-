"""体质辨识API"""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.common import Response
from app.services.constitution_service import analyze_constitution, get_constitution_list

router = APIRouter(prefix="/api/constitution", tags=["体质辨识"])


@router.get("/list", response_model=Response)
def list_constitutions(current_user: User = Depends(get_current_user)):
    """获取所有体质类型"""
    return Response(data=get_constitution_list())


@router.post("/analyze", response_model=Response)
def analyze(request: dict, current_user: User = Depends(get_current_user)):
    """分析体质（接收症状字典）"""
    result = analyze_constitution(request.get("symptoms", {}))
    return Response(data=result)
