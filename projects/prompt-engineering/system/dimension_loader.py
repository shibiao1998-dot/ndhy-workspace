"""
dimension_loader.py — 维度加载与解析

职责：
1. 扫描 dimensions/ 目录下的 Markdown 文件
2. 解析每个文件，提取维度 ID、名称、内容、类别、优先级
3. 构建维度索引，支持按 ID、类别查询

设计决策：
- 使用正则解析 Markdown 结构（零外部依赖）
- 容错处理：部分维度未完成时不崩溃，只标记为 incomplete
- 维度 ID 格式：字母 + 两位数字（如 A01, B12, K06）
"""

import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from config import CATEGORY_PRIORITY, DIMENSION_CATEGORIES, DIMENSIONS_DIR, KNOWN_DIMENSION_FILES


@dataclass
class Dimension:
    """单个维度的结构化数据"""
    id: str                    # e.g. "A01"
    name: str                  # e.g. "战略核心方向"
    category: str              # e.g. "A"
    content: str               # 维度的完整内容（Markdown）
    priority: int              # 1/2/3
    source_file: str           # 来源文件名
    is_complete: bool = True   # 内容是否已填充完整
    quality_role: str = ""     # 质量作用描述
    definition: str = ""       # 维度定义

    @property
    def category_name(self) -> str:
        return DIMENSION_CATEGORIES.get(self.category, "未知类别")

    @property
    def char_count(self) -> int:
        return len(self.content)

    def summary(self, max_chars: int = 200) -> str:
        """返回维度内容的摘要"""
        if len(self.content) <= max_chars:
            return self.content
        return self.content[:max_chars] + "..."


@dataclass
class DimensionIndex:
    """维度索引，支持多种查询方式"""
    dimensions: Dict[str, Dimension] = field(default_factory=dict)  # id -> Dimension
    by_category: Dict[str, List[str]] = field(default_factory=dict)  # category -> [ids]
    load_errors: List[str] = field(default_factory=list)
    load_warnings: List[str] = field(default_factory=list)

    @property
    def total_count(self) -> int:
        return len(self.dimensions)

    @property
    def complete_count(self) -> int:
        return sum(1 for d in self.dimensions.values() if d.is_complete)

    @property
    def categories_loaded(self) -> List[str]:
        return sorted(self.by_category.keys())

    def get(self, dim_id: str) -> Optional[Dimension]:
        """按 ID 获取维度"""
        return self.dimensions.get(dim_id.upper())

    def get_by_category(self, category: str) -> List[Dimension]:
        """按类别获取所有维度"""
        category = category.upper()
        ids = self.by_category.get(category, [])
        return [self.dimensions[did] for did in ids if did in self.dimensions]

    def get_by_ids(self, dim_ids: List[str]) -> List[Dimension]:
        """按 ID 列表获取维度"""
        result = []
        for did in dim_ids:
            d = self.get(did)
            if d:
                result.append(d)
        return result

    def stats(self) -> str:
        """返回加载统计信息"""
        lines = [
            f"维度总数: {self.total_count}",
            f"已完成: {self.complete_count}",
            f"未完成: {self.total_count - self.complete_count}",
            f"类别: {', '.join(self.categories_loaded)}",
        ]
        if self.load_warnings:
            lines.append(f"警告: {len(self.load_warnings)} 条")
        if self.load_errors:
            lines.append(f"错误: {len(self.load_errors)} 条")
        return "\n".join(lines)


class DimensionLoader:
    """维度文件加载器"""

    # 匹配维度 ID 的正则：## A01 战略核心方向
    DIMENSION_HEADER_RE = re.compile(
        r'^##\s+([A-Z]\d{2})\s+(.+?)$',
        re.MULTILINE
    )

    # 匹配维度定义行
    DEFINITION_RE = re.compile(
        r'\*\*维度定义\*\*[：:]\s*(.+?)$',
        re.MULTILINE
    )

    # 匹配质量作用行
    QUALITY_ROLE_RE = re.compile(
        r'\*\*质量作用\*\*[：:]\s*(.+?)$',
        re.MULTILINE
    )

    # 标记未完成维度的模式
    INCOMPLETE_MARKERS = [
        "⚠️ 待填充", "待补充", "TODO", "TBD",
        "暂无数据", "待调研", "需要补充",
    ]

    def __init__(self, dimensions_dir: str):
        """
        Args:
            dimensions_dir: dimensions/ 目录的绝对路径
        """
        self.dimensions_dir = dimensions_dir

    def load_all(self) -> DimensionIndex:
        """加载所有维度文件，返回维度索引"""
        index = DimensionIndex()

        if not os.path.isdir(self.dimensions_dir):
            index.load_errors.append(f"维度目录不存在: {self.dimensions_dir}")
            return index

        # 扫描目录
        md_files = [
            f for f in os.listdir(self.dimensions_dir)
            if f.endswith('.md') and not f.startswith('.')
        ]

        if not md_files:
            index.load_warnings.append("维度目录为空，没有找到 Markdown 文件")
            return index

        # 逐文件解析
        for filename in sorted(md_files):
            filepath = os.path.join(self.dimensions_dir, filename)
            try:
                dims = self._parse_file(filepath, filename)
                for dim in dims:
                    index.dimensions[dim.id] = dim
                    if dim.category not in index.by_category:
                        index.by_category[dim.category] = []
                    index.by_category[dim.category].append(dim.id)
            except Exception as e:
                index.load_errors.append(f"解析 {filename} 失败: {e}")

        return index

    def _parse_file(self, filepath: str, filename: str) -> List[Dimension]:
        """解析单个维度文件，返回维度列表"""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 从文件名推断类别（回退策略）
        file_category = self._infer_category(filename)

        # 找到所有维度标题
        headers = list(self.DIMENSION_HEADER_RE.finditer(content))

        if not headers:
            # 文件没有标准维度格式，尝试整体作为一个维度
            return self._parse_as_single(content, filename, file_category)

        dimensions = []
        for i, match in enumerate(headers):
            dim_id = match.group(1).upper()
            dim_name = match.group(2).strip()
            category = dim_id[0]

            # 提取本维度的内容（从当前标题到下一个标题之间）
            start = match.end()
            end = headers[i + 1].start() if i + 1 < len(headers) else len(content)
            dim_content = content[start:end].strip()

            # 提取维度定义
            definition = ""
            def_match = self.DEFINITION_RE.search(dim_content)
            if def_match:
                definition = def_match.group(1).strip()

            # 提取质量作用
            quality_role = ""
            qr_match = self.QUALITY_ROLE_RE.search(dim_content)
            if qr_match:
                quality_role = qr_match.group(1).strip()

            # 判断是否已完成
            is_complete = self._check_completeness(dim_content)

            # 确定优先级
            priority = CATEGORY_PRIORITY.get(category, 3)

            dim = Dimension(
                id=dim_id,
                name=dim_name,
                category=category,
                content=dim_content,
                priority=priority,
                source_file=filename,
                is_complete=is_complete,
                quality_role=quality_role,
                definition=definition,
            )
            dimensions.append(dim)

        return dimensions

    def _parse_as_single(self, content: str, filename: str, category: str) -> List[Dimension]:
        """
        文件不包含标准维度格式时，将整个文件作为一个维度。
        这允许系统处理非标准格式的维度文件。
        """
        if not category:
            return []

        # 从文件第一行提取名称
        lines = content.strip().split('\n')
        name = lines[0].strip('#').strip() if lines else filename

        dim = Dimension(
            id=f"{category}00",
            name=name,
            category=category,
            content=content,
            priority=CATEGORY_PRIORITY.get(category, 3),
            source_file=filename,
            is_complete=self._check_completeness(content),
        )
        return [dim]

    def _infer_category(self, filename: str) -> str:
        """从文件名推断维度类别"""
        # 先查已知映射
        if filename in KNOWN_DIMENSION_FILES:
            return KNOWN_DIMENSION_FILES[filename]

        # 尝试从文件名首字母推断（如 A-xxx.md → A）
        basename = os.path.splitext(filename)[0]
        if basename and basename[0].isalpha() and basename[0].isupper():
            first = basename[0]
            # 检查是否跟着非字母字符（如 A-strategy）
            if len(basename) == 1 or not basename[1].isalpha():
                return first

        return ""

    def _check_completeness(self, content: str) -> bool:
        """检查维度内容是否已填充完整"""
        # 内容太短视为未完成
        if len(content.strip()) < 50:
            return False

        # 检查未完成标记
        for marker in self.INCOMPLETE_MARKERS:
            if marker in content:
                return False

        return True


def load_dimensions(project_root: str) -> DimensionIndex:
    """便捷函数：加载项目维度"""
    dim_dir = os.path.join(project_root, DIMENSIONS_DIR)
    loader = DimensionLoader(dim_dir)
    return loader.load_all()


# ============================================================
# 测试入口
# ============================================================
if __name__ == "__main__":
    import sys
    import io
    if sys.platform == "win32":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    # 默认加载当前项目的维度
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index = load_dimensions(project_root)

    print("=" * 50)
    print("维度加载测试")
    print("=" * 50)
    print(index.stats())
    print()

    # 列出所有维度
    for cat in sorted(index.by_category.keys()):
        cat_name = DIMENSION_CATEGORIES.get(cat, "?")
        dims = index.get_by_category(cat)
        print(f"\n【{cat}类】{cat_name}（{len(dims)}个）")
        for d in dims:
            status = "✅" if d.is_complete else "⚠️"
            print(f"  {status} {d.id} {d.name} ({d.char_count}字)")

    # 报告错误和警告
    if index.load_errors:
        print("\n❌ 错误:")
        for e in index.load_errors:
            print(f"  - {e}")
    if index.load_warnings:
        print("\n⚠️ 警告:")
        for w in index.load_warnings:
            print(f"  - {w}")
