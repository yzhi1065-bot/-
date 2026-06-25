"""AI增强方案推荐API"""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.permissions import require_permissions, AI_DIAGNOSE
from app.models.user import User
from app.schemas.common import Response

router = APIRouter(prefix="/api/ai-enhance", tags=["AI诊断增强"])

FORMULA_KNOWLEDGE = {
    "脾肾阳虚证": {
        "prescription": "附子理中汤合平胃散加减",
        "acupuncture": ["足三里", "脾俞", "肾俞", "关元", "气海"],
        "diet": "宜温热易消化，忌生冷寒凉",
    },
    "肝郁气滞证": {
        "prescription": "逍遥散加减",
        "acupuncture": ["太冲", "期门", "足三里", "三阴交"],
        "diet": "宜疏肝理气食物，忌辛辣刺激",
    },
    "气血两虚证": {
        "prescription": "八珍汤加减",
        "acupuncture": ["足三里", "血海", "气海", "三阴交"],
        "diet": "宜补气养血食物",
    },
}


@router.get("/diagnosis/{pattern}")
def get_enhanced(pattern: str, current_user: User = Depends(require_permissions(AI_DIAGNOSE))):
    result = FORMULA_KNOWLEDGE.get(pattern)
    if not result:
        return Response(data={
            "error": "未找到该证型的增强方案",
            "available_patterns": list(FORMULA_KNOWLEDGE.keys()),
        })
    return Response(data=result)


@router.get("/diagnosis/available-patterns")
def available_patterns(current_user: User = Depends(require_permissions(AI_DIAGNOSE))):
    return Response(data={
        "patterns": list(FORMULA_KNOWLEDGE.keys()),
        "count": len(FORMULA_KNOWLEDGE),
    })
