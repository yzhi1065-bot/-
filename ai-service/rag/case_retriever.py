"""AI诊断服务 - RAG知识检索增强"""

import json
import numpy as np
from typing import List, Dict, Any, Optional


class VectorStore:
    """简易向量存储（后续可接入Milvus/PGVector）"""

    def __init__(self):
        self.vectors: Dict[str, np.ndarray] = {}
        self.metadata: Dict[str, Dict] = {}

    def add(self, key: str, vector: List[float], metadata: Dict = None):
        self.vectors[key] = np.array(vector)
        self.metadata[key] = metadata or {}

    def search(self, query_vector: List[float], top_k: int = 5) -> List[Dict]:
        """余弦相似度搜索"""
        q = np.array(query_vector)
        scores = []
        for key, vec in self.vectors.items():
            similarity = np.dot(q, vec) / (np.linalg.norm(q) * np.linalg.norm(vec) + 1e-8)
            scores.append((key, similarity))

        scores.sort(key=lambda x: x[1], reverse=True)
        return [
            {"key": key, "score": float(score), "metadata": self.metadata.get(key)}
            for key, score in scores[:top_k]
        ]


class MedicalCaseRetriever:
    """病例检索器 - 基于知识的案例推理"""

    def __init__(self):
        self.cases = self._load_cases()

    def _load_cases(self) -> List[Dict]:
        """加载典型病例库"""
        return [
            {
                "id": "case_001",
                "pattern": "脾肾阳虚证",
                "symptoms": ["畏寒肢冷", "纳差", "便溏", "腰膝酸软", "舌淡胖", "脉沉细"],
                "prescription": "附子理中汤加减",
                "effectiveness": "优",
            },
            {
                "id": "case_002",
                "pattern": "肝郁脾虚证",
                "symptoms": ["情志抑郁", "胁肋胀痛", "纳差", "腹胀", "舌淡红", "脉弦"],
                "prescription": "逍遥散加减",
                "effectiveness": "优",
            },
            {
                "id": "case_003",
                "pattern": "痰湿内阻证",
                "symptoms": ["身重困倦", "胸闷", "纳呆", "痰多", "舌白腻", "脉滑"],
                "prescription": "二陈汤合平胃散加减",
                "effectiveness": "良",
            },
            {
                "id": "case_004",
                "pattern": "气虚血瘀证",
                "symptoms": ["神疲乏力", "气短", "面色晦暗", "舌紫暗", "脉涩"],
                "prescription": "补阳还五汤加减",
                "effectiveness": "良",
            },
            {
                "id": "case_005",
                "pattern": "阴虚火旺证",
                "symptoms": ["五心烦热", "口干咽燥", "失眠", "盗汗", "舌红少苔", "脉细数"],
                "prescription": "知柏地黄汤加减",
                "effectiveness": "优",
            },
        ]

    def retrieve_similar(self, symptoms: List[str], top_k: int = 3) -> List[Dict]:
        """检索相似病例"""
        scored = []
        for case in self.cases:
            # 简单症状匹配度
            matches = sum(1 for s in case["symptoms"] if s in symptoms)
            score = matches / max(len(case["symptoms"]), len(symptoms))
            scored.append((case, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
