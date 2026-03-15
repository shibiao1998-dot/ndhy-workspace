"""
assembler.py — 提示词组装引擎

职责：
1. 接收路由结果（分级维度列表）
2. 按优先级排序维度内容
3. 组装正向信息 + 反向约束
4. 支持长度控制（适配不同 AI 引擎的上下文窗口）
5. 调用引擎适配器输出最终格式

设计决策：
- 组装顺序：系统指令头 → 一级信息（required）→ 二级信息（recommended）→ 三级信息（optional）
- 长度控制：先满足 required，再用剩余空间填 recommended/optional
- 反向约束：从维度内容中提取"❌"/"不要"/"禁止"类信息，单独组装为约束段
"""

import re
from typing import List, Optional, Tuple

from config import ENGINE_CONFIGS, DEFAULT_ENGINE, PRIORITY_LEVELS
from dimension_loader import Dimension
from router import RouteResult


class PromptAssembler:
    """提示词组装引擎"""

    # 反向约束的识别模式
    NEGATIVE_PATTERNS = [
        re.compile(r'❌\s*(.+?)(?:\n|$)', re.MULTILINE),
        re.compile(r'[不禁][要能做可以]+[：:]\s*(.+?)(?:\n|$)', re.MULTILINE),
        re.compile(r'红线\s*\d*[：:]\s*(.+?)(?:\n|$)', re.MULTILINE),
    ]

    def __init__(self, engine: str = DEFAULT_ENGINE):
        """
        Args:
            engine: 引擎名称（claude/gpt/midjourney/suno 等）
        """
        if engine not in ENGINE_CONFIGS:
            raise ValueError(
                f"未知引擎: {engine}. "
                f"可选: {', '.join(ENGINE_CONFIGS.keys())}"
            )
        self.engine = engine
        self.engine_config = ENGINE_CONFIGS[engine]
        self.max_chars = self.engine_config["max_tokens"]  # 简化：1 token ≈ 1 字符

    def assemble(self, route_result: RouteResult) -> str:
        """
        组装提示词

        Args:
            route_result: 路由结果

        Returns:
            组装好的提示词文本
        """
        # 根据引擎类型选择适配器
        adapter = self._get_adapter()
        return adapter.format(route_result, self.max_chars)

    def _get_adapter(self):
        """获取引擎适配器"""
        engine_type = self.engine_config["type"]

        if engine_type == "general_ai":
            from adapters.claude import GeneralAIAdapter
            return GeneralAIAdapter(self.engine_config)
        elif engine_type == "design_ai":
            from adapters.midjourney import DesignAIAdapter
            return DesignAIAdapter(self.engine_config)
        elif engine_type == "audio_ai":
            from adapters.suno import AudioAIAdapter
            return AudioAIAdapter(self.engine_config)
        else:
            # 回退到通用适配器
            from adapters.claude import GeneralAIAdapter
            return GeneralAIAdapter(self.engine_config)

    @staticmethod
    def extract_constraints(dimensions: List[Dimension]) -> List[str]:
        """
        从维度内容中提取反向约束

        Returns:
            约束条目列表
        """
        constraints = []
        seen = set()

        for dim in dimensions:
            for pattern in PromptAssembler.NEGATIVE_PATTERNS:
                for match in pattern.finditer(dim.content):
                    text = match.group(1).strip()
                    if text and text not in seen and len(text) > 5:
                        constraints.append(text)
                        seen.add(text)

        return constraints

    @staticmethod
    def truncate_content(content: str, max_chars: int) -> str:
        """
        智能截断内容：优先保留前面的段落（通常更重要）

        Args:
            content: 原始内容
            max_chars: 最大字符数

        Returns:
            截断后的内容
        """
        if len(content) <= max_chars:
            return content

        # 按段落截断，尽量不截断到段落中间
        paragraphs = content.split('\n\n')
        result = []
        current_len = 0

        for para in paragraphs:
            if current_len + len(para) + 2 > max_chars:
                # 放不下整段了
                remaining = max_chars - current_len - 20
                if remaining > 50 and not result:
                    # 第一段太长，强制截断
                    result.append(para[:remaining] + "...")
                break
            result.append(para)
            current_len += len(para) + 2

        if not result:
            return content[:max_chars - 3] + "..."

        return '\n\n'.join(result)

    @staticmethod
    def budget_allocation(
        required: List[Dimension],
        recommended: List[Dimension],
        optional: List[Dimension],
        total_budget: int,
        header_reserve: int = 2000,
    ) -> Tuple[List[Dimension], List[Dimension], List[Dimension]]:
        """
        按预算分配维度内容

        策略：required 全部包含（必要时截断）→ recommended 按优先级填充 → optional 剩余空间

        Args:
            required: 必须维度
            recommended: 建议维度
            optional: 可选维度
            total_budget: 总字符预算
            header_reserve: 预留给头部/尾部的字符数

        Returns:
            (实际 required, 实际 recommended, 实际 optional)
        """
        budget = total_budget - header_reserve
        used = 0

        # 阶段1：required 全部包含
        actual_required = []
        for dim in required:
            if used + dim.char_count <= budget:
                actual_required.append(dim)
                used += dim.char_count
            else:
                # 预算不足，截断内容但仍然包含
                actual_required.append(dim)
                used += dim.char_count  # 实际会在格式化时截断
                break

        # 阶段2：recommended 按优先级填充
        actual_recommended = []
        remaining = budget - sum(d.char_count for d in actual_required)
        for dim in sorted(recommended, key=lambda d: d.priority):
            if remaining <= 0:
                break
            if dim.char_count <= remaining:
                actual_recommended.append(dim)
                remaining -= dim.char_count

        # 阶段3：optional 剩余空间
        actual_optional = []
        for dim in sorted(optional, key=lambda d: d.priority):
            if remaining <= 0:
                break
            if dim.char_count <= remaining:
                actual_optional.append(dim)
                remaining -= dim.char_count

        return actual_required, actual_recommended, actual_optional


# ============================================================
# 测试入口
# ============================================================
if __name__ == "__main__":
    import os
    from dimension_loader import load_dimensions
    from router import DimensionRouter

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index = load_dimensions(project_root)
    router = DimensionRouter(index)

    # 测试组装
    task = "设计一个化学实验交互方案"
    route_result = router.route(task)

    for engine_name in ["claude", "midjourney", "suno"]:
        print(f"\n{'='*60}")
        print(f"引擎: {engine_name}")
        print(f"{'='*60}")
        assembler = PromptAssembler(engine=engine_name)
        prompt = assembler.assemble(route_result)
        print(prompt[:2000])
        print(f"\n... (总长度: {len(prompt)} 字符)")
