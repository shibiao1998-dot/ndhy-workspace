"""Dimension file parser and in-memory store builder.

Implements the parsing algorithm specified in database-design.md §五,
with relaxed patterns to handle real-world variations in dimension files.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from pathlib import Path

from app.models.dimension import (
    DimensionCategory,
    DimensionIndex,
    DimensionStore,
    ParseError,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level global store (singleton). Replaced atomically on reload.
# ---------------------------------------------------------------------------

_store: DimensionStore | None = None


def get_store() -> DimensionStore:
    """Return the current global DimensionStore.

    Raises ``RuntimeError`` if the store has not been initialised yet.
    """
    if _store is None:
        raise RuntimeError("DimensionStore has not been initialised. Call load_dimensions() first.")
    return _store


def set_store(store: DimensionStore) -> None:
    """Atomically replace the global DimensionStore."""
    global _store
    _store = store


# ---------------------------------------------------------------------------
# Category name fallback map
# ---------------------------------------------------------------------------

CATEGORY_NAMES: dict[str, str] = {
    "A": "战略与价值观",
    "B": "用户真实性",
    "C": "竞品与差异化",
    "D": "场景与需求",
    "E": "设计方法与技巧",
    "F": "可行性与资源",
    "G": "历史经验与案例",
    "H": "设计标准与规范",
    "I": "质量判断与检查",
    "J": "特殊领域知识",
    "K": "专有名词与定义",
    "L": "项目全生命周期",
}


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

# Flexible file title patterns — many formats seen in real files:
#   # A类：战略与价值观维度
#   # B 类维度：用户真实性（第一批 B01-B06）
#   # 【D类】场景与需求维度（7个）
#   # E 类维度：设计方法论（第一批 E01-E08）
#   # J类 教育领域专业知识库（第二批：J06-J09）
#   # I 类：质量判断与检查维度（8个）
_FILE_TITLE_PATTERNS = [
    # # A类：战略与价值观维度
    re.compile(r"^#\s+([A-L])\s*类[：:]?\s*(.+?)(?:维度)?\s*$", re.MULTILINE),
    # # 【D类】场景与需求维度（7个）
    re.compile(r"^#\s+[【\[]([A-L])类[】\]]\s*(.+?)(?:维度)?\s*$", re.MULTILINE),
    # # B 类维度：用户真实性（第一批 B01-B06）
    re.compile(r"^#\s+([A-L])\s*类维度[：:]\s*(.+?)\s*$", re.MULTILINE),
    # # J类 教育领域专业知识库（第二批：J06-J09）
    re.compile(r"^#\s+([A-L])\s*类\s+(.+?)\s*$", re.MULTILINE),
]


def _extract_file_category(text: str) -> tuple[str | None, str | None]:
    """Try to extract category letter and name from the file-level # heading."""
    for pattern in _FILE_TITLE_PATTERNS:
        m = pattern.search(text)
        if m:
            cat = m.group(1)
            raw_name = m.group(2).strip()
            # Clean up parenthetical suffixes like （7个）（第一批 B01-B06）
            clean_name = re.sub(r"[（(][^）)]*[）)]", "", raw_name).strip()
            # Remove trailing punctuation
            clean_name = clean_name.rstrip("：: ")
            return cat, clean_name if clean_name else CATEGORY_NAMES.get(cat, cat)
    return None, None


def _infer_category_from_dim_id(dim_id: str) -> tuple[str, str]:
    """Infer category letter and name from a dimension ID like 'J03'."""
    cat = dim_id[0]
    return cat, CATEGORY_NAMES.get(cat, cat)


def _extract_definition_from_table(section: str) -> str:
    """Extract definition from a table-based metadata format.

    Looks for rows like: | **维度定义** | ... | or | **质量作用** | ... |
    Returns definition text, or '' if not found.
    """
    # First try the standard bold pattern
    m = re.search(r"\*\*维度定义\*\*[：:]\s*(.+?)(?=\n\n|\n\*\*|\n###|\n##|\n\||\Z)", section, re.DOTALL)
    if m:
        return m.group(1).strip()

    # Try table row: | **维度定义** | ... |
    # Not actually present in real data — "维度定义" label doesn't appear in I-class tables.
    # For I-class, treat the heading name itself as the definition.
    return ""


def _extract_quality_role(section: str) -> str:
    """Extract quality role from section text."""
    # Standard bold pattern
    m = re.search(r"\*\*质量作用\*\*[：:]\s*(.+?)(?=\n\n|\n\*\*|\n###|\n##|\n\||\Z)", section, re.DOTALL)
    if m:
        return m.group(1).strip()

    # Table row: | **质量作用** | ... |
    m = re.search(r"\|\s*\*\*质量作用\*\*\s*\|\s*(.+?)\s*\|", section)
    if m:
        return m.group(1).strip()

    return ""


def _extract_content(section: str) -> str:
    """Extract the 'content' from a dimension section.

    Tries multiple patterns:
    1. ### 具体信息内容\\n...
    2. **具体信息内容**：\\n...  (some files use bold label instead of heading)
    3. ### 评分总览\\n...  (I-class uses different heading)
    4. Fallback: everything after the metadata block (definition/quality_role/table)
    """
    # Pattern 1: ### heading
    m = re.search(r"###\s+具体信息内容\s*\n(.*)", section, re.DOTALL)
    if m and m.group(1).strip():
        return m.group(1).strip()

    # Pattern 2: bold label
    m = re.search(r"\*\*具体信息内容\*\*[：:]\s*\n(.*)", section, re.DOTALL)
    if m and m.group(1).strip():
        return m.group(1).strip()

    # Pattern 3: For I-class files — content starts after the metadata table,
    # typically at the first ### heading (like ### 评分总览)
    m = re.search(r"\n(###\s+.+?\n.*)", section, re.DOTALL)
    if m and m.group(1).strip():
        return m.group(1).strip()

    # Pattern 4: Fallback — everything after a blank line following any ** or | block
    # Find the last metadata line and take everything after it
    lines = section.split("\n")
    content_start = -1
    past_header = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("## "):
            past_header = True
            continue
        if past_header and (
            stripped.startswith("**维度定义")
            or stripped.startswith("**质量作用")
            or stripped.startswith("| **")
            or stripped.startswith("|---")
            or stripped.startswith("| 字段")
        ):
            content_start = i + 1
            continue
        if past_header and content_start > 0 and stripped == "":
            content_start = i + 1
            continue
        if past_header and content_start > 0 and stripped:
            break

    if content_start > 0:
        remainder = "\n".join(lines[content_start:]).strip()
        if remainder:
            return remainder

    return ""


def parse_dimension_file(file_path: str) -> tuple[list[DimensionIndex], list[ParseError]]:
    """Parse a single dimension Markdown file.

    Returns:
        (list of parsed DimensionIndex objects, list of ParseErrors encountered)
    """
    errors: list[ParseError] = []
    file_name = Path(file_path).name

    try:
        text = Path(file_path).read_text(encoding="utf-8")
    except Exception as exc:
        errors.append(
            ParseError(
                file=file_name,
                dimension_id=None,
                error_type="file_read_error",
                message=str(exc),
            )
        )
        return [], errors

    results: list[DimensionIndex] = []

    # Step 1: Extract category info from file-level title.
    category_from_title, category_name_from_title = _extract_file_category(text)

    # Step 2: Split by ## headings (not ### or deeper).
    sections = re.split(r"^(?=## (?!#))", text, flags=re.MULTILINE)

    for section in sections:
        if not section.strip():
            continue

        # Step 3: Extract dimension ID and name.
        # Standard: ## A01 战略核心方向
        # Also handle: ## J03 教学设计原则库
        id_match = re.match(r"^## ([A-L]\d{2})\s+(.+?)\s*$", section, re.MULTILINE)
        if not id_match:
            continue  # Non-dimension section (file header, appendix, etc.)

        dim_id = id_match.group(1)
        dim_name = id_match.group(2)

        # Determine category — from file title or from dimension ID
        if category_from_title:
            category = category_from_title
            category_name = category_name_from_title or CATEGORY_NAMES.get(category, category)
        else:
            category, category_name = _infer_category_from_dim_id(dim_id)

        # Step 4: Extract definition.
        definition = _extract_definition_from_table(section)
        if not definition:
            # For files without explicit definition, use the dimension name
            definition = dim_name

        # Step 5: Extract quality role.
        quality_role = _extract_quality_role(section)

        # Step 6: Extract content.
        content = _extract_content(section)
        if not content:
            errors.append(
                ParseError(
                    file=file_name,
                    dimension_id=dim_id,
                    error_type="missing_content",
                    message=f"维度 {dim_id} 缺少具体信息内容",
                )
            )

        # Step 7: Determine status.
        status: str = "partial" if "⚠️ 待填充" in content else "ready"

        # Step 8: Generate summary.
        summary = content[:200] + ("..." if len(content) > 200 else "")

        results.append(
            DimensionIndex(
                id=dim_id,
                name=dim_name,
                category=category,
                category_name=category_name,
                definition=definition,
                quality_role=quality_role,
                content=content,
                char_count=len(content),
                status=status,
                summary=summary,
                source_file=file_name,
            )
        )

    # ------------------------------------------------------------------
    # Special handling for files like J01-J02.md that start directly
    # with # J01 ... (single-dimension-per-file, or numbered sub-sections
    # without ## J01 headings).
    # ------------------------------------------------------------------
    if not results:
        # Try to parse as a single-dimension file:
        # # J01 K12教育理论库  (top-level heading IS the dimension)
        top_match = re.match(r"^#\s+([A-L]\d{2})\s+(.+?)\s*$", text, re.MULTILINE)
        if top_match:
            dim_id = top_match.group(1)
            dim_name = top_match.group(2)
            category, category_name = _infer_category_from_dim_id(dim_id)

            # Content is everything after the # heading (minus metadata lines)
            heading_end = top_match.end()
            content = text[heading_end:].strip()

            # Check if there are multiple dimensions in this file
            # (e.g. J01 and J02 both as # headings)
            all_top_matches = list(
                re.finditer(r"^#\s+([A-L]\d{2})\s+(.+?)\s*$", text, re.MULTILINE)
            )
            if len(all_top_matches) > 1:
                # Multiple top-level dimensions — split between them
                for idx, tm in enumerate(all_top_matches):
                    did = tm.group(1)
                    dname = tm.group(2)
                    cat, cat_name = _infer_category_from_dim_id(did)

                    start = tm.end()
                    end = all_top_matches[idx + 1].start() if idx + 1 < len(all_top_matches) else len(text)
                    dim_content = text[start:end].strip()

                    status_val = "partial" if "⚠️ 待填充" in dim_content else "ready"
                    summary_val = dim_content[:200] + ("..." if len(dim_content) > 200 else "")

                    results.append(
                        DimensionIndex(
                            id=did,
                            name=dname,
                            category=cat,
                            category_name=cat_name,
                            definition=dname,
                            quality_role="",
                            content=dim_content,
                            char_count=len(dim_content),
                            status=status_val,
                            summary=summary_val,
                            source_file=file_name,
                        )
                    )
            else:
                # Single dimension
                status_val = "partial" if "⚠️ 待填充" in content else "ready"
                summary_val = content[:200] + ("..." if len(content) > 200 else "")

                results.append(
                    DimensionIndex(
                        id=dim_id,
                        name=dim_name,
                        category=category,
                        category_name=category_name,
                        definition=dim_name,
                        quality_role="",
                        content=content,
                        char_count=len(content),
                        status=status_val,
                        summary=summary_val,
                        source_file=file_name,
                    )
                )

    if not results and category_from_title is None:
        errors.append(
            ParseError(
                file=file_name,
                dimension_id=None,
                error_type="format_error",
                message="无法从文件中提取任何维度",
            )
        )

    return results, errors


def build_dimension_store(dimensions_dir: str) -> DimensionStore:
    """Scan the dimensions directory and build a DimensionStore."""

    all_dimensions: dict[str, DimensionIndex] = {}
    all_errors: list[ParseError] = []

    dir_path = Path(dimensions_dir)
    if not dir_path.is_dir():
        all_errors.append(
            ParseError(
                file=dimensions_dir,
                dimension_id=None,
                error_type="file_read_error",
                message=f"dimensions 目录不存在: {dimensions_dir}",
            )
        )
        return DimensionStore(
            dimensions={},
            categories={},
            total_dimensions=0,
            total_categories=0,
            total_chars=0,
            loaded_at=datetime.now(timezone.utc).isoformat(),
            parse_errors=all_errors,
        )

    for file_path in sorted(dir_path.glob("*.md")):
        dims, errs = parse_dimension_file(str(file_path))
        all_errors.extend(errs)
        for dim in dims:
            if dim.id in all_dimensions:
                all_errors.append(
                    ParseError(
                        file=dim.source_file,
                        dimension_id=dim.id,
                        error_type="format_error",
                        message=f"维度 {dim.id} 重复（已在 {all_dimensions[dim.id].source_file} 中存在）",
                    )
                )
                continue
            all_dimensions[dim.id] = dim

    # Aggregate category information.
    categories: dict[str, DimensionCategory] = {}
    for dim in all_dimensions.values():
        cat_id = dim.category
        if cat_id not in categories:
            categories[cat_id] = DimensionCategory(
                id=cat_id,
                name=dim.category_name,
                dimension_count=0,
                dimension_ids=[],
                total_chars=0,
                source_files=[],
            )
        cat = categories[cat_id]
        cat.dimension_count += 1
        cat.dimension_ids.append(dim.id)
        cat.total_chars += dim.char_count
        if dim.source_file not in cat.source_files:
            cat.source_files.append(dim.source_file)

    for cat in categories.values():
        cat.dimension_ids.sort()

    store = DimensionStore(
        dimensions=all_dimensions,
        categories=categories,
        total_dimensions=len(all_dimensions),
        total_categories=len(categories),
        total_chars=sum(d.char_count for d in all_dimensions.values()),
        loaded_at=datetime.now(timezone.utc).isoformat(),
        parse_errors=all_errors,
    )

    logger.info(
        "Loaded %d dimensions in %d categories (%d total chars, %d errors)",
        store.total_dimensions,
        store.total_categories,
        store.total_chars,
        len(all_errors),
    )

    return store


def load_dimensions(dimensions_dir: str) -> DimensionStore:
    """Build and install the global DimensionStore."""
    store = build_dimension_store(dimensions_dir)
    set_store(store)
    return store
