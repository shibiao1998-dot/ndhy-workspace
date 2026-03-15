"""
adapters/midjourney.py — 设计 AI 引擎适配器（Midjourney / DALL-E）

输出格式：精简关键词式
特点：
- 极度精简，不要长文本
- 关键词 + 修饰词组合
- 风格标签
- 负面提示词 (negative prompt)
"""

import re
from typing import Dict, List

from dimension_loader import Dimension
from router import RouteResult


class DesignAIAdapter:
    """设计 AI 引擎适配器：精简关键词格式"""

    def __init__(self, engine_config: Dict):
        self.config = engine_config
        self.max_chars = engine_config.get("max_tokens", 4000)

    def format(self, route_result: RouteResult, max_chars: int = 0) -> str:
        """
        将路由结果格式化为设计 AI 提示词（关键词式）

        策略：
        1. 从任务描述提取核心主题
        2. 从维度中提取视觉相关关键词
        3. 从 H 类（设计规范）提取风格参数
        4. 从反向约束生成 negative prompt
        """
        budget = max_chars or self.max_chars
        parts = []

        # ======== 主题描述 ========
        parts.append(f"# Prompt\n\n{route_result.task_description}")

        # ======== 从维度提取设计关键词 ========
        keywords = self._extract_design_keywords(route_result.all_dimensions)
        if keywords:
            parts.append("## 设计关键词\n\n" + ", ".join(keywords))

        # ======== 风格与规范 ========
        style_notes = self._extract_style_notes(route_result.all_dimensions)
        if style_notes:
            parts.append("## 风格要求\n\n" + "\n".join(f"- {s}" for s in style_notes))

        # ======== 上下文信息（精简版）========
        context = self._extract_context(route_result.required)
        if context:
            parts.append("## 背景上下文\n\n" + context)

        # ======== Negative Prompt ========
        from assembler import PromptAssembler
        constraints = PromptAssembler.extract_constraints(route_result.all_dimensions)
        if constraints:
            # 精简约束为关键词
            neg_keywords = self._constraints_to_keywords(constraints)
            if neg_keywords:
                parts.append("## Negative Prompt\n\n" + ", ".join(neg_keywords))

        result = "\n\n".join(parts)

        # 控制长度
        if len(result) > budget:
            result = result[:budget - 3] + "..."

        return result

    def _extract_design_keywords(self, dimensions: List[Dimension]) -> List[str]:
        """从维度中提取设计相关关键词"""
        keywords = []
        seen = set()

        # 提取与视觉/设计相关的词汇
        design_terms = [
            "3D", "VR", "AR", "交互", "动画", "沉浸式",
            "教育", "学习", "实验", "化学", "可视化",
            "简洁", "直观", "友好", "响应式",
        ]

        for dim in dimensions:
            for term in design_terms:
                if term in dim.content and term not in seen:
                    keywords.append(term)
                    seen.add(term)

        return keywords[:20]  # 限制数量

    def _extract_style_notes(self, dimensions: List[Dimension]) -> List[str]:
        """从 H 类维度提取风格要求"""
        notes = []
        for dim in dimensions:
            if dim.category == "H":
                # 提取风格相关的关键句
                lines = dim.content.split('\n')
                for line in lines:
                    line = line.strip()
                    if any(kw in line for kw in ["风格", "规范", "标准", "色彩", "字体"]):
                        clean = line.lstrip('-*# ').strip()
                        if len(clean) > 5 and len(clean) < 100:
                            notes.append(clean)
        return notes[:10]

    def _extract_context(self, dimensions: List[Dimension]) -> str:
        """提取精简的上下文信息"""
        context_parts = []
        for dim in dimensions:
            if dim.category == "A" and dim.definition:
                context_parts.append(dim.definition)
        return "; ".join(context_parts[:3])

    def _constraints_to_keywords(self, constraints: List[str]) -> List[str]:
        """将约束转为关键词形式"""
        keywords = []
        for c in constraints[:10]:
            # 取前 20 字作为关键词
            kw = c[:20].strip()
            if kw:
                keywords.append(kw)
        return keywords
