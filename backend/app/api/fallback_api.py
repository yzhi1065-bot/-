"""回退API - 为前端页面提供默认示例数据响应"""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.permissions import require_permissions, PHARMACY_READ
from app.models.user import User
from app.schemas.common import Response

router = APIRouter(tags=["回退API"])


def ok(data=None):
    return Response(data=data or [])


@router.get("/api/equipment")
def equipment(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([{"id":1,"name":"脉诊仪-001","type":"脉诊仪","status":"normal","location":"诊室1","last_maintain":"2026-06-01","next_maintain":"2026-09-01"}])


@router.get("/api/audit-logs")
def audit_logs(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.get("/api/chief-complaints/symptoms")
def symptoms(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok({"bodyParts":["头部","眼部","鼻部","口腔","咽喉","颈部","胸部","腹部","腰部","背部","上肢","下肢"],
               "commonComplaints":["头痛","发热","咳嗽","胃痛","腰痛","失眠","眩晕","腹泻","便秘","口干","心悸","乏力"]})


@router.get("/api/health-advice")
def health_advice(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "title": "春季养肝", "content": "春季阳气升发，肝气旺盛，宜顺应自然，调养肝脏。建议早睡早起，多食绿色蔬菜，保持心情舒畅，适当运动如散步、太极拳。避免过度饮酒和辛辣食物。", "category": "饮食"},
        {"id": 2, "title": "夏季养心", "content": "夏季心火旺盛，宜清心降火。建议多食苦味食物如苦瓜、莲子心，注意补充水分，避免贪凉饮冷伤及脾胃。午休30分钟有助养心安神。", "category": "养生"},
        {"id": 3, "title": "秋季润肺", "content": "秋燥伤肺，宜滋阴润燥。建议多食梨、银耳、百合等润肺食物，少食辛辣。早晚温差大，注意适时增减衣物，预防感冒。", "category": "饮食"}
    ])


@router.get("/api/health-edu/articles")
def health_edu(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "title": "认识中医体质", "summary": "中医将人体体质分为九种类型：平和质、气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质、特禀质。了解自身体质有助于针对性养生。", "category": "科普", "author": "王医师", "publish_date": "2026-06-20", "view_count": 1250},
        {"id": 2, "title": "经络养生入门", "summary": "经络是人体气血运行的通道，掌握常用穴位如足三里、合谷、内关等，日常按摩可起到保健作用。本文介绍12条正经的循行路线及养生要点。", "category": "科普", "author": "李医师", "publish_date": "2026-06-18", "view_count": 980},
        {"id": 3, "title": "中药煎煮方法", "summary": "正确的煎药方法直接影响药效。本文详解先煎、后下、包煎、烊化等特殊煎法，以及煎药器具选择、火候掌握、服用时间等关键知识。", "category": "用药指导", "author": "赵药师", "publish_date": "2026-06-15", "view_count": 2100}
    ])


@router.get("/api/insurance/records")
def insurance(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "patient_name": "张三", "type": "医保", "amount": 200, "status": "已报销", "record_no": "YB20260625001", "date": "2026-06-25", "clinic": "中医内科"},
        {"id": 2, "patient_name": "李四", "type": "医保", "amount": 350, "status": "审核中", "record_no": "YB20260624003", "date": "2026-06-24", "clinic": "针灸科"},
        {"id": 3, "patient_name": "王五", "type": "商业保险", "amount": 500, "status": "已报销", "record_no": "YB20260622007", "date": "2026-06-22", "clinic": "推拿科"}
    ])


@router.get("/api/lab-tests")
def lab_tests(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "patient_name": "张三", "patient_id": 1, "test_type": "血常规", "result": "正常", "date": "2026-06-25", "doctor": "张医生", "status": "已完成"},
        {"id": 2, "patient_name": "李四", "patient_id": 2, "test_type": "肝功能", "result": "ALT偏高", "date": "2026-06-24", "doctor": "李医生", "status": "已完成"},
        {"id": 3, "patient_name": "赵六", "patient_id": 3, "test_type": "肾功能", "result": "正常", "date": "2026-06-23", "doctor": "王医生", "status": "已完成"}
    ])


@router.get("/api/medication")
def medication(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "patient_name": "张三", "patient_id": 1, "drug_name": "制附子", "dosage": "9g", "frequency": "每日2次", "route": "口服", "status": "进行中", "prescribed_by": "张医生", "start_date": "2026-06-20", "end_date": "2026-07-04"},
        {"id": 2, "patient_name": "张三", "patient_id": 1, "drug_name": "黄芪", "dosage": "15g", "frequency": "每日2次", "route": "口服", "status": "进行中", "prescribed_by": "张医生", "start_date": "2026-06-20", "end_date": "2026-07-04"},
        {"id": 3, "patient_name": "李四", "patient_id": 2, "drug_name": "丹参", "dosage": "12g", "frequency": "每日3次", "route": "口服", "status": "已完成", "prescribed_by": "李医生", "start_date": "2026-06-10", "end_date": "2026-06-24"}
    ])


@router.get("/api/notifications")
def notifications(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "title": "库存预警", "content": "制附子库存不足，当前余量仅余2kg，低于安全库存线(5kg)，请及时补货。", "level": "warning", "time": "2026-06-25 08:30", "read": False},
        {"id": 2, "title": "系统通知", "content": "今日有3位患者预约复诊，请相关医师做好接诊准备。", "level": "info", "time": "2026-06-25 07:00", "read": False},
        {"id": 3, "title": "处方审核", "content": "处方#P20260625008中有甘草与海藻同用，请药师确认是否为十八反配伍禁忌。", "level": "error", "time": "2026-06-25 09:15", "read": True}
    ])


@router.get("/api/messages")
def messages(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "sender": "系统", "content": "今日有5位患者待复诊，请登录系统查看详情。", "time": "2026-06-25 08:00", "type": "system", "read": False},
        {"id": 2, "sender": "药房", "content": "中药饮片配送已完成，请各科室注意查收。", "time": "2026-06-25 09:30", "type": "department", "read": False},
        {"id": 3, "sender": "管理员", "content": "本周五下午2点召开全院中医学术交流会，请各科室主任准时参加。", "time": "2026-06-24 16:00", "type": "notice", "read": True}
    ])


@router.get("/api/referrals")
def referrals(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "patient_name": "张三", "patient_id": 1, "from": "中医内科", "to": "针灸科", "reason": "患者腰部扭伤，经中药内服治疗效果不佳，需要配合针灸治疗。", "status": "待接收", "referral_date": "2026-06-25", "referring_doctor": "张医生"},
        {"id": 2, "patient_name": "李四", "patient_id": 2, "from": "推拿科", "to": "中医内科", "reason": "患者颈椎病推拿后症状缓解，但伴有头晕乏力，需内科调理气血。", "status": "已完成", "referral_date": "2026-06-24", "referring_doctor": "刘医生"},
        {"id": 3, "patient_name": "王五", "patient_id": 3, "from": "中医内科", "to": "康复科", "reason": "中风后遗症，病情稳定，建议转康复科进行系统康复训练。", "status": "进行中", "referral_date": "2026-06-23", "referring_doctor": "张医生"}
    ])


@router.get("/api/satisfaction/feedbacks")
def satisfaction(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "patient_name": "张三", "patient_id": 1, "rating": 5, "content": "张医生医术高明，治疗3天后腰痛明显好转，态度也非常好。", "department": "中医内科", "doctor": "张医生", "date": "2026-06-25", "status": "已回复"},
        {"id": 2, "patient_name": "李四", "patient_id": 2, "rating": 4, "content": "针灸治疗效果不错，就是等待时间有点长，希望改善预约流程。", "department": "针灸科", "doctor": "陈医生", "date": "2026-06-24", "status": "待回复"},
        {"id": 3, "patient_name": "钱七", "patient_id": 4, "rating": 5, "content": "中药调理半年，体质明显改善，感谢李医师的精心诊治。", "department": "中医内科", "doctor": "李医生", "date": "2026-06-22", "status": "已回复"}
    ])


@router.get("/api/finance/transactions")
def finance(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "date": "2026-06-25", "type": "挂号收入", "amount": 50, "category": "门诊", "patient_name": "张三", "payment_method": "微信", "status": "已完成"},
        {"id": 2, "date": "2026-06-25", "type": "药品收入", "amount": 128, "category": "药房", "patient_name": "李四", "payment_method": "医保", "status": "已完成"},
        {"id": 3, "date": "2026-06-24", "type": "治疗收入", "amount": 200, "category": "针灸", "patient_name": "王五", "payment_method": "现金", "status": "已完成"}
    ])


@router.get("/api/formulas")
def formulas(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.get("/api/knowledge-base")
def knowledge_base(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "title": "麻黄", "content": "发汗解表，宣肺平喘，利水消肿。用于风寒感冒，胸闷喘咳，风水浮肿。蜜炙后润肺止咳。", "category": "中药", "tags": ["解表药", "辛温解表"], "source": "《神农本草经》"},
        {"id": 2, "title": "桂枝汤", "content": "解肌发表，调和营卫。主治外感风寒表虚证，症见发热头痛、汗出恶风、鼻鸣干呕、脉浮缓。由桂枝、芍药、甘草、生姜、大枣组成。", "category": "方剂", "tags": ["解表剂", "辛温解表"], "source": "《伤寒论》"},
        {"id": 3, "title": "足三里穴", "content": "在小腿外侧，犊鼻下3寸。主治胃肠病症、下肢痿痹、神志病、虚劳诸证。是保健要穴，常灸可强身健体。", "category": "穴位", "tags": ["足阳明胃经", "保健要穴"], "source": "《针灸甲乙经》"}
    ])


@router.get("/api/medical-records")
def patient_records(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.get("/api/patient-search")
def patient_search(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.get("/api/diagnosis/patients/{patient_id}/sessions")
def patient_sessions(patient_id: int, current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.post("/api/diagnosis/sessions/{session_id}/start")
def start_session(session_id: int, current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return Response(message="ok")


@router.get("/api/consultations")
def consultations(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.get("/api/compatibility/references")
def compatibility_refs(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok({"eighteen_antagonisms":["乌头反半夏、瓜蒌、贝母、白蔹、白及","甘草反海藻、大戟、甘遂、芫花","藜芦反人参、沙参、丹参、玄参、细辛、芍药"],
               "nineteen_incompatibilities":["硫黄畏朴硝","水银畏砒霜","狼毒畏密陀僧","巴豆畏牵牛","丁香畏郁金","牙硝畏三棱","川乌草乌畏犀角","人参畏五灵脂","官桂畏石脂"]})


@router.get("/api/export/stats")
def export_stats(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok({})


@router.get("/api/visit-compare")
def visit_compare(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([])


@router.get("/api/admin/users")
def admin_users(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return ok([
        {"id": 1, "username": "admin", "real_name": "管理员", "role": "admin", "is_active": True, "email": "admin@example.com", "phone": "13800000001", "last_login": "2026-06-25 08:00"},
        {"id": 2, "username": "doctor1", "real_name": "张医生", "role": "doctor", "is_active": True, "email": "zhang@example.com", "phone": "13800000002", "last_login": "2026-06-24 18:30"},
        {"id": 3, "username": "pharmacist1", "real_name": "赵药师", "role": "pharmacist", "is_active": True, "email": "zhao@example.com", "phone": "13800000003", "last_login": "2026-06-25 07:45"}
    ])


@router.get("/api/admin/settings")
def admin_settings(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return Response(data={
        "clinic_name": "杏林中医诊所",
        "address": "北京市朝阳区中医街88号",
        "phone": "010-88886666",
        "email": "info@xinglinclinic.com",
        "business_hours": "周一至周日 08:00-20:00",
        "departments": ["中医内科", "针灸科", "推拿科", "康复科", "药房"],
        "admin_name": "管理员",
        "registration_enabled": True,
        "appointment_interval": 30,
        "max_daily_patients": 50
    })


@router.get("/api/admin/maintenance")
def admin_maintenance(current_user: User = Depends(require_permissions(PHARMACY_READ))):
    return Response(data={
        "uptime": 72,
        "dbSize": "12.5MB",
        "version": "v1.0.0",
        "lastBackup": "2026-06-25 03:00",
        "activeUsers": 8,
        "totalPatients": 1256,
        "serverStatus": "正常",
        "memoryUsage": "45%",
        "cpuUsage": "22%"
    })
