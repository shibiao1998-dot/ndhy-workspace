"""GET /api/dimensions — dimension index list (no full content).

Aligned with api-design.md §3.1.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.core.dimension_loader import get_store
from app.models.dimension import (
    CategoryListItem,
    DimensionListItem,
    DimensionsResponse,
)
from app.routers.errors import api_error

router = APIRouter()


@router.get("/dimensions", response_model=DimensionsResponse)
def list_dimensions() -> DimensionsResponse:
    try:
        store = get_store()
    except RuntimeError:
        raise api_error(
            500,
            "DIMENSION_LOAD_FAILED",
            "维度文件加载失败：索引未初始化",
            "请检查 dimensions/ 目录下的文件完整性",
        )

    items = [
        DimensionListItem(
            id=d.id,
            name=d.name,
            category=d.category,
            category_name=d.category_name,
            definition=d.definition,
            char_count=d.char_count,
            status=d.status,
            summary=d.summary,
        )
        for d in sorted(store.dimensions.values(), key=lambda x: x.id)
    ]

    cats = [
        CategoryListItem(
            key=c.id,
            name=c.name,
            count=c.dimension_count,
        )
        for c in sorted(store.categories.values(), key=lambda x: x.id)
    ]

    return DimensionsResponse(
        dimensions=items,
        total=store.total_dimensions,
        categories=cats,
    )
