"""配伍检查API - 十八反十九畏等禁忌检查"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.common import Response
from app.services.compatibility import check_compatibility

router = APIRouter(prefix="/api/compatibility", tags=["配伍检查"])


class CompatibilityCheckRequest(BaseModel):
    """配伍检查请求"""
    herbs: List[str]
    prescription_name: Optional[str] = None


@router.post("/check", response_model=Response)
def check_herb_compatibility(
    request: CompatibilityCheckRequest,
    current_user: User = Depends(get_current_user),
):
    """检查处方中的配伍禁忌（十八反、十九畏、孕妇禁忌等）"""
    if not request.herbs:
        raise HTTPException(status_code=400, detail="药材列表不能为空")

    findings = check_compatibility(request.herbs)

    return Response(data={
        "herbs": request.herbs,
        "prescription_name": request.prescription_name,
        "total": len(findings),
        "has_conflicts": len(findings) > 0,
        "findings": findings,
    })
