"""回退API - 为前端页面提供默认空数据响应"""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.common import Response

router = APIRouter(tags=["回退API"])


def ok(data=None):
    return Response(data=data or [])


@router.get("/api/equipment")
def equipment(current_user: User = Depends(get_current_user)):
    return ok([{"id":1,"name":"脉诊仪-001","type":"脉诊仪","status":"normal","location":"诊室1","last_maintain":"2026-06-01","next_maintain":"2026-09-01"}])

@router.get("/api/audit-logs")
def audit_logs(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/chief-complaints/symptoms")
def symptoms(current_user: User = Depends(get_current_user)):
    return ok({"bodyParts":["头部","眼部","鼻部","口腔","咽喉","颈部","胸部","腹部","腰部","背部","上肢","下肢"],
               "commonComplaints":["头痛","发热","咳嗽","胃痛","腰痛","失眠","眩晕","腹泻","便秘","口干","心悸","乏力"]})

@router.get("/api/followups")
def followups(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/health-advice")
def health_advice(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/health-edu/articles")
def health_edu(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/insurance/records")
def insurance(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/lab-tests")
def lab_tests(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/medication")
def medication(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/referrals")
def referrals(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/nursing")
def nursing(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/satisfaction/feedbacks")
def satisfaction(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/finance/transactions")
def finance(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/schedules")
def schedules(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/notifications")
def notifications(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/messages")
def messages(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/formulas")
def formulas(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/knowledge-base")
def knowledge_base(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/appointments")
def appointments(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/patients/records")
def patient_records(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/consultations")
def consultations(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/compatibility/references")
def compatibility_refs(current_user: User = Depends(get_current_user)):
    return ok({"eighteen_antagonisms":["乌头反半夏、瓜蒌、贝母、白蔹、白及","甘草反海藻、大戟、甘遂、芫花","藜芦反人参、沙参、丹参、玄参、细辛、芍药"],
               "nineteen_incompatibilities":["硫黄畏朴硝","水银畏砒霜","狼毒畏密陀僧","巴豆畏牵牛","丁香畏郁金","牙硝畏三棱","川乌草乌畏犀角","人参畏五灵脂","官桂畏石脂"]})

@router.get("/api/export/stats")
def export_stats(current_user: User = Depends(get_current_user)):
    return ok({})

@router.get("/api/visit-compare")
def visit_compare(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/admin/users")
def admin_users(current_user: User = Depends(get_current_user)):
    return ok([])

@router.get("/api/admin/settings")
def admin_settings(current_user: User = Depends(get_current_user)):
    return ok({})

@router.get("/api/admin/maintenance")
def admin_maintenance(current_user: User = Depends(get_current_user)):
    return ok([])
