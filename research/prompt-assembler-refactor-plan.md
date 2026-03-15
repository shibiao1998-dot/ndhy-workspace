# prompt_assembler.py 重构方案

> 基于 BAML Schema Engineering 思路，用 Pydantic + Jinja2 改造现有字符串拼接

---

## 一、当前代码问题分析

### 源文件
`D:\code\openclaw-home\workspace\projects\prompt-engineering-v2\backend\services\prompt_assembler.py`

### 问题清单

| # | 问题 | 行号 | 严重度 |
|---|------|------|--------|
| 1 | 输入类型是 `list[dict]`，字段缺失只有运行时发现 | L14 | 🔴 高 |
| 2 | prompt 模板硬编码在 Python f-string 中，改措辞 = 改代码 | L89-106 | 🔴 高 |
| 3 | mixed 方向用关键词列表拆分，语义判断脆弱 | L46-56 | 🟡 中 |
| 4 | 正向/约束 section 渲染逻辑不可复用 | L59-78 | 🟡 中 |
| 5 | 输出要求硬编码，不同场景无法定制 | L101-104 | 🟡 中 |
| 6 | 覆盖率统计与 prompt 组装耦合在同一函数 | L108-125 | 🟢 低 |

---

## 二、目标架构

```
backend/services/
├── prompt_assembler.py          # 重构后的组装器（~80行，纯逻辑）
├── prompt_schemas.py            # Pydantic 类型定义
├── prompt_stats.py              # 覆盖率统计（独立模块）
└── templates/
    ├── system_prompt.jinja2     # 主 prompt 模板
    └── partials/
        ├── positive_section.jinja2
        ├── constraint_section.jinja2
        └── output_requirements.jinja2
```

---

## 三、具体重构代码

### 3.1 prompt_schemas.py — 类型定义

```python
"""Type-safe prompt assembly schemas (Schema Engineering approach)."""

from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


class Direction(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"


class DimensionInput(BaseModel):
    """单个维度的输入 schema。
    
    注意：不再有 'mixed' 方向。mixed 内容应在数据入库时
    拆分为 positive + negative 两条记录。
    """
    id: str
    name: str
    description: str = Field(min_length=1)
    direction: Direction
    priority: Literal[1, 2, 3] = 2

    @field_validator("description")
    @classmethod
    def description_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("description must not be blank")
        return v.strip()


class CoverageStats(BaseModel):
    """Prompt 覆盖率统计。"""
    total: int
    used: int
    coverage_rate: float
    must: dict[str, int]      # {"total": N, "filled": M}
    suggest: dict[str, int]
    optional: dict[str, int]
    truncated: int = 0


class AssembledPrompt(BaseModel):
    """组装结果的输出 schema。"""
    system_prompt: str
    positive_section: str
    constraint_section: str
    dimensions_used: list[str]
    coverage_stats: CoverageStats


class PromptContext(BaseModel):
    """传入 Jinja2 模板的完整上下文。"""
    positive_by_priority: dict[int, list[DimensionInput]] = Field(
        default_factory=lambda: {1: [], 2: [], 3: []}
    )
    negative_items: list[DimensionInput] = Field(default_factory=list)
    user_exclusions: Optional[str] = None
    priority_labels: dict[int, str] = Field(
        default_factory=lambda: {1: "必须", 2: "建议", 3: "可选"}
    )
    priority_headers: dict[int, str] = Field(
        default_factory=lambda: {1: "一级信息", 2: "二级信息", 3: "三级信息"}
    )
```

### 3.2 模板文件

#### templates/system_prompt.jinja2
```jinja2
你是华渔教育的 AI 设计师。你的任务是基于以下完整的信息上下文，
为用户产出专业级的设计方案。

## 核心原则
- 信息对称：你已获得最全面的项目信息，请充分利用
- 如果用户描述不够清晰，主动追问 2-4 个关键问题后再产出方案
- 追问应覆盖用户画像、使用场景、技术约束、竞品差异化等维度

## 正向信息（你需要遵循的方向）
{% include "partials/positive_section.jinja2" %}

## 约束与禁忌（你必须避免的事项）
{% include "partials/constraint_section.jinja2" %}

## 输出要求
{% include "partials/output_requirements.jinja2" %}
```

#### templates/partials/positive_section.jinja2
```jinja2
{% for priority in [1, 2, 3] %}
{% set items = positive_by_priority.get(priority, []) %}
{% if items %}
## {{ priority_headers[priority] }}（{{ priority_labels[priority] }}）
{% for item in items %}
### {{ item.id }} {{ item.name }}
{{ item.description }}

{% endfor %}
{% endif %}
{% endfor %}
```

#### templates/partials/constraint_section.jinja2
```jinja2
{% if negative_items %}
### 红线与禁区
{% for item in negative_items %}
**{{ item.id }} {{ item.name }}**
{{ item.description }}

{% endfor %}
{% endif %}
{% if user_exclusions %}
### 排除条件
{{ user_exclusions }}
{% endif %}
```

#### templates/partials/output_requirements.jinja2
```jinja2
1. 结构化 Markdown 格式
2. 包含：设计概述、用户旅程、交互方案、视觉建议、约束与禁忌
3. 方案应可直接用于项目推进
```

### 3.3 prompt_assembler.py — 重构后

```python
"""System prompt assembler with Schema Engineering approach.

Uses Jinja2 templates + Pydantic schemas instead of f-string concatenation.
Inspired by BAML's core insight: prompts are typed functions, not string soup.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .prompt_schemas import (
    AssembledPrompt,
    DimensionInput,
    Direction,
    PromptContext,
)
from .prompt_stats import compute_coverage_stats

# Template directory (relative to this file)
_TEMPLATE_DIR = Path(__file__).parent / "templates"

# Jinja2 environment — initialized once, reused across calls
_jinja_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATE_DIR)),
    autoescape=select_autoescape([]),  # No HTML escaping for prompts
    trim_blocks=True,
    lstrip_blocks=True,
    keep_trailing_newline=False,
)


def assemble_system_prompt(
    dimensions: list[DimensionInput],
    task_description: str,
    user_exclusions: Optional[str] = None,
) -> AssembledPrompt:
    """Assemble the system prompt from typed dimension inputs.

    Args:
        dimensions: List of validated dimension inputs (no more 'mixed' direction).
        task_description: The user's task description.
        user_exclusions: Optional exclusion criteria from the user.

    Returns:
        AssembledPrompt with system_prompt, sections, and coverage stats.
    """
    # 1. Classify dimensions by direction and priority
    ctx = _build_context(dimensions, user_exclusions)

    # 2. Render templates
    system_prompt = _render_template("system_prompt.jinja2", ctx)
    positive_section = _render_template(
        "partials/positive_section.jinja2", ctx
    )
    constraint_section = _render_template(
        "partials/constraint_section.jinja2", ctx
    )

    # 3. Compute coverage stats (separated concern)
    coverage_stats = compute_coverage_stats(dimensions)

    return AssembledPrompt(
        system_prompt=system_prompt.strip(),
        positive_section=positive_section.strip(),
        constraint_section=constraint_section.strip(),
        dimensions_used=[d.id for d in dimensions],
        coverage_stats=coverage_stats,
    )


def _build_context(
    dimensions: list[DimensionInput],
    user_exclusions: Optional[str],
) -> dict:
    """Build the Jinja2 template context from typed inputs."""
    prompt_ctx = PromptContext(user_exclusions=user_exclusions)

    for dim in dimensions:
        if dim.direction == Direction.POSITIVE:
            prompt_ctx.positive_by_priority[dim.priority].append(dim)
        elif dim.direction == Direction.NEGATIVE:
            prompt_ctx.negative_items.append(dim)

    return prompt_ctx.model_dump()


def _render_template(template_name: str, context: dict) -> str:
    """Render a Jinja2 template with the given context."""
    template = _jinja_env.get_template(template_name)
    return template.render(**context)


# --- Backward Compatibility Layer ---
# Remove after all callers migrate to DimensionInput

def assemble_system_prompt_compat(
    dimensions: list[dict],
    task_description: str,
    user_exclusions: Optional[str] = None,
) -> dict:
    """Backward-compatible wrapper that accepts list[dict].
    
    Converts legacy dict format to DimensionInput, handling 'mixed' direction
    by splitting into positive + negative entries.
    
    DEPRECATED: Migrate callers to use assemble_system_prompt() with
    DimensionInput directly.
    """
    typed_dims = _convert_legacy_dimensions(dimensions)
    result = assemble_system_prompt(typed_dims, task_description, user_exclusions)
    return result.model_dump()


def _convert_legacy_dimensions(raw_dims: list[dict]) -> list[DimensionInput]:
    """Convert legacy dict dimensions to typed DimensionInput.
    
    Handles 'mixed' direction by splitting into two entries.
    """
    NEGATIVE_KEYWORDS = {"❌", "不要", "禁止", "红线", "不能做", "不做"}
    result: list[DimensionInput] = []

    for dim in raw_dims:
        desc = (dim.get("description") or "").strip()
        if not desc:
            continue

        direction = dim.get("direction", "positive")
        base = {"id": dim.get("id", ""), "name": dim.get("name", "")}

        if direction == "mixed":
            pos_lines, neg_lines = [], []
            for line in desc.split("\n"):
                stripped = line.strip()
                if any(kw in stripped for kw in NEGATIVE_KEYWORDS):
                    neg_lines.append(line)
                else:
                    pos_lines.append(line)
            if pos_lines:
                result.append(DimensionInput(
                    **base,
                    description="\n".join(pos_lines),
                    direction=Direction.POSITIVE,
                    priority=dim.get("priority", 2),
                ))
            if neg_lines:
                result.append(DimensionInput(
                    **base,
                    description="\n".join(neg_lines),
                    direction=Direction.NEGATIVE,
                    priority=dim.get("priority", 2),
                ))
        else:
            result.append(DimensionInput(
                **base,
                description=desc,
                direction=Direction(direction),
                priority=dim.get("priority", 2),
            ))

    return result
```

### 3.4 prompt_stats.py — 覆盖率统计（独立模块）

```python
"""Coverage statistics computation, separated from prompt assembly."""

from __future__ import annotations

from .prompt_schemas import CoverageStats, DimensionInput


def compute_coverage_stats(dimensions: list[DimensionInput]) -> CoverageStats:
    """Compute coverage statistics for the given dimensions."""
    total = len(dimensions)
    used = [d for d in dimensions if d.description.strip()]

    def _count(priority: int) -> dict[str, int]:
        all_p = [d for d in dimensions if d.priority == priority]
        filled_p = [d for d in all_p if d.description.strip()]
        return {"total": len(all_p), "filled": len(filled_p)}

    return CoverageStats(
        total=total,
        used=len(used),
        coverage_rate=round(len(used) / total * 100, 1) if total else 0,
        must=_count(1),
        suggest=_count(2),
        optional=_count(3),
    )
```

---

## 四、迁移策略

### Phase 1：增量迁移（无破坏性变更）
1. 新增 `prompt_schemas.py`、`prompt_stats.py`、`templates/` 目录
2. 新增 `assemble_system_prompt()` 新版函数（接受 `DimensionInput`）
3. 保留 `assemble_system_prompt_compat()` 兼容旧调用
4. 旧调用方暂时不改，通过 compat 层过渡

### Phase 2：调用方迁移
1. 逐个修改调用方，使用 `DimensionInput` 替代 `dict`
2. 数据入库层消灭 `mixed` direction，改为入库时拆分
3. 测试覆盖所有调用路径

### Phase 3：清理
1. 删除 `assemble_system_prompt_compat()`
2. 删除 `_convert_legacy_dimensions()`
3. 确认所有 mixed 数据已迁移

### 依赖
```
pip install jinja2 pydantic
```

---

## 五、验证方案

### 单元测试示例

```python
"""Tests for the refactored prompt assembler."""

import pytest
from services.prompt_schemas import DimensionInput, Direction
from services.prompt_assembler import assemble_system_prompt


def test_basic_assembly():
    """正向维度应正确渲染到 positive section。"""
    dims = [
        DimensionInput(
            id="D001",
            name="目标用户",
            description="K12 教师群体",
            direction=Direction.POSITIVE,
            priority=1,
        ),
        DimensionInput(
            id="D002",
            name="禁止抄袭",
            description="不得复制竞品界面",
            direction=Direction.NEGATIVE,
            priority=1,
        ),
    ]
    result = assemble_system_prompt(dims, task_description="设计教师端界面")
    
    assert "D001 目标用户" in result.positive_section
    assert "K12 教师群体" in result.positive_section
    assert "D002 禁止抄袭" in result.constraint_section
    assert result.coverage_stats.total == 2
    assert result.coverage_stats.used == 2


def test_empty_description_rejected():
    """空描述应被 Pydantic 拒绝。"""
    with pytest.raises(ValueError):
        DimensionInput(
            id="D003",
            name="无效维度",
            description="   ",
            direction=Direction.POSITIVE,
            priority=2,
        )


def test_invalid_priority_rejected():
    """非法优先级应被 Pydantic 拒绝。"""
    with pytest.raises(ValueError):
        DimensionInput(
            id="D004",
            name="错误优先级",
            description="测试内容",
            direction=Direction.POSITIVE,
            priority=5,
        )


def test_priority_grouping():
    """不同优先级应分组渲染。"""
    dims = [
        DimensionInput(id="P1", name="必须项", description="内容1",
                       direction=Direction.POSITIVE, priority=1),
        DimensionInput(id="P2", name="建议项", description="内容2",
                       direction=Direction.POSITIVE, priority=2),
        DimensionInput(id="P3", name="可选项", description="内容3",
                       direction=Direction.POSITIVE, priority=3),
    ]
    result = assemble_system_prompt(dims, task_description="测试")
    
    # 确认优先级标签出现
    assert "一级信息" in result.positive_section
    assert "二级信息" in result.positive_section
    assert "三级信息" in result.positive_section


def test_backward_compat():
    """兼容层应正确处理旧格式 dict 输入。"""
    from services.prompt_assembler import assemble_system_prompt_compat
    
    raw_dims = [
        {"id": "D001", "name": "测试", "description": "内容",
         "direction": "positive", "priority": 1},
        {"id": "D002", "name": "混合", "description": "好的方向\n❌ 不要这样",
         "direction": "mixed", "priority": 2},
    ]
    result = assemble_system_prompt_compat(raw_dims, "测试任务")
    
    assert isinstance(result, dict)
    assert "system_prompt" in result
    assert "positive_section" in result
    assert "constraint_section" in result
```

---

## 六、改造收益总结

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| 类型安全 | dict，运行时爆炸 | Pydantic，编辑器提示 + 验证前置 |
| 改 prompt | 改 Python 代码 + 部署 | 改 .jinja2 模板文件 |
| 可测试性 | mock 整个函数 | 模板可独立渲染测试 |
| 可复用性 | 零 | template partials 跨场景复用 |
| mixed 处理 | 运行时关键词匹配 | 数据入库时分离（消灭问题源头） |
| 关注点分离 | 一个函数 130 行做所有事 | schema / render / stats 三个模块各司其职 |
| 代码行数 | ~130 行 | ~80 行核心 + ~60 行 schema + ~20 行 stats |
