"""POST /api/generate — prompt generation.

Aligned with api-design.md §3.5.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.config import ENGINES, TASK_TYPES
from app.core.adapter import adapt_prompt
from app.core.assembler import assemble
from app.core.dimension_loader import get_store
from app.core.router_engine import expand_dimension_refs
from app.models.prompt import (
    ByLevel,
    GenerateRequest,
    GenerateResponse,
    GenerateStats,
)
from app.routers.errors import api_error

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
def generate(body: GenerateRequest) -> GenerateResponse:
    # --- Input validation ---

    # Engine must exist.
    engine_cfg = ENGINES.get(body.engine)
    if engine_cfg is None:
        raise api_error(
            404,
            "ENGINE_NOT_FOUND",
            f"引擎 '{body.engine}' 不存在",
            "请从 /api/engines 获取有效的引擎列表",
        )

    # Dimensions must not be empty (Pydantic min_length=1 handles this, belt-and-suspenders).
    if not body.dimensions:
        raise api_error(
            422,
            "EMPTY_DIMENSIONS",
            "维度列表不能为空",
            "请至少选择一个维度",
        )

    # Validate each dimension ID exists.
    try:
        store = get_store()
    except RuntimeError:
        raise api_error(
            500,
            "GENERATE_FAILED",
            "提示词生成处理失败：维度索引未初始化",
            "请稍后重试，若持续失败请联系管理员",
        )

    for did in body.dimensions:
        if did not in store.dimensions:
            raise api_error(
                404,
                "DIMENSION_NOT_FOUND",
                f"维度 '{did}' 不存在",
                "请从 /api/dimensions 获取有效的维度 ID 列表",
            )

    # Validate priorities: keys must cover dimensions, values must be 1/2/3.
    for did in body.dimensions:
        if did not in body.priorities:
            raise api_error(
                400,
                "INVALID_REQUEST_BODY",
                f"priorities 中缺少维度 '{did}' 的优先级",
                "请确保 priorities 覆盖 dimensions 中的每个 ID",
            )
    for did, pval in body.priorities.items():
        if pval not in (1, 2, 3):
            raise api_error(
                400,
                "INVALID_FIELD_VALUE",
                f"字段 priority 值必须为 1、2 或 3，收到: {pval}",
                "请检查字段取值范围",
            )

    # --- Determine task_type_name for system header ---
    # Use "general" as default for the header text.
    task_type_name = "通用设计任务"
    for tt in TASK_TYPES.values():
        # Simple heuristic: use the first matching task type by keyword hit.
        if any(kw in body.task for kw in tt.keywords if tt.keywords):
            task_type_name = tt.name
            break

    # --- Assemble ---
    try:
        asm_result = assemble(
            task_text=body.task,
            task_type_name=task_type_name,
            dimension_ids=body.dimensions,
            priorities=body.priorities,
            max_chars=engine_cfg.max_chars,
        )
    except Exception:
        logger.exception("Assembly failed")
        raise api_error(
            500,
            "GENERATE_FAILED",
            "提示词生成处理失败",
            "请稍后重试，若持续失败请联系管理员",
        )

    # --- Adapt ---
    try:
        final_prompt = adapt_prompt(
            asm_result.raw_prompt,
            adapter_type=engine_cfg.adapter_type,
            max_chars=engine_cfg.max_chars,
        )
    except Exception:
        logger.exception("Adapter failed")
        raise api_error(
            500,
            "GENERATE_FAILED",
            "提示词生成处理失败",
            "请稍后重试，若持续失败请联系管理员",
        )

    # --- Compute stats (aligned with api-design.md §3.5 response schema) ---
    # dimensions_total: total related dimensions for the (inferred) task type.
    # We approximate using all task-type expanded dimensions for the best-matching type.
    best_tt = TASK_TYPES.get("general")  # fallback
    for tt in TASK_TYPES.values():
        if tt.name == task_type_name:
            best_tt = tt
            break

    all_expanded = set()
    if best_tt:
        all_expanded.update(expand_dimension_refs(best_tt.required, store))
        all_expanded.update(expand_dimension_refs(best_tt.recommended, store))
        all_expanded.update(expand_dimension_refs(best_tt.optional, store))

    dimensions_total = len(all_expanded) if all_expanded else len(body.dimensions)
    dimensions_used = len(asm_result.dimensions_used)

    # Coverage percent based on weighted coverage.
    coverage_percent = round(
        (dimensions_used / dimensions_total * 100) if dimensions_total > 0 else 0.0,
        1,
    )

    # Missing required: dimensions in the task type's required set that are
    # NOT in the user's selected dimensions OR were truncated.
    missing_required: list[str] = []
    if best_tt:
        req_expanded = set(expand_dimension_refs(best_tt.required, store))
        for rid in sorted(req_expanded):
            if rid not in body.dimensions or rid in asm_result.dimensions_truncated:
                missing_required.append(rid)

    stats = GenerateStats(
        total_chars=len(final_prompt),
        dimensions_used=dimensions_used,
        dimensions_total=dimensions_total,
        coverage_percent=coverage_percent,
        by_level=ByLevel(
            required_count=asm_result.by_priority.get(1, 0),
            recommended_count=asm_result.by_priority.get(2, 0),
            optional_count=asm_result.by_priority.get(3, 0),
        ),
        missing_required=missing_required,
        truncated_dimensions=asm_result.dimensions_truncated,
    )

    return GenerateResponse(prompt=final_prompt, stats=stats)
