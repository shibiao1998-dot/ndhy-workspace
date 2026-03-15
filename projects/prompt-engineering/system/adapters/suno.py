"""
adapters/suno.py — 音频 AI 引擎适配器（Suno）

输出格式：简洁描述式
特点：
- 简短自然语言描述
- 音乐风格 + 情感 + 场景
- 不需要技术细节
"""

from typing import Dict, List

from dimension_loader import Dimension
from router import RouteResult


class AudioAIAdapter:
    """音频 AI 引擎适配器：简洁描述格式"""

    def __init__(self, engine_config: Dict):
        self.config = engine_config
        self.max_chars = engine_config.get("max_tokens", 2000)

    def format(self, route_result: RouteResult, max_chars: int = 0) -> str:
        """
        将路由结果格式化为音频 AI 提示词（简洁描述式）

        策略：
        1. 核心描述（从任务描述提取）
        2. 情感基调（从战略/价值观维度推断）
        3. 场景氛围（从场景维度提取）
        4. 风格标签
        """
        budget = max_chars or self.max_chars
        parts = []

        # ======== 核心描述 ========
        parts.append(f"# 音频生成提示词\n\n## 任务\n{route_result.task_description}")

        # ======== 情感基调 ========
        mood = self._extract_mood(route_result.all_dimensions)
        if mood:
            parts.append(f"## 情感基调\n{mood}")

        # ======== 场景描述 ========
        scene = self._extract_scene(route_result.all_dimensions)
        if scene:
            parts.append(f"## 场景\n{scene}")

        # ======== 风格建议 ========
        style = self._suggest_style(route_result)
        if style:
            parts.append(f"## 风格\n{style}")

        # ======== 约束 ========
        from assembler import PromptAssembler
        constraints = PromptAssembler.extract_constraints(route_result.all_dimensions)
        if constraints:
            parts.append("## 避免\n" + "\n".join(f"- {c[:50]}" for c in constraints[:5]))

        result = "\n\n".join(parts)
        if len(result) > budget:
            result = result[:budget - 3] + "..."

        return result

    def _extract_mood(self, dimensions: List[Dimension]) -> str:
        """从维度中推断情感基调"""
        mood_keywords = {
            "积极正向": ["鼓励", "成长", "进步", "创新", "探索"],
            "严谨专业": ["严谨", "科学", "准确", "规范", "标准"],
            "温暖关怀": ["关怀", "尊重", "理解", "包容", "支持"],
            "活泼趣味": ["趣味", "游戏", "互动", "好玩", "挑战"],
        }

        scores = {}
        all_content = " ".join(d.content for d in dimensions)

        for mood, keywords in mood_keywords.items():
            score = sum(1 for kw in keywords if kw in all_content)
            if score > 0:
                scores[mood] = score

        if scores:
            top_moods = sorted(scores.items(), key=lambda x: -x[1])[:2]
            return "、".join(m[0] for m in top_moods)
        return "专业、积极"

    def _extract_scene(self, dimensions: List[Dimension]) -> str:
        """从场景维度提取场景描述"""
        for dim in dimensions:
            if dim.category == "D" and dim.definition:
                return dim.definition[:200]
        return ""

    def _suggest_style(self, route_result: RouteResult) -> str:
        """基于任务类型建议音乐风格"""
        style_map = {
            "core_value": "史诗感、激励性、品牌感",
            "design_methodology": "轻快、有节奏、思考型",
            "prototype": "科技感、现代、简洁",
            "planning": "沉稳、有力量、叙事型",
            "programming": "电子、科技、节奏感",
            "art": "优美、有意境、艺术性",
            "marketing": "流行、抓耳、朗朗上口",
            "general": "适中节奏、专业感",
        }
        return style_map.get(route_result.task_type, "适中节奏、专业感")
