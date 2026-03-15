"""POST /api/reload — reload dimension files.

Aligned with api-design.md §3.6.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.config import DIMENSIONS_DIR
from app.core.dimension_loader import load_dimensions
from app.models.prompt import ReloadResponse
from app.routers.errors import api_error

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/reload", response_model=ReloadResponse)
def reload_dimensions() -> ReloadResponse:
    try:
        store = load_dimensions(DIMENSIONS_DIR)
    except Exception:
        logger.exception("Reload failed")
        raise api_error(
            500,
            "RELOAD_FAILED",
            "维度重新加载失败",
            "请检查 dimensions/ 目录和文件格式",
        )

    if store.total_dimensions == 0:
        raise api_error(
            500,
            "RELOAD_FAILED",
            "维度重新加载失败：未找到可解析的维度",
            "请检查 dimensions/ 目录下的文件完整性",
        )

    return ReloadResponse(
        dimensions_count=store.total_dimensions,
        categories_count=store.total_categories,
        loaded_at=store.loaded_at,
    )
