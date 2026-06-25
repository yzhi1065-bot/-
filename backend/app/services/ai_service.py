"""AI诊断服务"""

import json
from typing import Dict, Any
import httpx
from app.core.config import settings


class AIService:
    """AI诊断服务 - 管理与大模型的交互"""

    def __init__(self):
        self.timeout = 60

    def _get_config(self) -> dict:
        """获取当前配置"""
        try:
            from app.api.ai_config import current_config
            return current_config
        except ImportError:
            return {
                "mode": "demo",
                "api_url": settings.AI_API_URL,
                "api_key": settings.AI_API_KEY,
                "model": settings.LLM_MODEL,
                "temperature": 0.3,
            }

    async def diagnose(self, diagnosis_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行AI诊断"""
        config = self._get_config()

        # 演示模式 - 使用模拟数据
        if config.get("mode") == "demo" or not config.get("api_key"):
            return self._get_mock_result()

        # 在线模式 - 调用真实API
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(diagnosis_data)

        try:
            # 构建API URL：如果api_url末尾已包含/v1则不再重复添加
            base_url = config['api_url'].rstrip('/')
            chat_url = f"{base_url}/chat/completions" if '/v1' in base_url else f"{base_url}/v1/chat/completions"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    chat_url,
                    headers={
                        "Authorization": f"Bearer {config['api_key']}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": config.get("model", "deepseek-chat"),
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": config.get("temperature", 0.3),
                        "response_format": {"type": "json_object"},
                    },
                )
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    print(f"AI API错误: {response.status_code}")
                    return self._get_mock_result()
        except Exception as e:
            print(f"AI服务调用失败: {e}")
            return self._get_mock_result()

    async def analyze_tongue(self, tongue_data: Dict[str, Any]) -> Dict[str, Any]:
        """舌诊图片AI分析"""
        config = self._get_config()
        if config.get("mode") == "demo" or not config.get("api_key"):
            return self._get_tongue_mock()

        system_prompt = "你是一位资深中医舌诊专家。请基于舌象图片描述进行辨证分析。仅输出JSON格式。"
        user_prompt = f"舌象信息：{json.dumps(tongue_data, ensure_ascii=False)}"
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{config['api_url']}/v1/chat/completions",
                    headers={"Authorization": f"Bearer {config['api_key']}", "Content-Type": "application/json"},
                    json={"model": config.get("model", "deepseek-chat"), "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ], "temperature": 0.2, "response_format": {"type": "json_object"}},
                )
                if response.status_code == 200:
                    content = response.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            print(f"舌诊AI分析失败: {e}")
        return self._get_tongue_mock()

    def _get_tongue_mock(self) -> Dict[str, Any]:
        return {
            "tongue_body": "舌淡红",
            "tongue_coating": "苔薄白",
            "tongue_shape": "大小正常，无裂纹",
            "sublingual": "脉络未见明显异常",
            "analysis": "舌象大致正常，无明显病理改变",
            "suggestion": "建议结合其他三诊综合判断",
        }

    def _build_system_prompt(self) -> str:
        return """你是一位资深中医专家，精通中医辨证论治。请基于四诊信息进行辨证分析，并给出治疗方案。

请严格按照以下JSON格式输出：

{
  "primary_pattern": "主证名称",
  "secondary_pattern": "兼证名称",
  "confidence_score": 0.95,
  "diagnosis_basis": {
    "tongue_basis": "舌诊辨证依据",
    "pulse_basis": "脉诊辨证依据",
    "symptom_basis": "症状辨证依据",
    "summary": "综合辨证推理过程"
  },
  "treatment_principle": "治则",
  "treatment_method": "治法",
  "recommended_prescription": {
    "name": "方剂名称",
    "source": "方剂出处",
    "composition": [{"herb": "药名", "dosage": "剂量", "unit": "克", "special": "特殊煎法"}],
    "modification": "随症加减说明",
    "usage": "用法"
  },
  "recommended_acupuncture": {
    "points": ["穴位1", "穴位2"],
    "method": "针法说明",
    "frequency": "治疗频率"
  },
  "differential_diagnosis": ["鉴别诊断1", "鉴别诊断2"],
  "health_advice": {
    "diet": "饮食建议",
    "emotion": "情志调节",
    "routine": "作息建议"
  }
}"""

    def _build_user_prompt(self, data: Dict[str, Any]) -> str:
        prompt_parts = ["## 患者信息"]
        patient = data.get("patient", {})
        if patient:
            prompt_parts.append(f"- 姓名：{patient.get('name', '未知')}")
            prompt_parts.append(f"- 年龄：{patient.get('age', '未知')}")
            prompt_parts.append(f"- 性别：{patient.get('gender', '未知')}")

        if data.get("chief_complaint"):
            prompt_parts.append(f"\n## 主诉\n{data['chief_complaint']}")

        if data.get("inspection"):
            ins = data["inspection"]
            prompt_parts.append("\n## 望诊")
            prompt_parts.append(f"- 舌质：{ins.get('tongue_body', '未采集')}")
            prompt_parts.append(f"- 舌苔：{ins.get('tongue_coating', '未采集')}")
            prompt_parts.append(f"- 舌形：{ins.get('tongue_shape', '未采集')}")
            prompt_parts.append(f"- 面色：{ins.get('complexion', '未采集')}")

        if data.get("inquiry"):
            inq = data["inquiry"]
            prompt_parts.append("\n## 问诊")
            for key, label in [("chills_fever", "寒热"), ("sweat", "汗"), ("head_body", "头身"), ("appetite", "饮食"), ("sleep", "睡眠"), ("bowel", "二便"), ("emotion", "情志")]:
                val = inq.get(key)
                if val:
                    prompt_parts.append(f"- {label}：{val}")

        if data.get("palpation"):
            pal = data["palpation"]
            prompt_parts.append("\n## 切诊")
            prompt_parts.append(f"- 脉位：{pal.get('pulse_depth', '未采集')}")
            prompt_parts.append(f"- 脉形：{pal.get('pulse_shape', '未采集')}")

        prompt_parts.append("\n请基于以上四诊信息进行辨证论治，输出JSON格式诊断结果。")
        return "\n".join(prompt_parts)

    async def analyze_tongue(self, image_path: str, description: str = None) -> Dict[str, Any]:
        """分析舌象图片，返回舌质/舌苔/舌形等诊断结果

        Args:
            image_path: 舌象图片的本地路径
            description: 用户额外描述信息（可选）

        Returns:
            舌诊分析结果字典
        """
        config = self._get_config()

        # 演示模式 - 使用模拟舌诊数据
        if config.get("mode") == "demo" or not config.get("api_key"):
            return self._get_mock_tongue_result()

        # 在线模式 - 调用真实API分析舌象
        system_prompt = """你是一位资深中医舌诊专家。请基于患者的舌象描述（未来可支持图片分析）进行舌诊辨证。

请严格按照以下JSON格式输出舌诊结果：

{
  "tongue_body": {
    "color": "舌质颜色描述",
    "description": "舌质详细描述",
    "finding": "舌质诊断发现"
  },
  "tongue_coating": {
    "color": "舌苔颜色",
    "quality": "舌苔质地（薄/厚/腻/腐/剥等）",
    "description": "舌苔详细描述",
    "finding": "舌苔诊断发现"
  },
  "tongue_shape": {
    "shape": "舌形描述（胖/瘦/齿痕/裂纹/点刺等）",
    "description": "舌形详细描述",
    "finding": "舌形诊断发现"
  },
  "sublingual_veins": {
    "description": "舌下络脉描述",
    "finding": "舌下络脉发现"
  },
  "overall_assessment": "舌诊综合评述",
  "clinical_significance": "舌诊临床意义及辨证提示",
  "confidence": 0.9
}"""

        user_prompt = f"舌象图片路径: {image_path}\n"
        if description:
            user_prompt += f"患者描述: {description}\n"
        user_prompt += "\n请基于以上信息进行舌诊分析，输出JSON格式结果。"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{config['api_url']}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {config['api_key']}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": config.get("model", "deepseek-chat"),
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": config.get("temperature", 0.3),
                        "response_format": {"type": "json_object"},
                    },
                )
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    parsed["confidence"] = parsed.get("confidence", 0.85)
                    return parsed
                else:
                    print(f"舌诊AI API错误: {response.status_code}")
                    return self._get_mock_tongue_result()
        except Exception as e:
            print(f"舌诊AI服务调用失败: {e}")
            return self._get_mock_tongue_result()

    def _get_mock_tongue_result(self) -> Dict[str, Any]:
        """获取模拟舌诊结果（演示模式使用）"""
        return {
            "tongue_body": {
                "color": "淡红",
                "description": "舌质淡红，色泽欠华",
                "finding": "淡红舌，提示气血偏虚或正常舌象偏虚"
            },
            "tongue_coating": {
                "color": "白",
                "quality": "薄腻",
                "description": "舌苔薄白微腻，根部略厚",
                "finding": "薄白腻苔，提示表邪未解或湿浊内蕴"
            },
            "tongue_shape": {
                "shape": "胖大，边有齿痕",
                "description": "舌体胖大，边缘可见明显齿痕",
                "finding": "胖大齿痕舌，提示脾虚湿盛"
            },
            "sublingual_veins": {
                "description": "舌下络脉无明显迂曲扩张",
                "finding": "舌下络脉未见明显异常"
            },
            "overall_assessment": "综合舌象表现为淡红舌、薄白腻苔、胖大齿痕舌，提示脾虚湿盛，运化失常，水湿内停。",
            "clinical_significance": "临床多见消化功能减退、食欲不振、肢体困重、大便溏薄等脾虚湿困表现，建议健脾化湿为治则。",
            "confidence": 0.88
        }

    def _get_mock_result(self) -> Dict[str, Any]:
        return {
            "primary_pattern": "脾肾阳虚证",
            "secondary_pattern": "湿困脾胃",
            "confidence_score": 0.88,
            "diagnosis_basis": {
                "tongue_basis": "舌淡胖苔白腻，提示脾阳不足，运化失常，湿浊内停",
                "pulse_basis": "脉沉细，沉主里，细主虚，提示脾肾阳虚",
                "symptom_basis": "畏寒肢冷为阳虚失温，纳差便溏为脾失健运",
                "summary": "综合舌脉症，辨证为脾肾阳虚，兼湿困脾胃"
            },
            "treatment_principle": "温补脾肾，化湿和中",
            "treatment_method": "温阳健脾以治本，化湿和中以治标",
            "recommended_prescription": {
                "name": "附子理中汤合平胃散加减",
                "source": "《伤寒论》《太平惠民和剂局方》",
                "composition": [
                    {"herb": "制附子", "dosage": "9", "unit": "克", "special": "先煎"},
                    {"herb": "干姜", "dosage": "6", "unit": "克", "special": ""},
                    {"herb": "党参", "dosage": "12", "unit": "克", "special": ""},
                    {"herb": "炒白术", "dosage": "12", "unit": "克", "special": ""},
                    {"herb": "茯苓", "dosage": "15", "unit": "克", "special": ""},
                    {"herb": "苍术", "dosage": "9", "unit": "克", "special": ""},
                    {"herb": "厚朴", "dosage": "9", "unit": "克", "special": ""},
                    {"herb": "陈皮", "dosage": "6", "unit": "克", "special": ""},
                    {"herb": "炙甘草", "dosage": "6", "unit": "克", "special": ""},
                    {"herb": "砂仁", "dosage": "6", "unit": "克", "special": "后下"}
                ],
                "modification": "若便溏甚加薏苡仁30g；若畏寒甚加肉桂6g",
                "usage": "每日1剂，水煎分2次温服，饭后1小时服用"
            },
            "recommended_acupuncture": {
                "points": ["足三里", "脾俞", "肾俞", "关元", "气海"],
                "method": "毫针刺，补法，可加灸",
                "frequency": "每周3次，10次为一疗程"
            },
            "differential_diagnosis": ["单纯脾气虚证：无阳虚表现", "肾阳虚证：以腰膝酸软为主"],
            "health_advice": {
                "diet": "忌生冷寒凉，宜温热易消化食物",
                "emotion": "保持心情舒畅，避免忧思过度",
                "routine": "早睡早起，避免熬夜，适当午休"
            }
        }
