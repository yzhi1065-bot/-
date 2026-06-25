"""体质辨识服务"""

from typing import Dict, List, Any


# 中医九种体质特征库
CONSTITUTION_DATABASE = {
    "pinghe": {
        "name": "平和质",
        "features": "阴阳气血调和，体态适中、面色红润、精力充沛",
        "characteristics": ["体态匀称", "面色红润", "精力充沛", "睡眠良好", "食欲正常"],
        "advice": "保持良好生活习惯，均衡饮食，适度运动",
    },
    "qixu": {
        "name": "气虚质",
        "features": "元气不足，疲乏、气短、自汗",
        "characteristics": ["容易疲劳", "气短懒言", "自汗", "易感冒", "食欲不振"],
        "advice": "宜补气健脾，多吃山药、黄芪、大枣，适当运动不过劳",
    },
    "yangxu": {
        "name": "阳虚质",
        "features": "阳气不足，畏寒怕冷、手足不温",
        "characteristics": ["畏寒肢冷", "手足不温", "喜热饮", "大便溏薄", "小便清长"],
        "advice": "宜温阳补气，多吃牛羊肉、生姜、韭菜，避寒凉",
    },
    "yinxu": {
        "name": "阴虚质",
        "features": "阴液亏少，口燥咽干、手足心热",
        "characteristics": ["口燥咽干", "手足心热", "失眠多梦", "大便干结", "潮热盗汗"],
        "advice": "宜滋阴清热，多吃百合、银耳、梨，避免熬夜",
    },
    "tanshi": {
        "name": "痰湿质",
        "features": "痰湿凝聚，形体肥胖、腹部肥满、口黏苔腻",
        "characteristics": ["形体肥胖", "腹部肥满", "口黏苔腻", "胸闷痰多", "身重不爽"],
        "advice": "宜健脾化痰，多吃薏米、冬瓜、白萝卜，少食肥甘厚味",
    },
    "shire": {
        "name": "湿热质",
        "features": "湿热内蕴，面垢油光、口苦口干",
        "characteristics": ["面垢油光", "口苦口干", "身重困倦", "大便黏滞", "小便短黄"],
        "advice": "宜清热利湿，多吃绿豆、冬瓜、苦瓜，少吃辛辣",
    },
    "xueyu": {
        "name": "血瘀质",
        "features": "血行不畅，肤色晦暗、舌质紫暗",
        "characteristics": ["肤色晦暗", "舌质紫暗", "易有瘀斑", "疼痛固定", "肌肤甲错"],
        "advice": "宜活血化瘀，多吃山楂、红糖、黑豆，适度运动",
    },
    "qiyu": {
        "name": "气郁质",
        "features": "气机郁滞，神情抑郁、忧虑脆弱",
        "characteristics": ["情志抑郁", "忧虑脆弱", "烦闷不乐", "胸胁胀满", "嗳气叹息"],
        "advice": "宜疏肝理气，多运动、听音乐，少吃辛辣刺激",
    },
    "tebing": {
        "name": "特禀质",
        "features": "先天失常，过敏体质",
        "characteristics": ["易过敏", "易打喷嚏", "易皮肤瘙痒", "易哮喘", "对某些食物敏感"],
        "advice": "宜益气固表，避免接触过敏原，饮食清淡",
    },
}


def analyze_constitution(symptoms: Dict[str, str]) -> Dict[str, Any]:
    """根据症状分析体质类型"""
    scores = {key: 0 for key in CONSTITUTION_DATABASE}

    symptom_value_mapping = {
        "畏寒肢冷": ["yangxu"], "手足不温": ["yangxu"],
        "五心烦热": ["yinxu"], "口燥咽干": ["yinxu"], "盗汗": ["yinxu"],
        "失眠": ["yinxu", "qiyu"],
        "乏力": ["qixu"], "气短": ["qixu"], "自汗": ["qixu"], "易感冒": ["qixu"],
        "身重": ["tanshi", "shire"], "口黏": ["tanshi"], "痰多": ["tanshi"],
        "口苦": ["shire"], "面垢": ["shire"],
        "易怒": ["qiyu", "shire"], "抑郁": ["qiyu"], "胸胁胀满": ["qiyu"],
        "面色晦暗": ["xueyu"],
        "便溏": ["yangxu", "qixu"], "便秘": ["yinxu", "shire"],
        "纳差": ["qixu"], "食欲不振": ["qixu"],
        "正常": [], "无异常": [], "平和": [], "": [],
    }

    for symptom_value in symptoms.values():
        matched = symptom_value_mapping.get(symptom_value, [])
        for key in matched:
            if key in scores:
                scores[key] += 1

    max_score = max(scores.values()) if scores else 0
    if max_score == 0:
        return CONSTITUTION_DATABASE["pinghe"]

    top = [k for k, v in scores.items() if v == max_score]
    return CONSTITUTION_DATABASE[top[0]]


def get_constitution_list() -> List[Dict]:
    """获取所有体质类型"""
    return [
        {
            "id": key,
            "name": info.get("name", ""),
            "features": info.get("features", ""),
            "characteristics": info.get("characteristics", []),
            "advice": info.get("advice", ""),
        }
        for key, info in CONSTITUTION_DATABASE.items()
    ]
