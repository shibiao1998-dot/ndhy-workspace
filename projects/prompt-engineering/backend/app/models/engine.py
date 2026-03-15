"""Pydantic models for engine data — aligned with database-design.md §3.5."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class EngineConfig(BaseModel):
    """AI engine configuration — hardcoded in config.py."""

    key: str
    name: str
    type: Literal["text", "visual", "audio"]
    max_chars: int
    adapter_type: Literal["markdown", "keyword", "description"]
    description: str


# ---------- API response models (aligned with api-design.md §3.3) ----------


class EngineListItem(BaseModel):
    """Single engine in the GET /api/engines response.

    Note: ``format_type`` uses the API-design values (``keywords`` with 's'),
    and ``ai_platform`` is an extra display field required by api-design.md.
    """

    key: str
    name: str
    ai_platform: str
    max_chars: int
    format_type: Literal["markdown", "keywords", "description"]


class EnginesResponse(BaseModel):
    """GET /api/engines full response."""

    engines: list[EngineListItem]
