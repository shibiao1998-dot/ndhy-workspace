"""
config.py — 路由规则配置

定义维度类别、任务类型与维度的路由映射、优先级规则、引擎适配参数。
所有路由规则参考飞书文档 1.3 节"按需加载"原则。
"""

# ============================================================
# 维度类别定义
# ============================================================
DIMENSION_CATEGORIES = {
    "A": "战略与价值观",
    "B": "用户真实性",
    "C": "竞品与差异化",
    "D": "场景与需求",
    "E": "设计方法与技巧",
    "F": "可行性与资源",
    "G": "历史经验与案例",
    "H": "设计标准与规范",
    "I": "质量判断与检查",
    "J": "特殊领域专有知识",
    "K": "专有名词与定义",
    "L": "项目全生命周期",
    "M": "核心价值专项",  # 飞书文档中提到但可能尚未填充
}

# ============================================================
# 任务类型路由规则
# ============================================================
# 每种任务类型定义三个级别的维度需求：
#   required  — 必须加载，缺失时警告
#   recommended — 强烈建议加载
#   optional  — 可选，按 token 预算决定是否加载
#
# 维度选择器格式：
#   "A"     — 整个 A 类
#   "A01"   — 单个维度
#   "E11"   — 单个维度
#
# DJ 会议明确的路由规则：
#   核心价值编写：必需 A 类全部 + K 类 + M 类 + I01
#   设计方法论编写：必需 A-E 类 + K 类 + I03
#   原型设计：必需 E11 + H 类 + I04

TASK_ROUTES = {
    # ---- 核心任务类型（飞书文档明确定义）----
    "core_value": {
        "name": "核心价值编写",
        "description": "编写产品/功能的核心价值定义",
        "required": ["A", "K", "M", "I01"],
        "recommended": ["B", "C", "G"],
        "optional": ["D", "E", "F"],
    },
    "design_methodology": {
        "name": "设计方法论编写",
        "description": "编写设计方法论文档、设计方案",
        "required": ["A", "B", "C", "D", "E", "K", "I03"],
        "recommended": ["F", "G", "J"],
        "optional": ["H", "L"],
    },
    "prototype": {
        "name": "原型设计",
        "description": "原型设计、交互方案、界面设计",
        "required": ["E11", "H", "I04"],
        "recommended": ["G", "D07"],
        "optional": ["A", "B", "K"],
    },

    # ---- 扩展任务类型（基于 DJ 子项目定义推导）----
    "planning": {
        "name": "产品策划",
        "description": "产品策划、功能规划、需求分析",
        "required": ["A", "B", "C", "D", "K"],
        "recommended": ["E", "F", "G", "I01", "I02"],
        "optional": ["J", "L"],
    },
    "programming": {
        "name": "AI编程",
        "description": "编程任务、技术实现方案",
        "required": ["A", "D", "F", "K"],
        "recommended": ["H", "J"],
        "optional": ["B", "C"],
    },
    "art": {
        "name": "AI美术",
        "description": "美术资源设计、视觉方案",
        "required": ["A", "H", "K"],
        "recommended": ["B", "C", "E11"],
        "optional": ["G"],
    },
    "marketing": {
        "name": "AI Marketing",
        "description": "市场营销、推广方案",
        "required": ["A", "B", "C", "K"],
        "recommended": ["D", "G"],
        "optional": ["E", "F"],
    },

    # ---- 通用/全量任务 ----
    "general": {
        "name": "通用设计任务",
        "description": "未明确分类的设计任务，加载核心维度",
        "required": ["A", "B", "D", "K"],
        "recommended": ["C", "E", "F", "G"],
        "optional": ["H", "I", "J", "L"],
    },
}

# ============================================================
# 任务类型关键词匹配（用于自动路由）
# ============================================================
TASK_KEYWORDS = {
    "core_value": [
        "核心价值", "价值定义", "价值主张", "value proposition",
        "产品价值", "核心卖点",
    ],
    "design_methodology": [
        "设计方法", "方法论", "设计方案", "设计文档",
        "竞品分析", "用户分析", "需求分析",
    ],
    "prototype": [
        "原型", "交互", "界面", "UI", "UX", "wireframe",
        "页面设计", "交互方案", "原型设计",
    ],
    "planning": [
        "策划", "规划", "功能规划", "产品策划", "需求规划",
        "产品规划", "功能列表",
    ],
    "programming": [
        "编程", "开发", "代码", "技术实现", "API",
        "后端", "前端", "程序",
    ],
    "art": [
        "美术", "视觉", "插画", "图标", "3D",
        "渲染", "动画", "美术资源",
    ],
    "marketing": [
        "营销", "推广", "市场", "运营", "增长",
        "获客", "品牌",
    ],
}

# ============================================================
# 优先级定义
# ============================================================
# 信息优先级（参考 DJ 子项目 2：信息排序）
PRIORITY_LEVELS = {
    1: "一级信息（核心，必须包含）",
    2: "二级信息（重要，空间允许时包含）",
    3: "三级信息（补充，仅在充裕时包含）",
}

# 维度类别默认优先级
CATEGORY_PRIORITY = {
    "A": 1,  # 战略——始终最高
    "K": 1,  # 术语——始终最高（保证语义对齐）
    "B": 1,  # 用户——核心
    "D": 1,  # 场景——核心
    "C": 2,  # 竞品
    "E": 2,  # 方法
    "F": 2,  # 可行性
    "I": 2,  # 质量
    "G": 2,  # 历史
    "H": 2,  # 规范
    "J": 3,  # 专业知识
    "L": 3,  # 生命周期
    "M": 1,  # 核心价值专项
}

# ============================================================
# 引擎适配配置
# ============================================================
ENGINE_CONFIGS = {
    "claude": {
        "name": "Claude / GPT / DeepSeek",
        "type": "general_ai",
        "format": "structured_markdown",
        "max_tokens": 180000,    # 大窗口，给充裕空间
        "description": "通用 AI 引擎，支持结构化 Markdown 长文本",
    },
    "gpt": {
        "name": "GPT-4 / GPT-4o",
        "type": "general_ai",
        "format": "structured_markdown",
        "max_tokens": 120000,
        "description": "OpenAI 通用 AI 引擎",
    },
    "deepseek": {
        "name": "DeepSeek",
        "type": "general_ai",
        "format": "structured_markdown",
        "max_tokens": 60000,
        "description": "DeepSeek AI 引擎",
    },
    "midjourney": {
        "name": "Midjourney / DALL-E",
        "type": "design_ai",
        "format": "keyword_compact",
        "max_tokens": 4000,     # 图像生成提示词很短
        "description": "设计 AI 引擎，精简关键词格式",
    },
    "dalle": {
        "name": "DALL-E",
        "type": "design_ai",
        "format": "keyword_compact",
        "max_tokens": 4000,
        "description": "OpenAI 图像生成引擎",
    },
    "suno": {
        "name": "Suno",
        "type": "audio_ai",
        "format": "brief_description",
        "max_tokens": 2000,     # 音频提示词更短
        "description": "音频 AI 引擎，简洁描述格式",
    },
}

# 默认引擎
DEFAULT_ENGINE = "claude"

# ============================================================
# 维度文件目录（相对于项目根目录）
# ============================================================
DIMENSIONS_DIR = "dimensions"

# 维度文件名到类别的映射
# 系统会自动扫描 dimensions/ 目录，但这里提供已知的映射作为回退
KNOWN_DIMENSION_FILES = {
    "A-strategy-values.md": "A",
    "B-user-research.md": "B",
    "C-competitive.md": "C",
    "D-scenarios.md": "D",
    "E-design-methods.md": "E",
    "F-feasibility.md": "F",
    "G-history.md": "G",
    "H-standards.md": "H",
    "I-quality.md": "I",
    "J-domain-knowledge.md": "J",
    "K-terminology.md": "K",
    "L-lifecycle.md": "L",
    "M-core-value.md": "M",
}
