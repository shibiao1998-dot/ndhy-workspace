"""GET /api/engines — engine list.

Aligned with api-design.md §3.3.
Note: ``format_type`` uses API-design value (``keywords`` plural for visual engines).
Note: ``ai_platform`` field is added from ENGINE_AI_PLATFORM mapping.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.config import ADAPTER_TO_FORMAT_TYPE, ENGINE_AI_PLATFORM, ENGINES
from app.models.engine import EngineListItem, EnginesResponse

router = APIRouter()


@router.get("/engines", response_model=EnginesResponse)
def list_engines() -> EnginesResponse:
    items = [
        EngineListItem(
            key=e.key,
            name=e.name,
            ai_platform=ENGINE_AI_PLATFORM.get(e.key, e.name),
            max_chars=e.max_chars,
            format_type=ADAPTER_TO_FORMAT_TYPE.get(e.adapter_type, e.adapter_type),
        )
        for e in ENGINES.values()
    ]
    return EnginesResponse(engines=items)
