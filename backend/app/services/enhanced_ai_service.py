"""AI增强方案 - 证型知识库"""

from typing import Optional

FORMULA_KNOWLEDGE = {
    "脾肾阳虚证": {
        "prescription": "附子理中汤合平胃散加减",
        "acupuncture": ["足三里", "脾俞", "肾俞", "关元", "气海"],
        "moxibustion": "隔姜灸神阙、关元，每日1次",
        "diet": "宜温热易消化，忌生冷寒凉",
        "exercise": "八段锦、太极拳，避免剧烈运动",
        "external_treatment": "中药足浴：艾叶30g、生姜20g、花椒10g",
    },
    "肝郁气滞证": {
        "prescription": "逍遥散加减",
        "acupuncture": ["太冲", "期门", "足三里", "三阴交", "行间"],
        "moxibustion": "温和灸膻中、期门",
        "diet": "宜疏肝理气食物（佛手、玫瑰花茶），忌辛辣刺激",
        "exercise": "散步、瑜伽，注意情绪调节",
        "external_treatment": "耳穴压豆：肝、胆、神门",
    },
    "气血两虚证": {
        "prescription": "八珍汤加减",
        "acupuncture": ["足三里", "血海", "气海", "三阴交", "脾俞"],
        "moxibustion": "温灸足三里、气海，每穴15分钟",
        "diet": "宜补气养血食物（红枣、桂圆、阿胶）",
        "exercise": "适度活动，避免劳累",
        "external_treatment": "中药膏方调补",
    },
    "湿热蕴结证": {
        "prescription": "茵陈蒿汤合四妙散加减",
        "acupuncture": ["阴陵泉", "丰隆", "曲池", "合谷", "内庭"],
        "diet": "宜清淡利湿，忌油腻甜食",
        "exercise": "适当运动出汗，促进代谢",
    },
    "阴虚火旺证": {
        "prescription": "知柏地黄丸加减",
        "acupuncture": ["太溪", "三阴交", "涌泉", "复溜"],
        "diet": "宜滋阴降火（百合、银耳、麦冬），忌辛辣",
        "exercise": "避免剧烈运动，宜静养",
    },
    "痰湿内阻证": {
        "prescription": "二陈汤合温胆汤加减",
        "acupuncture": ["丰隆", "阴陵泉", "中脘", "天枢"],
        "diet": "宜健脾祛湿（薏米、冬瓜），忌生冷肥腻",
        "exercise": "坚持有氧运动",
    },
}

HERB_KNOWLEDGE = {
    "麻黄": {"category": "解表药", "property": "辛、微苦，温", "meridian": "肺、膀胱",
             "dosage": "2-10g", "caution": "高血压、心脏病慎用"},
    "附子": {"category": "温里药", "property": "辛、甘，大热。有毒", "meridian": "心、肾、脾",
             "dosage": "3-15g（先煎）", "caution": "孕妇禁用，反半夏、瓜蒌、贝母、白蔹、白及"},
    "甘草": {"category": "补气药", "property": "甘，平", "meridian": "心、肺、脾、胃",
             "dosage": "2-10g", "caution": "反海藻、大戟、甘遂、芫花，湿盛者慎用"},
}


def get_enhanced_diagnosis(pattern: str) -> Optional[dict]:
    """获取证型的增强方案"""
    return FORMULA_KNOWLEDGE.get(pattern)


def get_herb_info(name: str) -> Optional[dict]:
    """查询中药信息"""
    return HERB_KNOWLEDGE.get(name)


def search_herbs(keyword: str) -> list:
    """搜索中药"""
    return [{"name": k, **v} for k, v in HERB_KNOWLEDGE.items()
            if keyword in k or keyword in v.get("category", "")]


def get_similar_cases(pattern: str) -> list:
    """获取相似病例参考"""
    cases = {
        "脾肾阳虚证": [
            {"symptoms": "畏寒肢冷、纳差便溏、腰膝酸软", "treatment": "附子理中汤加减", "effect": "显效"},
        ],
    }
    return cases.get(pattern, [])
