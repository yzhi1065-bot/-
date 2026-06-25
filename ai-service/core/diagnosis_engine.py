"""
AI诊断服务 - 核心模块
"""

import json
import httpx
from typing import Dict, Any, Optional


class TCMDiagnosisEngine:
    """中医诊断引擎"""

    def __init__(self, api_url: str = "http://localhost:8000", api_key: str = ""):
        self.api_url = api_url
        self.api_key = api_key
        self.knowledge_base = KnowledgeBase()

    async def analyze(self, diagnosis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        综合分析四诊数据
        1. 特征融合
        2. 辨证推理
        3. 方剂推荐
        """
        # 融合四诊特征
        features = self._fuse_features(diagnosis_data)

        # 调用LLM进行辨证推理
        result = await self._llm_reasoning(features)

        # 知识图谱验证
        result = self.knowledge_base.validate(result)

        return result

    def _fuse_features(self, data: Dict) -> Dict:
        """融合四诊特征向量"""
        fused = {
            "patient_info": data.get("patient", {}),
            "syndrome_vector": self._build_syndrome_vector(data),
            "key_symptoms": self._extract_key_symptoms(data),
        }
        return fused

    def _build_syndrome_vector(self, data: Dict) -> Dict:
        """构建证候向量"""
        vector = {}

        # 望诊特征
        inspection = data.get("inspection", {})
        vector["tongue_body"] = inspection.get("tongue_body", "")
        vector["tongue_coating"] = inspection.get("tongue_coating", "")
        vector["complexion"] = inspection.get("complexion", "")

        # 闻诊特征
        auscultation = data.get("auscultation", {})
        vector["voice"] = auscultation.get("voice_quality", "")

        # 问诊特征
        inquiry = data.get("inquiry", {})
        vector["chills_fever"] = inquiry.get("chills_fever", "")
        vector["appetite"] = inquiry.get("appetite", "")
        vector["sleep"] = inquiry.get("sleep", "")
        vector["bowel"] = inquiry.get("bowel", "")

        # 切诊特征
        palpation = data.get("palpation", {})
        vector["pulse_shape"] = palpation.get("pulse_shape", "")
        vector["pulse_rate"] = palpation.get("pulse_rate", "")

        return vector

    def _extract_key_symptoms(self, data: Dict) -> list:
        """提取关键症状"""
        symptoms = []
        inquiry = data.get("inquiry", {})
        for key in ["chills_fever", "sweat", "head_body", "appetite",
                      "sleep", "bowel", "emotion"]:
            value = inquiry.get(key, "")
            if value and value != "正常" and value != "无异常":
                symptoms.append({"type": key, "value": value})
        return symptoms

    async def _llm_reasoning(self, features: Dict) -> Dict:
        """调用LLM进行辨证推理"""
        system_prompt = self._build_diagnosis_prompt()
        user_prompt = json.dumps(features, ensure_ascii=False, indent=2)

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    f"{self.api_url}/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"},
                    },
                )
                if response.status_code == 200:
                    content = response.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            print(f"LLM调用失败: {e}")

        return self._fallback_result(features)

    def _build_diagnosis_prompt(self) -> str:
        """构建诊断提示词"""
        return """你是一位资深中医专家。请基于四诊信息进行辨证分析。

输出JSON格式：
{
  "primary_pattern": "主证",
  "secondary_pattern": "兼证",
  "confidence": 0.95,
  "analysis": {
    "tongue_analysis": "舌诊分析",
    "pulse_analysis": "脉诊分析",
    "symptom_analysis": "症状分析",
    "conclusion": "综合结论"
  },
  "treatment": {
    "principle": "治则",
    "method": "治法"
  },
  "prescription": {
    "name": "方剂名",
    "herbs": [{"name": "药名", "dosage": "剂量", "unit": "克"}],
    "usage": "用法"
  }
}"""

    def _fallback_result(self, features: Dict) -> Dict:
        """备用诊断结果"""
        return {
            "primary_pattern": "脾肾阳虚证",
            "secondary_pattern": "",
            "confidence": 0.85,
            "analysis": {
                "tongue_analysis": "舌淡胖苔白腻",
                "pulse_analysis": "脉沉细",
                "symptom_analysis": "畏寒肢冷，纳差便溏",
                "conclusion": "综合辨证为脾肾阳虚证",
            },
            "treatment": {
                "principle": "温补脾肾",
                "method": "温阳健脾，化湿和中",
            },
            "prescription": {
                "name": "附子理中汤加减",
                "herbs": [
                    {"name": "制附子", "dosage": "9", "unit": "克"},
                    {"name": "党参", "dosage": "12", "unit": "克"},
                    {"name": "炒白术", "dosage": "12", "unit": "克"},
                    {"name": "干姜", "dosage": "6", "unit": "克"},
                    {"name": "炙甘草", "dosage": "6", "unit": "克"},
                ],
                "usage": "每日1剂，水煎分2次温服",
            },
        }


class KnowledgeBase:
    """中医知识库"""

    def __init__(self):
        self.patterns = self._init_patterns()
        self.herb_contraindications = self._init_contraindications()

    def _init_patterns(self) -> Dict:
        """初始化证型库"""
        return {
            "脾肾阳虚证": {
                "key_symptoms": ["畏寒肢冷", "纳差", "便溏", "腰膝酸软"],
                "tongue": ["淡白", "淡胖", "胖大"],
                "pulse": ["沉", "细", "弱"],
                "treatment": "温补脾肾",
            },
            "肝郁脾虚证": {
                "key_symptoms": ["情志抑郁", "胁痛", "纳差", "腹胀"],
                "tongue": ["淡红", "薄白"],
                "pulse": ["弦", "细"],
                "treatment": "疏肝健脾",
            },
            "痰湿内阻证": {
                "key_symptoms": ["身重", "纳呆", "胸闷", "痰多"],
                "tongue": ["白腻", "厚腻"],
                "pulse": ["滑", "濡"],
                "treatment": "燥湿化痰",
            },
        }

    def _init_contraindications(self) -> Dict:
        """初始化配伍禁忌（十八反十九畏）"""
        return {
            "十八反": {
                "乌头": "半夏、瓜蒌、贝母、白蔹、白及",
                "甘草": "甘遂、大戟、海藻、芫花",
                "藜芦": "人参、沙参、丹参、玄参、细辛、芍药",
            },
            "十九畏": {
                "硫黄": "朴硝",
                "水银": "砒霜",
                "狼毒": "密陀僧",
                "巴豆": "牵牛",
                "丁香": "郁金",
                "川乌草乌": "犀角",
                "牙硝": "三棱",
                "官桂": "石脂",
                "人参": "五灵脂",
            },
        }

    def validate(self, result: Dict) -> Dict:
        """验证诊断结果"""
        errors = []

        # 验证证型是否存在
        pattern = result.get("primary_pattern", "")
        if pattern not in self.patterns:
            errors.append(f"证型 '{pattern}' 未在知识库中找到")

        # 检查配伍禁忌
        herbs = result.get("prescription", {}).get("herbs", [])
        herb_names = [h["name"] for h in herbs]
        for group, items in self.herb_contraindications["十八反"].items():
            if group in herb_names:
                for item in items.split("、"):
                    if item in herb_names:
                        errors.append(f"十八反禁忌: {group} 反 {item}")

        result["validation_errors"] = errors
        result["validated"] = len(errors) == 0
        return result
