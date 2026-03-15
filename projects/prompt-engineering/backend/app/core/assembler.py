"""Assembler engine — compose prompt text from dimension content.

Implements the assembly pipeline from technical-architecture.md §3.4.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from app.core.dimension_loader import get_store
from app.models.dimension import DimensionStore

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal result type
# ---------------------------------------------------------------------------


@dataclass
class AssembleResult:
    """Internal result from the assembler, before engine adaptation."""

    raw_prompt: str
    dimensions_used: list[str]         # IDs of dimensions actually included
    dimensions_truncated: list[str]    # IDs skipped due to length limit
    by_priority: dict[int, int]        # {1: N, 2: N, 3: N} — included counts
    total_chars: int
    warnings: list[str] = field(default_factory=list)
    constraints: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Constraint extraction helpers
# ---------------------------------------------------------------------------

_CONSTRAINT_PATTERNS = [
    re.compile(r"^[-*]\s*❌.*$", re.MULTILINE),
    re.compile(r"^[-*]\s*不[要能可以]+[：:].+$", re.MULTILINE),
    re.compile(r"^[-*]\s*禁止.+$", re.MULTILINE),
]


def _extract_constraints(content: str, dim_id: str, dim_name: str) -> list[str]:
    """Extract constraint / prohibition lines from dimension content."""
    blocks: list[str] = []
    for pattern in _CONSTRAINT_PATTERNS:
        for m in pattern.finditer(content):
            blocks.append(m.group(0).strip())
    return blocks


# ---------------------------------------------------------------------------
# Public assemble function
# ---------------------------------------------------------------------------

SYSTEM_HEADER_TEMPLATE = (
    "你是一名专业的{task_type_name}。以下是你执行任务时必须参考的关键信息维度，"
    "按重要性从高到低排列。请基于这些信息完成用户的任务。\n\n"
    "【用户任务】\n{task_text}\n\n"
    "【关键信息维度】\n"
)


def assemble(
    *,
    task_text: str,
    task_type_name: str,
    dimension_ids: list[str],
    priorities: dict[str, int],
    max_chars: int,
) -> AssembleResult:
    """Assemble raw prompt from selected dimensions.

    Parameters
    ----------
    task_text:
        User's original task description.
    task_type_name:
        Chinese name of the matched task type (for the system header).
    dimension_ids:
        Ordered list of dimension IDs selected by the user.
    priorities:
        ``{dimension_id: 1|2|3}`` — user-adjusted priorities.
    max_chars:
        Engine character limit.

    Returns
    -------
    AssembleResult containing the raw prompt and metadata.
    """
    store = get_store()

    # ------------------------------------------------------------------
    # Step 1 — Group dimensions by priority and sort within each group.
    # ------------------------------------------------------------------

    groups: dict[int, list[str]] = {1: [], 2: [], 3: []}
    for did in dimension_ids:
        p = priorities.get(did, 3)
        if p not in groups:
            p = 3
        groups[p].append(did)

    # Priority 1: sort by category letter + number (natural order).
    groups[1].sort()

    # Priority 2 & 3: sort by char_count ascending (small first to fit more).
    def _char_sort(did: str) -> int:
        dim = store.dimensions.get(did)
        return dim.char_count if dim else 0

    groups[2].sort(key=_char_sort)
    groups[3].sort(key=_char_sort)

    # ------------------------------------------------------------------
    # Step 2 — Build the text with length control.
    # ------------------------------------------------------------------

    header = SYSTEM_HEADER_TEMPLATE.format(
        task_type_name=task_type_name,
        task_text=task_text,
    )

    sections: list[str] = [header]
    current_chars = len(header)
    used: list[str] = []
    truncated: list[str] = []
    by_priority: dict[int, int] = {1: 0, 2: 0, 3: 0}
    warnings: list[str] = []
    all_constraints: list[str] = []

    level_labels = {1: "一级：必须参考", 2: "二级：建议参考", 3: "三级：可选参考"}

    for priority in (1, 2, 3):
        if not groups[priority]:
            continue

        level_dims: list[str] = []

        for did in groups[priority]:
            dim = store.dimensions.get(did)
            if dim is None:
                continue

            dim_block = f"\n### {dim.id} {dim.name}\n{dim.content}\n"
            block_len = len(dim_block)

            if priority == 1:
                # Rule A2: required dimensions are never truncated.
                level_dims.append(dim_block)
                current_chars += block_len
                used.append(did)
                by_priority[1] += 1
                # Check for partial status warning.
                if dim.status == "partial":
                    warnings.append(f"维度 {dim.id} 内容状态为 partial，可能影响输出质量")
            else:
                # For priority 2 & 3, respect max_chars.
                if current_chars + block_len > max_chars:
                    truncated.append(did)
                    continue
                level_dims.append(dim_block)
                current_chars += block_len
                used.append(did)
                by_priority[priority] += 1
                if dim.status == "partial":
                    warnings.append(f"维度 {dim.id} 内容状态为 partial，可能影响输出质量")

            # Extract constraints from included dimensions.
            constraint_lines = _extract_constraints(dim.content, dim.id, dim.name)
            all_constraints.extend(constraint_lines)

        if level_dims:
            section_header = f"\n## {level_labels[priority]}\n"
            sections.append(section_header)
            current_chars += len(section_header)
            sections.extend(level_dims)

    # Warn if required dimensions exceed engine limit.
    req_chars = sum(
        store.dimensions[did].char_count
        for did in groups[1]
        if did in store.dimensions
    )
    if req_chars > max_chars:
        warnings.append(
            f"一级维度总字符数（{req_chars}）超过引擎限制（{max_chars}），已全部保留"
        )

    # ------------------------------------------------------------------
    # Step 3 — Append constraints section.
    # ------------------------------------------------------------------

    if all_constraints:
        # Deduplicate while preserving order.
        seen: set[str] = set()
        unique_constraints: list[str] = []
        for c in all_constraints:
            if c not in seen:
                seen.add(c)
                unique_constraints.append(c)

        constraint_section = "\n\n【约束与禁忌】\n" + "\n".join(unique_constraints)
        sections.append(constraint_section)
        current_chars += len(constraint_section)

    raw_prompt = "".join(sections)

    return AssembleResult(
        raw_prompt=raw_prompt,
        dimensions_used=used,
        dimensions_truncated=truncated,
        by_priority=by_priority,
        total_chars=len(raw_prompt),
        warnings=warnings,
        constraints=all_constraints,
    )
