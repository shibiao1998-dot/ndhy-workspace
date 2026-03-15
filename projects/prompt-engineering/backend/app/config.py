"""System configuration — task types, engine list, ai_platform mapping.

Data sourced from database-design.md §3.4 / §3.5 and api-design.md §3.3.
"""

from __future__ import annotations

import os
from pathlib import Path

from app.models.task_type import TaskTypeConfig
from app.models.engine import EngineConfig

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

# Default: dimensions/ directory next to the backend/ folder (sibling).
# Can be overridden via DIMENSIONS_DIR env var.
_DEFAULT_DIMENSIONS_DIR = str(
    Path(__file__).resolve().parent.parent.parent / "dimensions"
)
DIMENSIONS_DIR: str = os.getenv("DIMENSIONS_DIR", _DEFAULT_DIMENSIONS_DIR)

# ---------------------------------------------------------------------------
# Task Types (aligned with database-design.md §3.4 — complete data)
# ---------------------------------------------------------------------------

TASK_TYPES: dict[str, TaskTypeConfig] = {
    "core_value": TaskTypeConfig(
        key="core_value",
        name="核心价值编写",
        description="围绕产品核心价值进行定义、阐述和验证",
        keywords=["核心价值", "价值定义", "价值主张"],
        required=["A", "K", "I01"],
        recommended=["B", "C", "G"],
        optional=["D", "E", "F"],
    ),
    "design_methodology": TaskTypeConfig(
        key="design_methodology",
        name="设计方法论编写",
        description="编写或梳理设计方法论、竞品分析等方法类文档",
        keywords=["设计方法", "方法论", "竞品分析"],
        required=["A", "B", "C", "D", "E", "K", "I03"],
        recommended=["F", "G", "J"],
        optional=["H", "L"],
    ),
    "prototype": TaskTypeConfig(
        key="prototype",
        name="原型设计",
        description="交互原型、界面设计、UI 方案",
        keywords=["原型", "交互", "界面", "UI"],
        required=["E11", "H", "I04"],
        recommended=["G", "D07"],
        optional=["A", "B", "K"],
    ),
    "product_planning": TaskTypeConfig(
        key="product_planning",
        name="产品策划",
        description="产品规划、需求定义、功能策划",
        keywords=["策划", "规划", "需求"],
        required=["A", "B", "C", "D", "K"],
        recommended=["E", "F", "G", "I01", "I02"],
        optional=["J", "L"],
    ),
    "ai_programming": TaskTypeConfig(
        key="ai_programming",
        name="AI 编程",
        description="AI 辅助编程、代码生成、开发任务",
        keywords=["编程", "开发", "代码"],
        required=["A", "D", "F", "K"],
        recommended=["H", "J"],
        optional=["B", "C"],
    ),
    "ai_art": TaskTypeConfig(
        key="ai_art",
        name="AI 美术",
        description="AI 辅助视觉设计、3D 建模、美术创作",
        keywords=["美术", "视觉", "3D"],
        required=["A", "H", "K"],
        recommended=["B", "C", "E11"],
        optional=["G"],
    ),
    "ai_marketing": TaskTypeConfig(
        key="ai_marketing",
        name="AI Marketing",
        description="AI 辅助营销内容创作、市场推广",
        keywords=["营销", "推广", "市场"],
        required=["A", "B", "C", "K"],
        recommended=["D", "G"],
        optional=["E", "F"],
    ),
    "general": TaskTypeConfig(
        key="general",
        name="通用设计任务",
        description="未匹配到特定类型时的回退路由",
        keywords=[],
        required=["A", "B", "D", "K"],
        recommended=["C", "E", "F", "G"],
        optional=["H", "I", "J", "L"],
    ),
}

# ---------------------------------------------------------------------------
# Engines (aligned with database-design.md §3.5 — complete data)
# ---------------------------------------------------------------------------

ENGINES: dict[str, EngineConfig] = {
    "claude": EngineConfig(
        key="claude",
        name="Claude",
        type="text",
        max_chars=180000,
        adapter_type="markdown",
        description="适合长文本结构化方案，支持 180K 字符",
    ),
    "gpt4": EngineConfig(
        key="gpt4",
        name="GPT-4",
        type="text",
        max_chars=120000,
        adapter_type="markdown",
        description="适合结构化方案，支持 120K 字符",
    ),
    "deepseek": EngineConfig(
        key="deepseek",
        name="DeepSeek",
        type="text",
        max_chars=60000,
        adapter_type="markdown",
        description="适合精简方案，支持 60K 字符",
    ),
    "midjourney": EngineConfig(
        key="midjourney",
        name="Midjourney",
        type="visual",
        max_chars=4000,
        adapter_type="keyword",
        description="视觉生成，关键词模式，4K 字符",
    ),
    "dall_e": EngineConfig(
        key="dall_e",
        name="DALL-E",
        type="visual",
        max_chars=4000,
        adapter_type="keyword",
        description="视觉生成，关键词模式，4K 字符",
    ),
    "suno": EngineConfig(
        key="suno",
        name="Suno",
        type="audio",
        max_chars=2000,
        adapter_type="description",
        description="音乐生成，情感氛围描述，2K 字符",
    ),
}

# ---------------------------------------------------------------------------
# ai_platform mapping (required by api-design.md §3.3 — engines[].ai_platform)
# ---------------------------------------------------------------------------

ENGINE_AI_PLATFORM: dict[str, str] = {
    "claude": "Anthropic Claude 3.5 Sonnet",
    "gpt4": "OpenAI GPT-4o",
    "deepseek": "DeepSeek V3",
    "midjourney": "Midjourney v6",
    "dall_e": "OpenAI DALL-E 3",
    "suno": "Suno v4",
}

# ---------------------------------------------------------------------------
# format_type mapping: internal adapter_type → API format_type value
# api-design.md uses "keywords" (plural) for visual engines.
# ---------------------------------------------------------------------------

ADAPTER_TO_FORMAT_TYPE: dict[str, str] = {
    "markdown": "markdown",
    "keyword": "keywords",      # API spec uses plural "keywords"
    "description": "description",
}
