"""舌诊图片上传与分析API"""

import os
import uuid
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.common import Response
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/tongue", tags=["舌诊分析"])

# 舌象图片存储目录
TONGUE_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "tongue")
os.makedirs(TONGUE_UPLOAD_DIR, exist_ok=True)

# 允许的图片格式
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# AI服务实例
ai_service = AIService()


class TongueAnalysisRequest(BaseModel):
    """舌象分析请求"""
    image_path: Optional[str] = ""
    description: Optional[str] = None


@router.post("/upload", response_model=Response)
async def upload_tongue_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """上传舌象图片并保存到upload/tongue目录"""
    # 验证文件类型
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的图片格式: {ext}，允许的格式: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # 读取文件内容验证大小
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"图片过大，最大允许{MAX_FILE_SIZE // (1024*1024)}MB",
        )

    # 生成唯一文件名保存
    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(TONGUE_UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        f.write(content)

    # 返回相对路径供后续分析使用
    relative_path = f"uploads/tongue/{filename}"
    return Response(data={
        "image_path": relative_path,
        "absolute_path": save_path,
        "filename": filename,
        "size": len(content),
        "message": "舌象图片上传成功",
    })


@router.post("/analyze", response_model=Response)
async def analyze_tongue(
    request: TongueAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """分析舌象图片，返回舌质/舌苔/舌形等诊断结果"""
    # 验证图片路径是否存在（仅在有路径时检查）
    if request.image_path:
        abs_path = request.image_path
        if not os.path.isabs(abs_path):
            abs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), abs_path)
        if not os.path.exists(abs_path):
            raise HTTPException(status_code=404, detail=f"图片文件不存在: {request.image_path}")

    # 调用AI服务进行舌象分析
    tongue_data = {"image_path": request.image_path or "", "description": request.description or ""}
    result = await ai_service.analyze_tongue(tongue_data)

    return Response(data=result)
