"""
router.py — 维度路由器

职责：
1. 接收任务描述，自动匹配任务类型
2. 根据任务类型从路由规则中选出相关维度
3. 支持手动指定任务类型（覆盖自动匹配）

路由逻辑：
1. 关键词匹配 → 确定任务类型
2. 查路由表 → 获取 required/recommended/optional 维度选择器
3. 展开选择器 → 从维度索引中获取实际维度
4. 返回分级的维度列表
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from config import TASK_ROUTES, TASK_KEYWORDS
from dimension_loader import Dimension, DimensionIndex


@dataclass
class RouteResult:
    """路由结果"""
    task_type: str                          # 匹配的任务类型 key
    task_name: str                          # 任务类型名称
    task_description: str                   # 原始任务描述
    required: List[Dimension] = field(default_factory=list)      # 必须加载
    recommended: List[Dimension] = field(default_factory=list)   # 建议加载
    optional: List[Dimension] = field(default_factory=list)      # 可选加载
    missing_required: List[str] = field(default_factory=list)    # 必须但缺失的维度
    match_confidence: float = 0.0           # 匹配置信度 (0-1)

    @property
    def all_dimensions(self) -> List[Dimension]:
        """所有维度（按优先级排序）"""
        return self.required + self.recommended + self.optional

    @property
    def total_chars(self) -> int:
        """所有维度的总字符数"""
        return sum(d.char_count for d in self.all_dimensions)

    def summary(self) -> str:
        lines = [
            f"任务类型: {self.task_name} ({self.task_type})",
            f"匹配置信度: {self.match_confidence:.0%}",
            f"必须维度: {len(self.required)} 个",
            f"建议维度: {len(self.recommended)} 个",
            f"可选维度: {len(self.optional)} 个",
            f"总字符数: {self.total_chars:,}",
        ]
        if self.missing_required:
            lines.append(f"⚠️ 缺失必须维度: {', '.join(self.missing_required)}")
        return "\n".join(lines)


class DimensionRouter:
    """维度路由器：根据任务描述选择相关维度"""

    def __init__(self, index: DimensionIndex):
        self.index = index

    def route(self, task_description: str, task_type: Optional[str] = None) -> RouteResult:
        """
        执行路由：任务描述 → 维度选择

        Args:
            task_description: 任务描述文本
            task_type: 手动指定任务类型（可选，覆盖自动匹配）

        Returns:
            RouteResult 包含分级的维度列表
        """
        # 1. 确定任务类型
        if task_type and task_type in TASK_ROUTES:
            matched_type = task_type
            confidence = 1.0
        else:
            matched_type, confidence = self._match_task_type(task_description)

        # 2. 获取路由规则
        route_config = TASK_ROUTES[matched_type]

        # 3. 展开维度选择器并获取实际维度
        required, req_missing = self._resolve_selectors(
            route_config["required"], "required"
        )
        recommended, _ = self._resolve_selectors(
            route_config["recommended"], "recommended"
        )
        optional, _ = self._resolve_selectors(
            route_config["optional"], "optional"
        )

        # 4. 去重（如果某维度已在 required 中，不再出现在 recommended/optional）
        req_ids = {d.id for d in required}
        recommended = [d for d in recommended if d.id not in req_ids]
        rec_ids = req_ids | {d.id for d in recommended}
        optional = [d for d in optional if d.id not in rec_ids]

        return RouteResult(
            task_type=matched_type,
            task_name=route_config["name"],
            task_description=task_description,
            required=required,
            recommended=recommended,
            optional=optional,
            missing_required=req_missing,
            match_confidence=confidence,
        )

    def _match_task_type(self, description: str) -> Tuple[str, float]:
        """
        通过关键词匹配确定任务类型

        Returns:
            (task_type_key, confidence)
        """
        desc_lower = description.lower()
        scores: Dict[str, int] = {}

        for task_type, keywords in TASK_KEYWORDS.items():
            score = 0
            for kw in keywords:
                if kw.lower() in desc_lower:
                    score += 1
            if score > 0:
                scores[task_type] = score

        if not scores:
            # 没匹配到任何关键词，使用通用路由
            return "general", 0.3

        # 选得分最高的
        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]
        max_possible = len(TASK_KEYWORDS.get(best_type, []))

        confidence = min(best_score / max(max_possible, 1), 1.0)
        # 至少给 0.5 的置信度（有关键词命中）
        confidence = max(confidence, 0.5)

        return best_type, confidence

    def _resolve_selectors(
        self, selectors: List[str], level: str
    ) -> Tuple[List[Dimension], List[str]]:
        """
        展开维度选择器为实际维度列表

        选择器格式：
        - "A"   → 整个 A 类所有维度
        - "A01" → 单个维度 A01
        - "I03" → 单个维度 I03

        Returns:
            (dimensions_list, missing_list)
        """
        dimensions = []
        missing = []
        seen_ids = set()

        for selector in selectors:
            selector = selector.upper()

            if len(selector) == 1 and selector.isalpha():
                # 类别选择器：获取整个类别
                cat_dims = self.index.get_by_category(selector)
                if not cat_dims and level == "required":
                    missing.append(f"{selector}类（未找到）")
                for d in cat_dims:
                    if d.id not in seen_ids:
                        dimensions.append(d)
                        seen_ids.add(d.id)
            else:
                # 单维度选择器
                dim = self.index.get(selector)
                if dim:
                    if dim.id not in seen_ids:
                        dimensions.append(dim)
                        seen_ids.add(dim.id)
                elif level == "required":
                    missing.append(f"{selector}（未找到）")

        return dimensions, missing

    def list_task_types(self) -> List[Dict[str, str]]:
        """列出所有可用的任务类型"""
        result = []
        for key, config in TASK_ROUTES.items():
            result.append({
                "key": key,
                "name": config["name"],
                "description": config["description"],
            })
        return result


# ============================================================
# 测试入口
# ============================================================
if __name__ == "__main__":
    import os
    import sys
    import io
    if sys.platform == "win32":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    from dimension_loader import load_dimensions

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index = load_dimensions(project_root)

    router = DimensionRouter(index)

    # 测试自动路由
    test_tasks = [
        "设计一个化学实验交互方案",
        "编写产品核心价值定义",
        "做一个竞品分析文档",
        "设计学生端原型",
        "策划一个新的教学功能",
    ]

    for task in test_tasks:
        print(f"\n{'='*50}")
        print(f"任务: {task}")
        print("=" * 50)
        result = router.route(task)
        print(result.summary())
        print(f"必须维度: {[d.id for d in result.required]}")
        print(f"建议维度: {[d.id for d in result.recommended]}")
