"""
adapters/claude.py — 通用 AI 引擎适配器（Claude / GPT / DeepSeek）

输出格式：结构化 Markdown
特点：
- 完整的上下文信息
- 分层结构清晰
- 支持长文本
- 包含反向约束和质量检查要求
"""

from typing import Dict, List

from dimension_loader import Dimension
from router import RouteResult


class GeneralAIAdapter:
    """通用 AI 引擎适配器：结构化 Markdown 格式"""

    def __init__(self, engine_config: Dict):
        self.config = engine_config
        self.max_chars = engine_config.get("max_tokens", 120000)

    def format(self, route_result: RouteResult, max_chars: int = 0) -> str:
        """
        将路由结果格式化为结构化 Markdown 提示词

        Args:
            route_result: 路由结果
            max_chars: 最大字符数（0 = 使用引擎默认值）

        Returns:
            格式化的提示词文本
        """
        budget = max_chars or self.max_chars
        sections = []

        # ======== 系统指令头 ========
        sections.append(self._build_header(route_result))

        # ======== 必须维度（一级信息）========
        if route_result.required:
            sections.append(self._build_dimension_section(
                "一级信息（核心维度 — 必须遵循）",
                route_result.required,
                budget,
            ))

        # ======== 建议维度（二级信息）========
        if route_result.recommended:
            sections.append(self._build_dimension_section(
                "二级信息（重要参考 — 建议参考）",
                route_result.recommended,
                budget,
            ))

        # ======== 可选维度（三级信息）========
        if route_result.optional:
            sections.append(self._build_dimension_section(
                "三级信息（补充参考 — 空间允许时参考）",
                route_result.optional,
                budget,
            ))

        # ======== 反向约束 ========
        from assembler import PromptAssembler
        constraints = PromptAssembler.extract_constraints(route_result.all_dimensions)
        if constraints:
            sections.append(self._build_constraints(constraints))

        # ======== 缺失警告 ========
        if route_result.missing_required:
            sections.append(self._build_missing_warning(route_result.missing_required))

        # ======== 输出要求 ========
        sections.append(self._build_output_requirements(route_result))

        # 组装并控制长度
        full_prompt = "\n\n".join(sections)

        if len(full_prompt) > budget:
            full_prompt = PromptAssembler.truncate_content(full_prompt, budget)

        return full_prompt

    def _build_header(self, route_result: RouteResult) -> str:
        """构建系统指令头"""
        return f"""# 任务指令

## 任务描述
{route_result.task_description}

## 任务类型
{route_result.task_name}

## 信息说明
以下是为完成此任务提供的多维度参考信息，按重要性分三级：
- **一级信息**：核心维度，必须遵循和体现
- **二级信息**：重要参考，建议在方案中考虑
- **三级信息**：补充参考，视具体情况参考

请基于以下维度信息，结合你的专业能力，完成上述任务。"""

    def _build_dimension_section(
        self, title: str, dimensions: List[Dimension], budget: int
    ) -> str:
        """构建维度内容段"""
        lines = [f"---\n\n# {title}\n"]

        for dim in dimensions:
            status = "✅" if dim.is_complete else "⚠️ 信息可能不完整"
            lines.append(f"## [{dim.id}] {dim.name} {status}\n")

            if dim.definition:
                lines.append(f"> {dim.definition}\n")

            # 维度内容（去掉重复的标题行）
            content = dim.content.strip()
            lines.append(content)
            lines.append("")  # 空行分隔

        return "\n".join(lines)

    def _build_constraints(self, constraints: List[str]) -> str:
        """构建反向约束段"""
        lines = ["---\n\n# ⛔ 反向约束（以下内容必须避免）\n"]
        for i, c in enumerate(constraints, 1):
            lines.append(f"{i}. {c}")
        return "\n".join(lines)

    def _build_missing_warning(self, missing: List[str]) -> str:
        """构建缺失维度警告"""
        lines = ["---\n\n# ⚠️ 信息缺失警告\n"]
        lines.append("以下维度信息尚未提供，可能影响产出质量：\n")
        for m in missing:
            lines.append(f"- {m}")
        lines.append("\n请在回答中标注哪些部分可能因信息不足而需要进一步确认。")
        return "\n".join(lines)

    def _build_output_requirements(self, route_result: RouteResult) -> str:
        """构建输出要求"""
        return """---

# 📋 输出要求

1. **结构化输出**：使用清晰的标题、列表、表格组织内容
2. **证据支撑**：关键判断需引用维度信息中的证据
3. **标注不确定性**：信息不足的部分明确标注"待确认"
4. **质量自检**：完成后对照相关评分卡进行自检
5. **战略对齐**：确保方案与 A 类战略维度一致"""
